Leena,

The May 13 statement that Alder data had not been exposed and no further action was needed was wrong. An unauthorized party retrieved an Alder support attachment, and we subsequently asked Theo to revoke sessions and rotate a connector secret. We apologize for the incorrect assurance and the confusion it caused.

The retrieved attachment, A-61, was uploaded May 12 at 15:38 UTC and read at 16:03 by the compromised support identity. It contained administrator session values, a connector header secret and administrator contact metadata. The values could present a risk even with hardware authentication; retrieval does not establish how they were used. Theo's two browser sessions were revoked and the identified connector secret rotated; Engineering verified the old connector version failed. The separate dispatch credential was not found in the parsed archive and has not been changed. No blanket reset is currently requested.

Northline disabled the compromised support identity, revoked its sessions and blocked the observed route on May 13; verification showed that identity's requests were denied. Monitoring through 11:00 UTC today showed no renewed successful use of that identity. These actions do not establish that all access paths or downstream effects are understood.

The account-specific schedule prepared for the secure portal contains these rows, without secret values:

| Attachment | Uploaded May 12 UTC | Retrieval | Relevant contents |
| --- | --- | --- | --- |
| A-61 | 15:38 | Confirmed at 16:03 | Session values, connector header, administrator contact metadata |
| A-62 | 15:48 | Unknown | Staff directory fragment in an image |
| A-63 | 16:07 | Unknown | Group label and work email in an image |

The attachment feed is incomplete for the relevant interval, so missing events do not establish that A-62 or A-63 were not retrieved. A support contact report also ran during the access period; its filter and possible inclusion of Alder contacts remain under investigation. The exact shared report reference is withheld while Privacy and Legal assess whether it could reveal associations with other accounts. The cleared rows and account facts need not wait for that review. Raw credentials, cross-customer records and privileged material cannot be included; the account-level explanation may be shared with your board and appointed incident advisers under existing confidentiality duties.

A denied administrator-console attempt at 16:19 is recorded, but the searchable production audit begins at 18:00. Alder's application logs show normal token exchanges and no unexplained outage or bulk route retrieval in their covered range; they do not cover every administrative function. No unauthorized production configuration change has been tied to the suspicious session in available records, but earlier production impact and possible data access remain unresolved. Separate attachment, report-filter and earlier production audit feeds have been requested. The vendor extraction attempt is scheduled for 12:45, not guaranteed to complete. Dris will provide a technical checkpoint at 13:30; a written update will reach you by 13:45 UTC even if the gaps remain. This is an update time, not a final-report deadline.

Please review administrator accounts, factor changes and unexpected grants for the period, alongside local identity notifications and application logs. Tessa can discuss the targeted checklist and optional shorter sessions or network restrictions, including testing and fallback, at the reserved 12:30 secure briefing if that time works. Please do not resend the original unredacted archive; it is preserved. New secret-bearing uploads are paused pending a cleared route.

The April presentation's claim that all diagnostics are automatically sanitized was incorrect: the pilot handles only some patterns and was not enabled for AF-SUPPORT on May 12. The suggestion of a completed security report within 24 hours was also incorrect; no final report date is approved. An external review is being arranged, but no engagement is signed and no independent conclusion exists.

Incident cooperation, evidence, protection guidance and supported exports do not depend on a purchase. The current service ends May 16 at 00:00 UTC unless a renewal or extension is activated. Ben may accept the no-charge C-218 offer in authenticated writing by May 15 at 18:00 for existing-scope service through May 30 at 00:00; it is not active yet and does not automatically renew or settle any claim. The unsigned $198,000 annual quote remains an alternative; if the extension is accepted, its price is available through May 29 at 18:00. Ben controls the commercial choice. If Alder leaves, supported configuration exports remain available after an authenticated instruction from an authorized account administrator and verification of the delivery destination; live sessions and password factors are not portable. Support-console read access continues for 30 days after service end, but production authentication stops at service end absent an active extension or renewal. Evidence remains preserved through June 30 and incident cooperation continues regardless of the choice.

Noor Vale
Support lead, INC-218
