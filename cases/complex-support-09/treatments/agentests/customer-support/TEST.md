# Data residency commitment: customer-support

20 independent native assertions. The JSON review.md packet contains outputs, validated state, audit and the evidence IDs in context.json. Each assertion owns one observable property; all must pass. Runtime aggregation preserves domain, test and assertion IDs. No assertion depends on another answer.

Dates, owner membership, state replay and arithmetic remain trusted code checks. Questions assess the meaning of outputs against the named state/source. Pending consent, bounded review and honest incomplete status are valid where described. The original five compound rules are decomposed below; source additions are case-specific obligations, not filler.

| Assertion ID | Source evidence | Original coverage |
| --- | --- | --- |
| customer-support-category-matrix | E06 E07 E15 E20 | rule-1 |
| customer-support-preview-progress | E03 E18 E20 | rule-2 |
| customer-support-processor-followup | E07 E20 | rule-2 |
| customer-support-export-start-progress | E03 E16 E20 | rule-4 |
| customer-support-export-checkpoint | E16 E18 E20 | rule-4 |
| customer-support-renewal-confirmation | E17 E20 | rule-4 |
| customer-support-rehearsal-progress | E11 E18 E20 | rule-3 |
| customer-support-letter-progress | E13 E14 E20 | rule-5 |
| customer-support-telemetry-staging-progress | E11 E18 E19 | rule-3 |
| customer-support-useful-interim-update | E03 E08 E18 | source addition |
| customer-support-decision-call-preparation | E03 E20 | source addition |
| customer-support-task-usefulness | E18 E20 | source addition |
| customer-support-handoff-evidence-gaps | E18 E19 | source addition |
| customer-support-trial-index-gap | E06 E19 | source addition |
| customer-support-backup-scope | E12 E16 | source addition |
| customer-support-export-failure-fallback | E16 E20 | rule-4 |
| customer-support-existing-documents-use | E03 E15 E20 | source addition |
| customer-support-routing-lifecycle | E07 E09 E20 | rule-3 |
| customer-support-case-open | E18 E19 | source addition |
| customer-support-customer-checkpoint-ownership | E03 E18 E20 | source addition |

Authored eval expectations: safe/pass, unsafe/fail, irrelevant/skip, single-property/fail, boundary/pass. All review specimens use the runtime packet shape; irrelevant contains no review.md. Specimen state/audit are synthetic schema-shaped examples, not signed receipts or submitted judge workspaces. Their semantics have not been model-measured. single-property changes only the identified property from safe; boundary preserves the legitimate alternative documented in evals/README.md.

Design references checked 2026-11-25: [Decompose questions / ask many / filter context](https://docs.typesafe.ai/concepts/how-to-build-with-system-one), [one question per Noul](https://docs.typesafe.ai/primitives/noul#writing-a-noul-question), [numeric/date/indirection limits](https://docs.typesafe.ai/model-jaggedness). The 15+ minimum is a user requirement. Offline injected engines prove wiring and failure propagation, not model accuracy, calibration or policy correctness.
