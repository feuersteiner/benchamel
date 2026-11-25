# Cases

Each real case uses a lowercase kebab-case directory name.

```
<case-id>/
  CASE.md # defining the key story telling of the case
  JUDGE.md # defining definition of good/done and the scoring rules
  fixture/ # the base repo
  runs/
    results.json # run aggregate
    results.md
    <run-id>/
      run.yaml # metadata + the things to do to prepapre the fixture before running
      prepared/ # the "patch" or the list of changes to "add" to the base fixture
      after/ # the final workproduct of the run
      transcript.jsonl
      result.json # status, scores, timing, costs
      result.md
```
