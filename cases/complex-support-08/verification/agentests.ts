/** Offline corpus contract checks, never a semantic classifier. */
import assert from 'node:assert/strict';
import {readFile,readdir,mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {Agentests} from 'agentests';
import {config,loadDomainSuite,installDomainSuite} from '../../../harness/treatments/gate.ts';
import {replay,type Policy} from '../../../harness/fixture-engine.ts';
import {derive} from '../fixture/src/integrations.ts';
const root=join(import.meta.dir,'..'),suite=await loadDomainSuite(root);
const policy:Policy=await Bun.file(join(root,'fixture/policies/domain.json')).json();
const provenance=await Bun.file(join(root,'fixture/provenance.json')).json();
const frozen=new Map<string,string>();
for(const doc of provenance.documents)frozen.set(doc.id,await readFile(join(root,'fixture/docs/evidence',doc.file),'utf8'));
const total=suite.reduce((n,item)=>n+item.test.assert.length,0);
let packetCount=0,skipCount=0;
for(const item of suite){
 const coverage=await readFile(join(item.source,'TEST.md'),'utf8');
 for(const assertion of item.test.assert){
  assert(coverage.includes('`'+assertion.id+'`'),'Missing assertion coverage row');
  for(const id of assertion.decide!.toString().match(/E\d\d/g)??[])assert(item.evidence!.includes(id),'Question cites evidence excluded by manifest');
 }
 for(const name of await readdir(join(item.source,'evals'))){
  const folder=join(item.source,'evals',name);
  const expectation=Bun.YAML.parse(await readFile(join(folder,'eval.yaml'),'utf8')) as {expect:string};
  assert(['pass','fail','skip'].includes(expectation.expect));
  if(expectation.expect==='skip'){
   assert.equal(await Bun.file(join(folder,'review.md')).exists(),false);skipCount++;continue;
  }
  const packet=await Bun.file(join(folder,'review.md')).json();
  assert.deepEqual(Object.keys(packet).sort(),['audit','evidence','outputs','state']);
  assert.deepEqual(Object.keys(packet.outputs).sort(),['plan.md','reply.md']);
  for(const text of Object.values(packet.outputs))assert(typeof text==='string'&&text.length>0);
  replay(policy,{state:packet.state,audit:packet.audit},derive);
  assert.deepEqual(Object.keys(packet.evidence),item.evidence);
  for(const id of item.evidence!)assert.equal(packet.evidence[id],frozen.get(id));
  packetCount++;
 }
}
// Native eval is exercised with fixed engines, independent of authored semantic expectations.
// Score 1 must select and pass every review.md; score 0 must report every assertion.
const original=process.cwd(),temp=await mkdtemp(join(tmpdir(),'support08-native-evals-'));
try{
 await installDomainSuite(suite,temp);
 await writeFile(join(temp,'agentests.config.yaml'),JSON.stringify(config('luna')));
 const git=Bun.spawn(['git','init','--quiet',temp],{stdout:'ignore',stderr:'pipe'});assert.equal(await git.exited,0);
 process.chdir(temp);
 for(const score of [1,0]){
  let calls=0;
  class Injected extends Agentests{
   constructor(){
    super(config('luna'),{OPENAI_API_KEY:'offline-placeholder',TYPESAFE_AI_API_KEY:'offline-placeholder'});
    this.engines.decide=async()=>{calls++;return score;};
    this.engines.reason=async()=>{throw Error('Unexpected reasoning');};
   }
  }
  const results=await new Injected().eval();let expectedCalls=0,seenSkips=0;
  for(const result of results){
   const item=suite.find(i=>i.test.id===result.test.id)!;
   for(const specimen of result.evals){
    if(specimen.eval.expect==='skip'){assert.equal(specimen.actual,'skip');seenSkips++;}
    else{
     assert.equal(specimen.actual,score===1?'pass':'fail');
     assert.equal(specimen.findings.length,score===1?0:item.test.assert.length);
     if(score===0)assert.deepEqual(specimen.findings.map(f=>f.assertion.id),item.test.assert.map(a=>a.id));
     expectedCalls+=item.test.assert.length;
    }
   }
  }
  assert.equal(calls,expectedCalls);assert.equal(seenSkips,skipCount);
 }
}finally{process.chdir(original);await rm(temp,{recursive:true,force:true});}
console.log(JSON.stringify({offline:true,assertions:total,domains:Object.fromEntries(suite.map(i=>[i.domain,i.test.assert.length])),canonicalPackets:packetCount,irrelevantSkips:skipCount,semanticExpectations:'authored-not-model-validated'}));
