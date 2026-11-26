Dear Leena,

The May 13 statement that Alder data had not been exposed and no further action was needed was wrong. Northline is sorry for that error and the confusion it caused. A support attachment, A-61, was retrieved without authorization on May 12. It contained administrator session values, a connector secret and administrator contact information. Retrieval does not establish how those contents were subsequently used. The two identified sessions have been revoked and the connector secret rotated; Engineering verified both. The separate dispatch credential was not in the parsed archive and has not been changed.

Security disabled the compromised support identity, revoked its sessions and blocked the observed route; subsequent requests using that identity were denied. These steps do not establish the complete impact. The denied administrator-console attempt at 16:19 is known, but its relationship to the retrieval and any earlier production impact remain unresolved. Searchable production audit coverage begins at 18:00; an earlier archive is being restored. Your dispatch logs show no unexplained outage or bulk route retrieval in their covered period, but do not cover every administrative function.

The following account-specific schedule is cleared for the secure channel; it contains no secret values:

| Attachment | Uploaded May 12 UTC | Finding | Category |
| --- | --- | --- | --- |
| A-61 | 15:38 | Unauthorized retrieval at 16:03 | Session values, connector header, administrator contact metadata |
| A-62 | 15:48 | Retrieval unknown | Directory image |
| A-63 | 16:07 | Retrieval unknown | Group and contact image |

The attachment log has an incomplete interval, so missing events for A-62 and A-63 do not prove they were not retrieved. A support contact report also ran during the access period; its filter and possible inclusion of Alder contacts are still being reconstructed. Its shared reference is withheld while Privacy and Legal assess correlation risk; the cleared facts need not wait. Other customers' records, raw credentials and privileged material cannot be included in an export.

The April presentation incorrectly said diagnostic uploads were automatically sanitized and implied a completed security report within 24 hours. The pilot does not cover every secret and was not enabled for your support workspace. There is no completed forensic report or approved final-report date. An external review is being arranged but is not yet engaged or complete.

Please continue reviewing administrator accounts, factor changes and unexpected grants with your team. Tessa can discuss a checklist and optional controls with a test and fallback; no blanket rotation is requested. The 12:30 UTC secure briefing is reserved, subject to your confirmation. Dris has a technical checkpoint at 13:30, and Noor will provide a written update by 13:45 UTC today even if the outstanding logs have not arrived. You may share this account-level explanation with your board and appointed incident advisers under the existing agreement.

For Ben: C-218 offers fourteen days at existing scope at no charge, provided he sends authenticated written acceptance by May 15 at 18:00 UTC. If accepted and activated, service ends May 30 at 00:00 UTC; it is not active now. The existing term ends May 16 at 00:00 UTC. The $198,000 annual quote remains unsigned; if the extension is accepted, its price may remain available through May 29 at 18:00 UTC. Neither option settles the incident or waives existing rights. Incident cooperation and supported exports do not depend on a purchase. Supported configuration and audit exports require an authenticated request; live sessions and password factors cannot be exported. Production authentication ends at the current entitlement end unless extended or renewed, although support-console read access remains for 30 days for supported export requests. Evidence is preserved through June 30.

Noor Vale
Support lead, INC-218
