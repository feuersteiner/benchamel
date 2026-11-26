import {expect,test} from 'bun:test';
import {mkdtemp,mkdir,readFile,rm,writeFile,cp} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {compactState,assertionPacket} from '../treatments/context.ts';
import {withBatchedDecisions} from '../treatments/batching.ts';
import {run} from '../run.ts';

test('review context preserves duplicate references, opaque inventory identity, and required evidence',()=>{
  const inventory=Array.from({length:93},(_,i)=>({id:'A-'+i,sha256:String(i).padStart(64,'a')}));
  const domain={'a/b~c':{status:'ready',records:500,attachments:inventory}};
  const {state,audit}=compactState({domain,commitments:{domain},handoff:{domain}},[{command:'commitments',args:{snapshot:JSON.stringify(domain)}}]);
  const root={state,audit};
  const resolve=(value:any):any=>value?.$ref?resolve(value.$ref.slice(1).split('/').map((part:string)=>part.replaceAll('~1','/').replaceAll('~0','~')).reduce((obj:any,key:string)=>obj[key],root)):value;
  expect(resolve(state.commitments).domain).toEqual({$ref:'/state/domain'});expect(resolve(resolve(state.handoff).domain)).toBe(state.domain);
  expect(state.domain['a/b~c'].attachments.count).toBe(93);expect(state.domain['a/b~c'].attachments.ids).toHaveLength(93);
  expect(audit[0].args.snapshot.decodedJsonArgument).toEqual({$ref:'/state/domain'});
  const repeated=compactState({'a/b~c':domain,same:domain},[]).state;
  expect(repeated.same.$ref).toBe('/state/a~1b~0c');const key=repeated.same.$ref.slice('/state/'.length).replaceAll('~1','/').replaceAll('~0','~');expect(repeated[key]).toBe(repeated['a/b~c']);
  const item:any={domain:'legal',evidence:['E01','E02']};
  const packet=assertionPacket({outputs:{'reply.md':'draft'},state:{domain},audit:[],evidence:{E01:'Required source',E02:'Unrelated source'}},item,'Does evidence E01 support the claim?');
  expect(packet.evidence).toEqual({E01:'Required source'});expect(packet.outputs['reply.md']).toBe('draft');
  expect(()=>assertionPacket({...packet,evidence:{}},item,'Read E01')).toThrow('absent');
});

test('both native provider transports batch identical input and preserve every question and answer',async()=>{
  const native=globalThis.fetch;const calls:any[]=[];
  globalThis.fetch=(async(url:any,init:any)=>{
    const body=JSON.parse(init.body);calls.push(body);
    const openai=String(url).includes('openai');
    return new Response(JSON.stringify({model:'offline',usage:{input_tokens:12,output_tokens:0},answers:openai?body.questions.map((q:any,i:number)=>({type:'predicate',name:q.name,probability:.8+i*.01})):Object.fromEntries(Object.keys(body.questions).map((name,i)=>[name,{type:'noul',noul:.8+i*.01}]))}),{headers:{'content-type':'application/json'}});
  }) as any;
  try {
    for(const provider of ['luna','jev']) {
      const receipts:any[]=[];const url=provider==='luna'?'https://api.openai.com/v1/decisions':'https://api.typesafe.ai/v1/systemone';
      const outputs=await withBatchedDecisions(()=>Promise.all(['A','B','C'].map(instructions=>fetch(url,{method:'POST',body:JSON.stringify(provider==='luna'?{model:'gpt-6-luna',input:[{role:'user',content:'same'}],questions:[{name:'criterion',type:'predicate',instructions}]}:{model:'jev-latest',state:{input:'same'},questions:{criterion:{type:'noul',instructions}}})}).then(r=>r.json()))),receipts) as any[];
      expect(receipts).toHaveLength(1);expect(receipts[0].questions).toBe(3);expect(receipts[0].requestBytes).toBeGreaterThan(0);
      expect(outputs.map(o=>provider==='luna'?o.answers[0].name:Object.keys(o.answers)[0])).toEqual(['criterion','criterion','criterion']);
      expect(outputs.map(o=>Math.round(100*(provider==='luna'?o.answers[0].probability:o.answers.criterion.noul)))).toEqual([80,81,82]);
    }
    expect(calls).toHaveLength(2);
  }finally{globalThis.fetch=native;}
});

test('an early transport failure drains sibling batches before restoring fetch',async()=>{
  const native=globalThis.fetch;let slowFinished=false;
  const fake=(async(_url:any,init:any)=>{const body=JSON.parse(init.body);if(body.state.input==='bad')throw Error('offline failure');await new Promise(r=>setTimeout(r,25));slowFinished=true;return new Response(JSON.stringify({answers:{q_0_0:{type:'noul',noul:.9}}}));}) as any;
  globalThis.fetch=fake;
  try {
    await expect(withBatchedDecisions(()=>Promise.all(['bad','slow'].map(input=>fetch('https://api.typesafe.ai/v1/systemone',{method:'POST',body:JSON.stringify({model:'jev-latest',state:{input},questions:{criterion:{type:'noul',instructions:'check'}}})}))),[])).rejects.toThrow('offline failure');
    expect(slowFinished).toBe(true);expect(globalThis.fetch).toBe(fake);
  }finally{globalThis.fetch=native;}
});

test('producer failure still grades initial/final snapshots independently and retains historical captures',async()=>{
  const root=await mkdtemp(join(tmpdir(),'benchamel-postrun-test-'));
  try {
    await mkdir(join(root,'fixture'));await mkdir(join(root,'runs/unit'),{recursive:true});
    await writeFile(join(root,'CASE.md'),'Synthetic case');await writeFile(join(root,'JUDGE.md'),'Synthetic rubric');
    await writeFile(join(root,'judge.ts'),`import {readFile,writeFile} from 'node:fs/promises';import {join} from 'node:path';export async function judge(workspace:string){const text=await readFile(join(workspace,'reply.md'),'utf8');const score=text==='initial'?80:20;await writeFile(join(workspace,'judge-assessment.json'),JSON.stringify({score}));return score;}`);
    const script=join(root,'producer.sh');
    await writeFile(script,'printf initial > reply.md\ncp -R . "$BENCHAMEL_INITIAL_DIRECTORY"\nprintf revised > reply.md\nexit 1\n');
    const definition=join(root,'runs/unit/run.yaml');await writeFile(definition,JSON.stringify({preflight:[],agent:'sh '+script,starter_prompt:'same ordinary task'}));
    await expect(run(definition)).rejects.toThrow('agent exited');
    const grading=JSON.parse(await readFile(join(root,'runs/unit/assessment.json'),'utf8'));
    expect(grading.initial.score).toBe(80);expect(grading.final.score).toBe(20);expect(grading.scoreDelta).toBe(-60);expect(grading.producer.status).toBe('failed');
    const before=await readFile(join(root,'runs/unit/result.json'),'utf8');await expect(run(definition)).rejects.toThrow();
    expect(await readFile(join(root,'runs/unit/result.json'),'utf8')).toBe(before);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('identical candidates reuse the independent assessment without judge noise',async()=>{
  const root=await mkdtemp(join(tmpdir(),'benchamel-same-candidate-'));
  try {
    await mkdir(join(root,'fixture'));await mkdir(join(root,'runs/unit'),{recursive:true});
    await writeFile(join(root,'CASE.md'),'Synthetic case');await writeFile(join(root,'JUDGE.md'),'Synthetic rubric');
    const count=join(root,'judge-count');await writeFile(count,'');
    await writeFile(join(root,'judge.ts'),`import {appendFile} from 'node:fs/promises';export async function judge(){await appendFile(${JSON.stringify(count)},'x');return 80;}`);
    const script=join(root,'producer.sh');await writeFile(script,'printf initial > reply.md\ncp -R . "$BENCHAMEL_INITIAL_DIRECTORY"\n');
    const definition=join(root,'runs/unit/run.yaml');await writeFile(definition,JSON.stringify({preflight:[],agent:'sh '+script,starter_prompt:'task'}));await run(definition);
    expect(await readFile(count,'utf8')).toBe('x');const assessment=JSON.parse(await readFile(join(root,'runs/unit/assessment.json'),'utf8'));expect(assessment.identicalCandidates).toBe(true);expect(assessment.scoreDelta).toBe(0);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('Luna reservations are shared across separate worker processes without a task limit',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'benchamel-shared-pacing-'));
  try {
    const source=join(import.meta.dir,'../treatments/pacing.ts');
    const children=Array.from({length:3},()=>Bun.spawn([process.execPath,'-e',`const {reserveLuna}=await import(${JSON.stringify(source)});console.log(JSON.stringify(await reserveLuna(24000,${JSON.stringify(directory)},1000)));`],{stdout:'pipe',stderr:'pipe'}));
    const times=await Promise.all(children.map(async child=>{const [exit,text]=await Promise.all([child.exited,new Response(child.stdout).text()]);expect(exit).toBe(0);return JSON.parse(text).reservedAt;}));
    expect(times.sort((a,b)=>a-b)).toEqual([1000,2000,3000]);
  }finally{await rm(directory,{recursive:true,force:true});}
});

test('fixture tests start after first completion; unavailable review retains completed first-pass work',async()=>{
  const root=await mkdtemp(join(tmpdir(),'benchamel-fixture-lifecycle-')),repo=join(root,'case-unit');
  try {
    await mkdir(join(repo,'fixture/state'),{recursive:true});await mkdir(join(repo,'fixture/docs/evidence'),{recursive:true});await mkdir(join(repo,'runs/unit'),{recursive:true});await mkdir(join(root,'bin'));
    await writeFile(join(repo,'fixture/state/runtime.json'),'{}');await writeFile(join(repo,'fixture/docs/evidence/source.md'),'Frozen source');await writeFile(join(repo,'fixture/provenance.json'),JSON.stringify({documents:[{id:'E01',file:'source.md'}]}));
    await writeFile(join(repo,'CASE.md'),'Synthetic task');await writeFile(join(repo,'JUDGE.md'),'Synthetic judge');
    const boundary=join(import.meta.dir,'../boundary.ts');
    await writeFile(join(repo,'judge.ts'),`import {readFile,writeFile} from 'node:fs/promises';import {join} from 'node:path';import {boundary} from ${JSON.stringify(boundary)};export async function inspectWorkspace(workspace:string){await boundary(import.meta.dir,workspace);return {state:JSON.parse(await readFile(join(workspace,'state/runtime.json'),'utf8')),audit:[]};}export async function judge(workspace:string){await inspectWorkspace(workspace);const score=(await readFile(join(workspace,'reply.md'),'utf8'))==='initial'?80:0;await writeFile(join(workspace,'judge-assessment.json'),JSON.stringify({score}));return score;}`);
    for(const domain of ['legal','marketing','customer-support']) {
      const dir=join(repo,'treatments/agentests',domain);await mkdir(dir,{recursive:true});await writeFile(join(dir,'TEST.md'),'Synthetic declared native test.');await writeFile(join(dir,'context.json'),JSON.stringify({evidence:['E01']}));
      await writeFile(join(dir,'test.yaml'),JSON.stringify({version:1,id:'case-unit-'+domain,title:domain,description:'Synthetic lifecycle',select:{glob:'review.md'},assert:Array.from({length:15},(_,i)=>({id:domain+'-'+i,description:'Property '+i,error:'Fix property '+i,decide:'Does '+domain+' property '+i+' match E01?'}))}));
    }
    const capture=join(root,'first-prompt.json'),fake=join(root,'bin/codex');
    await writeFile(fake,`#!/usr/bin/env node\nconst fs=require('fs');if(process.argv.includes('--version')){console.log('codex-cli 0.172.0-alpha.2');process.exit(0);}if(fs.existsSync('.agents/tests'))throw Error('Tests exposed before first pass');fs.writeFileSync(${JSON.stringify(capture)},JSON.stringify({prompt:process.argv.at(-1)}));fs.writeFileSync('reply.md','initial');fs.writeFileSync('plan.md','initial');fs.writeFileSync('state/runtime.json','{"status":"complete"}');console.log(JSON.stringify({type:'thread.started',thread_id:'offline-thread'}));console.log(JSON.stringify({type:'turn.completed',usage:{}}));\n`);
    await (await import('node:fs/promises')).chmod(fake,0o755);
    const agent=join(import.meta.dir,'../treatments/agent.ts'),definition=join(repo,'runs/unit/run.yaml');
    await writeFile(definition,JSON.stringify({preflight:[],agent:`OPENAI_API_KEY= TYPESAFE_AI_API_KEY= PATH='${join(root,'bin')}:${process.env.PATH}' bun '${agent}' terra-agentests-jev`,starter_prompt:'Ordinary task prompt'}));
    await run(definition);
    const assessment=JSON.parse(await readFile(join(repo,'runs/unit/assessment.json'),'utf8'));expect(assessment.producer.status).toBe('completed');expect(assessment.optimization.status).toBe('error');expect(assessment.final.score).toBe(80);expect(assessment.initial.score).toBe(80);expect(assessment.identicalCandidates).toBe(true);
    const first=JSON.parse(await readFile(capture,'utf8'));expect(first.prompt).toContain('Ordinary task prompt');expect(first.prompt).not.toMatch(/budget|draft phase|four task turns/i);
    expect(await Bun.file(join(repo,'runs/unit/workproduct/.agents/tests/case-unit-legal/test.yaml')).exists()).toBe(true);expect(await Bun.file(join(repo,'runs/unit/initial-workproduct/.agents/tests/case-unit-legal/test.yaml')).exists()).toBe(false);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('an initial judge error is retained and does not suppress final grading of the same candidate',async()=>{
  const root=await mkdtemp(join(tmpdir(),'benchamel-judge-error-'));
  try {
    await mkdir(join(root,'fixture'));await mkdir(join(root,'runs/unit'),{recursive:true});await writeFile(join(root,'CASE.md'),'Synthetic case');await writeFile(join(root,'JUDGE.md'),'Synthetic rubric');
    const count=join(root,'judge-count');await writeFile(count,'');
    await writeFile(join(root,'judge.ts'),`import {readFile,writeFile,appendFile} from 'node:fs/promises';import {join} from 'node:path';export async function judge(workspace:string){const prior=await readFile(${JSON.stringify(count)},'utf8');await appendFile(${JSON.stringify(count)},'x');if(!prior){await writeFile(join(workspace,'judge-assessment.json'),JSON.stringify({score:null,inferenceFailure:'synthetic citation validation failure'}));throw Error('synthetic citation validation failure');}await writeFile(join(workspace,'judge-assessment.json'),JSON.stringify({score:80}));return 80;}`);
    const script=join(root,'producer.sh');await writeFile(script,'printf initial > reply.md\ncp -R . "$BENCHAMEL_INITIAL_DIRECTORY"\n');const definition=join(root,'runs/unit/run.yaml');await writeFile(definition,JSON.stringify({preflight:[],agent:'sh '+script,starter_prompt:'task'}));
    await run(definition);
    const assessment=JSON.parse(await readFile(join(root,'runs/unit/assessment.json'),'utf8'));expect(assessment.initial.score).toBeNull();expect(assessment.final.score).toBe(80);expect(assessment.scoreDelta).toBeNull();expect(await readFile(count,'utf8')).toBe('xx');
    expect(JSON.parse(await readFile(join(root,'runs/unit/initial-assessment.json'),'utf8')).inferenceFailure).toContain('validation failure');
  }finally{await rm(root,{recursive:true,force:true});}
});
