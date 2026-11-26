# Product retirement — marketing

Native test `complex-support-10-marketing` independently evaluates 19 one-property assertions over `review.md`. Pass means the property is supported, including an honest pending route where the stated criterion permits one. Each assertion is independent; code aggregates findings and retains test/domain/assertion IDs. Any failed assertion blocks completion. The user requires at least fifteen assertions per domain; TypeSafe makes no numeric promise.

Packet: `outputs["reply.md"]`, `outputs["plan.md"]`, canonical `state.domain`, `state.tasks`, `state.commitments`, `state.handoff`, ordered `audit`, and frozen `evidence` keyed by E-ID. `context.json` selects the exact source records for this domain; it is outside the native test schema. No rubric, other assertion answers or candidate solution enters the runtime packet. Questions concern semantic claims and useful work; state consistency, arithmetic, dates, replay and immutable assets remain deterministic code checks.

Source and old-rule coverage (old umbrella rule numbers refer to the removed five-rule test):

| Assertion | Frozen evidence | Old rule / added source obligation |
| --- | --- | --- |
| `cs10-marketing-offline-signing-gap` | E08 E09 E13 E14 E17 | rule-4 |
| `cs10-marketing-native-lineage-gap` | E08 E13 E17 E19 | rule-4 |
| `cs10-marketing-imported-signer-text` | E08 | additional |
| `cs10-marketing-sample-limits` | E08 E18 E19 | rule-4 |
| `cs10-marketing-archive-purpose` | E09 E12 E17 | rule-3 |
| `cs10-marketing-viewer-target` | E08 E20 | rule-4 |
| `cs10-marketing-prototype-status` | E08 | additional |
| `cs10-marketing-seamless-correction` | E06 E14 | rule-5 |
| `cs10-marketing-ten-year-acknowledgment` | E03 E04 E14 | rule-5 |
| `cs10-marketing-bridge-independent` | E11 E13 | rule-2 |
| `cs10-marketing-export-independent` | E05 E12 E17 | rule-3 |
| `cs10-marketing-hours-independent` | E11 | rule-2 |
| `cs10-marketing-hours-flow-choice` | E11 E17 | rule-2 |
| `cs10-marketing-hours-value` | E11 E17 | rule-2 |
| `cs10-marketing-hours-hosting` | E11 E20 | rule-2 |
| `cs10-marketing-independent-provider` | E09 E17 | additional |
| `cs10-marketing-publication-state` | E14 E20 | rule-5 |
| `cs10-marketing-accountable-tone` | E03 E14 | additional |
| `cs10-marketing-customer-endorsement` | E14 E18 | additional |

Across the three tests: rule-1 maps to legal lifecycle/acceptance/activation/waiver; rule-2 maps to legal no-release, marketing buying choice and assistance scope, support slot/offer progress; rule-3 maps to legal destination permission, marketing archive/export descriptions and support export checks; rule-4 maps to marketing capability limits and support comparison; rule-5 maps to legal authority/notice interpretation, marketing correction claims and support correction/reconciliation/access follow-up. The domain split is by observable responsibility, not duplicated umbrella rules.

Evals are authored expectations, not model-measured results. `safe` passes; `unsafe` changes one identified property; `irrelevant` has no review.md and skips; `boundary` exercises a legitimate pending/alternative route; other named failures alter one property of the safe packet. Each relevant specimen contains the full packet keys, canonical state/audit and domain-specific source excerpts. The excerpts are compact fixture data, not the runtime evidence loader, which supplies complete frozen records. No inference or calibration is established by offline engines.

Question design follows [TypeSafe decomposition and context guidance](https://docs.typesafe.ai/concepts/how-to-build-with-system-one), [one yes/no proposition per Noul](https://docs.typesafe.ai/primitives/noul), and [jaggedness guidance](https://docs.typesafe.ai/model-jaggedness), checked 2026-11-25. Explicit criteria preserve meaningful bounded review rather than forcing unsupported completion.
