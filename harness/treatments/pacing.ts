import {mkdir,readFile,writeFile,rm,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
// Measured Luna organization limit: 2M input tokens/minute. Reserve 1.44M/minute conservatively.
export const lunaTokensPerSecond=24000;
export async function reserveLuna(tokens:number,directory=process.env.BENCHAMEL_PROVIDER_RATE_DIRECTORY??join(tmpdir(),'benchamel-luna-provider-rate'),now?:number) {
  if(!Number.isFinite(tokens)||tokens<=0)throw Error('Invalid provider token reservation');
  await mkdir(directory,{recursive:true});const lock=join(directory,'lock'),clock=join(directory,'next');
  for(;;) {
    try{await mkdir(lock);break;}
    catch(error){
      if((error as NodeJS.ErrnoException).code!=='EEXIST')throw error;
      try{if(Date.now()-(await stat(lock)).mtimeMs>10000)await rm(lock,{recursive:true,force:true});}catch{}
      await Bun.sleep(25);
    }
  }
  try {
    let next=0;try{next=Number(await readFile(clock,'utf8'));}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
    if(!Number.isFinite(next))throw Error('Invalid provider pacing clock');
    const reservedAt=Math.max(now??Date.now(),next),duration=Math.ceil(tokens/lunaTokensPerSecond*1000);
    await writeFile(clock,String(reservedAt+duration));return {reservedAt,estimatedTokens:tokens,tokensPerSecond:lunaTokensPerSecond};
  }finally{await rm(lock,{recursive:true,force:true});}
}
export async function paceLuna(body:string) {
  const started=Date.now(),reservation=await reserveLuna(Math.ceil(body.length/3)+2500);
  await Bun.sleep(Math.max(0,reservation.reservedAt-Date.now()));
  return {...reservation,waitMilliseconds:Date.now()-started,scope:'shared provider pacing, not a task/revision budget'};
}
