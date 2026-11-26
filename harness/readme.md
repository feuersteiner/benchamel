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
agentests 1.0.1 against three separate native Tests: legal, marketing and
customer-support. Each receives reply, plan, validated state/audit and its selected
frozen evidence in `review.md`. Findings retain the Test, domain, assertion ID and
correction; any failed assertion blocks completion. The same Codex session resumes with feedback, until
clean or four turns expire. Gate failures/setup errors cannot silently pass.
This is a trusted external runtime integration, not a nonexistent agentests hook
flag or a post-benchmark check. No task work is declared complete until the gate
passes. No workspace code is executed by a judge or gate evaluator.

Luna uses the upstream OpenAI decision preset; Jev uses the exact upstream Jev
preset (`jev-latest`, intentionally a mutable provider alias). Both use the same three domain Tests and provisional decision bounds: probabilities
at least 0.8 pass, at most 0.2 fail, and values between those bounds are uncertain.
Uncertainty blocks completion and produces actionable revision feedback. Every
assertion probability and status is retained, including passing assertions. These
bounds are operating policy, not a claim of calibrated model accuracy. There are no reasoning assertions, so the configured
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


### Domain Test contract

Each case owns `treatments/agentests/<domain>/test.yaml`, `TEST.md` and `evals/`.
The three domain directories are `legal`, `marketing` and `customer-support`.
The root umbrella `test.yaml` is forbidden. Test IDs are exactly
`<case-directory-name>-<domain>`; installation copies each domain separately to
`.agents/tests/<test-id>/`. Runtime and layer-three verification require all three
Tests, each with at least 15 assertions. Assertion IDs and decision questions must
be unique across the suite. Native agentests parsing validates required text,
version, IDs and unsupported fields. Each assertion has one `decide` question
(a string or a single-element string array); `grep` and `reason` are forbidden.
Selection contains only `glob: review.md` (the native `[review.md]` form also works).
These structural checks cannot establish semantic independence of the questions.

An optional sibling `context.json` is a case-owned evidence manifest, separate
from the native YAML schema:

```json
{"evidence":["E01","E04","E08"]}
```

Only `evidence` is supported: a nonempty list of unique IDs from
`fixture/provenance.json` documents. Unknown IDs reject the whole gate before any
inference. Without a manifest, all source evidence is included. A domain's packet
has this shape, preserving the canonical state/audit paths:

```text
outputs["reply.md"], outputs["plan.md"]: workproduct strings
state: inspectWorkspace(workspace).state (e.g. state.domain, state.tasks)
audit: inspectWorkspace(workspace).audit (event array)
evidence: {<selected source ID>: <frozen source text>}
```

All domains are installed together. Before each native `run({kind:'all'}, testId)`,
the runtime writes that domain's packet to repository-root `review.md`. Engine
receipts prove every expected assertion ran exactly once. Missing/duplicate Test
results, skipped assertions and nonfinite/out-of-range scores throw instead of
allowing completion. Native findings are aggregated by code without dropping
failures from other domains. The unchanged revision loop forwards the complete
findings to the same producer session under its existing four-turn budget.

`treatmentChecks` native-validates the suite under both provider presets and
uses injected engines for all-pass, all-fail and each selective domain failure.
Shared unit checks also cover malformed/empty/missing/duplicate suites, evidence
filtering, individual assertion failure, result omission and revision feedback.
These checks use no live inference and establish runtime wiring only.

The question-design guidance comes from TypeSafe's
[How to build with TypeSafe](https://docs.typesafe.ai/concepts/how-to-build-with-system-one),
[Writing a Noul question](https://docs.typesafe.ai/primitives/noul#writing-a-noul-question)
and [Model jaggedness](https://docs.typesafe.ai/model-jaggedness)
(checked 2026-11-25): ask narrow independent yes/no questions, send relevant
context, point directly at structured state, and keep arithmetic/date comparisons
and aggregation in code. The minimum of 15 assertions per domain is a user
requirement. Offline doubles do not establish model correctness or calibration.
