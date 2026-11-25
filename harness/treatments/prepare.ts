import { cp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { boundary } from '../boundary.ts';
export async function prepare(caseRoot:string,workspace:string,arm:string) {
  if(!/^terra(?:-skill|-agentests-(?:luna|jev)(?:-skill)?)?$/.test(arm))throw Error('Unknown arm');
  if(await Bun.file(join(caseRoot,'fixture/policies/domain.json')).exists()) {
    await mkdir(join(workspace,'.benchamel'),{recursive:true});
    await cp(join(import.meta.dir,'../fixture-engine.ts'),join(workspace,'.benchamel/engine.ts'));
  }
  if(arm.endsWith('-skill')) {
    await mkdir(join(workspace,'.agents/skills/case-policy'),{recursive:true});
    await cp(join(caseRoot,'treatments/skill/SKILL.md'),join(workspace,'.agents/skills/case-policy/SKILL.md'));
  }
  await boundary(caseRoot,workspace);
}
if(import.meta.main) {
  const c=process.env.BENCHAMEL_CASE; if(!c)throw Error('Use the Benchamel harness; BENCHAMEL_CASE is required');
  await prepare(c,process.cwd(),process.argv[2]!);
}
