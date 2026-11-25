# Benchamel agent guide

Benchamel compares agent configurations against versioned benchmark cases.

## Structure

- `harness/`: shared environment preparation, execution, capture, judging, and reporting code.
- `cases/<case-id>/`: one scenario, its fixture, judge, configurations, runs, and aggregate results.
- `results.json` and `results.md`: benchmark aggregates, derived from case results.

Reference: https://github.com/feuersteiner/agentests/issues/115

## Case fixtures

- Research primary online sources; record URLs and check dates, distinguish sourced facts from synthetic reconstruction, and keep scenario records, code and policies consistent.
- Construct a runnable repository from sourced real-scenario evidence. Include meaningful repository/organization rules, executable workflows, consistent structured business records and state, domain policies enforced by those workflows, and realistic deterministic local tools/integrations.
- Documents supply evidence inside the repository. Documentation bundles, empty directory scaffolds and decorative unused code are not complete fixtures. The dummy smoke case is an explicit exception.
- Define observable workproduct/state and invariants in CASE/JUDGE. Identify immutable source/seed assets and allowed runtime mutations. Verify a fresh temporary copy offline, including representative successful and rejected transitions, before benchmarking.
