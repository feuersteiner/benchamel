Leena,

The May 13 statement that Alder data had not been exposed and no further action was needed was wrong. A support attachment was retrieved without authorization, and targeted protective action was necessary. Northline apologizes for that error and the confusion it caused.

The compromised support identity retrieved A-61 on May 12 at 16:03 UTC. The archive contained administrator session values, a connector header secret and administrator contact information. Those values could have been used; retrieval alone does not establish subsequent use. Northline disabled the support identity, revoked its sessions and blocked the known route on May 13; requests using that identity were subsequently denied. These steps do not establish the full impact of the incident.

Engineering verified that Theo revoked the two identified browser sessions and rotated the connector secret. Thank you for completing those actions. The separate dispatch credential is not in the parsed A-61 archive and remains unchanged. No blanket rotation is being requested. Tessa can discuss a scoped review of administrator accounts, factor changes and grants, and test any optional network restrictions with a fallback before changes.

The cleared attachment schedule for secure delivery is:

| Attachment | Uploaded May 12 UTC | Finding | Category |
| --- | --- | --- | --- |
| A-61 | 15:38 | Unauthorized retrieval at 16:03 confirmed | Session values, connector header, administrator contact metadata |
| A-62 | 15:48 | Retrieval unknown | Directory image |
| A-63 | 16:07 | Retrieval unknown | Group and contact image |

The attachment feed has a gap from 15:45 to 16:15, so missing events do not prove A-62 or A-63 were not retrieved. A contact report also ran during the unauthorized access period; its account filter and whether it included Alder contacts remain unknown. The shared report reference is withheld because it may allow association with other accounts; the account-specific facts above are cleared. Raw credentials and other customers' records are excluded.

The 16:19 administrator-console attempt was denied. Alder's dispatch logs show normal token exchanges and no unexplained outage or bulk route retrieval in the range reviewed, but those logs do not cover every identity administration action. Northline's searchable production audit begins at 18:00, after the alert; the earlier archive is being restored. Actual earlier production impact remains unresolved. Hardware authentication alone does not rule out use of an existing session value.

The April presentation also overstated automatic sanitization and disclosure within 24 hours. The limited pilot did not protect Alder's upload and does not catch every secret. A completed forensic report within 24 hours cannot be promised. An external review is being arranged; no engagement is signed and no independent conclusion or final report date is available.

Dris will provide a technical checkpoint at 13:30 UTC today, and Noor will send an update by 13:45 even if the outstanding feeds have not arrived. The 12:30 secure briefing is reserved, subject to your confirmation. The board and appointed incident advisers may receive this account-level explanation under the existing confidentiality arrangements.

Ben may consider C-218: fourteen days at existing scope at no charge, ending May 30 at 00:00 UTC, if he provides authenticated written acceptance by May 15 at 18:00. It is an offer, not an active extension; Celia must activate and verify it. The existing term ends May 16 at 00:00 unless an extension or renewal is activated. The $198,000 annual quote remains unsigned. Neither option settles the incident or changes existing rights. Incident cooperation, supported export and evidence preservation do not depend on a purchase. If service ends, production authentication stops; support-console read access for supported exports continues for 30 days. Original incident evidence is held through June 30.

Noor Vale
Incident support lead
