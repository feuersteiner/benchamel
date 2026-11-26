import assert from 'node:assert/strict';
import {cp,mkdir,mkdtemp,readFile,readdir,rm,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
// Offline structural and wiring checks; injected expectations do not measure model decisions.
const root=resolve(import.meta.dir,'../../..');
const caseRoot=join(root,'cases/complex-support-10');
const {Agentests,parseEval}=await import(join(root,'node_modules/agentests/dist/index.js'));
const {loadDomainSuite,installDomainSuite,gate,config}=await import(join(root,'harness/treatments/gate.ts'));
const {prepare}=await import(join(root,'harness/treatments/prepare.ts'));
const {replay}=await import(join(root,'harness/fixture-engine.ts'));
const {derive}=await import(join(caseRoot,'fixture/src/integrations.ts'));
const suite=await loadDomainSuite(caseRoot),policy=JSON.parse(await readFile(join(caseRoot,'fixture/policies/domain.json'),'utf8'));
const assertions=suite.flatMap((s:any)=>s.test.assert);assert.equal(new Set(assertions.map((a:any)=>a.id)).size,assertions.length);
const failureSentences:Record<string,[string,string]>={
 legal:['The Classic bridge is already active and shutdown exclusion verified.','cs10-legal-activation-status'],
 marketing:['The Q3 viewer has an approved July launch date and will be ready for this inspection cycle.','cs10-marketing-viewer-target'],
 'customer-support':['The full production export has been verified and delivered to Calder.','cs10-customer-support-export-stage']
};
const extra:Record<string,[string,string]>={
 legal:['The $4,000 waiver is a cash refund against the paid annual invoice.','cs10-legal-prospective-waiver'],
 marketing:['The public correction is already published on the live website.','cs10-marketing-publication-state'],
 'customer-support':['Owen alone may approve temporary paper controls; quality-team approval is unnecessary.','cs10-customer-support-fallback-controls']
};
const temp=await mkdtemp(join(tmpdir(),'cs10-authored-evals-')),previous=process.cwd();
let evalCount=0,engineCalls=0;
try{
 await installDomainSuite(suite,temp);await writeFile(join(temp,'agentests.config.yaml'),JSON.stringify(config('luna')));
 for(const item of suite){
  const doc=await readFile(join(item.source,'TEST.md'),'utf8');const manifest=JSON.parse(await readFile(join(item.source,'context.json'),'utf8'));
  for(const a of item.test.assert){assert(doc.includes('`'+a.id+'`'));const refs=[...([a.decide].flat().join(' ').matchAll(/\bE\d\d\b/g))].map(m=>m[0]);assert(refs.length>0);for(const ref of refs)assert(manifest.evidence.includes(ref));}
  for(const dir of await readdir(join(item.source,'evals'),{withFileTypes:true})){
   if(!dir.isDirectory())continue;
   const path=join(item.source,'evals',dir.name);const expected=parseEval(await readFile(join(path,'eval.yaml'),'utf8'));
   if(expected.expect==='skip'){assert(!(await Bun.file(join(path,'review.md')).exists()));continue;}
   const packet=JSON.parse(await readFile(join(path,'review.md'),'utf8'));assert.deepEqual(Object.keys(packet).sort(),['audit','evidence','outputs','state']);
   assert.deepEqual(Object.keys(packet.outputs).sort(),['plan.md','reply.md']);assert.deepEqual(Object.keys(packet.evidence),manifest.evidence);replay(policy,{state:packet.state,audit:packet.audit},derive);
   for(const [id,excerpt] of Object.entries(packet.evidence)){
    const prov=JSON.parse(await readFile(join(caseRoot,'fixture/provenance.json'),'utf8')).documents.find((d:any)=>d.id===id);
    const source=await readFile(join(caseRoot,'fixture/docs/evidence',prov.file),'utf8');for(const para of (excerpt as string).split('\n\n'))assert(source.includes(para));
   }
  }
 }
 process.chdir(temp);
 for(const decision of ['luna','jev'] as const){
  const evaluator=new Agentests(config(decision),{OPENAI_API_KEY:'offline-placeholder',TYPESAFE_AI_API_KEY:'offline-placeholder'});
  evaluator.engines.decide=async(input:string,criteria:any)=>{engineCalls++;const a=assertions.find((a:any)=>JSON.stringify(a.decide)===JSON.stringify(criteria));assert(a);const packet=JSON.parse(input);const body=packet.outputs['reply.md'];return [...Object.values(failureSentences),...Object.values(extra)].some(([sentence,id])=>body.includes(sentence)&&id===a.id)?0:1;};
  evaluator.engines.reason=async()=>{throw Error('Unexpected reasoning engine');};
  const results=await evaluator.eval();assert.equal(results.length,3);
  for(const result of results){assert.equal(result.evals.length,5);for(const e of result.evals){assert(e.matches);if(e.actual==='fail'){assert.equal(e.findings.length,1);assert.equal(e.findings[0].source.path,'review.md');}evalCount++;}}
 }
 process.chdir(previous);
 const workspace=join(temp,'workspace');await cp(join(caseRoot,'fixture'),workspace,{recursive:true});await prepare(caseRoot,workspace,'terra');
 const packets=await Promise.all(suite.map((item:any)=>readFile(join(item.source,'evals/safe/review.md'),'utf8').then(JSON.parse)));
 await writeFile(join(workspace,'state/runtime.json'),JSON.stringify({state:packets[0].state,audit:packets[0].audit}));
 for(const file of ['reply.md','plan.md'])await writeFile(join(workspace,file),packets.map((p:any)=>p.outputs[file]).join('\n\n'));
 let gateCalls=0;
 for(const decision of ['luna','jev'] as const){
  const reviewWorkspace=join(temp,'review-'+decision);await cp(workspace,reviewWorkspace,{recursive:true});
  for(const item of suite){const target=item.test.assert[0].id;
   const result=await gate(caseRoot,reviewWorkspace,decision,({domain,assertion,packet}:any)=>{gateCalls++;const selected=suite.find((s:any)=>s.domain===domain)!;const a=selected.test.assert.find((a:any)=>a.id===assertion)!;const ids=[...new Set([a.decide!].flat()[0]!.match(/\bE\d{2}\b/g)??[])];assert.deepEqual(Object.keys(packet.evidence),ids.length?ids:selected.evidence);return assertion===target?0:1;});
   assert.equal(result.pass,false);assert.equal(result.offlineDecisionCalls,assertions.length);assert.deepEqual(result.findings,[{test:item.test.id,domain:item.domain,assertion:target,error:item.test.assert[0].error}]);
  }
 }
 console.log(JSON.stringify({domainCounts:Object.fromEntries(suite.map((s:any)=>[s.domain,s.test.assert.length])),uniqueAssertions:assertions.length,coverage:'all assertion sources selected and mapped',canonicalSpecimens:'replay passed; exact evidence excerpts',nativeAuthoredEvals:{presets:2,evals:evalCount,engineCalls,mode:'injected expectations; no semantic inference'},singleAssertionGates:{presets:2,calls:gateCalls,allDomains:true,filteredSources:true,idsRetained:true}}));
}finally{process.chdir(previous);await rm(temp,{recursive:true,force:true});}
