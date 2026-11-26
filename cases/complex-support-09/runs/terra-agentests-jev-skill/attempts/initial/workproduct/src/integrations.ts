import records from '../data/records.json';
const sha=(s:string)=>new Bun.CryptoHasher('sha256').update(s).digest('hex');
// Deterministic synthetic domain adapters: no network, real clock, secrets or randomness.
export function derive(command:string,args:Record<string,string>,domain:Record<string,any>):Record<string,any>{
if(command==='map-locations')return {categoriesMapped:records.categories.length,locationMatrix:records.categories,accessCoverage:{productionPrivilegedDays:90,historicIndividualViewing:'unavailable',trialIndex:'identifier-mismatch'}};
if(command==='disable-preview')return {previewManifest:records.previewJobs,previewManifestSha:sha(JSON.stringify(records.previewJobs)),vendorCopies:'unresolved'};
if(command==='reserve-rehearsal')return {migrationLimits:records.migration,customerOutageConsent:false};
return {};
}
