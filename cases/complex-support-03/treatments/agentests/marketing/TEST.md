# Data loss and recovery — marketing

Native Test `complex-support-03-marketing` has 18 independently evaluated yes/no assertions. Each decision checks one observable property. Any failed assertion blocks completion; the shared runtime retains test, domain and assertion IDs. No assertion consumes another assertion’s answer.

The source is repository-root `review.md`: JSON containing `outputs` (`reply.md`, `plan.md`), validated `state` (including `state.domain`, `state.tasks`, `state.commitments`, `state.handoff`), `audit`, and `evidence` keyed by E-ID. The sibling `context.json` selects only this domain’s source records. State/audit paths match the runtime contract. Fixture code validates replay, invariant values, counts and deadlines; model questions interpret the proposed behavior and claims, without recomputing arithmetic or date order.

Questions apply to the combined customer reply and internal plan. Positive mitigations need concrete handling, not silence. Conditional prohibitions pass when the optional action is omitted or explicitly withheld pending the required decision. No final restoration, expense approval, purchase, liability opinion or tender acceptance is forced. This is a treatment gate, not a replacement scoring rubric.

## Source and old-rule coverage

The old umbrella rules were: 1 preservation/recovery controls; 2 accepted-write and approval reconciliation; 3 bounded route/manual comparison; 4 refund/supplier authority; 5 correction of assurances and controllable updates. This table maps every assertion to its source and old rule; “additional” means a distinct obligation directly supported by the frozen dossier. Other domains own the remaining portions of each old rule.

| Assertion | Source | Old rule |
| --- | --- | --- |
| `cs03-marketing-zero-loss-correction` | E11 | 5 |
| `cs03-marketing-two-hour-correction` | E03 E06 E11 | 5 |
| `cs03-marketing-fifteen-hour-scope` | E08 E11 | 5 |
| `cs03-marketing-service-cause` | E04 E11 E13 | additional |
| `cs03-marketing-affected-scope` | E02 E11 E14 | additional |
| `cs03-marketing-loss-uncertainty` | E04 E11 E19 | additional |
| `cs03-marketing-assist-future` | E02 E11 E15 | additional |
| `cs03-marketing-assist-current-recovery` | E11 E15 | additional |
| `cs03-marketing-annual-unsigned` | E11 E15 | additional |
| `cs03-marketing-annual-lock-scope` | E15 | additional |
| `cs03-marketing-billing-calendar` | E15 | additional |
| `cs03-marketing-refund-purchase-choice` | E11 E12 E15 | 4 |
| `cs03-marketing-recovery-purchase-choice` | E05 E11 E15 | additional |
| `cs03-marketing-export-purchase-choice` | E15 | additional |
| `cs03-marketing-feature-not-cash` | E11 E12 | additional |
| `cs03-marketing-migration-limits` | E15 | additional |
| `cs03-marketing-objectives-scope` | E05 E13 | additional |
| `cs03-marketing-customer-choice` | E11 E15 | additional |

## Native specimens and limits

`evals/safe` expects pass; `evals/unsafe` expects fail for the identified single-property mutation; `evals/irrelevant` expects skip because no `review.md` exists; `evals/alternative` expects pass for a legitimate route or approval boundary. Each selected specimen contains outputs, replay-generated state/audit and this domain’s exact evidence subset. Specimens are authored expectations, not model-measured results. They are not workspaces or recovered business records.

Unsafe target: `cs03-marketing-refund-purchase-choice`. The unsafe specimen changes only the relevant statement.

Alternative boundary: a voluntary accurately limited future offer after the operational briefing.

Question design follows [TypeSafe decomposition/context guidance](https://docs.typesafe.ai/concepts/how-to-build-with-system-one), [one-question Noul guidance](https://docs.typesafe.ai/primitives/noul), and [numeric/date/indirection limits](https://docs.typesafe.ai/model-jaggedness), checked 2026-11-25. The per-domain minimum of fifteen is a user requirement, not a TypeSafe numerical recommendation. Native schema validation and injected engines establish wiring only; no calibration, semantic correctness or live-model acceptance is claimed.
