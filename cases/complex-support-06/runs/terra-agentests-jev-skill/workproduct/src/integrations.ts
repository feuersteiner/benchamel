import records from '../data/records.json';
const sha=(s:string)=>new Bun.CryptoHasher('sha256').update(s).digest('hex');
// Deterministic synthetic domain adapters: no network, real clock, secrets or randomness.
export function derive(command:string,args:Record<string,string>,domain:Record<string,any>):Record<string,any>{
if(command==='preserve-drafts')return {draftCount:records.drafts.length,draftInventory:records.drafts.map(({reference,submitted})=>({reference,submitted})),draftSnapshotSha:sha(JSON.stringify(records.drafts))};
if(command==='retest-intake'){const accepted=new Set<string>();const screens=[];for(const a of records.submissionAttempts){accepted.add(a.key);screens.push({reference:a.key,status:'accepted',notification:a.notify?'sent':'pending',retryCreatesNew:false});}return {acceptedReferences:accepted.size,retest:{screens,environments:records.tested,universalConformance:false}};}
return {};
}
