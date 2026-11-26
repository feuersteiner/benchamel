# complex-support-05 benchmark results

Source: [81e53b29](https://github.com/feuersteiner/benchamel/commit/81e53b29be7f4e89bbd0be9e0f612197ba31d3da). Six configurations, one retained final execution each; 10 task executions including preserved infrastructure attempts.

Runtime: codex-cli 0.172.0-alpha.2, Bun 1.3.3, Node v22.19.0.

| Configuration | Execution | Score / 100 | Agent seconds | Cost USD | Max context | Reviews |
|---|---|---:|---:|---:|---:|---:|
| Agent | completed | 100 | 92.1094 | 0.0721 | 47557 | 0 |
| Agent + skill | completed | 100 | 84.6114 | 0.0712 | 42830 | 0 |
| Agent + Luna | completed | 100 | 142.467 | unavailable | unavailable | 1 |
| Agent + Jev | completed | 100 | 150.7606 | unavailable | unavailable | 3 |
| Agent + Luna + skill | completed | 100 | 157.7331 | unavailable | unavailable | 1 |
| Agent + Jev + skill | completed | 100 | 137.6167 | unavailable | unavailable | 2 |

[Execution method and preserved attempts](verification/benchmark-20261126/README.md). A one-line runtime fix explicitly preserves workspace-write permission on resume. Luna batches independent questions following user approval; native gate decisions and thresholds are retained.


## Measurement limits

- One retained final execution per arm; infrastructure attempts are preserved, not statistical replicates.
- Mean scores cover scored runs only; failed execution and unavailable scores remain explicit. Null is not zero.
- Time includes runtime reviews/pacing, excludes preflight/final judging, and uses different concurrency across waves; no controlled latency ranking.
- Native agentests does not expose complete gate usage; gated total cost and context length remain null.
- Luna uses user-approved independent-question batching; Jev retains native single-question transport.
