import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { boundary, hash, textFile } from './boundary.ts';
import { canonical, replay, type Policy, type Runtime } from './fixture-engine.ts';
import { assess } from './semantic.ts';
type Criterion = {id:string; points:number; any:Record<string,unknown>[]};
export async function inspect(caseRoot:string,workspace:string) {
  await boundary(caseRoot,workspace);
  const policy:Policy=JSON.parse(await readFile(join(caseRoot,'fixture/policies/domain.json'),'utf8'));
  const runtime:Runtime=JSON.parse(await textFile(join(workspace,'state/runtime.json')));
  const {derive}=await import(join(caseRoot,'fixture/src/integrations.ts'));
  const state=replay(policy,runtime,derive);
  if(state.commitments&&(canonical(state.commitments.domain)!==canonical(state.domain)||Date.parse(state.commitments.nextUpdate)<Date.parse(state.now)))throw Error('Stale commitments');
  if(state.handoff&&(canonical(state.handoff.domain)!==canonical(state.domain)||canonical(state.handoff.tasks)!==canonical(state.tasks)))throw Error('Stale handoff');
  const criteria:Criterion[]=JSON.parse(await readFile(join(caseRoot,'judge-policy.json'),'utf8'));
  const details:Record<string,number>={};
  for(const c of criteria)details[c.id]=c.any.some(option=>Object.entries(option).every(([key,value])=>canonical(state.domain[key])===canonical(value)))?c.points:0;
  details.ownership=Object.keys(policy.areas).every(area=>state.tasks.some((t:any)=>t.area===area&&Date.parse(t.due)>=Date.parse(state.now)))?4:0;
  details.commitments=state.commitments?3:0;details.handoff=state.handoff?3:0;
  return {score:Object.values(details).reduce((a,b)=>a+b,0),details,state,audit:runtime.audit};
}
export async function judgeDomain(caseRoot:string,workspace:string) {
  const retain=async(data:unknown)=>{const path=join(workspace,'judge-assessment.json');await rm(path,{force:true});await writeFile(path,JSON.stringify(data,null,2)+'\n',{flag:'wx'});};
  let checked:Awaited<ReturnType<typeof inspect>>,outputs:Record<string,string>={};
  try {
    checked=await inspect(caseRoot,workspace);
    for(const file of ['reply.md','plan.md'])outputs[file]=await textFile(join(workspace,file),65536);
  }catch(e){await retain({judgeVersion:'1.0',score:0,breach:String(e)});return 0;}
  const documents:Record<string,string>={STATE:JSON.stringify(checked.state,null,2),AUDIT:JSON.stringify(checked.audit,null,2)};
  const provenance=JSON.parse(await readFile(join(caseRoot,'fixture/provenance.json'),'utf8'));
  for(const item of provenance.documents) {
    const bytes=await readFile(join(caseRoot,'fixture/docs/evidence',item.file));
    if(hash(bytes)!==item.sha256||bytes.length!==item.bytes)throw Error('Source provenance mismatch');
    documents[item.id]=bytes.toString('utf8');
  }
  try {
    const result=await assess(await readFile(join(caseRoot,'CASE.md'),'utf8'),await readFile(join(caseRoot,'JUDGE.md'),'utf8'),documents,outputs);
    const score=result.hardBreach?0:Math.round((checked.score+0.6*result.semantic)*100)/100;
    await retain({judgeVersion:'1.0',operational:checked, ...result,score});return score;
  }catch(e){await retain({judgeVersion:'1.0',score:null,inferenceFailure:String(e)});throw e;}
}
