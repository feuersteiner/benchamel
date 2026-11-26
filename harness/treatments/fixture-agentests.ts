/** Frozen fixture command. Host dependencies/credentials remain outside the task workproduct. */
import { join } from 'node:path';
const caseRoot=process.env.BENCHAMEL_CASE,harness=process.env.BENCHAMEL_HARNESS,decision=process.argv[2];
if(!caseRoot||!harness||!['luna','jev'].includes(decision!))throw Error('Run through Benchamel with its trusted case/harness environment');
const {boundary}=await import(join(harness,'boundary.ts'));await boundary(caseRoot,process.cwd(),true);
const {gate}=await import(join(harness,'treatments/gate.ts'));
console.log(JSON.stringify({type:'benchamel.gate',...await gate(caseRoot,process.cwd(),decision)}));
