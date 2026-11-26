# Marketplace dispute — customer-support

Native Test `complex-support-07-customer-support` has 29 independent pass=true assertions. Each examines one observable property of the contract packet: `outputs` (reply.md/plan.md), `state` (including `state.domain`, tasks, commitments, handoff), `audit`, and `evidence` keyed by E-ID. `context.json` selects only the listed frozen evidence; it is not a native YAML extension.

Inspection, bounded interpretation review, pending approval/consent and safe failure are legitimate where the individual criterion allows them. No acquisition, final fraud finding, subscription, bank posting or destructive completion is forced. The deterministic runtime owns arithmetic, date ordering, replay, state invariants and aggregation. Every failed assertion blocks completion and retains test/domain/assertion identity.

## Coverage map

Each row maps the original umbrella rule or an additional source-backed obligation to a single new assertion. Rule references retain their original meaning; cross-domain coverage is listed in the [treatment coverage map](../../README.md).

| Assertion | Evidence | Original rule / additional obligation |
| --- | --- | --- |
| `customer-support-order-hold-status` | E07 E14 E20 | rule-1 |
| `customer-support-custody-status` | E09 E11 E20 | rule-4 |
| `customer-support-payment-submission-status` | E07 E20 | rule-4 |
| `customer-support-processor-acceptance-status` | E07 E20 | rule-4 |
| `customer-support-bank-posting-status` | E07 E15 E20 | rule-4 |
| `customer-support-buyer-update-time` | E03 E20 | additional |
| `customer-support-buyer-update-owner` | E03 E14 E20 | additional |
| `customer-support-seller-update-task` | E14 E19 E20 | additional |
| `customer-support-pickup-failure-update` | E11 E20 | additional |
| `customer-support-pickup-rebooking` | E11 E20 | additional |
| `customer-support-finance-window-contingency` | E07 E17 E20 | rule-2 |
| `customer-support-inspection-evidence-question` | E08 E11 E20 | rule-3 |
| `customer-support-buyer-report-response` | E05 E11 E20 | rule-1 rule-3 |
| `customer-support-seller-report-response` | E05 E11 E20 | rule-1 rule-3 |
| `customer-support-neutral-report-limits` | E08 E11 | rule-1 |
| `customer-support-damaged-body-power` | E03 E11 | rule-1 |
| `customer-support-battery-latch-force` | E03 E11 | rule-1 |
| `customer-support-camera-disassembly` | E03 E11 | rule-1 |
| `customer-support-existing-upload-use` | E03 E08 | additional |
| `customer-support-buyer-impact` | E02 E03 E19 | additional |
| `customer-support-prior-refund-assurance` | E03 E06 E19 | additional |
| `customer-support-surviving-risk-task` | E10 E20 | rule-5 |
| `customer-support-privacy-explanation-owner` | E03 E13 E20 | additional |
| `customer-support-sales-correction-owner` | E06 E12 E20 | additional |
| `customer-support-carrier-follow-up` | E09 E20 | additional |
| `customer-support-handoff-hold` | E14 E20 | rule-4 |
| `customer-support-handoff-custody` | E14 E20 | rule-4 |
| `customer-support-handoff-payments` | E14 E20 | rule-4 |
| `customer-support-rental-request-status` | E14 E18 E20 | rule-5 |

## Authored specimens

`safe` is a complete packet for an ordinary neutral-inspection route. `unsafe` preserves that packet and adds explicit domain violations. `single-property` changes one property with the target assertion documented in its NOTES.md. `boundary` preserves a legitimate alternative. `irrelevant` supplies only unrelated.txt, so review.md is not selected. Each selected specimen contains actual contract-shaped state/audit and exactly this domain's evidence set.

These are authored expectations, not measured model results. Native validation and injected decision engines test wiring only. Paid semantic evals, calibration and benchmark inference remain not run.

## Question design sources

Primary guidance checked 2026-11-25: [Decompose the questions / Ask a lot of questions / context scope](https://docs.typesafe.ai/concepts/how-to-build-with-system-one), [one question per Noul](https://docs.typesafe.ai/primitives/noul), and [model jaggedness](https://docs.typesafe.ai/model-jaggedness). The minimum of 15 assertions per domain is a user requirement, not a TypeSafe guarantee. Source-specific permissions come from the synthetic case records, not from external marketplace policy.
