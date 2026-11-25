import { constants } from 'node:fs';
import { lstat, open, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
export const hash = (v:string|Uint8Array) => new Bun.CryptoHasher('sha256').update(v).digest('hex');
export async function textFile(path:string,limit=262144):Promise<string> {
  const h=await open(path,constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);
  try {
    const st=await h.stat(); if(!st.isFile()||st.size>limit)throw Error('Not a bounded regular file');
    const b=Buffer.alloc(limit+1); let size=0;
    while(size<b.length) { const n=await h.read(b,size,b.length-size,null);if(!n.bytesRead)break;size+=n.bytesRead; }
    if(size>limit)throw Error('File too large');
    const s=new TextDecoder('utf-8',{fatal:true}).decode(b.subarray(0,size));if(!s.trim()||s.includes('\0'))throw Error('Malformed text');return s;
  } finally {await h.close();}
}
export async function inventory(root:string):Promise<string[]> {
  const files:string[]=[];
  async function walk(rel:string) {
    for(const name of await readdir(join(root,rel))) {
      const key=rel?`${rel}/${name}`:name,st=await lstat(join(root,key));
      if(st.isDirectory())await walk(key);else if(st.isFile())files.push(key);else throw Error(`Non-regular asset: ${key}`);
    }
  }
  await walk(''); return files.sort();
}
/** Compare originals and legitimate preflight assets from trusted case/harness paths. */
export async function boundary(caseRoot:string,workspace:string) {
  const fixture=join(caseRoot,'fixture');
  const originals=await inventory(fixture);
  for(const file of originals) {
    if(file==='state/runtime.json')continue;
    if(hash(await textFile(join(workspace,file),1048576))!==hash(await readFile(join(fixture,file))))throw Error(`Immutable asset modified: ${file}`);
  }
  const expected:Record<string,string>={};
  const engine=join(import.meta.dir,'fixture-engine.ts');
  if(await Bun.file(join(fixture,'policies/domain.json')).exists())expected['.benchamel/engine.ts']=engine;
  // A skill is a permitted prepared asset only when it matches the case-owned source.
  const skill='.agents/skills/case-policy/SKILL.md';
  const source=join(caseRoot,'treatments/skill/SKILL.md');
  const files=await inventory(workspace);
  if(files.includes(skill))expected[skill]=source;
  for(const [file,original] of Object.entries(expected)) {
    if(hash(await textFile(join(workspace,file),1048576))!==hash(await readFile(original)))throw Error(`Prepared asset modified: ${file}`);
  }
  const allowed=new Set([...originals,...Object.keys(expected),'reply.md','plan.md','judge-assessment.json']);
  for(const file of files)if(!allowed.has(file))throw Error(`Unexpected mutation: ${file}`);
}
