import records from '../data/records.json';
const sha=(s:string)=>new Bun.CryptoHasher('sha256').update(s).digest('hex');
// Deterministic synthetic domain adapters: no network, real clock, secrets or randomness.
export function derive(command:string,args:Record<string,string>,domain:Record<string,any>):Record<string,any>{
if(command==='assemble-notice')return {contactMismatch:records.notice.sentTo!==records.notice.current,noticeTable:{...records.notice,contentAmount:records.listAnnualCents,humanAcknowledgment:false}};
if(command==='prepare-options')return {optionAmounts:{annual:records.legacyAnnualCents,bridge:records.bridgeMonths*records.bridgeMonthlyCents,monthly:records.bridgeMonthlyCents,seats:records.baseSeats,executed:false}};
return {};
}
