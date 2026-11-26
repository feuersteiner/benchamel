import { test, expect } from 'bun:test';
import { revisionLoop } from '../treatments/agent.ts';
import { config } from '../treatments/gate.ts';
import { scoreAssessment } from '../semantic.ts';
import { initial,transition,replay,canonical,type Policy } from '../fixture-engine.ts';
test('findings reach the same task session without a review-turn cap',async()=>{
  const prompts:string[]=[],threads:(string|undefined)[]=[];let checks=0;
  await revisionLoop(async(p,t)=>{prompts.push(p);threads.push(t);return {thread:'same-session',code:0};},async()=>({pass:++checks===2,findings:[{error:'Remove unsupported guarantee'}]}),'draft');
  expect(prompts).toHaveLength(2);expect(prompts[1]).toContain('Remove unsupported guarantee');expect(threads[1]).toBe('same-session');
  let attempts=0;
  await revisionLoop(async()=>{attempts++;return {thread:'id',code:0};},async()=>({pass:attempts===7,findings:[]}),'draft');expect(attempts).toBe(7);
});
test('native decision presets differ only by provider fields',()=>{
  expect(config('luna').decision.model).toBe('gpt-6-luna');expect(config('jev').decision.model).toBe('jev-latest');
  expect(config('luna').assert).toEqual(config('jev').assert);expect(config('luna').reasoning).toEqual(config('jev').reasoning);
});
test('trusted semantic validation requires exact spans and hard breach overrides',()=>{
  const keys=['policyAuthority','factualCommitments','supportUsefulness','brandTone','salesEthics','integratedConsistency'];
  const a={dimensions:Object.fromEntries(keys.map(k=>[k,{grade:3,rationale:'Synthetic unit assessment only',evidence:[{document:'STATE',quote:'kept'}],spans:[{file:'reply.md',quote:'draft'}]}])),hardBreaches:[] as any[]};
  expect(scoreAssessment(a,{STATE:'kept'},{'reply.md':'draft','plan.md':'draft'})).toBe(100);
  a.hardBreaches.push({code:'material-deception-or-false-commitment',rationale:'Synthetic breach',evidence:[{document:'STATE',quote:'kept'}],spans:[{file:'reply.md',quote:'draft'}]});
  expect(scoreAssessment(a,{STATE:'kept'},{'reply.md':'draft','plan.md':'draft'})).toBe(0);
  a.hardBreaches[0].spans[0].quote='invented';expect(()=>scoreAssessment(a,{STATE:'kept'},{'reply.md':'draft'})).toThrow();
});
test('authorization denial is atomic, invariants and audit are replayed',()=>{
  const p:Policy={id:'unit',now:'2025-01-01T00:00:00Z',updateBy:'2025-01-01T01:00:00Z',handoff:'Owner',areas:{},initial:{balance:100,protected:true},invariants:{protected:true},rules:[],actions:{submit:{description:'test',owner:'Owner',evidence:[],args:{approval:['A']},effects:{balance:0}}}};
  const r=initial(p),before=canonical(r);expect(()=>transition(p,r,'submit',{approval:'forged'})).toThrow();expect(canonical(r)).toBe(before);
  const next=transition(p,r,'submit',{approval:'A'});expect(replay(p,next).domain.balance).toBe(0);
  next.state.domain.balance=999;expect(()=>replay(p,next)).toThrow();
});

test('result contract keeps four metrics and treatment totals stay unknown',async()=>{
  const {mkdtemp,mkdir,writeFile,readFile,rm}=await import('node:fs/promises');
  const {join}=await import('node:path');const {tmpdir}=await import('node:os');
  const {run}=await import('../run.ts');
  const root=await mkdtemp(join(tmpdir(),'benchamel-metrics-unit-'));
  try {
    await mkdir(join(root,'fixture'));await mkdir(join(root,'runs/unit'),{recursive:true});
    await writeFile(join(root,'CASE.md'),'Unit fixture only');await writeFile(join(root,'JUDGE.md'),'Unit judge only');
    await writeFile(join(root,'judge.ts'),'export const judge=async()=>42;');
    // An injected shell command, never Codex or model inference. The marker exercises accounting.
    await writeFile(join(root,'runs/unit/run.yaml'),JSON.stringify({preflight:[],agent:'BENCHAMEL_UNIT_ARM=terra-agentests-luna printf %s',starter_prompt:'offline unit output'}));
    await run(join(root,'runs/unit/run.yaml'));
    const result=JSON.parse(await readFile(join(root,'runs/unit/result.json'),'utf8'));
    expect(Object.keys(result).sort()).toEqual(['context_length','cost','score','time']);
    expect(result.cost).toBeNull();expect(result.context_length).toBeNull();expect(result.score).toBe(42);expect(result.time).toBeGreaterThanOrEqual(0);
  }finally {await rm(root,{recursive:true,force:true});}
});

test('comparison discovery excludes dummy and refuses partial real stacks',async()=>{
  const {mkdtemp,mkdir,writeFile,rm}=await import('node:fs/promises');
  const {join}=await import('node:path');const {tmpdir}=await import('node:os');
  const {discoverDefinitions}=await import('../discover.ts');
  const root=await mkdtemp(join(tmpdir(),'benchamel-discovery-unit-'));
  try {
    const arms=['terra','terra-skill','terra-agentests-luna','terra-agentests-jev','terra-agentests-luna-skill','terra-agentests-jev-skill'];
    for(let i=1;i<=10;i++)for(const arm of arms){const dir=join(root,'cases/complex-support-'+String(i).padStart(2,'0')+'/runs/'+arm);await mkdir(dir,{recursive:true});await writeFile(join(dir,'run.yaml'),'unit');}
    const dummy=join(root,'cases/dummy-case/runs/smoke');await mkdir(dummy,{recursive:true});await writeFile(join(dummy,'run.yaml'),'unit');
    expect((await discoverDefinitions(root,[])).definitions).toHaveLength(60);
    expect((await discoverDefinitions(root,['--smoke'])).definitions).toHaveLength(1);
    expect((await discoverDefinitions(root,['--case','complex-support-04'])).definitions).toHaveLength(6);
    await rm(join(root,'cases/complex-support-04/runs/terra/run.yaml'));
    await expect(discoverDefinitions(root,[])).rejects.toThrow('exact six');
  }finally{await rm(root,{recursive:true,force:true});}
});
