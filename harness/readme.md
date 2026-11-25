# Harness

Run `bun run benchamel` for the ten real cases (exactly sixty definitions). It executes them sequentially in path order and stops on failure. `--case complex-support-XX` selects one complete case; `--smoke` selects only dummy-case. `--list` prints a selection without executing anything. Partial real stacks are rejected before execution.

The runner copies the fixture into a temporary workspace, executes preflight commands and the agent, and saves artifacts beside `run.yaml` under `runs/<run-id>/`:

- `transcript.jsonl`: command output, per-call usage, exit codes, errors, and SHA-256 versions of the case and judge.
- `workproduct/`: final workspace, including failed executions.
- `result.json`: output metrics.

The temporary workspace is removed after artifacts are saved. The included dummy case runs Codex GPT-6-Luna.

Each invocation replaces the previous artifacts for that run.

## `run.yaml` contract

Definitions live at `cases/<case-id>/runs/<run-id>/run.yaml`; see [`run.example.yaml`](run.example.yaml). The three fields are:

- `preflight`: Ordered list of shell command strings; `[]` skips preparation.
- `agent`: Shell command string, such as `codex -c`, accepting a final prompt argument.
- `starter_prompt`: String passed as one appended argument to the agent.

Copy `cases/<case-id>/fixture` into a fresh temporary workspace, then run preflight commands in order and the agent there. Command strings use shell syntax; pass the starter prompt safely as one appended argument, never interpolating it as shell code.

Scoring rules live in `cases/<case-id>/JUDGE.md`; `judge.ts` exports `judge(workspace)`, returning a score from 0 to 100.

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

## Ten-case comparison foundation

Install Bun 1.3.3, Node >=22, Codex CLI 0.172.0-alpha.2, then `bun install --frozen-lockfile`.
`bun run verify` is entirely offline; `bun run benchamel` launches **paid inference** and is not part of verification.
No supplied API keys are stored. A later operator supplies credentials through their environment.

All real arms use the pinned Codex CLI with `gpt-6.1-terra`, medium reasoning,
1800 seconds inclusive of runtime reviews, and at most four task turns. Same
fixture, task prompt and final judge apply to all six arms. The dummy smoke case
is excluded from the ten-case/60-arm comparison and all aggregate claims.

`prepare.ts` installs the shared deterministic integration engine in every new
fixture and the identical case skill in skill arms. The trusted boundary checks
those bytes against harness/case originals. The task prompt explicitly invokes
`$case-policy` and includes the skill text, in addition to Codex's `.agents/skills`
discovery. Offline verification proves installation and prompt inclusion; it
cannot prove that a model follows the skill.

Gated arms have a draft/review/revision runtime: the wrapper runs native
agentests 1.0.1 against a minimized temporary repository containing the combined
reply, plan, validated state/audit, and frozen evidence. Findings name the failing
assertion and correction. The same Codex session resumes with feedback, until
clean or four turns expire. Gate failures/setup errors cannot silently pass.
This is a trusted external runtime integration, not a nonexistent agentests hook
flag or a post-benchmark check. No task work is declared complete until the gate
passes. No workspace code is executed by a judge or gate evaluator.

Luna uses the upstream OpenAI decision preset; Jev uses the exact upstream Jev
preset (`jev-latest`, intentionally a mutable provider alias). Both use threshold
0.5 and the same case Test. There are no reasoning assertions, so the configured
reasoning model is not called. See `provenance/dependencies.json` and the lockfile.
The native library does not expose decision usage; total treatment `cost` and
`context_length` are therefore **null**, with producer-only telemetry retained
separately. Runtime reviews are inside `time`; preflight and final judging are
outside it. The four result metrics and three definition fields remain unchanged.

Judges combine 40 operational points with 60 semantic points, with hard breaches
forcing zero. Semantic judging is paid and fails explicitly when unavailable.
Offline known-good routes and synthetic assessment checks validate machinery,
not semantic quality, model availability or calibrated benchmark scores. Never
report offline assertions as measured benchmark outcomes.

Fixture integrations are dated synthetic reconstruction. Their local poll
responses describe bounded state transitions only, with no invented final
forensic, legal or approval result. Private candidate/reviewer answers are never
copied into fixtures, skills, or Tests. Treatment assets are frozen separately
from domain code/policy, so legitimate preparation is allowed and later tampering
remains detectable. The simulation threat model is cooperative task execution:
replay proves state consistency, not an independent signature of CLI execution.
Use process/container isolation before running adversarial agents; filesystem
sandboxing alone does not make external trusted files unreadable.
