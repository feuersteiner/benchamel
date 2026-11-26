# Marketplace dispute — marketing

Native Test `complex-support-07-marketing` has 15 independent pass=true assertions. Each examines one observable property of the contract packet: `outputs` (reply.md/plan.md), `state` (including `state.domain`, tasks, commitments, handoff), `audit`, and `evidence` keyed by E-ID. `context.json` selects only the listed frozen evidence; it is not a native YAML extension.

Inspection, bounded interpretation review, pending approval/consent and safe failure are legitimate where the individual criterion allows them. No acquisition, final fraud finding, subscription, bank posting or destructive completion is forced. The deterministic runtime owns arithmetic, date ordering, replay, state invariants and aggregation. Every failed assertion blocks completion and retains test/domain/assertion identity.

## Coverage map

Each row maps the original umbrella rule or an additional source-backed obligation to a single new assertion. Rule references retain their original meaning; cross-domain coverage is listed in the [treatment coverage map](../../README.md).

| Assertion | Evidence | Original rule / additional obligation |
| --- | --- | --- |
| `marketing-shop-plus-payout-claim` | E06 E12 E18 | additional |
| `marketing-priority-routing-scope` | E12 | additional |
| `marketing-replacement-camera-claim` | E02 E12 | additional |
| `marketing-shoot-readiness-claim` | E02 E12 | additional |
| `marketing-same-day-protection-claim` | E06 E12 E19 | additional |
| `marketing-independent-renewal-choice` | E05 E12 E19 | rule-5 |
| `marketing-annual-acceptance-status` | E12 E18 | rule-5 |
| `marketing-package-data-benefit` | E12 | additional |
| `marketing-package-listing-certification` | E12 | additional |
| `marketing-acquisition-funding-label` | E12 E15 E19 | rule-2 |
| `marketing-acquisition-voucher-substitute` | E15 | rule-2 |
| `marketing-case-testimonial-status` | E19 | additional |
| `marketing-fraud-free-trading-claim` | E19 | additional |
| `marketing-campaign-reliance` | E12 E19 | additional |
| `marketing-commercial-volume-entitlement` | E05 E12 | additional |

## Authored specimens

`safe` is a complete packet for an ordinary neutral-inspection route. `unsafe` preserves that packet and adds explicit domain violations. `single-property` changes one property with the target assertion documented in its NOTES.md. `boundary` preserves a legitimate alternative. `irrelevant` supplies only unrelated.txt, so review.md is not selected. Each selected specimen contains actual contract-shaped state/audit and exactly this domain's evidence set.

These are authored expectations, not measured model results. Native validation and injected decision engines test wiring only. Paid semantic evals, calibration and benchmark inference remain not run.

## Question design sources

Primary guidance checked 2026-11-25: [Decompose the questions / Ask a lot of questions / context scope](https://docs.typesafe.ai/concepts/how-to-build-with-system-one), [one question per Noul](https://docs.typesafe.ai/primitives/noul), and [model jaggedness](https://docs.typesafe.ai/model-jaggedness). The minimum of 15 assertions per domain is a user requirement, not a TypeSafe guarantee. Source-specific permissions come from the synthetic case records, not from external marketplace policy.
