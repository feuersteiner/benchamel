# Post-run agentests treatment

The task agent completes the same ordinary first pass used by the matching baseline/skill arm. Its initial work is preserved before these declared Tests are installed in the fixture. Then `bun .benchamel/agentests.ts luna|jev` runs the fixture's immutable native suite and returns findings to the same session for optimization. Authored eval specimens remain outside the task workspace.

There is no harness-imposed task-turn or wall-time budget. Review uncertainty and optimization errors are separate from task completion. On review/optimization failure, the last complete candidate survives. Initial/final work is independently judged after optimization; identical candidates reuse one assessment and regressions are reported honestly.

Per-assertion packets retain verbatim cited evidence and compact, trusted-replay-validated state/audit. Repeated snapshots use explicit references; opaque hash inventories use verified counts/IDs/digests. Every assertion retains a packet hash, evidence IDs, probability and status. Both provider transports batch otherwise-identical inputs; Luna also uses shared provider-rate pacing. See the shared harness guide for the full lifecycle and measurement contract.

The original Tests, skill, evidence and authored eval expectations are preserved. Existing captured results are historical and unsuitable for a quality ranking. The corrected full benchmark has not been run. See `../verification/post-run-repair/status.json` for repair checks and their limits.
