# complex-support-09 benchmark results

**Historical invocation — not valid for a quality ranking.** These captures used an unrequested four-turn/time cap, oversized review context and no grading for blocked work. The runtime below has been repaired; a corrected full benchmark has not been run. Initial-to-final optimization effects were not measured in this invocation.

Source: [f138325b](https://github.com/feuersteiner/benchamel/commit/f138325b8677c974ea608b1d891ec6c4b82b02e4). Six configurations, one retained final execution each; 10 task executions including preserved infrastructure attempts.

Runtime: codex-cli 0.172.0-alpha.2, Bun 1.3.3, Node v22.19.0.

| Configuration | Execution | Score / 100 | Agent seconds | Cost USD | Max context | Reviews |
|---|---|---:|---:|---:|---:|---:|
| Agent | completed | 100 | 110.4379 | 0.076 | 45448 | 0 |
| Agent + skill | completed | 100 | 115.6992 | 0.0859 | 50937 | 0 |
| Agent + Luna | completed | 100 | 205.9694 | unavailable | unavailable | 1 |
| Agent + Jev | runtime-turn-budget | unavailable | 239.3175 | unavailable | unavailable | 4 |
| Agent + Luna + skill | completed | 100 | 369.2428 | unavailable | unavailable | 3 |
| Agent + Jev + skill | completed | 100 | 193.916 | unavailable | unavailable | 4 |

[Execution method and preserved attempts](verification/benchmark-20261126/README.md). A one-line runtime fix explicitly preserves workspace-write permission on resume. Luna batches independent questions following user approval; native gate decisions and thresholds are retained.

- `terra-agentests-jev`: runtime-turn-budget. agent exited with code 1.

## Measurement limits

- One retained final execution per arm; infrastructure attempts are preserved, not statistical replicates.
- Mean scores cover scored runs only; failed execution and unavailable scores remain explicit. Null is not zero.
- Time includes runtime reviews/pacing, excludes preflight/final judging, and uses different concurrency across waves; no controlled latency ranking.
- Native agentests does not expose complete gate usage; gated total cost and context length remain null.
- Luna uses user-approved independent-question batching; Jev retains native single-question transport.
