# complex-support-03 benchmark results

Source: [5b3bcd96](https://github.com/feuersteiner/benchamel/commit/5b3bcd969d5bfd4082946e111f6d493bf7a882fd). Six configurations, one retained final execution each; 10 task executions including preserved infrastructure attempts.

Runtime: codex-cli 0.172.0-alpha.2, Bun 1.3.3, Node v22.19.0.

| Configuration | Execution | Score / 100 | Agent seconds | Cost USD | Max context | Reviews |
|---|---|---:|---:|---:|---:|---:|
| Agent | completed | 100 | 91.6674 | 0.0654 | 47706 | 0 |
| Agent + skill | completed | 100 | 111.2553 | 0.0964 | 53772 | 0 |
| Agent + Luna | completed | 100 | 378.7494 | unavailable | unavailable | 4 |
| Agent + Jev | runtime-turn-budget | unavailable | 176.4512 | unavailable | unavailable | 4 |
| Agent + Luna + skill | completed | 100 | 352.1478 | unavailable | unavailable | 3 |
| Agent + Jev + skill | runtime-turn-budget | unavailable | 166.0525 | unavailable | unavailable | 4 |

[Execution method and preserved attempts](verification/benchmark-20261126/README.md). A one-line runtime fix explicitly preserves workspace-write permission on resume. Luna batches independent questions following user approval; native gate decisions and thresholds are retained.

- `terra-agentests-jev`: runtime-turn-budget. agent exited with code 1.
- `terra-agentests-jev-skill`: runtime-turn-budget. agent exited with code 1.

## Measurement limits

- One retained final execution per arm; infrastructure attempts are preserved, not statistical replicates.
- Mean scores cover scored runs only; failed execution and unavailable scores remain explicit. Null is not zero.
- Time includes runtime reviews/pacing, excludes preflight/final judging, and uses different concurrency across waves; no controlled latency ranking.
- Native agentests does not expose complete gate usage; gated total cost and context length remain null.
- Luna uses user-approved independent-question batching; Jev retains native single-question transport.
