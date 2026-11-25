import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { boundary } from '../boundary.ts';
import { gate } from './gate.ts';
export type ProducerResult={thread:string;code:number};
export async function revisionLoop(produce:(prompt:string,thread?:string)=>Promise<ProducerResult>,review:()=>Promise<{pass:boolean;findings:unknown[]}>,prompt:string,maxTurns=4) {
  let thread:string|undefined;
  for(let turn=0;turn<maxTurns;turn++) {
    const result=await produce(prompt,thread);if(result.code!==0)throw Error(`Task agent exited ${result.code}`);thread=result.thread;
    const report=await review(); if(report.pass)return;
    prompt=`The runtime review found issues. The task remains open; revise your operations, reply.md and plan.md using this actionable feedback. Preserve immutable assets and refresh stale commitments/handoff after changes.\n${JSON.stringify(report.findings)}\nReturn after revising so the runtime review can check again.`;
  }
  throw Error('Runtime gate did not pass within the common four-turn budget');
}
export async function skillPrompt(caseRoot:string,arm:string,prompt:string) {
  if(!arm.endsWith('-skill'))return prompt;
  const skill=await readFile(join(caseRoot,'treatments/skill/SKILL.md'),'utf8');
  return `${prompt}\n\nUse $case-policy for this task. Its installed path is .agents/skills/case-policy/SKILL.md. Apply this skill throughout execution:\n${skill}`;
}
if(import.meta.main) {
  const arm=process.argv[2]!,caseRoot=process.env.BENCHAMEL_CASE!,workspace=process.cwd();
  if(!caseRoot||!/^terra(?:-skill|-agentests-(?:luna|jev)(?:-skill)?)?$/.test(arm))throw Error('Invalid harness invocation');
  const gated=arm.includes('-agentests-'),decision=arm.includes('-jev')?'jev':'luna';
  const version=Bun.spawnSync(['codex','--version']);
  if(version.stdout.toString().trim()!=='codex-cli 0.172.0-alpha.2')throw Error('Install pinned Codex CLI 0.172.0-alpha.2');
  await boundary(caseRoot,workspace);
  let prompt=await skillPrompt(caseRoot,arm,process.argv[3]!);
  prompt+='\nBudget: 1800 seconds total, at most four task turns, no network or external actions. Produce the requested state, reply.md and plan.md.';
  if(gated)prompt+='\nThis is the draft phase of an open task. Return after preparing the complete draft. The runtime agentests review will then provide feedback; you can revise before task completion.';
  console.log(JSON.stringify({type:'benchamel.treatment',arm,gate:gated,task_model:'gpt-6.1-terra',max_seconds:1800,max_turns:4}));
  const env={...process.env};delete env.BENCHAMEL_CASE;delete env.BENCHAMEL_HARNESS;
  // Jev credentials are needed only by the trusted gate; Codex uses its own auth or OpenAI key.
  delete env.TYPESAFE_AI_API_KEY;
  let activeChild:ReturnType<typeof Bun.spawn>|undefined;
  const produce=async(input:string,thread?:string):Promise<ProducerResult>=>{
    const base=['codex','-a','never','exec'];
    const common=['--ignore-user-config','--model','gpt-6.1-terra','--skip-git-repo-check','--json','--disable','multi_agent','--disable','multi_agent_v2','-c','web_search="disabled"','-c','model_reasoning_effort="medium"'];
    const argv=thread?[...base,'resume',...common,thread,input]:[...base,...common,'--sandbox','workspace-write',input];
    const child=Bun.spawn(argv,{cwd:workspace,env,stdin:'ignore',stdout:'pipe',stderr:'inherit'});activeChild=child;
    let id=thread??'',buffer='';const decoder=new TextDecoder();
    for await(const chunk of child.stdout) {
      const text=decoder.decode(chunk,{stream:true});process.stdout.write(text);buffer+=text;
      let end:number;while((end=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,end);buffer=buffer.slice(end+1);try{const event=JSON.parse(line);if(event.type==='thread.started')id=event.thread_id;}catch{}}
    }
    const code=await child.exited;if(!id&&code===0)throw Error('Missing Codex thread ID');return {code,thread:id};
  };
  const timer=setTimeout(()=>{console.error('Common wall-time budget exhausted');activeChild?.kill('SIGKILL');process.exit(124);},1800000);
  try {
    if(gated)await revisionLoop(produce,async()=>{
      await boundary(caseRoot,workspace);
      const result=await gate(caseRoot,workspace,decision);
      console.log(JSON.stringify({type:'benchamel.gate',...result}));return result;
    },prompt);
    else {const result=await produce(prompt);if(result.code!==0)throw Error(`Task agent exited ${result.code}`);}
    await boundary(caseRoot,workspace);
  }finally {clearTimeout(timer);}
}
