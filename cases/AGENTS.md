# Cases

- Research primary online sources; record URLs and check dates, distinguish sourced facts from synthetic reconstruction, and keep scenario records, code and policies consistent.
- Define observable success in `CASE.md` and scoring in `JUDGE.md` together, before building the fixture.
- Validate that the task is solvable and the judge accepts a known-good solution before benchmarking configurations.
- A case owns its judge, fixture, configuration definitions, execution artifacts, and aggregate reports.
- Record case and judge versions with each run. Keep shared comparison conditions fixed and document intentional configuration differences.
- Build a functioning repository from sourced real-scenario evidence: executable workflows, meaningful repository/organization rules, consistent structured records/state, realistic deterministic tools/integrations, and policies that affect workflow decisions. Code, evidence and task must interlock.
- Documentation bundles, empty directory scaffolds and decorative unused scripts do not satisfy the fixture requirement. Only the explicitly labelled dummy smoke case is exempt.
- Name immutable source/seed assets and allowed runtime/output mutations. Judge observable workproduct and state/invariants with trusted logic; do not execute agent-modified evaluators or reject expected runtime changes as tampering.
- Verify a fresh temporary copy offline: runnable entry points, representative state transitions, rejected unauthorized actions leaving state unchanged, deterministic seeds and source hashes. Record inference-dependent validation limits honestly.
- Keep this directory indexed in `readme.md` when real cases are added.

```
<case-id>/
  CASE.md # defining the key story telling of the case
  JUDGE.md # defining definition of good/done and the scoring rules
  judge.ts # implements the scoring rules
  fixture/ # runnable repository reconstructed from sourced scenario evidence
  runs/
    <run-id>/
      run.yaml
      transcript.jsonl
      workproduct/ # final workspace
      result.json # time, cost, score, context_length
```
