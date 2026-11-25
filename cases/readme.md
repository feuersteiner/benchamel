# Cases

Each real case uses a lowercase kebab-case directory name.

- [`dummy-case`](dummy-case/CASE.md): simple file edit using Codex GPT-6-Luna.

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
