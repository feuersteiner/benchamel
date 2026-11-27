import { main } from "./harness/cli.ts";

process.exitCode = await main(Bun.argv.slice(2), import.meta.dir);
