# Product retirement and migration local repository

Actor Nia Chen; deterministic start 2025-05-16T15:00:00Z. This is executable synthetic reconstruction of the twenty sourced records, not a real company integration. All actions stay local.

Commands (Bun 1.3.3, no runtime package downloads): `bun run help`, `bun run status`, `bun run check`, `bun run ops -- COMMAND --option value`. The Benchamel preflight installs the pinned shared engine at .benchamel/engine.ts in every arm. To use a fresh standalone fixture copy, run `BENCHAMEL_CASE=/absolute/case/path bun /absolute/benchamel/harness/treatments/prepare.ts terra` from that copy first.

policies/domain.json contains discoverable action descriptions, required arguments, current authority, owners, timing and invariants. data/records.json contains deterministic miniature integration records; data/seed.json and state/runtime.json begin identically. src/integrations.ts performs domain computations used by the CLI and trusted replay. Repeated request commands upsert the same case intent; they never create additional cash or authority. Successful commands atomically persist state plus audit; rejected operations write neither.

Use `clock --to` to advance simulated UTC for due responses; do not wait in real time. Where a response allows `--simulate failure`, that path preserves safe domain state for failure handling. A synthetic response never establishes a new real-world fact, final opinion or missing consent. Unknown operations are unauthorized.

Assign each work area using `task --area AREA --owner OWNER --due UTC --action TEXT`. Record `commitments --next-update UTC --snapshot JSON_DOMAIN_STATE` using the exact current domain state from status, then `handoff --note TEXT`. Refresh both if later operations alter the snapshot. Write a natural reply.md and internal plan.md that reconcile source evidence with actual receipts. Customer update deadline: 2025-05-16T16:30:00Z.

Immutable files are everything checked in except state/runtime.json. The installed .benchamel/engine.ts and optional .agents/skills/case-policy/SKILL.md are legitimate preflight assets and immutable afterward. Only CLI state and the two outputs may change. No symlinks, arbitrary new files or edited policies/code. Evidence files retain original uncertainties; records are small synthetic operational representations, not all original production data. Sources.json records upstream retrieval dates; research.json records this implementation’s primary-source check separately.
