/** Offline native eval plumbing only. Injected answers are authored routing doubles, never semantic judgments. */
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,basename} from 'node:path';
import {Agentests} from 'agentests';
import {config,loadDomainSuite,installDomainSuite} from '../../../harness/treatments/gate.ts';
import {replay} from '../../../harness/fixture-engine.ts';
import {derive} from '../fixture/src/integrations.ts';
const root=join(import.meta.dir,'..');
const policy=await Bun.file(join(root,'fixture/policies/domain.json')).json();
const suite=await loadDomainSuite(root),provenance=await Bun.file(join(root,'fixture/provenance.json')).json();
assert.deepEqual(suite.map(s=>s.test.assert.length),[24,21,20]);
const temp=await mkdtemp(join(tmpdir(),'cs09-native-evals-')),previous=process.cwd(),log=console.log;
let evaluations=0,calls=0;
try {
await installDomainSuite(suite,temp);
const known=new Map<string,{name:string;target?:string}>();
for(const s of suite){
 const doc=await readFile(join(s.source,'TEST.md'),'utf8');
 for(const a of s.test.assert)assert(doc.includes(`| ${a.id} |`),`Missing coverage: ${a.id}`);
 const files=await import('node:fs/promises').then(m=>m.readdir(join(s.source,'evals'),{withFileTypes:true}));
 const safe=await Bun.file(join(s.source,'evals/safe/review.md')).json();
 for(const file of files.filter(f=>f.isDirectory())){
  const name=file.name,folder=join(s.source,'evals',name);
  if(name==='irrelevant'){assert.equal(await Bun.file(join(folder,'review.md')).exists(),false);continue;}
  const packet=await Bun.file(join(folder,'review.md')).json();
  assert.deepEqual(Object.keys(packet).sort(),['audit','evidence','outputs','state']);
  replay(policy,{state:packet.state,audit:packet.audit},derive);
  assert.deepEqual(Object.keys(packet.evidence),s.evidence);
  for(const [id,excerpt] of Object.entries(packet.evidence)){
   const source=provenance.documents.find((d:any)=>d.id===id);assert(source);
   const full=await readFile(join(root,'fixture/docs/evidence',source.file),'utf8');
   for(const para of (excerpt as string).split('\n\n'))assert(full.includes(para),`${id} excerpt changed`);
  }
  const targets={legal:'legal-october-acceptance',marketing:'marketing-evidence-independent-renewal','customer-support':'customer-support-export-checkpoint'};
  const target=name==='single-property'?targets[s.domain]:name==='release-only'?'marketing-release-condition':name==='silence-only'?'marketing-silence-condition':undefined;
  if(target){assert.deepEqual(packet.state,safe.state);assert.deepEqual(packet.audit,safe.audit);assert.deepEqual(packet.evidence,safe.evidence);assert.equal(packet.outputs['plan.md'],safe.outputs['plan.md']);assert.notEqual(packet.outputs['reply.md'],safe.outputs['reply.md']);}
  known.set(JSON.stringify(packet.outputs),{name,target});
 }
}
process.chdir(temp);console.log=()=>{};
for(const provider of ['luna','jev'] as const){
 const settings=config(provider);await writeFile(join(temp,'agentests.config.yaml'),JSON.stringify(settings));
 const receipts=new Map<string,Set<string>>();
 class Injected extends Agentests{
 constructor(){super(settings,{OPENAI_API_KEY:'offline-placeholder',TYPESAFE_AI_API_KEY:'offline-placeholder'});
 this.engines.reason=async()=>{throw Error('Unexpected reasoning call');};
 this.engines.decide=async(input,question)=>{
 const packet=JSON.parse(input),probe=known.get(JSON.stringify(packet.outputs));assert(probe);
 const match=suite.flatMap(s=>s.test.assert.map(a=>({s,a}))).find(x=>JSON.stringify(x.a.decide)===JSON.stringify(question));assert(match);
 const key=match.s.domain+'/'+probe.name;const seen=receipts.get(key)??new Set<string>();assert(!seen.has(match.a.id));seen.add(match.a.id);receipts.set(key,seen);calls++;
 return probe.name==='unsafe'||probe.target===match.a.id?0:1;
 };
 }}
 const results=await new Injected().eval();assert.equal(results.length,3);
 for(const result of results){const s=suite.find(s=>s.test.id===result.test.id)!;for(const e of result.evals){
 const name=basename(e.eval.root);assert(e.matches,`${s.domain}/${name}`);evaluations++;
 if(name==='irrelevant'){assert.equal(e.actual,'skip');assert(!receipts.has(s.domain+'/'+name));continue;}
 assert.equal(receipts.get(s.domain+'/'+name)?.size,s.test.assert.length);
 const probe=known.get(JSON.stringify((await Bun.file(join(e.eval.root,'review.md')).json()).outputs))!;
 if(probe.target)assert.deepEqual(e.findings.map(f=>f.assertion.id),[probe.target]);
 }}
}
console.log=log;
const summary={mode:'offline-injected-only',assertions:{legal:24,marketing:21,'customer-support':20},providerPresets:2,nativeSpecimenEvaluations:evaluations,decisionCalls:calls,coverageMapAndEvidenceExcerpts:'passed',specimenStateAuditReplay:'passed',singlePropertyIsolation:'passed',semanticModelValidation:'not-run'};
assert.equal(evaluations,34);log(JSON.stringify(summary));
}finally{console.log=log;process.chdir(previous);await rm(temp,{recursive:true,force:true});}
