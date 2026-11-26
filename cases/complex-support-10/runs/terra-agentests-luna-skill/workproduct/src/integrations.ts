import records from '../data/records.json';
const sha=(s:string)=>new Bun.CryptoHasher('sha256').update(s).digest('hex');
// Deterministic synthetic domain adapters: no network, real clock, secrets or randomness.
export function derive(command:string,args:Record<string,string>,domain:Record<string,any>):Record<string,any>{
if(command==='verify-sample'){const manifest=records.attachments.map(x=>({id:x.id,sha256:sha(x.bytes)}));if(manifest.some((x,i)=>x.sha256!==records.attachments[i]!.expectedSha256))throw Error('Sample checksum mismatch');return {sampleArchive:{records:records.sampleRows.length,attachments:manifest,eventLinks:records.amendments,verifier:'offline-no-activation',production:false}};}
if(command==='compare-capabilities')return {missingNativeAmendments:records.amendments.length,comparisonTable:{mappedRecords:records.sampleRows.length,flowOfflineSigning:records.flowOfflineSigning,nativeAmendments:0,archiveAmendments:records.amendments.length}};
return {};
}
