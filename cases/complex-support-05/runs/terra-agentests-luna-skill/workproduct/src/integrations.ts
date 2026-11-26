import records from '../data/records.json';
const sha=(s:string)=>new Bun.CryptoHasher('sha256').update(s).digest('hex');
// Deterministic synthetic domain adapters: no network, real clock, secrets or randomness.
export function derive(command:string,args:Record<string,string>,domain:Record<string,any>):Record<string,any>{
if(command==='test-connector'){const reservations=new Map<number,number>();for(const event of records.events){if(!reservations.has(event.order))reservations.set(event.order,event.quantity*records.packSize);}if(reservations.size!==120)throw Error('Duplicate reservations');return {testReport:{events:records.events.length,reservations:reservations.size,units:[...reservations.values()].reduce((a,b)=>a+b,0),partialShipment:'not-validated',representativeVolume:'not-validated',commercial:false}};}
if(command==='prepare-legacy')return {legacyPacket:{quoteCents:records.legacyQuoteCents,capCents:records.reimbursementCapCents,accepted:false,reimbursed:false}};
return {};
}
