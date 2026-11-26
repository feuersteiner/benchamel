# complex-support-01 benchmark results

**Historical invocation — not valid for a quality ranking.** These captures used an unrequested four-turn/time cap, oversized review context and no grading for blocked work. The runtime below has been repaired; a corrected full benchmark has not been run. Initial-to-final optimization effects were not measured in this invocation.

Source: [7c33c87a](https://github.com/feuersteiner/benchamel/commit/7c33c87a11aa5afcc202d17c56597a24efa6b585). Six configurations, one retained final execution each; 12 task executions including preserved infrastructure attempts.

Runtime: codex-cli 0.172.0-alpha.2, Bun 1.3.3, Node v22.19.0.

| Configuration | Execution | Score / 100 | Agent seconds | Cost USD | Max context | Reviews |
|---|---|---:|---:|---:|---:|---:|
| Agent | completed | 100 | 98.3591 | 0.061 | 42620 | 0 |
| Agent + skill | completed | 100 | 87.9205 | 0.0598 | 43328 | 0 |
| Agent + Luna | runtime-turn-budget | unavailable | 388.2094 | unavailable | unavailable | 4 |
| Agent + Jev | runtime-turn-budget | unavailable | 247.9255 | unavailable | unavailable | 4 |
| Agent + Luna + skill | completed | 100 | 344.2674 | unavailable | unavailable | 3 |
| Agent + Jev + skill | runtime-turn-budget | unavailable | 174.2511 | unavailable | unavailable | 4 |

[Execution method and preserved attempts](verification/benchmark-20261126/README.md). A one-line runtime fix explicitly preserves workspace-write permission on resume. Luna batches independent questions following user approval; native gate decisions and thresholds are retained.

- `terra-agentests-luna`: runtime-turn-budget. agent exited with code 1.
- `terra-agentests-jev`: runtime-turn-budget. agent exited with code 1.
- `terra-agentests-jev-skill`: runtime-turn-budget. agent exited with code 1.

## Measurement limits

- One retained final execution per arm; infrastructure attempts are preserved, not statistical replicates.
- Mean scores cover scored runs only; failed execution and unavailable scores remain explicit. Null is not zero.
- Time includes runtime reviews/pacing, excludes preflight/final judging, and uses different concurrency across waves; no controlled latency ranking.
- Native agentests does not expose complete gate usage; gated total cost and context length remain null.
- Luna uses user-approved independent-question batching; Jev retains native single-question transport.
