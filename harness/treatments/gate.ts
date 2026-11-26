import { cp, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { Agentests, parseTest } from 'agentests';
import { installFixtureReview } from './prepare.ts';
import { assertionPacket,compactState } from './context.ts';
import { withBatchedDecisions,type TransportReceipt } from './batching.ts';
import type { AgentTestDefinition, AgentTestResult } from 'agentests/types';
import { hash,textFile } from '../boundary.ts';
import { config, decisionPolicy, decisionStatus, domains, type Domain } from './settings.ts';
export { config, decisionPolicy, domains };
export type { Domain };
export { decisionStatus } from './settings.ts';
export type DecisionReceipt={test:string;domain:Domain;assertion:string;probability:number;status:ReturnType<typeof decisionStatus>};
export type DomainTest={domain:Domain;source:string;test:AgentTestDefinition;evidence?:string[]};
export type ReviewPacket={outputs:Record<string,string>;state:unknown;audit:unknown;evidence:Record<string,string>;representation?:{references:string;integrity:string}};
export type OfflineDecision=(input:{test:string;domain:Domain;assertion:string;packet:ReviewPacket})=>number|Promise<number>;
const requireThat=(ok:unknown,message:string):void=>{if(!ok)throw Error(message);};

/** Strict case-owned suite contract; native parsing also rejects unsupported YAML fields. */
export async function loadDomainSuite(caseRoot:string):Promise<DomainTest[]> {
  const source=join(caseRoot,'treatments/agentests');
  const entries=await readdir(source,{withFileTypes:true});
  requireThat(!entries.some(e=>e.name==='test.yaml'),'Root umbrella Test is forbidden; install three domain Tests');
  requireThat(entries.filter(e=>e.isDirectory()).every(e=>domains.includes(e.name as Domain)),'Unknown domain directory');
  const suite:DomainTest[]=[],ids=new Set<string>(),assertions=new Set<string>(),questions=new Set<string>();
  for(const domain of domains) {
    requireThat(entries.some(e=>e.name===domain&&e.isDirectory()),`Missing domain: ${domain}`);
    const folder=join(source,domain),test=parseTest(await readFile(join(folder,'test.yaml'),'utf8'));
    requireThat(!ids.has(test.id),`Duplicate Test id: ${test.id}`);ids.add(test.id);
    requireThat(test.id===`${basename(caseRoot)}-${domain}`,`Test id must be ${basename(caseRoot)}-${domain}`);
    requireThat(test.select!==undefined&&JSON.stringify([test.select.glob].flat())===JSON.stringify(['review.md'])&&Object.keys(test.select).length===1,`${domain}: select must contain only glob: review.md`);
    requireThat(test.assert.length>=15,`${domain}: at least 15 independent assertions required`);
    for(const a of test.assert) {
      requireThat(!assertions.has(a.id),`Duplicate assertion id: ${a.id}`);assertions.add(a.id);
      requireThat(a.decide!==undefined&&[a.decide].flat().length===1&&[a.decide].flat().every(q=>q.trim().length>0)&&a.grep===undefined&&a.reason===undefined,`${domain}/${a.id}: one nonempty decide question required; grep/reason forbidden`);
      const question=[a.decide!].flat()[0]!.trim();
      requireThat(!questions.has(question),`Duplicate decide question: ${domain}/${a.id}`);questions.add(question);
    }
    let evidence:string[]|undefined;
    try {
      const context=JSON.parse(await readFile(join(folder,'context.json'),'utf8'));
      requireThat(context!==null&&!Array.isArray(context)&&typeof context==='object'&&Object.keys(context).join()==='evidence',`${domain}: context.json supports only evidence`);
      requireThat(Array.isArray(context.evidence)&&context.evidence.length>0&&context.evidence.every((id:unknown)=>typeof id==='string'&&id.trim().length>0),`${domain}: context evidence must be a nonempty ID list`);
      requireThat(new Set(context.evidence).size===context.evidence.length,`${domain}: duplicate evidence ID`);
      evidence=context.evidence;
    }catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
    suite.push({domain,source:folder,test,...(evidence?{evidence}:{})});
  }
  return suite;
}
export async function installDomainSuite(suite:DomainTest[],destination:string) {
  requireThat(suite.length===domains.length,'Exactly three domain Tests required');
  for(const item of suite)await cp(item.source,join(destination,'.agents/tests',item.test.id),{recursive:true});
}
export function reviewPacket(base:ReviewPacket,item:DomainTest):ReviewPacket {
  const selected=item.evidence??Object.keys(base.evidence);
  for(const id of selected)requireThat(Object.hasOwn(base.evidence,id),`${item.domain}: unknown evidence ID ${id}`);
  return {...base,evidence:Object.fromEntries(selected.map(id=>[id,base.evidence[id]!]))};
}
/** Native results omit passing assertions, so engine receipts prove every assertion actually ran. */
export function collectFindings(suite:DomainTest[],results:AgentTestResult[],executed:Map<string,Set<string>>) {
  requireThat(suite.length===domains.length&&new Set(suite.map(s=>s.domain)).size===domains.length,'Exactly three distinct domain Tests required');
  requireThat(results.length===suite.length,'Missing or duplicate native Test results');
  const seen=new Set<string>();
  const findings:{test:string;domain:Domain;assertion:string;error:string}[]=[];
  for(const result of results) {
    const item=suite.find(s=>s.test.id===result.test.id);
    requireThat(item&&!seen.has(result.test.id),'Unexpected or duplicate native Test result');seen.add(result.test.id);
    const expected=new Set(item!.test.assert.map(a=>a.id)),actual=executed.get(result.test.id);
    requireThat(actual?.size===expected.size&&[...expected].every(id=>actual.has(id)),`Missing assertion execution for ${result.test.id}`);
    requireThat(result.test.assert.length===expected.size&&result.test.assert.every(a=>expected.has(a.id)),`Native assertion mismatch for ${result.test.id}`);
    const failed=new Set<string>();
    for(const finding of result.findings) {
      requireThat(expected.has(finding.assertion.id)&&!failed.has(finding.assertion.id)&&finding.source.path==='review.md','Unexpected or duplicate assertion finding');failed.add(finding.assertion.id);
      const assertion=item!.test.assert.find(a=>a.id===finding.assertion.id)!;
      findings.push({test:result.test.id,domain:item!.domain,assertion:assertion.id,error:assertion.error});
    }
  }
  return findings;
}
export async function gate(caseRoot:string,workspace:string,decision:'luna'|'jev',offlineScore?:number|OfflineDecision) {
  let decisionCalls=0;
  const trusted=await loadDomainSuite(caseRoot);
  await installFixtureReview(caseRoot,workspace,decision);
  const suite=await Promise.all(trusted.map(async item=>({...item,test:parseTest(await readFile(join(workspace,'.agents/tests',item.test.id,'test.yaml'),'utf8'))})));
  const {inspectWorkspace}=await import(join(caseRoot,'judge.ts'));
  const state=await inspectWorkspace(workspace),outputs:Record<string,string>={},evidence:Record<string,string>={};
  for(const file of ['reply.md','plan.md'])outputs[file]=await textFile(join(workspace,file),65536);
  const provenance=JSON.parse(await readFile(join(caseRoot,'fixture/provenance.json'),'utf8'));
  for(const [i,item] of provenance.documents.entries()) {
    const id=item.id??`E${String(i+1).padStart(2,'0')}`;
    requireThat(!Object.hasOwn(evidence,id),`Duplicate source evidence ID: ${id}`);
    evidence[id]=await readFile(join(caseRoot,'fixture/docs/evidence',item.file),'utf8');
  }
  const base:ReviewPacket={outputs,state:state.state,audit:state.audit,evidence};
  // Validate every manifest and assertion reference before any paid request.
  const packets=suite.map(item=>{
    reviewPacket(base,item);
    return new Map(item.test.assert.map(a=>[a.id,assertionPacket(base,item,[a.decide!].flat()[0]!) ]));
  });
  const git=Bun.spawn(['git','init','--quiet',workspace],{stdout:'ignore',stderr:'pipe'});if(await git.exited!==0)throw Error('Fixture Git initialization failed');
  const previous=process.cwd();process.chdir(workspace);
  try {
  const contexts:{test:string;assertion:string;packetSha256:string;packetBytes:number;evidence:string[]}[]=[];
  const settings=config(decision),executed=new Map<string,Set<string>>(),results:AgentTestResult[]=[],receiptsById=new Map<string,DecisionReceipt>(),transport:TransportReceipt[]=[];
  for(const [i,item] of suite.entries()) {
    // The selected file and native Test live in this fixture. Per-assertion context is derived below.
    await writeFile(join(workspace,'review.md'),JSON.stringify({outputs,...compactState(base.state,base.audit)}));
    const receipts=new Set<string>();executed.set(item.test.id,receipts);
    const pending=new Set<Promise<number>>();
    class FixtureAgentests extends Agentests {
      constructor() {
        super(settings,offlineScore===undefined?process.env:{OPENAI_API_KEY:'offline-placeholder',TYPESAFE_AI_API_KEY:'offline-placeholder'});
        const nativeDecide=this.engines.decide;
        this.engines.decide=(_input,criteria)=>{
          const operation=(async()=>{
            const assertion=item.test.assert.find(a=>JSON.stringify(a.decide)===JSON.stringify(criteria));
            requireThat(assertion&&!receipts.has(assertion.id),`Unexpected or duplicate decision execution for ${item.test.id}`);
            receipts.add(assertion!.id);decisionCalls++;
            const packet=packets[i]!.get(assertion!.id)!,encoded=JSON.stringify(packet);
            contexts.push({test:item.test.id,assertion:assertion!.id,packetSha256:hash(encoded),packetBytes:Buffer.byteLength(encoded),evidence:Object.keys(packet.evidence)});
            const score=offlineScore===undefined?await nativeDecide(encoded,criteria):typeof offlineScore==='number'?offlineScore:await offlineScore({test:item.test.id,domain:item.domain,assertion:assertion!.id,packet});
            requireThat(Number.isFinite(score)&&score>=0&&score<=1,`Invalid decision result for ${item.test.id}/${assertion!.id}`);
            receiptsById.set(assertion!.id,{test:item.test.id,domain:item.domain,assertion:assertion!.id,probability:score,status:decisionStatus(score)});return score;
          })();
          pending.add(operation);operation.then(()=>pending.delete(operation),()=>pending.delete(operation));return operation;
        };
        this.engines.reason=async()=>{throw Error('Unexpected reasoning call');};
      }
    }
    const client=new FixtureAgentests();
    const run=async()=>{try {const result=await client.run({kind:'all'},item.test.id);requireThat(result.length===1&&result[0]!.test.id===item.test.id,'Unexpected native fixture result');return result[0]!;}finally{while(pending.size)await Promise.allSettled([...pending]);}};
    const result=offlineScore===undefined?await withBatchedDecisions(run,transport):await run();
    results.push(result);
  }
  const decisions=suite.flatMap(item=>item.test.assert.map(a=>receiptsById.get(a.id)!));
  const findings=collectFindings(suite,results,executed).map(f=>{
    const receipt=receiptsById.get(f.assertion)!;
    return receipt.status==='uncertain'?{...f,error:`Uncertain decision (P(yes)=${receipt.probability}); clarify the evidence or wording. ${f.error}`}:f;
  });
  const status=decisions.some(d=>d.status==='fail')?'fail':decisions.some(d=>d.status==='uncertain')?'uncertain':'pass';
  return {pass:status==='pass',status,findings,decisions,contexts,policy:decisionPolicy,decision:settings.decision,transport,usage:null,cost:null,...(offlineScore===undefined?{}:{offlineDecisionCalls:decisionCalls})};
  }finally{process.chdir(previous);}
}
