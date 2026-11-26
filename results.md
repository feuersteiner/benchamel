# Full benchmark results

One retained final run per configuration across ten cases. Original attempts and infrastructure retries are preserved in the per-case result branches.

| Configuration | Completed / 10 | Scored / 10 | Mean score among scored |
|---|---:|---:|---:|
| Agent | 10 | 10 | 100 |
| Agent + skill | 10 | 10 | 100 |
| Agent + Luna | 7 | 7 | 100 |
| Agent + Jev | 3 | 3 | 100 |
| Agent + Luna + skill | 8 | 8 | 100 |
| Agent + Jev + skill | 4 | 4 | 100 |

Failed runs have null scores, not zero. Scores are conditional on completion and do not provide a complete quality ranking. Wall times use different concurrency waves. Luna uses user-approved independent-question batching. Gated total cost/context remain unavailable.

| Case | Agent | Skill | Luna | Jev | Luna + skill | Jev + skill |
|---|---:|---:|---:|---:|---:|---:|
| complex-support-01 | 100 | 100 | runtime-turn-budget | runtime-turn-budget | 100 | runtime-turn-budget |
| complex-support-02 | 100 | 100 | 100 | runtime-turn-budget | runtime-turn-budget | 100 |
| complex-support-03 | 100 | 100 | 100 | runtime-turn-budget | 100 | runtime-turn-budget |
| complex-support-04 | 100 | 100 | 100 | 100 | 100 | runtime-turn-budget |
| complex-support-05 | 100 | 100 | 100 | 100 | 100 | 100 |
| complex-support-06 | 100 | 100 | 100 | 100 | 100 | 100 |
| complex-support-07 | 100 | 100 | runtime-turn-budget | runtime-turn-budget | 100 | runtime-turn-budget |
| complex-support-08 | 100 | 100 | runtime-turn-budget | runtime-turn-budget | runtime-turn-budget | runtime-turn-budget |
| complex-support-09 | 100 | 100 | 100 | runtime-turn-budget | 100 | 100 |
| complex-support-10 | 100 | 100 | 100 | provider-context-limit | 100 | provider-context-limit |

## Result pull requests

| Case | Pull request |
|---|---|
| complex-support-01 | [#32](https://github.com/feuersteiner/benchamel/pull/32) |
| complex-support-02 | [#33](https://github.com/feuersteiner/benchamel/pull/33) |
| complex-support-03 | [#34](https://github.com/feuersteiner/benchamel/pull/34) |
| complex-support-04 | [#35](https://github.com/feuersteiner/benchamel/pull/35) |
| complex-support-05 | [#36](https://github.com/feuersteiner/benchamel/pull/36) |
| complex-support-06 | [#37](https://github.com/feuersteiner/benchamel/pull/37) |
| complex-support-07 | [#38](https://github.com/feuersteiner/benchamel/pull/38) |
| complex-support-08 | [#39](https://github.com/feuersteiner/benchamel/pull/39) |
| complex-support-09 | [#40](https://github.com/feuersteiner/benchamel/pull/40) |
| complex-support-10 | [#41](https://github.com/feuersteiner/benchamel/pull/41) |

All 60 configurations were attempted; 42 completed and scored 100. Sixteen terminal failures exhausted the four-turn review budget; two Jev runs exceeded the provider context limit. Earlier infrastructure attempts bring the actual task execution count to 104. All attempts and final-judge validation retries are retained in the case PRs.

The case PRs also fix resumed producer sessions losing write access. The user approved Luna batching after native single-question calls saturated its token limit. Case source commits, the runtime fix, transport source, mapping checks, provider receipts and per-run telemetry are recorded. Shared tests, offline case verification, typechecks and retained-artifact integrity checks passed.
