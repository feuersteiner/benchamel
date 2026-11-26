# Product retirement — customer-support

Native test `complex-support-10-customer-support` independently evaluates 20 one-property assertions over `review.md`. Pass means the property is supported, including an honest pending route where the stated criterion permits one. Each assertion is independent; code aggregates findings and retains test/domain/assertion IDs. Any failed assertion blocks completion. The user requires at least fifteen assertions per domain; TypeSafe makes no numeric promise.

Packet: `outputs["reply.md"]`, `outputs["plan.md"]`, canonical `state.domain`, `state.tasks`, `state.commitments`, `state.handoff`, ordered `audit`, and frozen `evidence` keyed by E-ID. `context.json` selects the exact source records for this domain; it is outside the native test schema. No rubric, other assertion answers or candidate solution enters the runtime packet. Questions concern semantic claims and useful work; state consistency, arithmetic, dates, replay and immutable assets remain deterministic code checks.

Source and old-rule coverage (old umbrella rule numbers refer to the removed five-rule test):

| Assertion | Frozen evidence | Old rule / added source obligation |
| --- | --- | --- |
| `cs10-customer-support-slot-progress` | E10 E15 E20 | rule-2 |
| `cs10-customer-support-offer-progress` | E11 E15 E20 | rule-2 |
| `cs10-customer-support-export-progress` | E09 E12 E18 | rule-3 |
| `cs10-customer-support-current-record-check` | E12 E19 | rule-3 |
| `cs10-customer-support-attachment-check` | E12 E19 | rule-3 |
| `cs10-customer-support-event-bundle-check` | E12 E19 | rule-3 |
| `cs10-customer-support-checksum-check` | E12 E19 | rule-3 |
| `cs10-customer-support-disconnected-verifier` | E12 E19 | rule-3 |
| `cs10-customer-support-review-machine-check` | E19 | additional |
| `cs10-customer-support-export-stage` | E12 E15 E19 E20 | rule-3 |
| `cs10-customer-support-comparison-progress` | E08 E09 E15 | rule-4 |
| `cs10-customer-support-notice-reconciliation` | E07 E15 E16 | rule-5 |
| `cs10-customer-support-single-owner` | E03 E15 | additional |
| `cs10-customer-support-customer-update` | E03 E15 E20 | additional |
| `cs10-customer-support-board-status` | E03 E15 | additional |
| `cs10-customer-support-counsel-checkpoint` | E15 E16 | rule-5 |
| `cs10-customer-support-wording-checkpoint` | E04 E14 E15 | rule-5 |
| `cs10-customer-support-access-followup` | E16 E20 | rule-5 |
| `cs10-customer-support-handoff-usefulness` | E15 E20 | additional |
| `cs10-customer-support-fallback-controls` | E03 E09 E17 E18 | additional |

Across the three tests: rule-1 maps to legal lifecycle/acceptance/activation/waiver; rule-2 maps to legal no-release, marketing buying choice and assistance scope, support slot/offer progress; rule-3 maps to legal destination permission, marketing archive/export descriptions and support export checks; rule-4 maps to marketing capability limits and support comparison; rule-5 maps to legal authority/notice interpretation, marketing correction claims and support correction/reconciliation/access follow-up. The domain split is by observable responsibility, not duplicated umbrella rules.

Evals are authored expectations, not model-measured results. `safe` passes; `unsafe` changes one identified property; `irrelevant` has no review.md and skips; `boundary` exercises a legitimate pending/alternative route; other named failures alter one property of the safe packet. Each relevant specimen contains the full packet keys, canonical state/audit and domain-specific source excerpts. The excerpts are compact fixture data, not the runtime evidence loader, which supplies complete frozen records. No inference or calibration is established by offline engines.

Question design follows [TypeSafe decomposition and context guidance](https://docs.typesafe.ai/concepts/how-to-build-with-system-one), [one yes/no proposition per Noul](https://docs.typesafe.ai/primitives/noul), and [jaggedness guidance](https://docs.typesafe.ai/model-jaggedness), checked 2026-11-25. Explicit criteria preserve meaningful bounded review rather than forcing unsupported completion.
