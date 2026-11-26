import { cp, mkdtemp, rm, mkdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { codexMetrics } from "./metrics.ts";

type Definition = {
  preflight: string[];
  agent: string;
  starter_prompt: string;
};

function parseDefinition(source: string): Definition {
  const parsed = Bun.YAML.parse(source);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("run.yaml must contain a mapping.");
  }
  const value = parsed as Record<string, unknown>;
  const fields = ["preflight", "agent", "starter_prompt"];
  if (
    Object.keys(value).length !== fields.length ||
    Object.keys(value).some((key) => !fields.includes(key)) ||
    typeof value.agent !== "string" || !value.agent.trim() ||
    typeof value.starter_prompt !== "string" ||
    !Array.isArray(value.preflight) ||
    !value.preflight.every((command) => typeof command === "string" && command.trim())
  ) {
    throw new Error("run.yaml requires preflight (command strings), agent, and starter_prompt.");
  }
  return value as Definition;
}

export async function run(definitionPath: string): Promise<void> {
  const path = resolve(definitionPath);
  const definition = parseDefinition(await Bun.file(path).text());
  const runDirectory = dirname(path);
  const caseDirectory = resolve(runDirectory, "../..");
  const fixture = join(caseDirectory, "fixture");
  const [caseText, judgeText, judgeCode, { judge }] = await Promise.all([
    Bun.file(join(caseDirectory, "CASE.md")).arrayBuffer(),
    Bun.file(join(caseDirectory, "JUDGE.md")).arrayBuffer(),
    Bun.file(join(caseDirectory, "judge.ts")).arrayBuffer(),
    import(join(caseDirectory, "judge.ts")),
  ]);
  // Historical captures are immutable. Later executions get an isolated artifact directory.
  let output=runDirectory;
  if(await Bun.file(join(output,'result.json')).exists()||await Bun.file(join(output,'transcript.jsonl')).exists()) {
    await mkdir(join(runDirectory,'executions'),{recursive:true});output=await mkdtemp(join(runDirectory,'executions/run-'));
  }
  const initialDirectory=join(output,'initial-workproduct');
  const workspace = await mkdtemp(join(tmpdir(), "benchamel-"));
  const transcript = Bun.file(join(output, "transcript.jsonl")).writer();
  const result: Record<"time" | "cost" | "score" | "context_length", number | null> = {
    time: null, cost: null, score: null, context_length: null,
  };
  let agentOutput = "";
  const record = (event: Record<string, unknown>) => {
    transcript.write(JSON.stringify({ timestamp: new Date().toISOString(), ...event }) + "\n");
  };

  async function execute(command: string, stage: string, prompt?: string): Promise<void> {
    record({ type: "start", stage, command });
    const argv = prompt === undefined
      ? ["/bin/sh", "-c", command]
      : ["/bin/sh", "-c", `${command} "$1"`, "benchamel", prompt];
    const child = Bun.spawn(argv, { cwd: workspace, env: { ...process.env, BENCHAMEL_CASE: caseDirectory, BENCHAMEL_HARNESS: import.meta.dir, BENCHAMEL_INITIAL_DIRECTORY: initialDirectory }, stdin: "ignore", stdout: "pipe", stderr: "pipe" });

    async function capture(stream: ReadableStream<Uint8Array>, name: "stdout" | "stderr") {
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      const emit = async (text: string) => {
        if (!text) return;
        record({ type: "output", stage, stream: name, text });
        if (stage === "agent" && name === "stdout") agentOutput += text;
        await Bun.write(name === "stdout" ? Bun.stdout : Bun.stderr, text);
      };
      try {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          await emit(decoder.decode(chunk.value, { stream: true }));
        }
        await emit(decoder.decode());
      } finally {
        reader.releaseLock();
      }
    }

    const [exitCode] = await Promise.all([
      child.exited,
      capture(child.stdout, "stdout"),
      capture(child.stderr, "stderr"),
    ]);
    record({ type: "exit", stage, exit_code: exitCode });
    if (exitCode !== 0) throw new Error(`${stage} exited with code ${exitCode}.`);
  }

  let failed=false,failure:unknown,agentStarted=false,agentError:string|null=null;
  const grading:{initial:any;final:any;identicalCandidates:boolean;delta:number|null}={initial:null,final:null,identicalCandidates:false,delta:null};
  const digest=async(root:string)=>{
    const {inventory}=await import('./boundary.ts');const hasher=new Bun.CryptoHasher('sha256');
    for(const file of await inventory(root)) {
      // Prepared review assets do not change the candidate's domain work or prose.
      if(file==='judge-assessment.json'||file==='review.md'||file==='agentests.config.yaml'||file.startsWith('.agents/tests/')||file==='.benchamel/agentests.ts')continue;
      hasher.update(file).update(await readFile(join(root,file)));
    }
    return hasher.digest('hex');
  };
  const grade=async(source:string,stage:'initial'|'final')=>{
    const isolated=await mkdtemp(join(tmpdir(),'benchamel-blind-grade-'));
    try {
      await cp(source,isolated,{recursive:true});await rm(join(isolated,'judge-assessment.json'),{force:true});
      const score=await judge(isolated);
      if(typeof score!=='number'||!Number.isFinite(score)||score<0||score>100)throw Error('judge.ts must return a score from 0 to 100.');
      const assessment=Bun.file(join(isolated,'judge-assessment.json'));
      if(await assessment.exists())await Bun.write(join(output,stage+'-assessment.json'),await assessment.arrayBuffer());
      record({type:'judge',stage,score});return {score,error:null};
    }catch(error){if(await Bun.file(join(isolated,'judge-assessment.json')).exists())await cp(join(isolated,'judge-assessment.json'),join(output,stage+'-assessment.json'));record({type:'judge-error',stage,message:String(error)});return {score:null,error:String(error)};}
    finally{await rm(isolated,{recursive:true,force:true});}
  };
  try {
    record({type:'run',case_version:new Bun.CryptoHasher('sha256').update(caseText).digest('hex'),judge_version:new Bun.CryptoHasher('sha256').update(judgeText).update(judgeCode).digest('hex')});
    await cp(fixture,workspace,{recursive:true});
    for(const [index,command] of definition.preflight.entries())await execute(command,`preflight:${index+1}`);
    const start=performance.now();agentStarted=true;
    try {await execute(definition.agent,'agent',definition.starter_prompt);}
    catch(error){failed=true;failure=error;agentError=String(error);record({type:'error',stage:'agent',message:agentError});}
    finally {
      result.time=(performance.now()-start)/1000;
      const metrics=await codexMetrics(agentOutput),runtimeGate=definition.agent.includes('terra-agentests-');
      result.cost=runtimeGate?null:metrics.cost;result.context_length=runtimeGate?null:metrics.context_length;
      if(runtimeGate)record({type:'measurement_limit',producer_cost:metrics.cost,producer_context_length:metrics.context_length,treatment_cost:null,reason:'Native review usage is retained per provider request; treatment totals are not yet aggregated.'});
      for(const call of metrics.calls)record({type:'usage',...call});
    }
  }catch(error){failed=true;failure=error;record({type:'error',stage:agentStarted?'agent':'preflight',message:String(error)});}
  finally {
    // Grading is independent of task/review exit status and cannot influence optimization.
    if(agentStarted) {
      const hasInitial=await Bun.file(join(initialDirectory,'state/runtime.json')).exists()||await Bun.file(join(initialDirectory,'reply.md')).exists()||await Bun.file(join(initialDirectory,'plan.md')).exists();
      if(hasInitial)grading.initial=await grade(initialDirectory,'initial');
      else grading.initial={score:null,error:'First-pass snapshot unavailable; no paired quality claim.'};
      try{grading.identicalCandidates=hasInitial&&await digest(initialDirectory)===await digest(workspace);}
      catch(error){record({type:'candidate-comparison-error',message:String(error)});}
      if(grading.identicalCandidates&&!grading.initial.error) {
        grading.final={...grading.initial,reusedInitialAssessment:true};
        if(await Bun.file(join(output,'initial-assessment.json')).exists())await cp(join(output,'initial-assessment.json'),join(output,'final-assessment.json'));
        record({type:'judge',stage:'final',score:grading.final.score,reusedInitialAssessment:true});
      }else grading.final=await grade(workspace,'final');
      result.score=grading.final.score;
      if(grading.initial.score!==null&&grading.final.score!==null)grading.delta=grading.final.score-grading.initial.score;
      if(grading.final.error){failed=true;failure??=Error(grading.final.error);}
      if(await Bun.file(join(output,'final-assessment.json')).exists())await cp(join(output,'final-assessment.json'),join(workspace,'judge-assessment.json'));
    }
    const native=agentOutput.split('\n').flatMap(line=>{try{return [JSON.parse(line)];}catch{return [];}});
    const first=native.find(e=>e.type==='benchamel.first-pass'),optimization=native.findLast(e=>e.type==='benchamel.optimization');
    await Bun.write(join(output,'assessment.json'),JSON.stringify({initial:grading.initial,final:grading.final,identicalCandidates:grading.identicalCandidates,scoreDelta:grading.delta,producer:{status:!agentStarted?'not-started':first?first.exit_code===0?'completed':'failed':agentError?'failed':'completed',exitCode:first?.exit_code??null,error:agentError},optimization:optimization??{status:'unavailable'},qualityInterpretation:'Judge scores describe workproducts. Review uncertainty, provider errors and quality are separate outcomes; optimization may regress.'},null,2)+'\n');
    try {
      await transcript.end();await Bun.write(join(output,'result.json'),JSON.stringify(result,null,2)+'\n');
      await cp(workspace,join(output,'workproduct'),{recursive:true});
    }catch(error){throw new Error(`Could not save artifacts to ${output}; workspace retained at ${workspace}.`,{cause:error});}
    await rm(workspace,{recursive:true});console.log(`Artifacts: ${output}`);
  }
  if(failed)throw failure;
}
