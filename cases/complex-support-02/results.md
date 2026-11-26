# complex-support-02 benchmark results

Source: [70c426eb](https://github.com/feuersteiner/benchamel/commit/70c426eb3eaab2c2f367568d1dee051cf9e33163). Six configurations, one retained final execution each; 12 task executions including preserved infrastructure attempts.

Runtime: codex-cli 0.172.0-alpha.2, Bun 1.3.3, Node v22.19.0.

| Configuration | Execution | Score / 100 | Agent seconds | Cost USD | Max context | Reviews |
|---|---|---:|---:|---:|---:|---:|
| Agent | completed | 100 | 96.9099 | 0.0601 | 41437 | 0 |
| Agent + skill | completed | 100 | 88.2689 | 0.0973 | 43661 | 0 |
| Agent + Luna | completed | 100 | 302.9427 | unavailable | unavailable | 2 |
| Agent + Jev | runtime-turn-budget | unavailable | 169.1778 | unavailable | unavailable | 4 |
| Agent + Luna + skill | runtime-turn-budget | unavailable | 383.9258 | unavailable | unavailable | 4 |
| Agent + Jev + skill | completed | 100 | 123.9313 | unavailable | unavailable | 2 |

[Execution method and preserved attempts](verification/benchmark-20261126/README.md). A one-line runtime fix explicitly preserves workspace-write permission on resume. Luna batches independent questions following user approval; native gate decisions and thresholds are retained.

- `terra-agentests-jev`: runtime-turn-budget. agent exited with code 1.
- `terra-agentests-luna-skill`: runtime-turn-budget. agent exited with code 1.

## Measurement limits

- One retained final execution per arm; infrastructure attempts are preserved, not statistical replicates.
- Mean scores cover scored runs only; failed execution and unavailable scores remain explicit. Null is not zero.
- Time includes runtime reviews/pacing, excludes preflight/final judging, and uses different concurrency across waves; no controlled latency ranking.
- Native agentests does not expose complete gate usage; gated total cost and context length remain null.
- Luna uses user-approved independent-question batching; Jev retains native single-question transport.
