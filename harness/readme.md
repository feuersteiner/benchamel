# Harness

Run `bun run benchamel` for the ten real cases (exactly sixty definitions). It executes them sequentially in path order and stops on failure. `--case complex-support-XX` selects one complete case; `--smoke` selects only dummy-case. `--list` prints a selection without executing anything. Partial real stacks are rejected before execution.

The runner copies the fixture into a temporary workspace, executes preflight commands and the agent, and saves artifacts beside `run.yaml` under `runs/<run-id>/`:

- `transcript.jsonl`: command output, per-call usage, exit codes, errors, and SHA-256 versions of the case and judge.
- `workproduct/`: final workspace, including failed executions.
- `result.json`: the same four output metrics.
- `initial-workproduct/`: the ordinary first-pass snapshot, captured before Tests or review feedback are installed.
- `assessment.json`, `initial-assessment.json`, `final-assessment.json`: separate producer/optimization outcomes and paired, independent judge assessments. Initial/final assessment files exist when the judge generated them.

The temporary workspace is removed after artifacts are saved. The included dummy case runs Codex GPT-6-Luna.

Existing captures are immutable. When a definition already has result/transcript artifacts, a subsequent invocation writes a new `executions/run-*` directory rather than replacing them.

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

OpenAI cache-write rates use 30-minute retention. Above 272,000 input tokens, OpenAI input/cache rates double and output rates increase by 1.5 times. Jev has no long-context surcharge or caching discount. This is API-equivalent cost, including all reported calls, rather than subscription billing. Unknown models or missing usage remain `null`. Native review request usage is retained in transport receipts for both providers; four-metric treatment totals remain null until that telemetry is fully aggregated.

Preflight or producer failures remain explicit and artifacts are retained. Post-run review/optimization errors retain the last complete candidate (or the preserved initial work when setup failed); they do not relabel a completed first pass as a task failure. Final grading is attempted independently of execution status.

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

All real arms use the pinned Codex CLI with `gpt-6.1-terra` and medium reasoning. There is no harness-imposed task-turn or wall-time budget. The same ordinary first-pass prompt and final judge apply to all six arms; skill content is the explicit skill-arm difference. The dummy smoke case
is excluded from the ten-case/60-arm comparison and all aggregate claims.

`prepare.ts` installs the shared deterministic integration engine in every new
fixture and the identical case skill in skill arms. The trusted boundary checks
those bytes against harness/case originals. The task prompt explicitly invokes
`$case-policy` and includes the skill text, in addition to Codex's `.agents/skills`
discovery. Offline verification proves installation and prompt inclusion; it
cannot prove that a model follows the skill.

The agent first completes the ordinary task. The runtime preserves that full initial candidate before exposing any Test, authored eval specimen or review feedback. Agentests arms then install the three declared native Tests (`legal`, `marketing`, `customer-support`) and their config into that same fixture. Eval specimens and reference answers are never installed. The frozen fixture command is `bun .benchamel/agentests.ts luna|jev`, executed with the trusted case/harness environment provided by the runner. Its entrypoint, Test files and config are byte-checked against trusted originals, including after each revision; deletion is also rejected. Native agentests loads and runs the installed Tests in the actual fixture, not a separate synthetic review repository.

Failed or uncertain assertions provide feedback to the same task session for post-run optimization. There is no fixed number of revisions and no hidden time limit. Uncertainty remains a distinct review outcome, never an automatic task/content failure or silent pass. A provider error or incomplete/invalid revision ends optimization with a separate error receipt and restores the last complete candidate; the initial candidate remains independently available. Initial/final quality can regress and is measured rather than assumed. The benchmark judge never selects candidates or feeds its verdict into optimization.

Both providers batch independent questions only when all non-question request fields are identical. Every native assertion still runs exactly once and retains its probability/status. The in-repository transport replaces the historical external preload. Luna requests share cross-process provider pacing based on the measured 2M-token/minute organization limit, with conservative 1.44M/minute token reservations. Pacing is recorded as transport wait, not a task budget. No unmeasured Jev quota is invented; native SDK transport retries retain their normal semantics.

Luna uses the upstream OpenAI decision preset; Jev uses the exact upstream Jev
preset (`jev-latest`, intentionally a mutable provider alias). Both use the same three domain Tests and provisional decision bounds: probabilities
at least 0.8 pass, at most 0.2 fail, and values between those bounds are uncertain.
Uncertainty prevents optimization from being marked passed and produces revision feedback, while the already-completed task candidate remains preserved. Every
assertion probability and status is retained, including passing assertions. These
bounds are operating policy, not a claim of calibrated model accuracy. There are no reasoning assertions, so the configured
reasoning model is not called. See `provenance/dependencies.json` and the lockfile.
Native decision request usage, encoded request sizes and per-assertion packet hashes/evidence IDs are retained. Total treatment `cost` and `context_length` remain **null** until producer and review telemetry are fully aggregated; producer-only telemetry is retained separately. Runtime reviews are inside `time`; preflight and final judging are
outside it. The four result metrics and three definition fields remain unchanged.

Judges combine 40 operational points with 60 semantic points, with hard breaches
forcing zero. Semantic judging is paid and fails explicitly when unavailable. Initial and final candidates are judged only after optimization, on isolated copies without treatment/review identity or feedback. Byte-identical candidates reuse one independent assessment to avoid judge noise or duplicate cost. Changed candidates receive separate assessments and an honest initial-to-final delta. Judge errors retain their assessment/error artifact and do not prevent the other candidate from being assessed.
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
`.agents/tests/<test-id>/` after the first pass, excluding `evals/`. Runtime and layer-three verification require all three
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
inference. An assertion receives exactly its explicitly cited evidence IDs within that manifest; if it cites none, the manifest (or all evidence when absent) is retained. Unknown or undeclared IDs reject the review before inference. Source text is never summarized or changed. Each encoded model packet contains the full reply/plan and relevant frozen evidence, with canonical state/audit paths:

```text
outputs["reply.md"], outputs["plan.md"]: unchanged candidate workproduct strings
state, audit: trusted-replay-validated representation
evidence: {<required source ID>: <verbatim frozen text>}
representation: explicit duplicate-reference and inventory-integrity semantics
```

Repeated state/snapshot objects use escaped JSON Pointer `$ref` references within the packet. Opaque attachment SHA inventories carry verified counts, IDs and an inventory digest, rather than repeating every hash in domain state, commitments, handoff and audit arguments. Trusted deterministic replay and immutable-file validation happen on the complete originals before this model-only representation; no business fact is inferred from a compressed approximation.

The fixture's `review.md` contains the current output/state representation. The native decide engine enriches each assertion with its declared relevant evidence. Receipts retain the hash, encoded size and evidence IDs of each actual per-assertion input, plus real encoded request sizes and batch usage. Missing/duplicate native results, skipped assertions and invalid probabilities reject the review. All findings retain Test/domain/assertion IDs and are forwarded without dropping other domains.

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

## Historical comparison status

The saved 60-configuration invocation predates this repair. Its four-turn cap, oversized review context and skipped grading of blocked candidates make it unsuitable for a quality ranking or an optimization-effect claim. Captured transcripts, results and workproducts are historical evidence and remain unchanged. A corrected full benchmark has not been run. Separate live negative controls show the frozen judge can return zero for hard breaches and partial credit for incomplete safe work; they do not prove a quality gain from post-run optimization.
