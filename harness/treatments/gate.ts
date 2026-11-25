import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Agentests } from 'agentests';
import { textFile } from '../boundary.ts';
// Native agentests config schema, inspected in v1.0.1. No reasoning assertions are used.
export function config(decision:'luna'|'jev') {
  return {decision: decision==='luna'?{api:'openai' as const,url:'https://api.openai.com/v1',model:'gpt-6-luna',apiKeyEnv:'OPENAI_API_KEY'}:{api:'jev' as const,url:'https://api.typesafe.ai/v1',model:'jev-latest',apiKeyEnv:'TYPESAFE_AI_API_KEY'},
    reasoning:{api:'openai' as const,url:'https://api.openai.com/v1',model:'gpt-6-sol',apiKeyEnv:'OPENAI_API_KEY'},select:{threshold:0.5},assert:{threshold:0.5},ignore:[]};
}
export async function gate(caseRoot:string,workspace:string,decision:'luna'|'jev',offlineScore?:number) {
  let decisionCalls=0;
  const temp=await mkdtemp(join(tmpdir(),'benchamel-gate-'));const previous=process.cwd();
  try {
    const {inspectWorkspace}=await import(join(caseRoot,'judge.ts'));
    const state=await inspectWorkspace(workspace);
    const outputs:Record<string,string>={};
    for(const file of ['reply.md','plan.md'])outputs[file]=await textFile(join(workspace,file),65536);
    const source=join(caseRoot,'treatments/agentests');
    const test=Bun.YAML.parse(await readFile(join(source,'test.yaml'),'utf8')) as {id:string};
    await cp(source,join(temp,'.agents/tests',test.id),{recursive:true});
    const evidence:Record<string,string>={};
    const provenance=JSON.parse(await readFile(join(caseRoot,'fixture/provenance.json'),'utf8'));
    for(const [i,item] of provenance.documents.entries())evidence[item.id??`E${String(i+1).padStart(2,'0')}`]=await readFile(join(caseRoot,'fixture/docs/evidence',item.file),'utf8');
    await writeFile(join(temp,'review.md'),JSON.stringify({outputs,state:state.state,audit:state.audit,evidence},null,2));
    const git=Bun.spawn(['git','init','--quiet',temp],{stdout:'ignore',stderr:'pipe'});if(await git.exited!==0)throw Error('Gate repository initialization failed');
    const settings=config(decision);
    await writeFile(join(temp,'agentests.config.yaml'),JSON.stringify(settings));
    process.chdir(temp);
    let evaluator:Agentests;
    if(offlineScore!==undefined) {
      // Explicit test double in trusted verification only; never used by agent.ts.
      class OfflineAgentests extends Agentests { constructor(){super(settings,{OPENAI_API_KEY:'offline-placeholder',TYPESAFE_AI_API_KEY:'offline-placeholder'});this.engines.decide=async()=>{decisionCalls++;return offlineScore!;};this.engines.reason=async()=>{throw Error('Unexpected reasoning call');};} }
      evaluator=new OfflineAgentests();
    } else evaluator=new Agentests(settings,process.env);
    const results=await evaluator.run({kind:'all'});
    if(results.length!==1)throw Error('Exactly one case Test required');
    const findings=results.flatMap(r=>r.findings.map(f=>({test:r.test.id,assertion:f.assertion.id,error:f.assertion.error})));
    return {pass:findings.length===0,findings,decision:settings.decision,usage:null,cost:null,...(offlineScore===undefined?{}:{offlineDecisionCalls:decisionCalls})};
  }finally {process.chdir(previous);await rm(temp,{recursive:true,force:true});}
}
