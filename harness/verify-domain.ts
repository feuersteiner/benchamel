import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, writeFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initial,transition,replay,canonical,type Policy,type Runtime } from './fixture-engine.ts';
import { inspect, judgeDomain } from './domain-judge.ts';
import { boundary,hash } from './boundary.ts';
import { prepare } from './treatments/prepare.ts';
import { skillPrompt,revisionLoop } from './treatments/agent.ts';
import { gate,config,loadDomainSuite,installDomainSuite } from './treatments/gate.ts';
export async function commandCheck(workspace:string,command:string,args:Record<string,string>,expected?:unknown) {
  const before=await readFile(join(workspace,'state/runtime.json'),'utf8');
  const child=Bun.spawn(['bun','src/cli.ts',command,...Object.entries(args).flatMap(([k,v])=>['--'+k,v])],{cwd:workspace,stdout:'pipe',stderr:'pipe'});
  const [code,,err]=await Promise.all([child.exited,new Response(child.stdout).text(),new Response(child.stderr).text()]);
  const after=await readFile(join(workspace,'state/runtime.json'),'utf8');
  if(expected===undefined){assert.notEqual(code,0);assert.equal(after,before);}else{assert.equal(code,0,err);assert.equal(canonical(JSON.parse(after)),canonical(expected));}
}
export async function sourceCheck(root:string) {
  const p=JSON.parse(await readFile(join(root,'fixture/provenance.json'),'utf8'));
  assert.equal((p.source?.commit??p.sourceCommit),'6142590525acb698e473671f2420022f64adfa71');assert.equal(p.documents.length,20);
  assert.equal(hash(await readFile(join(root,'fixture/sources.json'))),p.sourcesFileSha256);
  for(const d of p.documents){const bytes=await readFile(join(root,'fixture/docs/evidence',d.file));assert.equal(hash(bytes),d.sha256);assert.equal(bytes.length,d.bytes);}
  const manifest=JSON.parse(await readFile(join(root,'fixture/manifest.json'),'utf8'));
  for(const [file,expected] of Object.entries(manifest))assert.equal(hash(await readFile(join(root,'fixture',file))),expected);
}
export async function treatmentChecks(root:string,workspace:string,arms:string[]) {
  for(const arm of arms) {
    const temp=await mkdtemp(join(tmpdir(),'benchamel-arm-'));
    try {
      await cp(join(root,'fixture'),temp,{recursive:true});await prepare(root,temp,arm);
      const skill=await Bun.file(join(temp,'.agents/skills/case-policy/SKILL.md')).exists();assert.equal(skill,arm.endsWith('-skill'));
      const prompt=await skillPrompt(root,arm,'Common task');assert.equal(prompt.startsWith('Common task'),true);
      if(skill){assert(prompt.includes('$case-policy'));assert(prompt.includes(await readFile(join(root,'treatments/skill/SKILL.md'),'utf8')));
        const skillPath=join(temp,'.agents/skills/case-policy/SKILL.md'),original=await readFile(skillPath,'utf8');await writeFile(skillPath,original+'Unauthorized extra scope');await assert.rejects(()=>boundary(root,temp));await writeFile(skillPath,original);}
      const check=Bun.spawn(['bun','run','check'],{cwd:temp,stdout:'pipe',stderr:'pipe'});
      const [code,out,err]=await Promise.all([check.exited,new Response(check.stdout).text(),new Response(check.stderr).text()]);assert.equal(code,0,err);assert(out.includes('"ok":true'));
    }finally {await rm(temp,{recursive:true,force:true});}
  }
  if(!arms.some(a=>a.includes('agentests')))return;
  const temp=await mkdtemp(join(tmpdir(),'benchamel-native-validate-'));
  try {
    const suite=await loadDomainSuite(root),total=suite.reduce((n,item)=>n+item.test.assert.length,0);
    await installDomainSuite(suite,temp);
    for(const decision of ['luna','jev'] as const) {
      await writeFile(join(temp,'agentests.config.yaml'),JSON.stringify(config(decision)));
      const cli=Bun.spawn(['node',join(import.meta.dir,'../node_modules/agentests/dist/cli/index.js'),'validate'],{cwd:temp,stdout:'pipe',stderr:'pipe'});
      const [code,out,err]=await Promise.all([cli.exited,new Response(cli.stdout).text(),new Response(cli.stderr).text()]);assert.equal(code,0,out+err);
      const pass=await gate(root,workspace,decision,1);assert.equal(pass.pass,true);assert.equal(pass.offlineDecisionCalls,total);assert.deepEqual(pass.findings,[]);
      const fail=await gate(root,workspace,decision,0);assert.equal(fail.pass,false);assert.equal(fail.offlineDecisionCalls,total);assert.equal(fail.findings.length,total);
      for(const item of suite)assert.equal(fail.findings.filter(f=>f.test===item.test.id&&f.domain===item.domain).length,item.test.assert.length);
      for(const item of suite) {
        const selective=await gate(root,workspace,decision,input=>input.domain===item.domain?0:1);
        assert.equal(selective.pass,false);assert.equal(selective.offlineDecisionCalls,total);assert.equal(selective.findings.length,item.test.assert.length);
        assert.deepEqual(selective.findings.map(f=>f.assertion),item.test.assert.map(a=>a.id));
        assert(selective.findings.every(f=>f.test===item.test.id&&f.domain===item.domain&&f.error.trim().length>0));
      }
      const prompts:string[]=[];let reviews=0;
      await revisionLoop(async prompt=>{prompts.push(prompt);return {thread:'offline-domain-revision',code:0};},async()=>++reviews===1?fail:pass,'Offline draft');
      assert.equal(prompts.length,2);assert(prompts[1]!.includes(JSON.stringify(fail.findings)));
    }
  }finally {await rm(temp,{recursive:true,force:true});}
}
export async function verifyDomain(root:string,arms:string[]) {
  await sourceCheck(root);
  const policy:Policy=JSON.parse(await readFile(join(root,'fixture/policies/domain.json'),'utf8'));
  const {derive}=await import(join(root,'fixture/src/integrations.ts'));
  const seed=initial(policy);assert.equal(canonical(seed),canonical(JSON.parse(await readFile(join(root,'fixture/data/seed.json'),'utf8'))));
  assert.equal(canonical(seed),canonical(JSON.parse(await readFile(join(root,'fixture/state/runtime.json'),'utf8'))));
  const routes:[string,Record<string,string>][][]=JSON.parse(await readFile(join(root,'verification/routes.json'),'utf8'));
  for(const route of routes) {
    const temp=await mkdtemp(join(tmpdir(),'benchamel-valid-route-'));
    try {
      await cp(join(root,'fixture'),temp,{recursive:true});await prepare(root,temp,'terra');
      let runtime=initial(policy);
      for(const [command,args] of route) {
        const before=canonical(runtime);const first=transition(policy,runtime,command,args,derive),second=transition(policy,runtime,command,args,derive);
        assert.equal(canonical(first),canonical(second));assert.equal(canonical(runtime),before);runtime=first;replay(policy,runtime,derive);await commandCheck(temp,command,args,runtime);
      }
      for(const [area,owners] of Object.entries(policy.areas))runtime=transition(policy,runtime,'task',{area,owner:owners[0]!,due:policy.updateBy,action:`Verify pending ${area} work and report any blocked dependency.`},derive);
      runtime=transition(policy,runtime,'commitments',{'next-update':policy.updateBy,snapshot:JSON.stringify(runtime.state.domain)},derive);
      runtime=transition(policy,runtime,'handoff',{note:'Carry actual receipts, pending consent, unresolved evidence and the customer update across shift.'},derive);
      await writeFile(join(temp,'state/runtime.json'),JSON.stringify(runtime,null,2)+'\n');
      const inspected=await inspect(root,temp);assert.equal(inspected.score,40,JSON.stringify(inspected.details));
      // A missing output is rejected deterministically before any inference.
      assert.equal(await judgeDomain(root,temp),0);
      await writeFile(join(temp,'reply.md'),'Offline plumbing specimen; not a semantically assessed customer reply.');await writeFile(join(temp,'plan.md'),'Offline state route specimen; no model assessment was performed.');
      await treatmentChecks(root,temp,arms);
      await commandCheck(temp,'production-delete',{});
      const changed=structuredClone(runtime);changed.state.domain.forged=true;
      assert.throws(()=>replay(policy,changed,derive));
      const seedBytes=await readFile(join(temp,'data/seed.json'));await writeFile(join(temp,'data/seed.json'),'{}');await assert.rejects(()=>boundary(root,temp));await writeFile(join(temp,'data/seed.json'),seedBytes);
      await symlink('/tmp',join(temp,'unexpected-link'));await assert.rejects(()=>boundary(root,temp));await rm(join(temp,'unexpected-link'));
    }finally {await rm(temp,{recursive:true,force:true});}
  }
  // Reject unknown operations, wrong scopes and missing required preconditions without touching state.
  const before=canonical(seed);assert.throws(()=>transition(policy,seed,'production-delete',{},derive));assert.equal(canonical(seed),before);
  for(const [name,a] of Object.entries(policy.actions)) {
    if(a.args&&Object.keys(a.args).length){assert.throws(()=>transition(policy,seed,name,{[Object.keys(a.args!)[0]!]: ''},derive));assert.equal(canonical(seed),before);}
    if(a.requires&&Object.entries(a.requires).some(([k,v])=>canonical(seed.state.domain[k])!==canonical(v))) {assert.throws(()=>transition(policy,seed,name,{},derive));assert.equal(canonical(seed),before);}
  }
  // Exercise each explicitly simulated failure from a valid pre-state.
  for(const route of routes) {
    let r:Runtime=initial(policy);
    for(const [command,args] of route) {
      const a=policy.actions[command];
      if(a?.failEffects){const failed=transition(policy,r,command,{...args,simulate:'failure'},derive);assert.equal(failed.audit.at(-1)!.outcome,'failed-safe');replay(policy,failed,derive);}
      r=transition(policy,r,command,args,derive);
    }
  }
}
