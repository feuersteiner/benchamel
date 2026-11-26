import records from '../data/records.json';
const sha=(s:string)=>new Bun.CryptoHasher('sha256').update(s).digest('hex');
// Deterministic synthetic domain adapters: no network, real clock, secrets or randomness.
export function derive(command:string,args:Record<string,string>,domain:Record<string,any>):Record<string,any>{
if(command==='inspect-backups')return {backupInventory:{...records.backup,completeApplication:false,dirtyReplica:records.replica.cleanupPresent}};
if(command==='prepare-discrepancy'){const journal=records.journal;return {journalReconciled:journal.length===74,discrepancyReport:{events:journal,approvalTransitions:journal.filter(x=>x.kind==='approval').length,changedOrWithdrawn:journal.filter(x=>x.negative).length,unresolvedFileDigests:2,tender:records.tender,liveLinks:false}};}
return {};
}
