# Benchamel agent guide

Benchamel compares agent configurations against versioned benchmark evals.

## Structure

- `harness/`: shared environment preparation, execution, capture, judging, and reporting code; see `harness/readme.md`.
- `evals/<eval-id>/`: one scenario: its base, judge, optional preflight tooling, runner definitions, runs, and aggregate results; see `evals/AGENTS.md`.
- `results.json` and `results.md`: benchmark aggregates, derived from eval results by `bun run benchamel report`.

Reference: https://github.com/feuersteiner/agentests/issues/115

## Checks

- `bun run benchamel run` and real agent commands cost money; never start them as checks.
- Use `bunx tsc --noEmit`, `bun run test` (harness tests, `harness/tooling/tests` and every `evals/*/verify`, without `.env`), `bun run benchamel list` and `bun run benchamel report`, which are offline.
- Harness tests build throwaway eval trees in temporary directories and never write into `evals/*/runs/`.

## Eval bases

- Research primary online sources; record URLs and check dates, distinguish sourced facts from synthetic reconstruction, and keep scenario records, code and policies consistent.
- Construct a runnable repository from sourced real-scenario evidence. Include meaningful repository/organization rules, executable workflows, consistent structured business records and state, domain policies enforced by those workflows, and realistic deterministic local tools/integrations.
- Documents supply evidence inside the repository. Documentation bundles, empty directory scaffolds and decorative unused code are not complete bases. The dummy smoke eval is an explicit exception.
- Define observable workproduct/state and invariants in EVAL/JUDGE. Identify immutable source/seed assets and allowed runtime mutations. Verify a fresh temporary copy offline, including representative successful and rejected transitions, before benchmarking.
