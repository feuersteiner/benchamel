import { cp,mkdtemp,readFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { boundary,textFile } from '../boundary.ts';
import { installFixtureReview } from './prepare.ts';
export type ProducerResult={thread:string;code:number};
type Hooks={candidate?:(first:boolean)=>Promise<void>};
/** No task-turn or wall-time budget. A review's uncertainty remains uncertainty. */
export async function revisionLoop(produce:(prompt:string,thread?:string)=>Promise<ProducerResult>,review:()=>Promise<{pass:boolean;findings:unknown[]}>,prompt:string,hooks:Hooks={}) {
  let thread:string|undefined,first=true;
  for(;;) {
    const result=await produce(prompt,thread);if(result.code!==0)throw Error(`Task agent exited ${result.code}`);thread=result.thread;
    await hooks.candidate?.(first);first=false;
    const report=await review();if(report.pass)return;
    prompt=`The post-run repository Tests found issues in the completed work. Optimize the operations, reply.md and plan.md using this feedback. Preserve immutable assets and refresh commitments/handoff after state changes.\n${JSON.stringify(report.findings)}\nReturn after revising so the declared Tests can run again.`;
  }
}
export async function skillPrompt(caseRoot:string,arm:string,prompt:string) {
  if(!arm.endsWith('-skill'))return prompt;
  return `${prompt}\n\nUse $case-policy for this task. Its installed path is .agents/skills/case-policy/SKILL.md. Apply this skill throughout execution:\n${await readFile(join(caseRoot,'treatments/skill/SKILL.md'),'utf8')}`;
}
if(import.meta.main) {
  const arm=process.argv[2]!,caseRoot=process.env.BENCHAMEL_CASE!,workspace=process.cwd(),initialDirectory=process.env.BENCHAMEL_INITIAL_DIRECTORY;
  if(!caseRoot||!initialDirectory||!/^terra(?:-skill|-agentests-(?:luna|jev)(?:-skill)?)?$/.test(arm))throw Error('Invalid harness invocation');
  const gated=arm.includes('-agentests-'),decision=arm.includes('-jev')?'jev':'luna';
  if(Bun.spawnSync(['codex','--version']).stdout.toString().trim()!=='codex-cli 0.172.0-alpha.2')throw Error('Install pinned Codex CLI 0.172.0-alpha.2');
  await boundary(caseRoot,workspace);
  const prompt=await skillPrompt(caseRoot,arm,process.argv[3]!)+'\nNo network or external actions. Produce the requested state, reply.md and plan.md.';
  console.log(JSON.stringify({type:'benchamel.treatment',arm,task_model:'gpt-6.1-terra',phase:'ordinary-first-pass'}));
  const env={...process.env};for(const key of ['BENCHAMEL_CASE','BENCHAMEL_HARNESS','BENCHAMEL_INITIAL_DIRECTORY','TYPESAFE_AI_API_KEY'])delete env[key];
  const produce=async(input:string,thread?:string):Promise<ProducerResult>=>{
    const base=['codex','-a','never','exec'],common=['--ignore-user-config','--model','gpt-6.1-terra','--skip-git-repo-check','--json','--disable','multi_agent','--disable','multi_agent_v2','-c','web_search="disabled"','-c','model_reasoning_effort="medium"','-c','sandbox_mode="workspace-write"'];
    const argv=thread?[...base,'resume',...common,thread,input]:[...base,...common,'--sandbox','workspace-write',input];
    const child=Bun.spawn(argv,{cwd:workspace,env,stdin:'ignore',stdout:'pipe',stderr:'inherit'});
    let id=thread??'',buffer='';const decoder=new TextDecoder();
    for await(const chunk of child.stdout) {
      const text=decoder.decode(chunk,{stream:true});process.stdout.write(text);buffer+=text;
      let end:number;while((end=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,end);buffer=buffer.slice(end+1);try{const event=JSON.parse(line);if(event.type==='thread.started')id=event.thread_id;}catch{}}
    }
    const code=await child.exited;if(!id&&code===0)throw Error('Missing Codex thread ID');return {code,thread:id};
  };
  const first=await produce(prompt);
  await cp(workspace,initialDirectory,{recursive:true});
  console.log(JSON.stringify({type:'benchamel.first-pass',exit_code:first.code,snapshot:initialDirectory}));
  if(first.code!==0)throw Error(`Task agent exited ${first.code}`);
  if(!gated){await boundary(caseRoot,workspace);console.log(JSON.stringify({type:'benchamel.optimization',status:'not-requested',producer_status:'completed'}));}
  else {
    let saved=await mkdtemp(join(tmpdir(),'benchamel-complete-candidate-'));
    let candidateSaved=false,turns=1;
    try {
      // Ordinary initial production is over before any review assets or feedback are installed.
      const {inspectWorkspace}=await import(join(caseRoot,'judge.ts'));
      const checkpoint=async()=>{
        await boundary(caseRoot,workspace,true);await inspectWorkspace(workspace);for(const file of ['reply.md','plan.md'])await textFile(join(workspace,file),65536);
        const next=await mkdtemp(join(tmpdir(),'benchamel-complete-candidate-'));
        try{await cp(workspace,next,{recursive:true});}catch(error){await rm(next,{recursive:true,force:true});throw error;}
        const previous=saved;saved=next;candidateSaved=true;await rm(previous,{recursive:true,force:true});
      };
      let cachedFirst=true;
      await revisionLoop(async(input,thread)=>{
        if(cachedFirst){cachedFirst=false;return first;}
        turns++;return produce(input,thread);
      },async()=>{
        await boundary(caseRoot,workspace,true);
        const child=Bun.spawn(['bun',join(workspace,'.benchamel/agentests.ts'),decision],{cwd:workspace,env:process.env,stdin:'ignore',stdout:'pipe',stderr:'inherit'});
        let report:any;const text=await new Response(child.stdout).text();process.stdout.write(text);
        for(const line of text.split('\n'))try{const e=JSON.parse(line);if(e.type==='benchamel.gate')report=e;}catch{}
        if(await child.exited!==0||!report)throw Error('Post-run repository Tests unavailable; completed task candidate retained');
        console.log(JSON.stringify({type:'benchamel.optimization-progress',status:report.status,turns}));return report;
      },prompt,{candidate:async(firstPass)=>{if(firstPass)await installFixtureReview(caseRoot,workspace,decision);await checkpoint();}});
      console.log(JSON.stringify({type:'benchamel.optimization',status:'passed',producer_status:'completed',turns}));
    }catch(error){
      await rm(workspace,{recursive:true,force:true});await cp(candidateSaved?saved:initialDirectory,workspace,{recursive:true});
      console.log(JSON.stringify({type:'benchamel.optimization',status:'error',producer_status:'completed',turns,error:String(error),candidate:candidateSaved?'last-complete':'initial'}));
    }finally{await rm(saved,{recursive:true,force:true});}
  }
}
