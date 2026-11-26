# complex-support-04 benchmark results

**Historical invocation — not valid for a quality ranking.** These captures used an unrequested four-turn/time cap, oversized review context and no grading for blocked work. The runtime below has been repaired; a corrected full benchmark has not been run. Initial-to-final optimization effects were not measured in this invocation.

Source: [620264a2](https://github.com/feuersteiner/benchamel/commit/620264a2f5c4525f7b7815e731c7638b9286de1e). Six configurations, one retained final execution each; 10 task executions including preserved infrastructure attempts.

Runtime: codex-cli 0.172.0-alpha.2, Bun 1.3.3, Node v22.19.0.

| Configuration | Execution | Score / 100 | Agent seconds | Cost USD | Max context | Reviews |
|---|---|---:|---:|---:|---:|---:|
| Agent | completed | 100 | 152.1214 | 0.0536 | 37505 | 0 |
| Agent + skill | completed | 100 | 80.1333 | 0.0559 | 41468 | 0 |
| Agent + Luna | completed | 100 | 191.9675 | unavailable | unavailable | 1 |
| Agent + Jev | completed | 100 | 199.6344 | unavailable | unavailable | 4 |
| Agent + Luna + skill | completed | 100 | 218.0548 | unavailable | unavailable | 2 |
| Agent + Jev + skill | runtime-turn-budget | unavailable | 183.3778 | unavailable | unavailable | 4 |

[Execution method and preserved attempts](verification/benchmark-20261126/README.md). A one-line runtime fix explicitly preserves workspace-write permission on resume. Luna batches independent questions following user approval; native gate decisions and thresholds are retained.

- `terra-agentests-jev-skill`: runtime-turn-budget. agent exited with code 1.

## Measurement limits

- One retained final execution per arm; infrastructure attempts are preserved, not statistical replicates.
- Mean scores cover scored runs only; failed execution and unavailable scores remain explicit. Null is not zero.
- Time includes runtime reviews/pacing, excludes preflight/final judging, and uses different concurrency across waves; no controlled latency ranking.
- Native agentests does not expose complete gate usage; gated total cost and context length remain null.
- Luna uses user-approved independent-question batching; Jev retains native single-question transport.
