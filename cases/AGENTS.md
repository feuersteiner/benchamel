# Cases

- Define observable success in `CASE.md` and scoring in `JUDGE.md` together, before building the fixture.
- Validate that the task is solvable and the judge accepts a known-good solution before benchmarking configurations.
- A case owns its judge, immutable fixture, configuration definitions, execution artifacts, and aggregate reports.
- Record case and judge versions with each run. Keep shared comparison conditions fixed and document intentional configuration differences.
- Keep this directory indexed in `readme.md` when real cases are added.

```
<case-id>/
  CASE.md # defining the key story telling of the case
  JUDGE.md # defining definition of good/done and the scoring rules
  judge.ts # implements the scoring rules
   fixture/ # the base repo
  runs/
    <run-id>/
      run.yaml
      transcript.jsonl
      workproduct/ # final workspace
      result.json # time, cost, score, context_length
```
