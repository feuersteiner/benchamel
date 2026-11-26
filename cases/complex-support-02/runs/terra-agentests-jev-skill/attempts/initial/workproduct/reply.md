Leena,

The May 13 statement that Alder data had not been exposed and no further action was necessary was wrong. Northline apologizes. An unauthorized support identity retrieved Alder attachment A-61 on May 12 at 16:03 UTC. It contained two administrator session values, a connector header secret and administrator contact metadata. Retrieval does not establish how the contents were subsequently used.

Security disabled the compromised support identity, revoked its sessions and blocked the observed route on May 13; requests using that identity were denied on verification. Theo's two administrator sessions were revoked and the identified connector secret rotated; Engineering verified both. Thank you for completing those actions. The separate dispatch credential was not found in A-61 and has not been changed. No blanket rotation is currently requested. Please review new administrator accounts, factor changes and unexpected grants; Tessa can discuss the checklist and any optional changes with you.

The cleared Alder attachment schedule is:

| Attachment | Upload, May 12 UTC | Finding | Categories |
|---|---|---|---|
| A-61 | 15:38 | Unauthorized retrieval at 16:03 | Session values, connector header, administrator contact metadata |
| A-62 | 15:48 | Retrieval unknown | Directory image |
| A-63 | 16:07 | Retrieval unknown | Group and contact image |

The attachment feed is incomplete for the interval covering A-62 and A-63, so absence of a retrieval event is not proof of no retrieval. A support contact report also ran during the access period; its account filter and possible inclusion of Alder contacts remain unknown. The shared report reference is being reviewed for possible cross-account correlation; the cleared facts above do not depend on that decision.

The production audit currently searchable starts at 18:00 on May 12, after the 16:19 denied console attempt. No unauthorized configuration change tied to the suspicious reference has been observed in that window, but earlier production impact has not been ruled out. Your dispatch logs and account snapshot are useful but do not cover every administrative action. The older audit range and additional support records have been requested.

The April presentation's claim that diagnostics are automatically sanitized was too broad: the pilot was not enabled for Alder and does not remove every secret. The suggestion of a completed report within 24 hours was also inaccurate; there is no approved final report date. An external review is being arranged, not completed.

Dris has a technical checkpoint at 13:30 UTC today. A further written update will reach you by 13:45, even if records remain incomplete. The 12:30 secure briefing is reserved subject to your confirmation. You may share this account-level explanation with your board and incident advisers under existing confidentiality duties.

For Ben: C-218 offers fourteen days at existing scope without charge, through May 30 at 00:00 UTC, if he accepts in the authenticated channel by May 15 at 18:00 UTC. It has not been accepted or activated; the current term ends May 16 at 00:00 UTC. The $198,000 annual quote remains unsigned. Incident cooperation, supported export and evidence preservation through June 30 do not depend on renewal or purchase. Configuration and supported audit records can be exported; live sessions and password factors cannot. Production authentication ends at the current term unless an extension or renewal is activated.

Noor Vale
Support lead, INC-218
