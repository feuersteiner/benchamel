# Evals

Each real eval uses a lowercase kebab-case directory name.

- [`dummy-eval`](dummy-eval/EVAL.md): explicit fixture exception: simple file-edit smoke check using Codex GPT-6-Luna.
- [`complex-support-01`](complex-support-01/EVAL.md): runnable offline HarborEdge support repository; 20 evidence records, finance/service workflows, state replay and semantic 0–100 judge.

```
<eval-id>/
  EVAL.md # defining the key story telling of the eval
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
