Leena,

The May 13 statement that Alder data had not been exposed and no further action was necessary was wrong. We are sorry. An unauthorized user of a Northline support integration identity retrieved Alder’s browser archive A-61 on May 12 at 16:03 UTC. It contained two administrator session values, a connector header secret and administrator contact metadata. Retrieval is confirmed; what the actor did with the contents is not established.

The compromised support identity was disabled, its sessions revoked and the observed route blocked on May 13; subsequent checks denied its use. Theo’s two sessions were revoked and the identified connector secret rotated, and Engineering verified those actions. The separate dispatch credential has not been changed: it was not present in the parsed archive, and a broad change could interrupt dispatch. Please review administrator accounts, factor changes and unexpected grants with Tessa; optional shorter sessions or network restrictions can be assessed with a tested fallback at the existing tier.

The account schedule prepared for secure delivery contains these rows without secret values:

| Attachment | Uploaded May 12 UTC | Finding | Category |
|---|---|---|---|
| A-61 | 15:38 | Unauthorized retrieval at 16:03 | Session values, connector header, administrator contact |
| A-62 | 15:48 | Retrieval unknown | Staff directory image |
| A-63 | 16:07 | Retrieval unknown | Group and contact image |

The relevant attachment log interval is incomplete, so missing events do not establish that A-62 or A-63 were not retrieved. A support contact report ran during the access period; its filter and possible inclusion of Alder contacts remain unknown. The shared report reference is under focused Privacy and Legal review because correlation could associate other accounts; the cleared rows need not wait. Raw cross-account records and credentials cannot be supplied, but account-specific facts can be shared securely.

A denied console attempt at 16:19 is recorded. No unauthorized configuration change tied to the suspicious session has been observed in the available production audit, which starts at 18:00; the earlier archive is being restored. Alder’s dispatch logs and account snapshot are useful but do not cover every administrative action. Production impact and possible earlier exfiltration remain unresolved; hardware authentication alone does not rule out session-token use. Separate attachment, report-filter and production archive feeds have been requested.

The April presentation also overstated automatic sanitization and a completed report within 24 hours. The pilot was not enabled for Alder and does not catch every secret; there is no approved final report date. An external review is being arranged, with no signed engagement or conclusions yet.

A secure technical call is reserved for 12:30 UTC, subject to your confirmation. Noor Vale will provide the next written update by 13:45 UTC today, even if the requested logs are incomplete, with the dependency and next checkpoint. The account explanation may be shared with your board and appointed incident advisers under existing confidentiality duties. Incident cooperation does not depend on renewal or a premium purchase.

For Ben: the existing term ends May 16 at 00:00 UTC. C-218 offers fourteen days at existing scope and no charge, through May 30 at 00:00, if Ben provides authenticated written acceptance by May 15 at 18:00. It is not active yet and carries no automatic renewal or release of rights. The unsigned annual quote is $198,000; if the extension is accepted, its price can remain available until May 29 at 18:00. Supported configuration and audit exports are also available; live sessions and password factors are not portable. Evidence is preserved through June 30 regardless of the commercial choice.

Noor Vale
Support lead, INC-218
