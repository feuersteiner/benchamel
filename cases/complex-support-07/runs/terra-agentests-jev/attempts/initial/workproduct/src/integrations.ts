import records from '../data/records.json';
const sha=(s:string)=>new Bun.CryptoHasher('sha256').update(s).digest('hex');
// Deterministic synthetic domain adapters: no network, real clock, secrets or randomness.
export function derive(command:string,args:Record<string,string>,domain:Record<string,any>):Record<string,any>{
if(command==='pickup')return {custodyReceipt:{items:records.items,insured:true,nonDestructive:true,title:domain.path==='acquisition'?'platform':'unchanged',cause:'unresolved'}};
if(command==='prepare-evidence')return {privateRiskShared:false,evidenceBundle:{serialClaim:records.serialClaim,cropped:true,fault:'unresolved'}};
if(command==='submit-paired'){if(records.paymentBlock||records.priorRefundCents)throw Error('Payment block or duplicate recovery');if(records.captureCents-records.feeCents-records.outboundCents!==records.payableCents)throw Error('Ledger does not reconcile');return {pairedInstruction:{buyer:records.captureCents,seller:records.payableCents,sellerSource:'original-payable',recoveryFromSeller:0}};}
return {};
}
