To: Leena Voss, via the verified secure channel
Subject: INC-218 — corrected account update

Leena,

The May 13 statement that Alder data had not been exposed and no further action was needed was wrong. A support attachment was retrieved without authorization, and targeted protection was necessary. We apologize for the incorrect assurance and the confusion it caused.

On May 12 at 16:03 UTC, the compromised support identity retrieved A-61, your browser archive. It contained two administrator session values, a connector secret in a header, and administrator contact metadata. The attached schedule is prepared for secure delivery and excludes secret values:

| Attachment | Upload UTC, May 12 | Retrieval | Relevant contents |
| --- | --- | --- | --- |
| A-61 | 15:38 | Confirmed at 16:03 | Session values, connector header, administrator contact metadata |
| A-62 | 15:48 | Unknown | Directory image |
| A-63 | 16:07 | Unknown | Group and contact image |

The missing attachment-log interval prevents a conclusion about A-62 and A-63. A support contact report also ran during the access period; its filter and whether Alder contacts were included remain unknown. Its shared reference is withheld while Privacy and Legal review whether correlation could associate another customer; the cleared facts need not wait for that review. Cross-customer records and raw secrets cannot be provided, but the account-specific schedule is available through the secure route.

Northline disabled the compromised support identity, revoked its sessions and blocked the observed route; requests using it were denied on verification. Monitoring through 11:00 today showed no renewed successful use of that identity. This does not establish complete containment or the full impact. The two Alder administrator sessions have been revoked and the identified connector secret rotated, with completion verified. The separate dispatch credential remains unchanged; wider rotation has not been authorized or established as necessary. Please continue to coordinate any further changes with us.

The 16:19 administrator-console attempt was denied. Your dispatch logs show normal exchanges and no unexplained outage or bulk route retrieval during 16:00–18:00; those logs do not cover every identity administration action. The searchable production audit starts at 18:00, so earlier production impact remains unresolved. We have requested the earlier archive and separate attachment and report-filter evidence. The event sequence makes a connection plausible, but does not prove use of the retrieved values or a production change. Hardware MFA alone does not rule out use of an existing session value.

We also correct the April presentation: the automatic sanitization pilot was not enabled for AF-SUPPORT on May 12 and does not universally remove secrets. A completed forensic report within 24 hours was not assured. An external forensic review is being arranged; no engagement or independent conclusion is yet in place. We cannot give a final report date today.

Dris will provide a technical checkpoint at 13:30 UTC. Noor will provide the next written update by 13:45 UTC today, including any missing dependencies even if no new evidence arrives. A secure briefing is reserved for 12:30, subject to your confirmation. You may share this account-level explanation with your board and appointed incident advisers under the existing confidentiality duties.

Your current service ends May 16 at 00:00 UTC unless an authorized change is activated. C-218 is an offer of fourteen days at existing scope and no charge, ending May 30 at 00:00, if Ben provides authenticated written acceptance by May 15 at 18:00; it is not active. The $198,000 annual quote remains unsigned; if the extension is accepted, its price can remain available through May 29 at 18:00. Neither choice resolves the investigation or waives existing rights. Incident cooperation and supported export are independent of purchase. If service ends, production authentication stops; support-console read access for supported exports remains for 30 days. Configuration can be exported, but live sessions and password factors cannot be transferred. Evidence is preserved through June 30.

Noor Vale
Support lead, INC-218
