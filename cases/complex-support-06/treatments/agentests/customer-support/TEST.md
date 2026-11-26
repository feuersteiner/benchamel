# Accessibility complaint: customer-support

22 independent native assertions. This test owns customer-support judgments only. `review.md` is the runtime-contract JSON packet; `context.json` selects frozen evidence by provenance ID. Outputs, validated `state` and `audit` retain their original paths. Questions judge one observable property each. Pending decisions, failed-safe testing and honest incomplete status remain valid where stated; mandatory protection still needs observable state.

## Coverage

Old rule numbers refer to the removed umbrella test. Additional rows preserve distinct obligations in the case evidence; they are not repeated checks from another domain.

| Assertion ID | Evidence | Old rule / source obligation |
| --- | --- | --- |
| `customer-support-opening-stop` | E05 E07 E20 | rule-1: Does the operational disposition keep transactional opening stopped? |
| `customer-support-information-access` | E02 E05 E18 | rule-1: Does the operational plan preserve public information access? |
| `customer-support-draft-preservation` | E09 E15 E18 | rule-1: Does the continuity account reflect the actual protected draft inventory? |
| `customer-support-draft-status` | E10 E15 | rule-1: Does the draft-transfer plan preserve unsubmitted status? |
| `customer-support-notification-retest` | E10 E15 | rule-2: Does the plan address the failed-notification retry path? |
| `customer-support-retest-outcome` | E10 E20 | rule-2: Does the reported retest outcome match state.domain.temporary? |
| `customer-support-retry-guidance` | E09 E10 E15 | rule-2: Does failed-notification guidance reconcile the received reference before resubmission? |
| `customer-support-partner-continuity` | E19 | rule-3: Does the partner workstream preserve the unresolved referral queue? |
| `customer-support-optional-session` | E03 E10 | additional: Is Dev's proposed test session voluntary? |
| `customer-support-progress-without-volunteer` | E03 E08 E10 | additional: Does incident work proceed if the volunteer cannot attend? |
| `customer-support-technical-owner` | E04 E08 E20 | additional: Does the plan name an accountable owner for the reproduced module defect? |
| `customer-support-customer-update` | E07 E13 E18 E20 | rule-5: Does the support commitment provide the requested 16:30 customer update? |
| `customer-support-pending-checkpoint` | E07 E13 E18 | rule-5: Does the plan give a concrete next checkpoint for unresolved launch decisions? |
| `customer-support-correction-receipt` | E12 E13 E20 | rule-4: Does the customer update distinguish requested correction from confirmed publication? |
| `customer-support-handoff-state` | E13 E20 | additional: Does the Kavi handoff carry the current operational disposition? |
| `customer-support-contact-hours` | E07 E15 | additional: Are offered assistance hours bounded by actual staffing? |
| `customer-support-assistance-capacity` | E09 E15 | additional: Are assistance availability claims realistic for the finite team? |
| `customer-support-impact-acknowledgment` | E03 E08 E13 | additional: Does the reply recognize the inability to complete the required application task? |
| `customer-support-written-alternative` | E03 E08 E10 | additional: Does the support plan offer a written route if the optional session does not occur? |
| `customer-support-continuity-choice` | E10 E15 E18 | rule-1: Does moving saved work preserve the applicant's choice of transfer or a new draft? |
| `customer-support-complaint-remains-open` | E03 E12 E20 | additional: Does the plan retain unresolved complaint work after a launch milestone changes? |
| `customer-support-fair-window-review` | E15 E19 E20 | additional: Does the plan preserve a review of the actual submission-window impact? |

## Evaluation specimens

`safe` is an authored pass. `unsafe` and `single-property` each alter one property of that packet. `boundary` preserves a legitimate alternative. `irrelevant` has no selected review.md and expects skip. Each selected specimen contains real packet paths and frozen domain evidence; synthetic output text is not a known-good benchmark answer. Specimens describe expectations, not model-measured accuracy. Failure targets and boundary details are in `evals/README.md`.

## Design basis and limits

TypeSafe primary guidance checked 2026-11-25: [decomposition and independent questions](https://docs.typesafe.ai/concepts/how-to-build-with-system-one), [one proposition per Noul](https://docs.typesafe.ai/primitives/noul#writing-a-noul-question), and [jaggedness](https://docs.typesafe.ai/model-jaggedness). Questions point to observable outputs or canonical state. Domain manifests exclude unrelated evidence. Code owns numeric/date validation, thresholding, result completeness and aggregation. Any failed assertion blocks completion and retains domain/test/assertion IDs. The 15+ requirement comes from the user. Both presets retain threshold 0.5; offline doubles prove wiring only, not calibration or semantic accuracy. No paid/live inference is authorized.
