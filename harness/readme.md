# Harness

Shared code will prepare isolated workspaces, invoke agents, capture artifacts, evaluate outcomes, and generate reports. No runner is implemented yet.

## `run.yaml` contract

Definitions live at `cases/<case-id>/runs/<run-id>/run.yaml`; see [`run.example.yaml`](run.example.yaml). The four fields are:

| Field | Value |
| --- | --- |
| `id` | Run identifier, such as `run-id`. |
| `preflight` | Ordered list of shell command strings; `[]` skips preparation. |
| `agent` | Shell command string, such as `codex -c`, accepting a final prompt argument. |
| `starter_prompt` | String passed as one appended argument to the agent. |

Copy `cases/<case-id>/fixture` into a fresh temporary workspace, then run preflight commands in order and the agent there. Command strings use shell syntax; pass the starter prompt safely as one appended argument, never interpolating it as shell code.

Evaluate using `cases/<case-id>/JUDGE.md`, report the outcome, and archive the final workspace before temporary cleanup. Judge invocation details are not yet implemented.

Use a unique output directory per execution; on failure, stop subsequent commands, report the failure, and retain logs, judge artifacts, and the workspace archive.

## Output metrics

Each run's `result.json` reports:

| Field | Meaning |
| --- | --- |
| `time` | Agent wall-clock duration in seconds. |
| `cost` | Total agent inference cost in USD, including retries. |
| `score` | Judge score, 0–100. |
| `context_length` | Largest input context across model calls, in tokens. |

Preflight and judging are excluded from agent time and cost. Unavailable measurements use `null`, never zero.
