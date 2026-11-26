Subject: INC-218 — correction and interim account update

Leena,

Northline's May 13 statement that the incident was contained, Alder data had not been exposed and no further action was necessary was wrong. An Alder support attachment was retrieved without authorization, and we subsequently asked Theo to revoke sessions and rotate a connector secret. We are sorry for the inaccurate assurance and the confusion it caused.

On May 12 at 16:03 UTC, the compromised support identity retrieved A-61, the browser archive uploaded at 15:38. It contained two administrator session values, a connector header secret and administrator contact metadata. Those values could be used against Alder; retrieval does not establish what the actor did with them. On May 13 Northline disabled the support identity, revoked its sessions and blocked the known route; requests using that identity were denied in verification, with no renewed successful use observed through 11:00 UTC today. This does not establish that all access paths or impact have been found.

The account-specific schedule, cleared for the secure route, contains no secret values:

| Attachment | Uploaded May 12 UTC | Finding | Category |
| --- | --- | --- | --- |
| A-61 | 15:38 | Unauthorized retrieval at 16:03 | Browser archive, session values, connector header, administrator contact metadata |
| A-62 | 15:48 | Retrieval unknown | Directory image |
| A-63 | 16:07 | Retrieval unknown | Group and contact image |

The attachment export lacks a completeness marker for the relevant interval, so missing events do not prove A-62 or A-63 were not retrieved. A support contact report also ran during the access period; its filter and possible inclusion of Alder contacts remain unknown. Its shared reference is being reviewed for potential association with other accounts; that review does not delay these cleared facts. Raw cross-customer records and credentials cannot be included, but an account-specific alternative will be provided where possible.

Engineering verified that Theo's two sessions were revoked and the identified connector secret rotated; the old secret failed validation. The separate dispatch credential is not present in the parsed archive and remains unchanged. No blanket rotation is presently requested. Please review administrator accounts, factor changes and unexpected grants, and retain relevant local references. Shorter sessions and network restrictions are available at the existing tier; Tessa can discuss testing and fallback before any change. Please do not resend the unredacted archive. The reserved secure briefing at 12:30 UTC is available for confirmation.

The searchable production audit starts at 18:00 on May 12, after the 16:19 alert. A separately retained gateway event shows a denied console attempt; it cannot rule out earlier activity. No unauthorized configuration change tied to the reference has been observed in the available audit, but production impact and possible data access in the missing period remain unresolved. Alder's dispatch logs show normal token exchanges and no unexplained outage or bulk route retrieval in their scope; they do not cover every administrative function. The earlier archive and separate attachment and report-filter feeds have been requested.

The April presentation's claim that all support diagnostics are automatically sanitized was incorrect: the pilot was not enabled for Alder and does not catch every secret. Its suggestion of a universal completed report within 24 hours was also incorrect. An external review is being arranged; no engagement has been signed, independent conclusion reached or final report date approved.

Dris will provide a technical checkpoint at 13:30 UTC. Noor will provide the next written account update by 13:45 UTC today, including any gaps and revised timing if the vendor extraction or archive is delayed. This interim statement may be shared with Alder's board and appointed incident advisers under existing confidentiality duties. Incident cooperation and supported export do not depend on renewal or a premium purchase.

For Ben: C-218 is an offer of 14 days at existing scope and no charge, ending May 30 at 00:00 UTC if Ben gives authenticated written acceptance by May 15 at 18:00 and Operations activates it. It is not active now and requires no release or renewal. Q-411 remains an unsigned $198,000 annual option; if the extension is accepted, its price may remain available through May 29 at 18:00. Without an activated extension or renewal, the existing term ends May 16 at 00:00 and production authentication stops. Supported configuration and audit exports are available; live sessions and password factors are not portable. Support-console read access for supported exports continues for 30 days after service end, but does not keep production authentication running. Evidence is preserved through June 30 regardless of the commercial decision.

Noor Vale
Support lead, INC-218
