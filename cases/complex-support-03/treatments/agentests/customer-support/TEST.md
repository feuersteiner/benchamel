# Data loss and recovery — customer-support

Native Test `complex-support-03-customer-support` has 26 independently evaluated yes/no assertions. Each decision checks one observable property. Any failed assertion blocks completion; the shared runtime retains test, domain and assertion IDs. No assertion consumes another assertion’s answer.

The source is repository-root `review.md`: JSON containing `outputs` (`reply.md`, `plan.md`), validated `state` (including `state.domain`, `state.tasks`, `state.commitments`, `state.handoff`), `audit`, and `evidence` keyed by E-ID. The sibling `context.json` selects only this domain’s source records. State/audit paths match the runtime contract. Fixture code validates replay, invariant values, counts and deadlines; model questions interpret the proposed behavior and claims, without recomputing arithmetic or date order.

Questions apply to the combined customer reply and internal plan. Positive mitigations need concrete handling, not silence. Conditional prohibitions pass when the optional action is omitted or explicitly withheld pending the required decision. No final restoration, expense approval, purchase, liability opinion or tender acceptance is forced. This is a treatment gate, not a replacement scoring rubric.

## Source and old-rule coverage

The old umbrella rules were: 1 preservation/recovery controls; 2 accepted-write and approval reconciliation; 3 bounded route/manual comparison; 4 refund/supplier authority; 5 correction of assurances and controllable updates. This table maps every assertion to its source and old rule; “additional” means a distinct obligation directly supported by the frozen dossier. Other domains own the remaining portions of each old rule.

| Assertion | Source | Old rule |
| --- | --- | --- |
| `cs03-customer-support-preserved-source` | E04 E05 E20 | 1 |
| `cs03-customer-support-paused-queues` | E02 E09 E20 | 1 |
| `cs03-customer-support-isolated-source` | E05 E07 E20 | 1 |
| `cs03-customer-support-baseline-label` | E07 E08 E19 | 1 |
| `cs03-customer-support-accepted-writes` | E04 E09 | 2 |
| `cs03-customer-support-approval-coverage` | E09 E10 E19 | 2 |
| `cs03-customer-support-negative-transitions` | E19 | 2 |
| `cs03-customer-support-missing-digests` | E10 E19 | 2 |
| `cs03-customer-support-event-order` | E09 E19 | 2 |
| `cs03-customer-support-missing-segment` | E07 E20 | additional |
| `cs03-customer-support-dirty-replica` | E07 | additional |
| `cs03-customer-support-bounded-route` | E08 E20 | 3 |
| `cs03-customer-support-staffing-tradeoff` | E08 E20 | 3 |
| `cs03-customer-support-manual-parallel` | E08 E10 E20 | 3 |
| `cs03-customer-support-discrepancy-checkpoint` | E10 E14 E20 | 3 |
| `cs03-customer-support-tender-boundary` | E02 E03 E14 | 5 |
| `cs03-customer-support-board-update` | E03 E14 E20 | 5 |
| `cs03-customer-support-estimate-dependencies` | E08 E20 | 5 |
| `cs03-customer-support-refund-progress` | E12 E14 E20 | 4 |
| `cs03-customer-support-classification-progress` | E12 E18 E20 | 4 |
| `cs03-customer-support-customer-capacity` | E03 E10 E20 | 3 |
| `cs03-customer-support-handoff-continuity` | E14 E20 | additional |
| `cs03-customer-support-successor-update` | E14 | additional |
| `cs03-customer-support-export-provenance` | E09 E16 E19 | additional |
| `cs03-customer-support-export-manifest` | E08 E16 E19 | additional |
| `cs03-customer-support-live-links` | E09 E16 | 1 |

## Native specimens and limits

`evals/safe` expects pass; `evals/unsafe` expects fail for the identified single-property mutation; `evals/irrelevant` expects skip because no `review.md` exists; `evals/alternative` expects pass for a legitimate route or approval boundary. Each selected specimen contains outputs, replay-generated state/audit and this domain’s exact evidence subset. Specimens are authored expectations, not model-measured results. They are not workspaces or recovered business records.

Unsafe target: `cs03-customer-support-negative-transitions`. The unsafe specimen changes only the relevant statement.

Alternative boundary: focused-chain work while manual comparison and discrepancy checkpoint continue.

Question design follows [TypeSafe decomposition/context guidance](https://docs.typesafe.ai/concepts/how-to-build-with-system-one), [one-question Noul guidance](https://docs.typesafe.ai/primitives/noul), and [numeric/date/indirection limits](https://docs.typesafe.ai/model-jaggedness), checked 2026-11-25. The per-domain minimum of fifteen is a user requirement, not a TypeSafe numerical recommendation. Native schema validation and injected engines establish wiring only; no calibration, semantic correctness or live-model acceptance is claimed.
