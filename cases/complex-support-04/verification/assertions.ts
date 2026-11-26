/** Offline structure, replay, native eval routing and authored-answer injection; no semantic measurement. */
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Agentests, parseEval } from 'agentests';
import { canonical, replay, type Policy, type Runtime } from '../../../harness/fixture-engine.ts';
import { config, installDomainSuite, loadDomainSuite } from '../../../harness/treatments/gate.ts';
import { derive } from '../fixture/src/integrations.ts';

const root=join(import.meta.dir,'..'),suite=await loadDomainSuite(root);
assert.equal(await Bun.file(join(root,'treatments/agentests/test.yaml')).exists(),false);
const policy:Policy=JSON.parse(await readFile(join(root,'fixture/policies/domain.json'),'utf8'));
const authoredFailures:Record<string,{single:string;unsafe:string}>={
  legal:{single:'cs04-legal-notice-server-scope',unsafe:'cs04-legal-signed-delegation-recognized'},
  marketing:{single:'cs04-marketing-legacy-status-pressure',unsafe:'cs04-marketing-claim-review-independent'},
  'customer-support':{single:'cs04-customer-support-refund-claim-evidence',unsafe:'cs04-customer-support-builder-verification'},
};
// Answers are deliberately supplied from authored labels, never inferred from specimen content.
const labels=new Map<string,Set<string>>();
let specimens=0;
for(const item of suite){
  assert.equal(item.test.assert.length,20);
  const doc=await readFile(join(item.source,'TEST.md'),'utf8');
  for(const a of item.test.assert){
    assert(doc.includes(a.id),`Missing coverage row: ${a.id}`);
    for(const match of String(a.decide).matchAll(/evidence\.(E\d+)/g))assert(item.evidence!.includes(match[1]!));
  }
  const packets:Record<string,any>={};
  assert.deepEqual((await readdir(join(item.source,'evals'))).sort(),['alternative','irrelevant','safe','single-property','unsafe']);
  for(const name of ['safe','unsafe','single-property','alternative','irrelevant']){
    const folder=join(item.source,'evals',name),expect=parseEval(await readFile(join(folder,'eval.yaml'),'utf8')).expect;
    specimens++;
    if(name==='irrelevant'){assert.equal(expect,'skip');assert.equal(await Bun.file(join(folder,'review.md')).exists(),false);continue;}
    const packet=JSON.parse(await readFile(join(folder,'review.md'),'utf8'));packets[name]=packet;
    assert.deepEqual(Object.keys(packet).sort(),['audit','evidence','outputs','state']);
    assert.deepEqual(Object.keys(packet.outputs).sort(),['plan.md','reply.md']);
    assert.deepEqual(Object.keys(packet.evidence).sort(),[...item.evidence!].sort());
    replay(policy,{state:packet.state,audit:packet.audit} as Runtime,derive);
    const target=name==='single-property'?authoredFailures[item.domain]!.single:name==='unsafe'?authoredFailures[item.domain]!.unsafe:undefined;
    assert.equal(expect,target?'fail':'pass');
    if(target)assert(item.test.assert.some(a=>a.id===target));
    labels.set(canonical(packet),new Set(target?[target]:[]));
  }
  assert.deepEqual(packets.safe.state,packets['single-property'].state);
  assert.deepEqual(packets.safe.audit,packets['single-property'].audit);
  assert.deepEqual(packets.safe.evidence,packets['single-property'].evidence);
  assert.equal(Object.keys(packets.safe.outputs).filter(key=>packets.safe.outputs[key]!==packets['single-property'].outputs[key]).length,1);
}
const temp=await mkdtemp(join(tmpdir(),'cs04-native-eval-')),previous=process.cwd();
try{
  await installDomainSuite(suite,temp);
  process.chdir(temp);
  for(const decision of ['luna','jev'] as const){
    const settings=config(decision);await writeFile(join(temp,'agentests.config.yaml'),JSON.stringify(settings));
    let calls=0;
    class AuthoredAnswers extends Agentests{
      constructor(){super(settings,{OPENAI_API_KEY:'offline-placeholder',TYPESAFE_AI_API_KEY:'offline-placeholder'});
        this.engines.decide=async(input,criteria)=>{
          calls++;const failures=labels.get(canonical(JSON.parse(input)));assert(failures,'Unexpected native eval packet');
          const a=suite.flatMap(t=>t.test.assert).find(a=>JSON.stringify(a.decide)===JSON.stringify(criteria));assert(a,'Unexpected question');
          return failures.has(a.id)?0:1;
        };
        this.engines.reason=async()=>{throw Error('No reasoning or network authorized');};
      }
    }
    const results=await new AuthoredAnswers().eval();assert.equal(results.length,3);assert.equal(calls,240);
    for(const result of results){assert.equal(result.evals.length,5);for(const e of result.evals)assert(e.matches);}
  }
}finally{process.chdir(previous);await rm(temp,{recursive:true,force:true});}
console.log(JSON.stringify({offline:true,domains:3,assertions:60,specimens,nativeEvalRouting:'passed-with-authored-answer-double',semanticValidation:'not-run'}));
