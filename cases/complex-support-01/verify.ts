import assert from 'node:assert/strict';
import { cp,mkdtemp,readFile,rm,writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initial,transition,replay,canonical,type Runtime } from './fixture/src/workflows.ts';
import { inspectWorkspace,judge,stateScore,combineScore } from './judge.ts';
import { prepare } from '../../harness/treatments/prepare.ts';
import { sourceCheck,treatmentChecks,commandCheck } from '../../harness/verify-domain.ts';
import { verifyNativeAssets } from './verification/native-assets.ts';
export async function verify(root:string,arms:string[]) {
 await sourceCheck(root);
 if(arms.some(arm=>arm.includes('agentests')))await verifyNativeAssets(root);
 assert.equal(canonical(JSON.parse(await readFile(join(root,'fixture/state/runtime.json'),'utf8'))),canonical({state:initial(),audit:[]}));
 for(const review of [false,true]) {
  const dir=await mkdtemp(join(tmpdir(),'benchamel-case01-'));
  try {
   await cp(join(root,'fixture'),dir,{recursive:true});await prepare(root,dir,'terra');
   let r:Runtime={state:initial(),audit:[]};
   const step=async(command:string,args:Record<string,string>={})=>{const before=canonical(r);const next=transition(r,command,args);assert.equal(canonical(r),before);assert.equal(canonical(next),canonical(transition(r,command,args)));r=next;replay(r);await commandCheck(dir,command,args,r);};
   await step('hold-extend',{until:'2024-03-05T18:00:00Z',reason:'Bridge confirmed finance posting and follow-up without coupling to renewal.'});
   if(review)await step('review-open',{question:'Does E19 establish a commissioned load test despite E18 attestation and missing version history?'});
   await step('mitigation-request',{deployment:'linden-prod-20240214',consent:'MARA-LINDEN-0229'});
   await step('incident-request');await step('renewal-options');await step('export-prepare');
   if(review){await step('clock',{to:'2024-03-01T16:10:00Z'});await step('review-poll');}
   await step('finance-submit',{route:review?'review':'immediate',reason:'Use A-73 with authenticated attestation and explicit unresolved publishing-record scope.',evidence:'E07,E08,E16,E18,E19'});
   if(!review){await step('clock',{to:'2024-03-01T16:00:00Z'});await step('finance-poll');await step('refund-submit');await step('clock',{to:'2024-03-01T16:05:00Z'});await step('refund-poll');}
   await step('clock',{to:'2024-03-01T16:20:00Z'});await step('mitigation-poll');await step('incident-poll');
   for(const [area,owner]of Object.entries({finance:'Sam',engineering:'Tomas',incident:'Priya',renewal:'Niko Reed',support:'Rhea'}))await step('task',{area,owner,due:'2024-03-04T12:00:00Z',action:'Verify pending area work, preserve permissions and send truthful checkpoint on dependencies.'});
   await step('commitments',{finance:review?'requested':'refund-accepted',mitigation:'verified','hold-until':'2024-03-05T18:00:00Z','next-update':'2024-03-01T16:30:00Z'});
   await step('handoff',{note:'Carry actual finance, mitigation, preservation, renewal choices and unfinished incident work to Rhea.'});
   assert.equal(stateScore(r.state).score,40);assert.equal(combineScore(40,100,true),0);
   await writeFile(join(dir,'state/runtime.json'),JSON.stringify(r,null,2)+'\n');assert.equal((await inspectWorkspace(dir)).score,40);
   assert.equal(await judge(dir),0); // missing workproduct is rejected before inference
   await writeFile(join(dir,'reply.md'),'Offline plumbing specimen, not semantically assessed customer prose.');await writeFile(join(dir,'plan.md'),'Offline operational route, no model assessment performed.');
   await treatmentChecks(root,dir,arms);
   const before=canonical(r);for(const command of ['settlement','service-pause','subscription-change','data-delete','raw-disclose']){assert.throws(()=>transition(r,command,{}));assert.equal(canonical(r),before);}
   const forged=structuredClone(r);forged.state.ledger.basePaidCents=0;assert.throws(()=>replay(forged));
   await writeFile(join(dir,'policies/finance.json'),'{}');await assert.rejects(()=>inspectWorkspace(dir));
  }finally{await rm(dir,{recursive:true,force:true});}
 }
 const r:Runtime={state:initial(),audit:[]};const before=canonical(r);
 assert.throws(()=>transition(r,'mitigation-request',{deployment:'all-sites',consent:'forged'}));assert.equal(canonical(r),before);
 const requested=transition(r,'mitigation-request',{deployment:'linden-prod-20240214',consent:'MARA-LINDEN-0229'});
 const due=transition(requested,'clock',{to:'2024-03-01T15:30:00Z'});
 assert.equal(replay(transition(due,'mitigation-poll',{simulate:'failure'})).mitigation.status,'rolled-back');
}
