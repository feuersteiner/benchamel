import { run } from './harness/run.ts';
import { discoverDefinitions } from './harness/discover.ts';
try {
  const selection=await discoverDefinitions(import.meta.dir,process.argv.slice(2));
  if(selection.list)console.log(JSON.stringify(selection,null,2));
  else for(const definition of selection.definitions)await run(definition);
} catch(error) {
  console.error(error instanceof Error?error.message:String(error));
  process.exitCode=1;
}
