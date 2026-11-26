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

const installedReviews=new Map<string,'luna'|'jev'>();

/** Install runnable native Tests only after the ordinary first pass; eval answers stay outside the fixture. */
export async function installFixtureReview(caseRoot:string,workspace:string,decision:'luna'|'jev') {
  const {config,domains}=await import('./settings.ts');
  const {readFile,writeFile}=await import('node:fs/promises');
  const alreadyInstalled=installedReviews.has(workspace);
  if(alreadyInstalled&&installedReviews.get(workspace)!==decision)throw Error('Prepared review provider changed');
  const configPath=join(workspace,'agentests.config.yaml'),expected=JSON.stringify(config(decision));
  if(alreadyInstalled&&!await Bun.file(configPath).exists())throw Error('Prepared review config missing');
  if(await Bun.file(configPath).exists()&&await readFile(configPath,'utf8')!==expected)throw Error('Prepared review config modified');
  for(const domain of domains) {
    const target=join(workspace,'.agents/tests',`${caseRoot.split('/').at(-1)}-${domain}`);await mkdir(target,{recursive:true});
    for(const name of ['test.yaml','TEST.md','context.json']) {
      const original=join(caseRoot,'treatments/agentests',domain,name),dest=join(target,name);
      if(!await Bun.file(original).exists())continue;
      if(alreadyInstalled&&!await Bun.file(dest).exists())throw Error(`Prepared Test missing: ${domain}/${name}`);
      if(await Bun.file(dest).exists()&&await readFile(dest,'utf8')!==await readFile(original,'utf8'))throw Error(`Prepared Test modified: ${domain}/${name}`);
      await cp(original,dest);
    }
  }
  await mkdir(join(workspace,'.benchamel'),{recursive:true});
  const entry=join(workspace,'.benchamel/agentests.ts'),source=join(import.meta.dir,'fixture-agentests.ts');
  if(alreadyInstalled&&!await Bun.file(entry).exists())throw Error('Prepared review entrypoint missing');
  if(await Bun.file(entry).exists()&&await readFile(entry,'utf8')!==await readFile(source,'utf8'))throw Error('Prepared review entrypoint modified');
  await cp(source,entry);await writeFile(configPath,expected);installedReviews.set(workspace,decision);
}
