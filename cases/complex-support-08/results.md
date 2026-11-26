# complex-support-08 benchmark results

**Historical invocation — not valid for a quality ranking.** These captures used an unrequested four-turn/time cap, oversized review context and no grading for blocked work. The runtime below has been repaired; a corrected full benchmark has not been run. Initial-to-final optimization effects were not measured in this invocation.

Source: [3191365d](https://github.com/feuersteiner/benchamel/commit/3191365d2b15c42708fff7b5130d978c38edf6f6). Six configurations, one retained final execution each; 10 task executions including preserved infrastructure attempts.

Runtime: codex-cli 0.172.0-alpha.2, Bun 1.3.3, Node v22.19.0.

| Configuration | Execution | Score / 100 | Agent seconds | Cost USD | Max context | Reviews |
|---|---|---:|---:|---:|---:|---:|
| Agent | completed | 100 | 82.6348 | 0.0819 | 49019 | 0 |
| Agent + skill | completed | 100 | 96.7745 | 0.0843 | 48863 | 0 |
| Agent + Luna | runtime-turn-budget | unavailable | 398.6204 | unavailable | unavailable | 4 |
| Agent + Jev | runtime-turn-budget | unavailable | 180.5044 | unavailable | unavailable | 4 |
| Agent + Luna + skill | runtime-turn-budget | unavailable | 365.6535 | unavailable | unavailable | 4 |
| Agent + Jev + skill | runtime-turn-budget | unavailable | 181.9762 | unavailable | unavailable | 4 |

[Execution method and preserved attempts](verification/benchmark-20261126/README.md). A one-line runtime fix explicitly preserves workspace-write permission on resume. Luna batches independent questions following user approval; native gate decisions and thresholds are retained.

- `terra-agentests-luna`: runtime-turn-budget. agent exited with code 1.
- `terra-agentests-jev`: runtime-turn-budget. agent exited with code 1.
- `terra-agentests-luna-skill`: runtime-turn-budget. agent exited with code 1.
- `terra-agentests-jev-skill`: runtime-turn-budget. agent exited with code 1.

## Measurement limits

- One retained final execution per arm; infrastructure attempts are preserved, not statistical replicates.
- Mean scores cover scored runs only; failed execution and unavailable scores remain explicit. Null is not zero.
- Time includes runtime reviews/pacing, excludes preflight/final judging, and uses different concurrency across waves; no controlled latency ranking.
- Native agentests does not expose complete gate usage; gated total cost and context length remain null.
- Luna uses user-approved independent-question batching; Jev retains native single-question transport.
