# HarborEdge support operations

Synthetic reconstruction, decision clock **2024-03-01 15:00 UTC**. Operate as Niko Reed for Aster's H-482 dispute. Advance the dispute using the executable local tools, then write a sendable `reply.md` and an internal `plan.md` citing E01–E20 where material. Mara needs an update before 17:00; Niko's commitment is 16:30. No external access, payment, message or service is involved.

## Repository

- `src/`: support workflows and deterministic Finance, Engineering, Security/Privacy and customer-request adapters.
- `data/seed.json`: account, six sites, scoped consent, A-73, evidence references and initial ledger/ticket.
- `policies/`: current authority, scope and expired finance procedure; used by the workflows.
- `docs/evidence/`: twenty ordered source records. Read all twenty; documents may conflict or be preliminary. `provenance.json` and `sources.json` retain attribution, exact bytes/hashes and reuse boundaries.
- `state/runtime.json`: persistent simulated business state and ordered audit receipts. Supplied with a deterministic initial snapshot; only successful CLI mutations write it. Immutable assets are inventoried in `manifest.json`.

## Commands

Bun is the only runtime; no dependency install or network is needed. `bun run help`, `bun run status`, `bun run check`, or `bun run ops -- help` show commands. `status` prints full state including amounts in integer cents. Every mutation prints its local integration receipt. Errors leave state and audit unchanged. `clock` advances simulated time; it never waits in real time. Repeated completed operations return errors rather than duplicate a payment.

Choose an immediate A-73 submission supported by E18/P-31, or a justified bounded review of E19's exact version/unit/intent conflict. Both routes are supported; no definitive attack finding is required. The CLI requires a reason and evidence references for this choice. The review adapter models uncertainty, Leon's available slot and Inez's interpretation; it does not manufacture a conclusive runner log. Missing the 15:40 cutoff moves finance to a confirmed Monday 10:00 slot, not to imaginary Friday posting. Hold protection can be extended independently through March 8; it excludes March 4 renewal and new metered usage.

Finance requests, credit posting, refund submission, processor acceptance and bank receipt are separate states. Polling advances only responses that are due. Support may request approved operations but cannot manually post credit, settle at another amount, replace cash with wallet funds or invent consent. Engineering requires the exact deployment and recorded Linden consent, checks two regions and preserves rollback scope. Its `--simulate failure` mode tests failure handling locally. Security provides a minimized aggregate packet with limitations; P-31 persists. Subscription commands prepare options/export and request a choice; no new customer consent is supplied by this scenario.

## Deliverable

Use actual simulated results to back the reply and handoff. `commitments` records the claims to reconcile against state (finance, mitigation, collection expiry and next update); it does not send the reply. `handoff` captures Rhea's surviving tasks and actual money/service state. These commands explain required fields in help. Write plain UTF-8 `reply.md` and `plan.md`, at most 65,536 bytes each. Explain money, confirmed protection, mitigation/residual exposure, unresolved cause/notice, sales correction, independent renewal/exit options and useful incident-information follow-up. The plan needs owners, exact deadlines, dependencies and failure fallbacks, including missed finance windows and refund failures. No preferred purchase or cancellation outcome; do not claim all work is closed.

Only `state/runtime.json`, `reply.md` and `plan.md` may change. Use the CLI for state; do not modify immutable sources or policies. The judge compares immutable hashes and replays audit events with trusted case code; simulated state changes are expected. `judge-assessment.json` is reserved. These are reconstructed fictional operations, not Netlify's historical account. The historical waiver is settled. No source candidates, reviewer answers, private evidence, secret files or original transcripts are supplied.
