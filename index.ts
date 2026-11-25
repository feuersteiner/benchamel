import { run } from "./harness/run.ts";

try {
  const definitions: string[] = [];
  const glob = new Bun.Glob("cases/*/runs/*/run.yaml");
  for await (const path of glob.scan({ cwd: import.meta.dir, absolute: true, onlyFiles: true })) {
    definitions.push(path);
  }
  if (definitions.length === 0) throw new Error("No run definitions found under cases/.");
  for (const definition of definitions.sort()) {
    await run(definition);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
