/** Offline case checks: source/packet integrity and injected failure propagation, never model scoring. */
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseEval } from 'agentests';
import { replay, type Policy, type Runtime } from '../../../harness/fixture-engine.ts';
import { gate, loadDomainSuite, type ReviewPacket } from '../../../harness/treatments/gate.ts';
import { prepare } from '../../../harness/treatments/prepare.ts';
import { derive } from '../fixture/src/integrations.ts';

const root=join(import.meta.dir,'..'),suite=await loadDomainSuite(root);
const policy:Policy=JSON.parse(await readFile(join(root,'fixture/policies/domain.json'),'utf8'));
assert.deepEqual(suite.map(s=>[s.domain,s.test.assert.length]),[['legal',38],['marketing',15],['customer-support',29]]);
const allIds=new Set(suite.flatMap(s=>s.test.assert.map(a=>a.id)));
assert.equal(allIds.size,82);
let specimens=0,selected=0;
for(const item of suite) {
  const doc=await readFile(join(item.source,'TEST.md'),'utf8');
  const evidenceIds=new Set(item.evidence!);
  for(const assertion of item.test.assert) {
    assert(doc.includes('`'+assertion.id+'`'),`Unmapped assertion: ${assertion.id}`);
    for(const id of [...String(assertion.decide).matchAll(/\bE\d{2}\b/g)].map(m=>m[0]))assert(evidenceIds.has(id),`Missing context for ${assertion.id}: ${id}`);
  }
  for(const entry of await readdir(join(item.source,'evals'),{withFileTypes:true})) {
    assert(entry.isDirectory());specimens++;
    const folder=join(item.source,'evals',entry.name),definition=parseEval(await readFile(join(folder,'eval.yaml'),'utf8'));
    const present=await Bun.file(join(folder,'review.md')).exists();
    assert.equal(present,definition.expect!=='skip');
    if(!present)continue;
    selected++;
    const packet:ReviewPacket=JSON.parse(await readFile(join(folder,'review.md'),'utf8'));
    assert.deepEqual(Object.keys(packet).sort(),['audit','evidence','outputs','state']);
    assert.deepEqual(Object.keys(packet.outputs).sort(),['plan.md','reply.md']);
    for(const text of Object.values(packet.outputs))assert(text.length>0&&!text.includes('\0')&&Buffer.byteLength(text)<=65536);
    assert.deepEqual(Object.keys(packet.evidence).sort(),[...evidenceIds].sort());
    const provenance=JSON.parse(await readFile(join(root,'fixture/provenance.json'),'utf8'));
    for(const id of evidenceIds) {
      const file=provenance.documents.find((d:{id:string;file:string})=>d.id===id).file;
      assert.equal(packet.evidence[id],await readFile(join(root,'fixture/docs/evidence',file),'utf8'));
    }
    replay(policy,{state:packet.state,audit:packet.audit} as Runtime,derive);
    const notes=await readFile(join(folder,'NOTES.md'),'utf8');
    for(const id of [...notes.matchAll(/`((?:legal|marketing|customer-support)-[^`]+)`/g)].map(m=>m[1]!))assert(allIds.has(id),`Unknown specimen target ${id}`);
  }
}
assert.equal(specimens,23);assert.equal(selected,20);
const temp=await mkdtemp(join(tmpdir(),'benchamel-case07-native-'));
try {
  const packet:ReviewPacket=JSON.parse(await readFile(join(suite[0]!.source,'evals/safe/review.md'),'utf8'));
  await cp(join(root,'fixture'),temp,{recursive:true});await prepare(root,temp,'terra');
  await writeFile(join(temp,'state/runtime.json'),JSON.stringify({state:packet.state,audit:packet.audit}));
  for(const [file,text] of Object.entries(packet.outputs))await writeFile(join(temp,file),text);
  const targets=['legal-custody-acceptance-prerequisite','legal-custody-complete-kit-scope','legal-custody-insurance','legal-custody-neutrality','legal-election-before-pickup','legal-buyer-notice-before-pickup','legal-seller-notice-before-pickup','marketing-annual-acceptance-status','customer-support-bank-posting-status'];
  for(const decision of ['luna','jev'] as const) {
    const reviewWorkspace=await mkdtemp(join(tmpdir(),'cs07-review-'));
    try{await cp(temp,reviewWorkspace,{recursive:true});
    const pass=await gate(root,reviewWorkspace,decision,({domain,assertion,packet})=>{
      const selected=suite.find(s=>s.domain===domain)!,a=selected.test.assert.find(a=>a.id===assertion)!;const ids=[...new Set([a.decide!].flat()[0]!.match(/\bE\d{2}\b/g)??[])];assert.deepEqual(Object.keys(packet.evidence).sort(),(ids.length?ids:[...selected.evidence!]).sort());
      return 1;
    });
    assert.equal(pass.pass,true);assert.equal(pass.offlineDecisionCalls,82);
    for(const target of targets) {
      const result=await gate(root,reviewWorkspace,decision,input=>input.assertion===target?0:1);
      assert.equal(result.pass,false);assert.equal(result.offlineDecisionCalls,82);
      const owner=suite.find(s=>s.test.assert.some(a=>a.id===target))!;
      const assertion=owner.test.assert.find(a=>a.id===target)!;
      assert.deepEqual(result.findings,[{test:owner.test.id,domain:owner.domain,assertion:target,error:assertion.error}]);
    }
    }finally{await rm(reviewWorkspace,{recursive:true,force:true});}
  }
}finally {await rm(temp,{recursive:true,force:true});}
console.log(JSON.stringify({offline:true,assertions:82,domains:3,specimens,selectedPackets:selected,presets:['luna','jev'],singleFailureTargets:9,semanticValidation:'not-run'}));
