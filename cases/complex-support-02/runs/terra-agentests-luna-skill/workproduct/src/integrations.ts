import records from '../data/records.json';
const sha=(s:string)=>new Bun.CryptoHasher('sha256').update(s).digest('hex');
// Deterministic synthetic domain adapters: no network, real clock, secrets or randomness.
export function derive(command:string,args:Record<string,string>,domain:Record<string,any>):Record<string,any>{
if(command==='prepare-schedule'||command==='prepare-reviewed-schedule')return {packetReady:true,packet:records.attachments.map(({id,retrieval,contents})=>({id,retrieval,contents})),optionalIndicator:'withheld'};
if(command==='verify-protection'){if(!records.sessions.every(x=>x==='revoked')||records.connector!=='rotated')throw Error('Targeted protection incomplete');return {checkedSessions:records.sessions.length};}
return {};
}
