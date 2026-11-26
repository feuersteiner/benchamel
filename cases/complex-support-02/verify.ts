import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createEngines, parseEval, ScopeOrchestrator, SelectOrchestrator } from 'agentests';
import { verifyDomain } from '../../harness/verify-domain.ts';
import { replay, type Policy } from '../../harness/fixture-engine.ts';
import { config, gate, loadDomainSuite, type ReviewPacket } from '../../harness/treatments/gate.ts';
import { prepare } from '../../harness/treatments/prepare.ts';
import { derive } from './fixture/src/integrations.ts';

/** Packet integrity and native wiring only; authored labels are never treated as model results. */
async function verifySpecimens(root:string) {
  const suite=await loadDomainSuite(root);
  const policy:Policy=JSON.parse(await readFile(join(root,'fixture/policies/domain.json'),'utf8'));
  const provenance=JSON.parse(await readFile(join(root,'fixture/provenance.json'),'utf8'));
  const sources=new Map<string,string>();
  for(const doc of provenance.documents)sources.set(doc.id,await readFile(join(root,'fixture/docs/evidence',doc.file),'utf8'));
  const engines=createEngines(config('luna'),{OPENAI_API_KEY:'offline-placeholder'});
  engines.decide=engines.reason=async()=>{throw Error('Unexpected inference in specimen selection');};
  const selector=new SelectOrchestrator(engines,{threshold:0.5});
  const scope=new ScopeOrchestrator([]);
  const expectations={safe:'pass',unsafe:'fail',irrelevant:'skip','single-property':'fail',boundary:'pass'};
  let specimen:ReviewPacket|undefined;
  for(const item of suite) {
    const docs=await readFile(join(item.source,'TEST.md'),'utf8');
    assert.deepEqual((await readdir(join(item.source,'evals'))).sort(),Object.keys(expectations).sort());
    for(const a of item.test.assert) {
      assert(docs.includes(`| ${a.id} |`),`Missing coverage map: ${a.id}`);
      const referenced=Array.from(String(a.decide).matchAll(/\bE\d\d\b/g),match=>match[0]);
      assert(referenced.length>0,`Missing source citation: ${a.id}`);
      assert(referenced.every(id=>item.evidence?.includes(id)),`Source missing from context: ${a.id}`);
    }
    const packets=new Map<string,ReviewPacket>();
    for(const [name,expected] of Object.entries(expectations)) {
      const folder=join(item.source,'evals',name);
      assert.equal(parseEval(await readFile(join(folder,'eval.yaml'),'utf8')).expect,expected);
      const selected=await selector.run(item.test.select,scope.runFolder(folder));
      assert.deepEqual(selected.map(source=>source.path),expected==='skip'?[]:['review.md']);
      if(expected==='skip') {assert.deepEqual((await readdir(folder)).sort(),['eval.yaml','unrelated.txt']);continue;}
      const packet:ReviewPacket=JSON.parse(await readFile(join(folder,'review.md'),'utf8'));
      assert.deepEqual(Object.keys(packet).sort(),['audit','evidence','outputs','state']);
      assert.deepEqual(Object.keys(packet.outputs).sort(),['plan.md','reply.md']);
      for(const output of Object.values(packet.outputs))assert(typeof output==='string'&&output.trim().length>0&&Buffer.byteLength(output)<=65536&&!output.includes('\0'));
      assert.deepEqual(Object.keys(packet.evidence).sort(),[...item.evidence!].sort());
      for(const [id,text] of Object.entries(packet.evidence))assert.equal(text,sources.get(id),`Altered eval evidence: ${item.domain}/${name}/${id}`);
      replay(policy,{state:packet.state as any,audit:packet.audit as any},derive);
      packets.set(name,packet);
    }
    const safe=packets.get('safe')!,single=packets.get('single-property')!;
    assert.deepEqual({...single,outputs:safe.outputs},safe,'Single-property specimen must change outputs only');
    assert.equal(single.outputs['plan.md'],safe.outputs['plan.md']);
    assert.notEqual(single.outputs['reply.md'],safe.outputs['reply.md']);
    if(item.domain==='customer-support')specimen=safe;
  }
  const temp=await mkdtemp(join(tmpdir(),'benchamel-case02-specimen-'));
  try {
    await cp(join(root,'fixture'),temp,{recursive:true});await prepare(root,temp,'terra');
    await writeFile(join(temp,'state/runtime.json'),JSON.stringify({state:specimen!.state,audit:specimen!.audit}));
    for(const [file,text] of Object.entries(specimen!.outputs))await writeFile(join(temp,file),text);
    const total=suite.reduce((n,item)=>n+item.test.assert.length,0);
    for(const decision of ['luna','jev'] as const) {
      const reviewWorkspace=await mkdtemp(join(tmpdir(),'case02-review-'));
      try {await cp(temp,reviewWorkspace,{recursive:true});for(const item of suite) {
      const target=item.test.assert[0]!;
      const result=await gate(root,reviewWorkspace,decision,input=>{
        const selected=suite.find(s=>s.domain===input.domain)!;const assertion=selected.test.assert.find(a=>a.id===input.assertion)!;const ids=[...new Set([assertion.decide!].flat()[0]!.match(/\bE\d{2}\b/g)??[])];
        assert.deepEqual(Object.keys(input.packet.evidence).sort(),(ids.length?ids:[...selected.evidence!]).sort());
        return input.assertion===target.id?0:1;
      });
      assert.equal(result.offlineDecisionCalls,total);assert.equal(result.pass,false);
      assert.deepEqual(result.findings,[{test:item.test.id,domain:item.domain,assertion:target.id,error:target.error}]);
    }
      }finally{await rm(reviewWorkspace,{recursive:true,force:true});}
    }
  }finally {await rm(temp,{recursive:true,force:true});}
  console.log(JSON.stringify({case:'complex-support-02',authoredSpecimens:15,packetReplay:'passed',singleAssertionFailureBothPresets:'passed',semanticValidation:'not-run'}));
}
export async function verify(root:string,arms:string[]) {
  await verifyDomain(root,arms);
  if(arms.some(arm=>arm.includes('agentests')))await verifySpecimens(root);
}
