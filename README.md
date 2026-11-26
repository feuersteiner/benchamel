# benchamel

Benchamel is a harness for testing harnesses.

It launches a configured agent in a fresh temporary directory, captures execution artifacts, and judges run outcomes against manually authored checks.

Install the pinned dependencies with `bun install --frozen-lockfile`. Run `bun run check` and `bun run verify` for type safety and offline fixture/treatment verification. See [the harness guide](harness/readme.md) before launching any paid benchmark execution. The real comparison is ten cases with six Terra task-agent arms per case; dummy-case is a separate smoke fixture.
