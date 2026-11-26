# complex-support-10 benchmark results

Source: [a5149b80](https://github.com/feuersteiner/benchamel/commit/a5149b80b5531f041bd2928aa19c9c8196019482). Six configurations, one retained final execution each; 10 task executions including preserved infrastructure attempts.

Runtime: codex-cli 0.172.0-alpha.2, Bun 1.3.3, Node v22.19.0.

| Configuration | Execution | Score / 100 | Agent seconds | Cost USD | Max context | Reviews |
|---|---|---:|---:|---:|---:|---:|
| Agent | completed | 100 | 77.6827 | 0.0669 | 51080 | 0 |
| Agent + skill | completed | 100 | 90.6256 | 0.0764 | 52782 | 0 |
| Agent + Luna | completed | 100 | 309.7373 | unavailable | unavailable | 2 |
| Agent + Jev | provider-context-limit | unavailable | 87.5405 | unavailable | unavailable | 0 |
| Agent + Luna + skill | completed | 100 | 272.827 | unavailable | unavailable | 2 |
| Agent + Jev + skill | provider-context-limit | unavailable | 90.3658 | unavailable | unavailable | 0 |

[Execution method and preserved attempts](verification/benchmark-20261126/README.md). A one-line runtime fix explicitly preserves workspace-write permission on resume. Luna batches independent questions following user approval; native gate decisions and thresholds are retained.

- `terra-agentests-jev`: provider-context-limit. agent exited with code 1.
- `terra-agentests-jev-skill`: provider-context-limit. agent exited with code 1.

## Measurement limits

- One retained final execution per arm; infrastructure attempts are preserved, not statistical replicates.
- Mean scores cover scored runs only; failed execution and unavailable scores remain explicit. Null is not zero.
- Time includes runtime reviews/pacing, excludes preflight/final judging, and uses different concurrency across waves; no controlled latency ranking.
- Native agentests does not expose complete gate usage; gated total cost and context length remain null.
- Luna uses user-approved independent-question batching; Jev retains native single-question transport.
