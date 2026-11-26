# Harness

Run `bun run benchamel`. It discovers every `evals/*/runs/*/run.yaml` and executes them sequentially in path order, stopping on failure.

The runner copies the fixture into a temporary workspace, executes preflight commands and the agent, and saves artifacts beside `run.yaml` under `runs/<run-id>/`:

- `transcript.jsonl`: command output, per-call usage, exit codes, errors, and SHA-256 versions of the eval and judge.
- `workproduct/`: final workspace, including failed executions.
- `result.json`: output metrics.

The temporary workspace is removed after artifacts are saved. The included dummy eval runs Codex GPT-6-Luna.

Each invocation replaces the previous artifacts for that run.

## `run.yaml` contract

Definitions live at `evals/<eval-id>/runs/<run-id>/run.yaml`; see [`run.example.yaml`](run.example.yaml). The three fields are:

- `preflight`: Ordered list of shell command strings; `[]` skips preparation.
- `agent`: Shell command string, such as `codex -c`, accepting a final prompt argument.
- `starter_prompt`: String passed as one appended argument to the agent.

Copy `evals/<eval-id>/fixture` into a fresh temporary workspace, then run preflight commands in order and the agent there. Command strings use shell syntax; pass the starter prompt safely as one appended argument, never interpolating it as shell code.

Scoring rules live in `evals/<eval-id>/JUDGE.md`; `judge.ts` exports `judge(workspace)`, returning a score from 0 to 100.

Codex per-call token counts are read from its local session log and preserved in the transcript. Cost uses standard API prices, checked 2026-11-25. USD per million tokens, listed as input / cached input / cache writes / output:

- [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna): $0.10 / $0.01 / $0.125 / $0.50.
- [GPT-6.1 Terra](https://developers.openai.com/api/docs/models/gpt-6.1-terra): $1 / $0.05 / $1.25 / $5.
- [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol): $2 / $0.10 / $2.50 / $10.
- [Jev](https://docs.typesafe.ai/models): $0.042 input; output is free. Supports `jev`, `jev-latest`, `jev-preview`, `jev-1.13.0`, and `jev-1.14.0`.

OpenAI cache-write rates use 30-minute retention. Above 272,000 input tokens, OpenAI input/cache rates double and output rates increase by 1.5 times. Jev has no long-context surcharge or caching discount. This is API-equivalent cost, including all reported calls, rather than subscription billing. Unknown models or missing usage remain `null`. Pricing Jev usage is supported by `tokenCost`; collecting Jev API telemetry is not implemented.

On failure, stop subsequent commands, report the failure, and retain logs and the final workspace.

## Output metrics

Each run's `result.json` reports:

- `time`: Agent wall-clock duration in seconds.
- `cost`: Total agent inference cost in USD, including retries.
- `score`: Judge score, 0–100.
- `context_length`: Largest input context across model calls, in tokens.

Preflight and judging are excluded from agent time and cost. Unavailable measurements use `null`, never zero.
