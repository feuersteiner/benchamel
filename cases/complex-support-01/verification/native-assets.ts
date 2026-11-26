/** Offline structural/native wiring checks; injected outcomes do not judge prose. */
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Agentests, parseEval } from 'agentests';
import { config, gate, installDomainSuite, loadDomainSuite } from '../../../harness/treatments/gate.ts';
import { canonical, replay } from '../fixture/src/workflows.ts';

export async function verifyNativeAssets(root:string) {
  const suite=await loadDomainSuite(root), total=suite.reduce((n,s)=>n+s.test.assert.length,0);
  const authored=new Map<string,{domain:string;failed:string[]}>();
  let evalCount=0;
  for(const item of suite) {
    const document=await readFile(join(item.source,'TEST.md'),'utf8');
    for(const assertion of item.test.assert) {
      assert(document.includes('`'+assertion.id+'`'),'Missing assertion coverage row');
      const question=[assertion.decide!].flat()[0]!;
      for(const [,id] of question.matchAll(/evidence\.(E\d\d)/g))assert(item.evidence!.includes(id!),'Question source missing from domain manifest');
    }
    const folders=(await readdir(join(item.source,'evals'))).sort();
    assert.deepEqual(folders,['bounded-review','irrelevant','safe','single-property','unsafe']);
    for(const folder of folders) {
      evalCount++;
      const path=join(item.source,'evals',folder),expected=parseEval(await readFile(join(path,'eval.yaml'),'utf8')).expect;
      if(folder==='irrelevant') {
        assert.equal(expected,'skip');assert.equal(await Bun.file(join(path,'review.md')).exists(),false);continue;
      }
      const bytes=await readFile(join(path,'review.md'),'utf8'),packet=JSON.parse(bytes);
      assert.deepEqual(Object.keys(packet).sort(),['audit','evidence','outputs','state']);
      assert.deepEqual(Object.keys(packet.outputs).sort(),['plan.md','reply.md']);
      for(const output of Object.values(packet.outputs)){assert.equal(typeof output,'string');assert((output as string).trim());assert(!(output as string).includes('{finance}'));}
      assert.equal(canonical(replay({state:packet.state,audit:packet.audit})),canonical(packet.state));
      assert.deepEqual(Object.keys(packet.evidence).sort(),[...item.evidence!].sort());
      const sources=JSON.parse(await readFile(join(root,'fixture/provenance.json'),'utf8')).documents.map((s:any,i:number)=>({...s,id:s.id??`E${String(i+1).padStart(2,'0')}`}));
      for(const [id,text]of Object.entries(packet.evidence))assert.equal(text,await readFile(join(root,'fixture/docs/evidence',sources.find((s:any)=>s.id===id).file),'utf8'));
      const meta=JSON.parse(await readFile(join(path,'specimen.json'),'utf8'));
      const failed=meta.expectedFailingAssertions as string[];
      assert.equal(new Set(failed).size,failed.length);
      for(const id of failed)assert(item.test.assert.some(a=>a.id===id));
      assert.equal(expected,failed.length?'fail':'pass');
      if(folder==='single-property')assert.equal(failed.length,1);
      if(folder==='bounded-review'){assert.equal(packet.state.finance.status,'requested');assert.equal(packet.state.finance.request.postAt,'2024-03-04T10:00:00Z');}
      authored.set(bytes,{domain:item.domain,failed});
    }
  }
  assert.equal(evalCount,15);
  const temp=await mkdtemp(join(tmpdir(),'benchamel-case01-native-assets-')),previous=process.cwd();
  try {
    await installDomainSuite(suite,temp);
    for(const decision of ['luna','jev'] as const) {
      let calls=0;
      class InjectedEvals extends Agentests {
        constructor(){
          super(config(decision),{OPENAI_API_KEY:'offline-placeholder',TYPESAFE_AI_API_KEY:'offline-placeholder'});
          this.engines.decide=async(input,criteria)=>{
            const specimen=authored.get(input);assert(specimen,'Native eval supplied unexpected packet');
            const item=suite.find(s=>s.domain===specimen.domain)!;
            const assertion=item.test.assert.find(a=>JSON.stringify(a.decide)===JSON.stringify(criteria));assert(assertion);
            calls++;return specimen.failed.includes(assertion.id)?0:1;
          };
          this.engines.reason=async()=>{throw Error('Unexpected reasoning call');};
        }
      }
      process.chdir(temp);
      const results=await new InjectedEvals().eval();
      process.chdir(previous);
      assert.equal(results.length,3);assert.equal(calls,total*4);
      assert.equal(results.flatMap(r=>r.evals).length,15);
      for(const result of results)for(const evaluation of result.evals)assert.equal(evaluation.matches,true);
    }
    const workspace=join(temp,'workspace');await cp(join(root,'fixture'),workspace,{recursive:true});
    const specimen=JSON.parse(await readFile(join(suite[0]!.source,'evals/safe/review.md'),'utf8'));
    await writeFile(join(workspace,'state/runtime.json'),JSON.stringify({state:specimen.state,audit:specimen.audit}));
    for(const [name,text]of Object.entries(specimen.outputs))await writeFile(join(workspace,name),text as string);
    for(const decision of ['luna','jev'] as const)for(const item of suite) {
      const id=JSON.parse(await readFile(join(item.source,'evals/single-property/specimen.json'),'utf8')).expectedFailingAssertions[0];
      const result=await gate(root,workspace,decision,input=>{
        const selected=suite.find(s=>s.domain===input.domain)!;
        assert.deepEqual(Object.keys(input.packet.evidence).sort(),[...selected.evidence!].sort());
        return input.assertion===id?0:1;
      });
      assert.equal(result.pass,false);assert.equal(result.offlineDecisionCalls,total);
      assert.deepEqual(result.findings.map(f=>[f.test,f.domain,f.assertion]),[[item.test.id,item.domain,id]]);
    }
  }finally {process.chdir(previous);await rm(temp,{recursive:true,force:true});}
  console.log(JSON.stringify({case:'complex-support-01',nativeEvalLayout:'passed-with-injected-expectations',evals:evalCount,assertions:Object.fromEntries(suite.map(s=>[s.domain,s.test.assert.length])),semanticValidation:'not-run'}));
}
if(import.meta.main)await verifyNativeAssets(join(import.meta.dir,'..'));
