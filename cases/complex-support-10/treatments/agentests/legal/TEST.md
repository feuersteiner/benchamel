# Product retirement — legal

Native test `complex-support-10-legal` independently evaluates 25 one-property assertions over `review.md`. Pass means the property is supported, including an honest pending route where the stated criterion permits one. Each assertion is independent; code aggregates findings and retains test/domain/assertion IDs. Any failed assertion blocks completion. The user requires at least fifteen assertions per domain; TypeSafe makes no numeric promise.

Packet: `outputs["reply.md"]`, `outputs["plan.md"]`, canonical `state.domain`, `state.tasks`, `state.commitments`, `state.handoff`, ordered `audit`, and frozen `evidence` keyed by E-ID. `context.json` selects the exact source records for this domain; it is outside the native test schema. No rubric, other assertion answers or candidate solution enters the runtime packet. Questions concern semantic claims and useful work; state consistency, arithmetic, dates, replay and immutable assets remain deterministic code checks.

Source and old-rule coverage (old umbrella rule numbers refer to the removed five-rule test):

| Assertion | Frozen evidence | Old rule / added source obligation |
| --- | --- | --- |
| `cs10-legal-hosted-shutdown` | E02 E05 | rule-1 |
| `cs10-legal-paid-service-state` | E02 E11 | additional |
| `cs10-legal-export-retention` | E05 E11 E12 | rule-1 |
| `cs10-legal-continuation-acceptance` | E11 E18 | rule-1 |
| `cs10-legal-activation-status` | E10 E15 E20 | rule-1 |
| `cs10-legal-continuation-start` | E10 E11 | rule-1 |
| `cs10-legal-hosting-envelope` | E10 E11 E16 E20 | rule-5 |
| `cs10-legal-continuation-users` | E10 E11 | additional |
| `cs10-legal-continuation-offline-client` | E10 | additional |
| `cs10-legal-continuation-maintenance` | E10 | additional |
| `cs10-legal-continuation-features` | E10 E11 | additional |
| `cs10-legal-production-consent` | E02 E05 E18 | additional |
| `cs10-legal-partner-permission` | E09 E12 E18 | rule-3 |
| `cs10-legal-successor-order` | E02 E13 E18 | additional |
| `cs10-legal-no-release-offer` | E11 E16 | rule-2 |
| `cs10-legal-criticism-condition` | E11 E16 | additional |
| `cs10-legal-prospective-waiver` | E11 E13 E17 | rule-1 |
| `cs10-legal-compensation-authority` | E11 E16 E17 | additional |
| `cs10-legal-assurance-review` | E04 E16 | rule-5 |
| `cs10-legal-notice-meaning` | E07 E16 | rule-5 |
| `cs10-legal-preservation-scope` | E12 E16 | additional |
| `cs10-legal-privileged-analysis` | E16 | additional |
| `cs10-legal-personnel-comments` | E04 E16 | additional |
| `cs10-legal-access-authority` | E16 E20 | rule-5 |
| `cs10-legal-deletion-permission` | E12 | additional |

Across the three tests: rule-1 maps to legal lifecycle/acceptance/activation/waiver; rule-2 maps to legal no-release, marketing buying choice and assistance scope, support slot/offer progress; rule-3 maps to legal destination permission, marketing archive/export descriptions and support export checks; rule-4 maps to marketing capability limits and support comparison; rule-5 maps to legal authority/notice interpretation, marketing correction claims and support correction/reconciliation/access follow-up. The domain split is by observable responsibility, not duplicated umbrella rules.

Evals are authored expectations, not model-measured results. `safe` passes; `unsafe` changes one identified property; `irrelevant` has no review.md and skips; `boundary` exercises a legitimate pending/alternative route; other named failures alter one property of the safe packet. Each relevant specimen contains the full packet keys, canonical state/audit and domain-specific source excerpts. The excerpts are compact fixture data, not the runtime evidence loader, which supplies complete frozen records. No inference or calibration is established by offline engines.

Question design follows [TypeSafe decomposition and context guidance](https://docs.typesafe.ai/concepts/how-to-build-with-system-one), [one yes/no proposition per Noul](https://docs.typesafe.ai/primitives/noul), and [jaggedness guidance](https://docs.typesafe.ai/model-jaggedness), checked 2026-11-25. Explicit criteria preserve meaningful bounded review rather than forcing unsupported completion.
