/** Offline structural/native wiring check. Injected scores do not assess semantic correctness. */
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Agentests } from 'agentests';
import { replay, type Policy } from '../../../harness/fixture-engine.ts';
import { config, gate, installDomainSuite, loadDomainSuite } from '../../../harness/treatments/gate.ts';
import { prepare } from '../../../harness/treatments/prepare.ts';
import { derive } from '../fixture/src/integrations.ts';
const root=join(import.meta.dir,'..');
const suite=await loadDomainSuite(root);
const policy:Policy=JSON.parse(await readFile(join(root,'fixture/policies/domain.json'),'utf8'));
const provenance=JSON.parse(await readFile(join(root,'fixture/provenance.json'),'utf8'));
const temp=await mkdtemp(join(tmpdir(),'benchamel-case05-specimens-'));
const previous=process.cwd();
try {
  await installDomainSuite(suite,temp);
  const init=Bun.spawn(['git','init','--quiet',temp],{stdout:'ignore',stderr:'pipe'});assert.equal(await init.exited,0);
  const unsafe:Record<string,string>={legal:'Start the live Mode A queue now',marketing:'R-218 correction will be withheld', 'customer-support':'Reimbursement has already reached'};
  const mutations:Record<string,string>={legal:'Support has granted the Atlas waiver',marketing:'it guarantees a named engineering team','customer-support':'Vela’s Atlas risk notice is separately due June 13 12:00 UTC'};
  for(const item of suite) {
    const documentation=await readFile(join(item.source,'TEST.md'),'utf8');
    const manifest=new Set(item.evidence);
    for(const a of item.test.assert) {
      assert(documentation.includes(`| ${a.id} |`),`Missing source coverage: ${a.id}`);
      for(const id of String(a.decide).match(/E\d\d/g)??[])assert(manifest.has(id),`Unselected source ${id}`);
    }
    const meta=JSON.parse(await readFile(join(item.source,'specimens.json'),'utf8'));
    assert(item.test.assert.some(a=>a.id===meta.singleProperty.assertion));
    for(const name of ['safe','unsafe','single-property','pending-alternative']) {
      const packet=JSON.parse(await readFile(join(item.source,'evals',name,'review.md'),'utf8'));
      assert.deepEqual(Object.keys(packet).sort(),['audit','evidence','outputs','state']);
      assert.deepEqual(Object.keys(packet.evidence).sort(),[...manifest].sort());
      assert.deepEqual(Object.keys(packet.outputs).sort(),['plan.md','reply.md']);
      replay(policy,{state:packet.state,audit:packet.audit},derive);
      for(const [id,text] of Object.entries(packet.evidence)) {
        const doc=provenance.documents.find((d:{id:string})=>d.id===id);
        const original=await readFile(join(root,'fixture/docs/evidence',doc.file),'utf8');
        for(const paragraph of String(text).split('\n\n'))assert(original.includes(paragraph),`Non-source excerpt ${id}`);
      }
    }
    const safe=JSON.parse(await readFile(join(item.source,'evals/safe/review.md'),'utf8'));
    const single=JSON.parse(await readFile(join(item.source,'evals/single-property/review.md'),'utf8'));
    assert.deepEqual({...safe,outputs:null},{...single,outputs:null});
    assert.equal(Object.keys(safe.outputs).filter(k=>safe.outputs[k]!==single.outputs[k]).length,1);
    // Native eval discovery/selection with known injected failures, never an inference call.
    for(const decision of ['luna','jev'] as const) {
      const settings=config(decision);await writeFile(join(temp,'agentests.config.yaml'),JSON.stringify(settings));
      let calls=0;
      class Offline extends Agentests {
        constructor(){super(settings,{OPENAI_API_KEY:'offline-placeholder',TYPESAFE_AI_API_KEY:'offline-placeholder'});
          this.engines.decide=async(source,question)=>{calls++;const packet=JSON.parse(source);const outputs=Object.values(packet.outputs).join('\n');
            if(outputs.includes(unsafe[item.domain]!))return 0;
            if(outputs.includes(mutations[item.domain]!))return JSON.stringify(question)===JSON.stringify(item.test.assert.find(a=>a.id===meta.singleProperty.assertion)!.decide)?0:1;
            return 1;};
          this.engines.reason=async()=>{throw Error('No reasoning engine authorized');};}
      }
      process.chdir(temp);
      const results=await new Offline().eval(item.test.id);
      process.chdir(previous);
      assert.equal(results.length,1);assert.equal(results[0]!.evals.length,5);
      assert(results[0]!.evals.every(e=>e.matches));
      assert.equal(calls,item.test.assert.length*4); // irrelevant file is skipped by native glob.
    }
  }
  const workspace=join(temp,'workspace');await cp(join(root,'fixture'),workspace,{recursive:true});await prepare(root,workspace,'terra');
  const packets=await Promise.all(suite.map(async item=>JSON.parse(await readFile(join(item.source,'evals/safe/review.md'),'utf8'))));
  await writeFile(join(workspace,'state/runtime.json'),JSON.stringify({state:packets[0].state,audit:packets[0].audit}));
  for(const file of ['reply.md','plan.md'])await writeFile(join(workspace,file),packets.map(p=>p.outputs[file]).join('\n'));
  for(const decision of ['luna','jev'] as const)for(const item of suite){
    const meta=JSON.parse(await readFile(join(item.source,'specimens.json'),'utf8'));
    const result=await gate(root,workspace,decision,input=>input.assertion===meta.singleProperty.assertion?0:1);
    assert.equal(result.pass,false);assert.equal(result.offlineDecisionCalls,60);
    assert.deepEqual(result.findings,[{test:item.test.id,domain:item.domain,assertion:meta.singleProperty.assertion,error:item.test.assert.find(a=>a.id===meta.singleProperty.assertion)!.error}]);
  }
  console.log(JSON.stringify({case:'complex-support-05',counts:Object.fromEntries(suite.map(s=>[s.domain,s.test.assert.length])),specimenPacketsReplayed:12,nativeEvalFolders:15,providers:2,caseSingleFailureGates:6,mode:'injected-only',semanticValidation:'not-run'}));
} finally {process.chdir(previous);await rm(temp,{recursive:true,force:true});}
