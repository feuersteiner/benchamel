import { basename, dirname, relative } from 'node:path';
const arms=['terra','terra-skill','terra-agentests-luna','terra-agentests-jev','terra-agentests-luna-skill','terra-agentests-jev-skill'];
export async function discoverDefinitions(root:string,argv:string[]) {
  const args=argv.filter(x=>x!=='--');let smoke=false,list=false,selected:string|undefined;
  while(args.length) {
    const arg=args.shift();
    if(arg==='--smoke')smoke=true;
    else if(arg==='--list')list=true;
    else if(arg==='--case'){selected=args.shift();if(!selected||!/^complex-support-(0[1-9]|10)$/.test(selected))throw Error('Use --case complex-support-01 through complex-support-10');}
    else throw Error('Usage: bun run benchamel [--case CASE | --smoke] [--list]');
  }
  if(smoke&&selected)throw Error('--case and --smoke are separate modes');
  const pattern=smoke?'cases/dummy-case/runs/*/run.yaml':selected?'cases/'+selected+'/runs/*/run.yaml':'cases/complex-support-*/runs/*/run.yaml';
  const definitions:string[]=[];
  for await(const path of new Bun.Glob(pattern).scan({cwd:root,absolute:true,onlyFiles:true}))definitions.push(path);
  if(smoke){if(!definitions.length)throw Error('No dummy smoke definitions found');}
  else {
    const ids=selected?[selected]:Array.from({length:10},(_,i)=>'complex-support-'+String(i+1).padStart(2,'0'));
    for(const id of ids) {
      const found=definitions.filter(p=>relative(root,p).startsWith('cases/'+id+'/')).map(p=>basename(dirname(p))).sort();
      if(JSON.stringify(found)!==JSON.stringify([...arms].sort()))throw Error(id+': expected the exact six Terra arms before running; reconstruct its full stack first');
    }
    if(definitions.length!==ids.length*6)throw Error('Unexpected real-case definitions outside the ten-case comparison');
  }
  return {definitions:definitions.sort(),list,smoke};
}
