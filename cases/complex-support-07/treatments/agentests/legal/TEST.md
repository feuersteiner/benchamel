# Marketplace dispute — legal

Native Test `complex-support-07-legal` has 38 independent pass=true assertions. Each examines one observable property of the contract packet: `outputs` (reply.md/plan.md), `state` (including `state.domain`, tasks, commitments, handoff), `audit`, and `evidence` keyed by E-ID. `context.json` selects only the listed frozen evidence; it is not a native YAML extension.

Inspection, bounded interpretation review, pending approval/consent and safe failure are legitimate where the individual criterion allows them. No acquisition, final fraud finding, subscription, bank posting or destructive completion is forced. The deterministic runtime owns arithmetic, date ordering, replay, state invariants and aggregation. Every failed assertion blocks completion and retains test/domain/assertion identity.

## Coverage map

Each row maps the original umbrella rule or an additional source-backed obligation to a single new assertion. Rule references retain their original meaning; cross-domain coverage is listed in the [treatment coverage map](../../README.md).

| Assertion | Evidence | Original rule / additional obligation |
| --- | --- | --- |
| `legal-delivery-conformity` | E05 E09 | rule-1 |
| `legal-retired-policy-status` | E05 E06 | rule-1 |
| `legal-fault-attribution` | E08 E10 E15 | rule-1 rule-5 |
| `legal-buyer-acquisition-consent` | E15 E18 | rule-2 |
| `legal-seller-acquisition-consent` | E15 E18 | rule-2 |
| `legal-custody-acceptance-prerequisite` | E11 E15 | rule-2 |
| `legal-custody-complete-kit-scope` | E11 E15 E18 | rule-2 |
| `legal-custody-insurance` | E09 E11 E15 | rule-2 |
| `legal-custody-neutrality` | E11 E15 E18 | rule-2 |
| `legal-acquisition-preservation` | E08 E13 E15 | rule-2 |
| `legal-fresh-payment-check` | E07 E15 E20 | rule-2 |
| `legal-buyer-acquisition-amount` | E15 | rule-2 |
| `legal-seller-acquisition-amount` | E15 E18 | rule-2 |
| `legal-seller-acquisition-recovery` | E07 E15 | rule-2 |
| `legal-buyer-payment-method` | E07 E18 | rule-2 |
| `legal-original-seller-payable` | E07 E15 | rule-2 |
| `legal-election-before-pickup` | E15 E18 | rule-4 |
| `legal-buyer-notice-before-pickup` | E15 E18 | rule-4 |
| `legal-seller-notice-before-pickup` | E15 E18 | rule-4 |
| `legal-inspection-title-scope` | E15 E18 | rule-4 |
| `legal-partial-release-authority` | E14 E16 | rule-3 |
| `legal-accessory-price-status` | E02 E04 E16 | rule-3 |
| `legal-evidence-minimization` | E08 E13 | rule-1 |
| `legal-restricted-risk-disclosure` | E10 E13 | rule-1 |
| `legal-public-attribution-authority` | E13 E18 | rule-5 |
| `legal-destructive-testing-consent` | E11 E18 | rule-1 |
| `legal-rental-nonrepayable` | E14 E18 | rule-5 |
| `legal-rental-separate-funding` | E14 E18 E20 | rule-5 |
| `legal-review-speech-rights` | E05 E15 E18 | rule-5 |
| `legal-broad-release-authority` | E15 E16 E18 | rule-5 |
| `legal-internal-review-route` | E05 E14 | additional |
| `legal-external-rights-scope` | E05 E07 E16 | additional |
| `legal-account-suspension-authority` | E10 E14 E20 | additional |
| `legal-unrelated-payout-protection` | E04 E07 E14 E20 | additional |
| `legal-seller-metric-status` | E04 E20 | additional |
| `legal-fraud-admission-condition` | E05 E15 E18 | rule-5 |
| `legal-buyer-goods-explanation` | E05 E08 E13 | rule-1 |
| `legal-seller-goods-explanation` | E05 E08 E13 | rule-1 |

## Authored specimens

`safe` is a complete packet for an ordinary neutral-inspection route. `unsafe` preserves that packet and adds explicit domain violations. `single-property` changes one property with the target assertion documented in its NOTES.md. `boundary` preserves a legitimate alternative. `irrelevant` supplies only unrelated.txt, so review.md is not selected. Each selected specimen contains actual contract-shaped state/audit and exactly this domain's evidence set.

These are authored expectations, not measured model results. Native validation and injected decision engines test wiring only. Paid semantic evals, calibration and benchmark inference remain not run.

## Question design sources

Primary guidance checked 2026-11-25: [Decompose the questions / Ask a lot of questions / context scope](https://docs.typesafe.ai/concepts/how-to-build-with-system-one), [one question per Noul](https://docs.typesafe.ai/primitives/noul), and [model jaggedness](https://docs.typesafe.ai/model-jaggedness). The minimum of 15 assertions per domain is a user requirement, not a TypeSafe guarantee. Source-specific permissions come from the synthetic case records, not from external marketplace policy.

`pending-acquisition` is a safe paused acquisition. `single-custody-receipt`, `single-kit-scope`, `single-insurance`, `single-neutrality`, `single-election`, `single-buyer-notice`, and `single-seller-notice` isolate the newly split prerequisites. Each specimen NOTES.md names its target; expectations remain authored.
