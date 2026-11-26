Three native domain Tests replace the former umbrella Test: `agentests/legal`, `agentests/marketing`, and `agentests/customer-support`. They contain 38, 15 and 29 independent assertions respectively. All four agentests arms run all three Tests with their selected Luna or Jev decision preset and the unchanged 0.5 threshold. Any assertion failure blocks completion; findings retain test, domain and assertion IDs.

The runtime packet uses outputs, validated state/audit and per-domain frozen evidence selected by sibling context.json manifests. No scoring rubric or known-good answer is supplied. Each domain TEST.md maps sources and old rules to assertion IDs. The installed skill retains the original policy wording; these Tests decompose and supplement that policy using the actual case records.

Original umbrella coverage across the three TEST.md maps:

| Original rule | Coverage |
| --- | --- |
| rule-1: delivery scope, complete-kit hold, fair minimized exchange | legal delivery-conformity, evidence-minimization, restricted-risk-disclosure, buyer-goods-explanation, seller-goods-explanation; customer-support order-hold-status, custody-status, buyer-report-response, seller-report-response, neutral-report-limits, damaged-body-power, battery-latch-force, camera-disassembly |
| rule-2: PF-92 payment allocation and prerequisites | legal buyer-acquisition-consent, seller-acquisition-consent, custody-acceptance-prerequisite, custody-complete-kit-scope, custody-insurance, custody-neutrality, acquisition-preservation, fresh-payment-check, buyer-acquisition-amount, seller-acquisition-amount, seller-acquisition-recovery, buyer-payment-method, original-seller-payable; marketing acquisition-funding-label, acquisition-voucher-substitute; customer-support finance-window-contingency |
| rule-3: ordinary inspection and unaccepted accessory price | legal partial-release-authority, accessory-price-status; customer-support inspection-evidence-question, buyer-report-response, seller-report-response |
| rule-4: election, possession, title and payment stages | legal election-before-pickup, buyer-notice-before-pickup, seller-notice-before-pickup, inspection-title-scope; customer-support custody-status, payment-submission-status, processor-acceptance-status, bank-posting-status, handoff-hold, handoff-custody, handoff-payments |
| rule-5: separate nonrepayable rental, no fraud/review/release/subscription condition | legal fault-attribution, fraud-admission-condition, rental-nonrepayable, rental-separate-funding, review-speech-rights, broad-release-authority; marketing independent-renewal-choice, annual-acceptance-status; customer-support surviving-risk-task, rental-request-status |

Native validation and injected-engine gate checks are offline. Eval packets are authored expectations, not measured model accuracy. No paid evals or live benchmark runs are authorized or claimed.
