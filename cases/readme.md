# Cases

Each real case uses a lowercase kebab-case directory name.

- [`dummy-case`](dummy-case/CASE.md): explicit fixture exception: simple file-edit smoke check using Codex GPT-6-Luna.
- [`complex-support-01`](complex-support-01/CASE.md): runnable offline HarborEdge support repository; 20 evidence records, finance/service workflows, state replay and semantic 0–100 judge.

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

## Real comparison (ten cases; six arms each)

- [complex-support-01](complex-support-01/CASE.md): Exceptional usage invoice and continuity.
- [complex-support-02](complex-support-02/CASE.md): Security incident during enterprise renewal.
- [complex-support-03](complex-support-03/CASE.md): Data loss and recovery.
- [complex-support-04](complex-support-04/CASE.md): Grandfathered pricing and disputed notice.
- [complex-support-05](complex-support-05/CASE.md): Failed enterprise implementation.
- [complex-support-06](complex-support-06/CASE.md): Accessibility complaint before launch.
- [complex-support-07](complex-support-07/CASE.md): Marketplace transaction dispute.
- [complex-support-08](complex-support-08/CASE.md): Account suspension appeal.
- [complex-support-09](complex-support-09/CASE.md): Data residency commitment.
- [complex-support-10](complex-support-10/CASE.md): Product retirement and migration.

Each independent case stack starts at the shared foundation. Dummy-case is a separate smoke fixture. Historical runs are retained with an invalid-comparison notice. The post-run optimization runtime has been repaired, but no corrected full benchmark result is claimed.
