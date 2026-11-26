import {compactState} from '../../../harness/treatments/context.ts';
/** Offline native-schema and authored-specimen checks; no decision-provider calls. */
import assert from 'node:assert/strict';
import {cp,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {replay,type Policy,type Runtime} from '../../../harness/fixture-engine.ts';
import {derive} from '../fixture/src/integrations.ts';
import {config,gate,loadDomainSuite} from '../../../harness/treatments/gate.ts';
import {prepare} from '../../../harness/treatments/prepare.ts';
const root=resolve(import.meta.dir,'..');
const base=join(root,'treatments/agentests');
const policy:Policy=await Bun.file(join(root,'fixture/policies/domain.json')).json();
const provenance=await Bun.file(join(root,'fixture/provenance.json')).json();
const seen=new Set<string>();const counts:Record<string,number>={};
assert.equal(await Bun.file(join(base,'test.yaml')).exists(),false,'umbrella removed');
for(const domain of ['legal','marketing','customer-support']) {
  const source=join(base,domain);
  const test=Bun.YAML.parse(await readFile(join(source,'test.yaml'),'utf8')) as {version:number;id:string;select:{glob:string[]};assert:{id:string;description:string;decide:string;error:string}[]};
  assert.equal(test.version,1);assert.equal(test.id,`complex-support-06-${domain}`);
  assert.deepEqual(test.select.glob,['review.md']);assert(test.assert.length>=15);
  const map=await readFile(join(source,'TEST.md'),'utf8');
  for(const a of test.assert) {
    assert(!seen.has(a.id),a.id);seen.add(a.id);
    for(const key of ['id','description','decide','error'] as const)assert(a[key].trim().length>0);
    assert(a.id.startsWith(domain+'-'));assert(map.includes('`'+a.id+'`'));
  }
  counts[domain]=test.assert.length;
  const manifest=await Bun.file(join(source,'context.json')).json();
  assert.equal(manifest.evidence.length,new Set(manifest.evidence).size);
  for(const id of manifest.evidence)assert(provenance.documents.some((d:{id:string})=>d.id===id));
  const packets:Record<string,any>={};
  for(const name of ['safe','unsafe','single-property','boundary']) {
    const folder=join(source,'evals',name);
    const expected=Bun.YAML.parse(await readFile(join(folder,'eval.yaml'),'utf8')) as {expect:string};
    assert.equal(expected.expect,['unsafe','single-property'].includes(name)?'fail':'pass');
    const packet=await Bun.file(join(folder,'review.md')).json();packets[name]=packet;
    assert.deepEqual(Object.keys(packet).sort(),['audit','evidence','outputs','state']);
    assert.deepEqual(Object.keys(packet.outputs).sort(),['plan.md','reply.md']);
    for(const text of Object.values(packet.outputs))assert(typeof text==='string'&&text.length>100);
    assert.deepEqual(Object.keys(packet.evidence).sort(),manifest.evidence);
    for(const d of provenance.documents)if(manifest.evidence.includes(d.id))assert.equal(packet.evidence[d.id],await readFile(join(root,'fixture/docs/evidence',d.file),'utf8'));
    replay(policy,{state:packet.state,audit:packet.audit} as Runtime,derive);
  }
  for(const name of ['unsafe','single-property']) {
    const original=packets.safe,changed=packets[name];
    assert.deepEqual(changed.state,original.state);assert.deepEqual(changed.audit,original.audit);assert.deepEqual(changed.evidence,original.evidence);
    assert.equal(Object.keys(original.outputs).filter(k=>original.outputs[k]!==changed.outputs[k]).length,1,'one output field mutation');
  }
  assert.equal(await Bun.file(join(source,'evals/irrelevant/review.md')).exists(),false);
  assert.deepEqual(Bun.YAML.parse(await readFile(join(source,'evals/irrelevant/eval.yaml'),'utf8')),{expect:'skip'});
  if(domain==='customer-support')assert.equal(packets.boundary.state.domain.temporary,'failed-safe');
  const temp=await mkdtemp(join(tmpdir(),'cs06-native-'));
  try {
    await cp(source,join(temp,'.agents/tests',test.id),{recursive:true});
    for(const decision of ['luna','jev'] as const) {
      await writeFile(join(temp,'agentests.config.yaml'),JSON.stringify(config(decision)));
      const child=Bun.spawn(['node',resolve(root,'../../node_modules/agentests/dist/cli/index.js'),'validate'],{cwd:temp,stdout:'pipe',stderr:'pipe'});
      const [code,out,err]=await Promise.all([child.exited,new Response(child.stdout).text(),new Response(child.stderr).text()]);
      assert.equal(code,0,out+err);
    }
  } finally {await rm(temp,{recursive:true,force:true});}
}
// Case-specific single-failure wiring: injected scores assert routing, not semantics.
const suite=await loadDomainSuite(root),workspace=await mkdtemp(join(tmpdir(),'cs06-single-failure-'));
try {
  await cp(join(root,'fixture'),workspace,{recursive:true});await prepare(root,workspace,'terra');
  const safe=await Bun.file(join(base,'customer-support/evals/safe/review.md')).json();
  await writeFile(join(workspace,'state/runtime.json'),JSON.stringify({state:safe.state,audit:safe.audit}));
  for(const file of ['reply.md','plan.md'])await writeFile(join(workspace,file),safe.outputs[file]);
  for(const decision of ['luna','jev'] as const){
    const reviewWorkspace=await mkdtemp(join(tmpdir(),'cs06-review-'));
    try{await cp(workspace,reviewWorkspace,{recursive:true});for(const target of suite) {
    const id=target.test.assert[0]!.id;const visited=new Set<string>();
    const result=await gate(root,reviewWorkspace,decision,input=>{
      assert(!visited.has(input.assertion));visited.add(input.assertion);
      const domain=suite.find(s=>s.domain===input.domain)!;
      const a=domain.test.assert.find(a=>a.id===input.assertion)!;const ids=[...new Set([a.decide!].flat()[0]!.match(/\bE\d{2}\b/g)??[])];assert.deepEqual(Object.keys(input.packet.evidence),(ids.length?ids:domain.evidence!));
      const represented=compactState(safe.state,safe.audit);assert.deepEqual(input.packet.state,represented.state);assert.deepEqual(input.packet.audit,represented.audit);
      return input.assertion===id?0:1;
    });
    assert.equal(result.offlineDecisionCalls,seen.size);assert.equal(visited.size,seen.size);
    assert.equal(result.pass,false);assert.deepEqual(result.findings,[{test:target.test.id,domain:target.domain,assertion:id,error:target.test.assert[0]!.error}]);
  }
    }finally{await rm(reviewWorkspace,{recursive:true,force:true});}
  }
}finally {await rm(workspace,{recursive:true,force:true});}
console.log(JSON.stringify({offline:true,counts,specimens:15,nativeProviders:['luna','jev'],singleFailureGates:6,semanticInference:'not-run'}));
