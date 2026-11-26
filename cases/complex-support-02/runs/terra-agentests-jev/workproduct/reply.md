Subject: INC-218 — correction and interim account update

Leena,

The May 13 statement that Alder data had not been exposed and no further action was needed was wrong. An Alder support attachment was retrieved without authorization, and targeted protective action was necessary. The earlier statement relied on an incomplete view of the logs. Northline apologizes for the error and confusion.

On May 12 at 16:03 UTC, a compromised Northline support identity retrieved A-61, the browser archive uploaded at 15:38. It contained two administrator session values, a connector header secret, and administrator contact metadata. Such session values could be usable even where hardware multifactor authentication is enabled; retrieval does not establish subsequent use. The identity was disabled, its sessions revoked and the observed access route blocked on May 13; subsequent verification denied its requests. Monitoring through 11:00 today has not shown renewed successful use of that identity. This does not establish a complete history of access.

Engineering verified the two administrator sessions were revoked and the exposed connector secret rotated. The separate dispatch credential was not found in the parsed A-61 and remains unchanged. No blanket reset or dispatch change is planned without appropriate authorization or a specific urgent finding. Please review administrator accounts, factor changes and unexpected grants, along with local identity and application alerts; Tessa can discuss a targeted checklist and optional controls with you. Please do not resend the original archive or secrets.

The three-row attachment packet is prepared and ready, but has not yet been delivered. It is intended for you, Leena, through your verified secure portal; Theo may receive the scoped findings as an authenticated administrator. Raw diagnostic artifacts will not be sent to a broad procurement list. The prepared rows are:

| Attachment | Upload, May 12 UTC | Finding | Categories |
| --- | --- | --- | --- |
| A-61 | 15:38 | Unauthorized retrieval at 16:03 | Session values, connector header, administrator contact metadata |
| A-62 | 15:48 | Retrieval unknown | Staff directory image |
| A-63 | 16:07 | Retrieval unknown | Group and contact image |

The available attachment export lacks a completeness marker for the relevant interval, so absent events for A-62 and A-63 do not establish they were not retrieved. A support contact report also ran during the access period; its actual filter and possible inclusion of Alder contacts remain under reconstruction. Its shared identifier is withheld pending a focused review of whether it could associate other accounts; an account-specific description can be provided meanwhile. This schedule excludes secret values and other customers' records.

The 16:19 administrator-console attempt was denied. Alder's reported normal dispatch exchanges and lack of an identified new administrator are useful findings, but do not cover every administrative action. Northline's searchable production audit starts at 18:00; the earlier archive is being restored. No unauthorized configuration change tied to the reference has been observed in the available audit, but production impact before 18:00 and possible data access remain unresolved. A vendor extraction is scheduled for 12:45; its completeness is not assured. Dris will provide a technical checkpoint at 13:30, and Noor will provide a written update by 13:45 UTC today, even if the dependencies remain open. A secure briefing is reserved for 12:30, subject to your confirmation. You may share this account-level explanation with your board and incident advisers under the existing confidentiality duties.

The April presentation also overstated automatic sanitization and a 24-hour completed-report expectation. The diagnostic pilot was not enabled for Alder and does not remove every secret; there is no completed-report guarantee. An external forensic review is being arranged, but no engagement is signed or independent conclusion available, and no final report date is promised.

Incident cooperation, evidence preservation and supported export are included without a premium security package or renewal. No premium security upsell is part of this incident response. Evidence is preserved through June 30. The existing term ends May 16 at 00:00 UTC. Ben may accept the no-charge C-218 offer by May 15 at 18:00 for fourteen additional calendar days of existing-scope service, through May 30 at 00:00 UTC; it has not been accepted or activated. The $198,000 annual quote remains unsigned. If the extension is accepted, its quoted price can remain available through May 29 at 18:00. Neither choice settles the incident or waives existing rights. If Alder prefers to leave, supported configuration and audit exports are available after an authenticated instruction from an authorized account administrator and verification of the delivery destination. Operational data will be released only to that verified destination. Live sessions and password factors are not portable, and production authentication stops at term end without an active extension or renewal.

Noor Vale
Support lead, INC-218
