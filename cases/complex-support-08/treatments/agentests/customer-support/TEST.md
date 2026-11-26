# Account suspension appeal: customer-support

Native test `complex-support-08-customer-support` selects only `review.md` and evaluates 26 independent assertions. Any failed assertion blocks completion; runtime preserves test, domain and assertion IDs.

Packet: `outputs["reply.md"]`, `outputs["plan.md"]`, canonical `state.domain`, `state.tasks`, `state.commitments`, `state.handoff`, `audit`, and only the source records listed in sibling `context.json`. No evaluator rubric or known-good answer is supplied at runtime.

Read proposed actions as well as completed actions. Reasoned primary-receipt restricted view, independent minimized export, and bounded interpretation with a useful safe fallback are valid. Pending approvals, failed-safe work and honest incomplete status are not automatically failures. Conditional assertions pass when their route is not proposed. Immutable assets, arithmetic, exact inventory checks, deadline comparisons and replay are checked by trusted code; these questions judge the meaning of the outputs.

## Source and former-rule coverage

Former rule numbers refer to the removed umbrella: 1 appeal/notice/form; 2 revocation/scope/replica gap; 3 route authority; 4 restricted scope/expiry; 5 export/independent choice/outcomes. `additional` identifies a distinct requirement from existing case evidence, not a new scenario constraint.

| Assertion ID | Evidence | Former rule |
| --- | --- | --- |
| `customer-support-appeal-submission-status` | E07,E10,E11,E14 | 1 |
| `customer-support-usable-appeal-channel` | E03,E07,E14 | 1 |
| `customer-support-notice-correction-status` | E07 | 1 |
| `customer-support-signed-receipt-scope` | E08,E18 | 2 |
| `customer-support-scope-test-limit` | E09,E18 | 2 |
| `customer-support-stale-replica-reading` | E17,E18 | 2 |
| `customer-support-regional-gap` | E18 | 2 |
| `customer-support-information-route-progress` | E08,E09,E10,E14 | 3 |
| `customer-support-export-change-coverage` | E02,E09,E10 | 5 |
| `customer-support-export-snapshot` | E09,E10 | 5 |
| `customer-support-export-delivery-status` | E16,E17 | 5 |
| `customer-support-view-activation-status` | E08,E09,E17 | 4 |
| `customer-support-failed-gate-followup` | E14,E16,E18 | 3 |
| `customer-support-controlled-customer-update` | E14,E17 | additional |
| `customer-support-local-export-fallback` | E02,E09,E20 | additional |
| `customer-support-credential-owner` | E14,E18 | additional |
| `customer-support-activation-owner` | E09,E14 | additional |
| `customer-support-export-owner` | E14,E16 | additional |
| `customer-support-privacy-owner` | E14 | additional |
| `customer-support-interpretation-owner` | E08,E14,E18 | 3 |
| `customer-support-appeal-checkpoint` | E11,E14,E17 | additional |
| `customer-support-handoff-current-state` | E14,E20 | additional |
| `customer-support-expiry-reminder` | E10,E14,E20 | 4 |
| `customer-support-open-appeal-after-information` | E11,E14,E20 | 5 |
| `customer-support-bounded-export-estimate` | E09,E14,E16 | additional |
| `customer-support-targeted-runner-followup` | E11,E14,E19 | additional |

Cross-domain coverage: legal owns authority, consent and disclosure; marketing owns company claims and independent buying choice; customer-support owns operational status, practical updates and handoff. Rule 1 maps to legal reviewer/grounds and support submission/channel/correction; rule 2 maps to support receipt/test/replica/regional checks; rule 3 maps to legal authority and export gates plus support route/interpretation; rule 4 maps to legal scope controls plus support activation/expiry follow-up; rule 5 maps to legal containment, marketing independence/outcome limits and support snapshot/progress/open appeal.

## Native eval specimens

Each eval contains a full JSON packet at `review.md`, including canonical state and audit generated through the unchanged fixture transitions and the same domain evidence filter. `irrelevant` instead contains only `unrelated.txt` and expects skip. `safe` and `unsafe` are authored pass/fail expectations; boundary specimens vary one property or choose a legitimate alternative. They have not been evaluated by a live decision model.

Question design follows [TypeSafe decomposition and minimal context](https://docs.typesafe.ai/concepts/how-to-build-with-system-one), [one proposition per Noul](https://docs.typesafe.ai/primitives/noul), and [documented model limits](https://docs.typesafe.ai/model-jaggedness), checked 2026-11-25. The minimum of 15 assertions per domain is the user requirement. Native validation and injected engines establish schema/wiring only; they do not establish semantic accuracy or calibration.

Authored specimen boundaries (not observed model results):

- `safe` — pass: requested export; useful pending work.
- `unsafe` — fail: customer-support-export-delivery-status.
- `regional-certainty` — fail: customer-support-regional-gap.
- `missing-update` — fail: customer-support-controlled-customer-update.
- `restricted-alternative` — pass: actual restricted activation.
- `bounded-interpretation` — pass: Elena interpretation pending; safe fallback.
- `failed-safe-export` — pass: failed verification reported honestly.
- `irrelevant` — skip: no review.md.
