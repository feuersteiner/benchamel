import records from '../data/records.json';
const sha=(s:string)=>new Bun.CryptoHasher('sha256').update(s).digest('hex');
// Deterministic synthetic domain adapters: no network, real clock, secrets or randomness.
export function derive(command:string,args:Record<string,string>,domain:Record<string,any>):Record<string,any>{
if(command==='check-credentials')return {credentialEvidence:{signed:records.revocation,replica:records.replica,regionalAcknowledgment:'unknown'}};
if(command==='reserve-export')return {exportFieldsVerified:true,exportInventory:records.assignments.map(({id,revision,snapshot})=>({id,revision,snapshot}))};
if(command==='activate-restricted'){if(!records.revocation.revoked||records.scopeTests.some(x=>x.workspace!=='Dispatch'&&x.allowed))throw Error('Gateway isolation failed');return {gatewayDeniedResearch:true,challenged:['Noor Vale','Felix Rowan'],expires:'2026-11-13T18:00:00Z'};}
return {};
}
