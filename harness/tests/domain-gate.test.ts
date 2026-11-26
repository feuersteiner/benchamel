import { test, expect } from 'bun:test';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { InMemorySource } from 'agentests';
import type { AgentTestResult } from 'agentests/types';
import { collectFindings, config, decisionPolicy, decisionStatus, domains, gate, installDomainSuite, loadDomainSuite } from '../treatments/gate.ts';
import { revisionLoop } from '../treatments/agent.ts';

// Synthetic wiring specimens; these questions are never evaluated by a model.
async function specimen() {
  const parent=await mkdtemp(join(tmpdir(),'benchamel-domain-gate-unit-')),root=join(parent,'case-unit'),workspace=join(parent,'workspace');
  await mkdir(join(root,'fixture/docs/evidence'),{recursive:true});await mkdir(workspace);
  await writeFile(join(root,'judge.ts'),`export async function inspectWorkspace(){return {state:{domain:{status:'pending-review'},tasks:[]},audit:[{command:'request-review',outcome:'confirmed'}]};}`);
  await writeFile(join(root,'fixture/provenance.json'),JSON.stringify({documents:domains.map((domain,i)=>({id:`E0${i+1}`,file:`${domain}.md`}))}));
  for(const file of ['reply.md','plan.md'])await writeFile(join(workspace,file),`Synthetic offline ${file}`);
  for(const [i,domain] of domains.entries()) {
    await writeFile(join(root,'fixture/docs/evidence',`${domain}.md`),`Frozen ${domain} source`);
    const folder=join(root,'treatments/agentests',domain);await mkdir(folder,{recursive:true});
    await writeFile(join(folder,'TEST.md'),'Synthetic plumbing Test; no model accuracy claim.');
    await writeFile(join(folder,'context.json'),JSON.stringify({evidence:[`E0${i+1}`]}));
    await writeFile(join(folder,'test.yaml'),JSON.stringify({version:1,id:`case-unit-${domain}`,title:`${domain} plumbing`,description:'Synthetic independent engine-call receipts',select:{glob:domain==='marketing'?['review.md']:'review.md'},assert:Array.from({length:15},(_,n)=>({id:`${domain}-property-${n+1}`,description:`Observe ${domain} property ${n+1}`,error:`Review ${domain} property ${n+1} in the selected packet.`,decide:domain==='marketing'?[`Does the synthetic ${domain} property ${n+1} hold?`]:`Does the synthetic ${domain} property ${n+1} hold?`}))}));
  }
  return {parent,root,workspace};
}
async function mutate(root:string,domain:string,change:(value:any)=>void) {
  const path=join(root,'treatments/agentests',domain,'test.yaml');const value=JSON.parse(await readFile(path,'utf8'));change(value);await writeFile(path,JSON.stringify(value));
}

test('native domain suites run every assertion, filter evidence, retain failures and resume revision for both presets',async()=>{
  const {parent,root,workspace}=await specimen();
  try {
    const suite=await loadDomainSuite(root),installed=join(parent,'native');await installDomainSuite(suite,installed);
    for(const decision of ['luna','jev'] as const) {
      const reviewWorkspace=join(parent,'review-'+decision);await cp(workspace,reviewWorkspace,{recursive:true});
      await writeFile(join(installed,'agentests.config.yaml'),JSON.stringify(config(decision)));
      const cli=Bun.spawn(['node',join(import.meta.dir,'../../node_modules/agentests/dist/cli/index.js'),'validate'],{cwd:installed,stdout:'pipe',stderr:'pipe'});
      const [code,out,err]=await Promise.all([cli.exited,new Response(cli.stdout).text(),new Response(cli.stderr).text()]);expect(code,out+err).toBe(0);
      const calls=new Map<string,Set<string>>();
      const pass=await gate(root,reviewWorkspace,decision,({domain,assertion,packet})=>{
        const index=domains.indexOf(domain);expect(packet.evidence).toEqual({[`E0${index+1}`]:`Frozen ${domain} source`});
        expect(packet.outputs['reply.md']).toBe('Synthetic offline reply.md');expect(packet.state).toEqual({domain:{status:'pending-review'},tasks:[]});expect(packet.audit).toEqual([{command:'request-review',outcome:'confirmed'}]);
        if(!calls.has(domain))calls.set(domain,new Set());calls.get(domain)!.add(assertion);return 0.8;
      });
      expect(pass.pass).toBe(true);expect(pass.offlineDecisionCalls).toBe(45);expect(pass.findings).toEqual([]);expect([...calls.values()].map(ids=>ids.size)).toEqual([15,15,15]);
      const fail=await gate(root,reviewWorkspace,decision,0);expect(fail.pass).toBe(false);expect(fail.findings).toHaveLength(45);expect(fail.offlineDecisionCalls).toBe(45);
      for(const item of suite) {
        const selective=await gate(root,reviewWorkspace,decision,input=>input.domain===item.domain?0:1);
        expect(selective.pass).toBe(false);expect(selective.offlineDecisionCalls).toBe(45);
        expect(selective.findings).toEqual(item.test.assert.map(a=>({test:item.test.id,domain:item.domain,assertion:a.id,error:a.error})));
      }
      const single=await gate(root,reviewWorkspace,decision,input=>input.assertion==='legal-property-1'?0:1);expect(single.findings).toHaveLength(1);expect(single.pass).toBe(false);
      const prompts:string[]=[],threads:(string|undefined)[]=[];let checks=0;
      await revisionLoop(async(prompt,thread)=>{prompts.push(prompt);threads.push(thread);return {thread:'same-offline-session',code:0};},async()=>++checks===1?fail:pass,'Offline draft');
      expect(prompts).toHaveLength(2);expect(prompts[1]).toContain(JSON.stringify(fail.findings));expect(threads[1]).toBe('same-offline-session');
    }
    await expect(gate(root,workspace,'luna',NaN)).rejects.toThrow('Invalid decision result');
  }finally {await rm(parent,{recursive:true,force:true});}
});

test('suite rejects missing, empty, duplicate, malformed and umbrella Tests before inference',async()=>{
  const original=await specimen();
  const checks:[string,(root:string)=>Promise<void>,RegExp][]=[
    ['empty',root=>rm(join(root,'treatments/agentests'),{recursive:true}).then(()=>mkdir(join(root,'treatments/agentests'))),/Missing domain/],
    ['missing-suite',root=>rm(join(root,'treatments/agentests'),{recursive:true}),/ENOENT/],
    ['missing-test-file',root=>rm(join(root,'treatments/agentests/legal/test.yaml')),/ENOENT/],
    ['missing-domain',root=>rm(join(root,'treatments/agentests/legal'),{recursive:true}),/Missing domain/],
    ['missing-id',root=>mutate(root,'legal',v=>delete v.id),/id/],
    ['duplicate-test',root=>mutate(root,'marketing',v=>v.id='case-unit-legal'),/Duplicate Test/],
    ['wrong-domain-id',root=>mutate(root,'legal',v=>v.id='another-case-legal'),/Test id must be/],
    ['empty-assert',root=>mutate(root,'legal',v=>v.assert=[]),/assert/],
    ['short-assert',root=>mutate(root,'legal',v=>v.assert.pop()),/at least 15/],
    ['duplicate-assert',root=>mutate(root,'marketing',v=>v.assert[0].id='legal-property-1'),/Duplicate assertion/],
    ['blank-error',root=>mutate(root,'legal',v=>v.assert[0].error=' '),/blank/],
    ['missing-decide',root=>mutate(root,'legal',v=>delete v.assert[0].decide),/assert|decide/],
    ['duplicate-question',root=>mutate(root,'legal',v=>v.assert[1].decide=v.assert[0].decide),/Duplicate decide/],
    ['reasoning',root=>mutate(root,'legal',v=>v.assert[0].reason='Another assessment'),/forbidden/],
    ['select-skips',root=>mutate(root,'legal',v=>v.select.grep='never-match'),/select must/],
    ['injected-domain',root=>mutate(root,'legal',v=>v.domain='legal'),/Unknown field/],
    ['umbrella',root=>writeFile(join(root,'treatments/agentests/test.yaml'),'{}'),/umbrella/],
    ['unknown-domain',root=>mkdir(join(root,'treatments/agentests/sales')),/Unknown domain/],
    ['duplicate-evidence',root=>writeFile(join(root,'treatments/agentests/legal/context.json'),JSON.stringify({evidence:['E01','E01']})),/duplicate evidence/],
    ['empty-evidence',root=>writeFile(join(root,'treatments/agentests/legal/context.json'),JSON.stringify({evidence:[]})),/nonempty ID/],
    ['unsupported-context',root=>writeFile(join(root,'treatments/agentests/legal/context.json'),JSON.stringify({evidence:['E01'],domain:'legal'})),/supports only evidence/],
  ];
  try {
    for(const [name,change,error] of checks) {
      const clone=join(original.parent,name,'case-unit');await cp(original.root,clone,{recursive:true});await change(clone);
      await expect(loadDomainSuite(clone),name).rejects.toThrow(error);
    }
    // Late-domain invalid evidence must reject before even the first engine call.
    await writeFile(join(original.root,'treatments/agentests/customer-support/context.json'),JSON.stringify({evidence:['E99']}));
    let calls=0;await expect(gate(original.root,original.workspace,'luna',()=>{calls++;return 1;})).rejects.toThrow('unknown evidence ID E99');expect(calls).toBe(0);
  }finally {await rm(original.parent,{recursive:true,force:true});}
});

test('native result aggregation fails closed on missing results, duplicate results and skipped assertions',async()=>{
  const {parent,root}=await specimen();
  try {
    const suite=await loadDomainSuite(root),results:AgentTestResult[]=suite.map(s=>({test:s.test,findings:[]})),executed=new Map(suite.map(s=>[s.test.id,new Set(s.test.assert.map(a=>a.id))]));
    expect(collectFindings(suite,results,executed)).toEqual([]);
    expect(()=>collectFindings(suite,[...results,results[0]!],executed)).toThrow('Missing or duplicate');
    expect(()=>collectFindings(suite,[],executed)).toThrow('Missing or duplicate');
    expect(()=>collectFindings(suite,[results[0]!,results[0]!,results[2]!],executed)).toThrow('duplicate');
    executed.get(suite[1]!.test.id)!.delete(suite[1]!.test.assert[0]!.id);
    expect(()=>collectFindings(suite,results,executed)).toThrow('Missing assertion execution');
    executed.get(suite[1]!.test.id)!.add(suite[1]!.test.assert[0]!.id);
    results[0]!.findings=[{source:new InMemorySource('review.md','synthetic packet'),assertion:suite[0]!.test.assert[0]!}];
    expect(collectFindings(suite,results,executed)[0]).toEqual({test:'case-unit-legal',domain:'legal',assertion:'legal-property-1',error:suite[0]!.test.assert[0]!.error});
  }finally {await rm(parent,{recursive:true,force:true});}
});


test('optional manifests preserve all frozen evidence when absent',async()=>{
  const {parent,root,workspace}=await specimen();
  try {
    for(const domain of domains)await rm(join(root,'treatments/agentests',domain,'context.json'));
    const pass=await gate(root,workspace,'jev',({packet})=>{expect(Object.keys(packet.evidence)).toEqual(['E01','E02','E03']);return 1;});
    expect(pass.pass).toBe(true);expect(pass.offlineDecisionCalls).toBe(45);
  }finally {await rm(parent,{recursive:true,force:true});}
});


test('decision bounds retain probabilities and block uncertainty for both providers',async()=>{
  expect(decisionStatus(0)).toBe('fail');expect(decisionStatus(0.2)).toBe('fail');
  for(const score of [0.200001,0.49,0.5,0.500001,0.799999])expect(decisionStatus(score)).toBe('uncertain');
  expect(decisionStatus(0.8)).toBe('pass');expect(decisionStatus(1)).toBe('pass');
  for(const score of [NaN,Infinity,-0.01,1.01])expect(()=>decisionStatus(score)).toThrow('Invalid decision result');
  const {parent,root,workspace}=await specimen();
  try {
    for(const provider of ['luna','jev'] as const) {
      const reviewWorkspace=join(parent,'review-'+provider);await cp(workspace,reviewWorkspace,{recursive:true});
      expect(config(provider).assert.threshold).toBe(decisionPolicy.passAtOrAbove);
      const result=await gate(root,reviewWorkspace,provider,({assertion})=>assertion==='legal-property-1'?0.5:0.8);
      expect(result.pass).toBe(false);expect(result.status).toBe('uncertain');
      expect(result.decisions).toHaveLength(45);expect(result.findings).toHaveLength(1);
      expect(result.decisions[0]).toEqual({test:'case-unit-legal',domain:'legal',assertion:'legal-property-1',probability:0.5,status:'uncertain'});
      expect(result.findings[0]!.error).toContain('Uncertain decision (P(yes)=0.5)');
      const failed=await gate(root,reviewWorkspace,provider,0.2);
      expect(failed.pass).toBe(false);expect(failed.status).toBe('fail');expect(failed.findings).toHaveLength(45);
      expect(failed.decisions.every(d=>d.probability===0.2&&d.status==='fail')).toBe(true);
    }
  }finally {await rm(parent,{recursive:true,force:true});}
});

test('installed fixture Tests cannot be deleted and silently reinstalled',async()=>{
  const {parent,root,workspace}=await specimen();
  try {
    await gate(root,workspace,'luna',1);
    await rm(join(workspace,'.agents/tests'),{recursive:true});
    await expect(gate(root,workspace,'luna',1)).rejects.toThrow('Prepared Test missing');
  }finally{await rm(parent,{recursive:true,force:true});}
});
