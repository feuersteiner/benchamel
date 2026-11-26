/** Offline only. No producer or semantic judge invocation. */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const repo=join(import.meta.dir,'..');
const option=(name:string)=>{const i=process.argv.indexOf(name);return i<0?undefined:process.argv[i+1];};
const requested=option('--case'),layer=Number(option('--layer')??3);
assert([1,2,3].includes(layer));
const arms=['terra','terra-skill','terra-agentests-luna','terra-agentests-jev','terra-agentests-luna-skill','terra-agentests-jev-skill'].slice(0,layer===1?1:layer===2?2:6);
const found=(await readdir(join(repo,'cases'))).filter(x=>/^complex-support-\d\d$/.test(x)).sort();
const cases=requested?[requested]:found;
if(!requested)assert.equal(cases.length,10,'Expected ten real cases');
let count=0;
for(const id of cases) {
  const root=join(repo,'cases',id);const dirs=await readdir(join(root,'runs'));const actual:string[]=[];let prompt:string|undefined;
  for(const dir of dirs) {
    const path=join(root,'runs',dir,'run.yaml');if(!await Bun.file(path).exists())continue;
    const value=Bun.YAML.parse(await readFile(path,'utf8')) as any;
    assert.deepEqual(Object.keys(value).sort(),['agent','preflight','starter_prompt']);
    assert(Array.isArray(value.preflight)&&value.preflight.every((x:any)=>typeof x==='string'));
    assert(typeof value.agent==='string'&&value.agent.includes(`agent.ts" ${dir}`));
    assert.equal(value.starter_prompt,prompt??value.starter_prompt);prompt=value.starter_prompt;
    actual.push(dir);count++;
  }
  assert.deepEqual(actual.sort(),[...arms].sort(),`${id}: exact arms`);
  const {verify}=await import(join(root,'verify.ts'));await verify(root,arms);
  console.log(JSON.stringify({case:id,offline:true,arms:actual.length,status:'passed'}));
}
const tests=Bun.spawn(['bun','test',join(import.meta.dir,'tests')],{stdout:'inherit',stderr:'inherit'});
assert.equal(await tests.exited,0);
console.log(JSON.stringify({offline:true,cases:cases.length,definitions:count,paidRuns:0,semanticValidation:'not-run'}));
