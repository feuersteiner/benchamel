Subject: INC-218 — correction and account update, 14 May 2025

Leena,

The May 13 message saying Alder data had not been exposed and no further action was necessary was wrong. An unauthorized user of a Northline support identity retrieved your support attachment A-61. That does not establish what was subsequently done with its contents or whether production data was accessed. Northline apologizes for the inaccurate assurance and the confusion it caused.

The account schedule prepared for the secure route contains no secret values:

| Attachment | May 12 upload (UTC) | Finding | Contents |
|---|---|---|---|
| A-61 | 15:38 | Unauthorized file read at 16:03 confirmed | Two administrator session values, connector header secret, administrator contact metadata |
| A-62 | 15:48 | Retrieval unknown | Directory image |
| A-63 | 16:07 | Retrieval unknown | Group and contact image |

The incomplete attachment log interval prevents treating missing events for A-62 and A-63 as proof of no retrieval. A separate support contact report ran during the unauthorized access period; its filter and whether Alder contacts were included remain unknown. The shared report reference is withheld while Privacy and Legal assess whether it could associate another customer; the cleared rows remain available now. The full cross-customer export and raw secrets cannot be shared, but account-specific facts can be provided through the secure portal.

Northline disabled the compromised support identity, revoked its sessions, blocked the known route and verified denial on May 13. Monitoring through 11:00 today showed no renewed successful use of that identity. These measures do not establish the full impact. Engineering verified Alder's two session revocations and rotation of the identified connector secret; thank you for completing them. The separate dispatch credential is not in the parsed A-61 archive and remains unchanged. No blanket rotation has been authorized. Existing session values can pose a risk even with hardware authentication.

The 16:19 May 12 console attempt was denied. Alder's dispatch logs show normal exchanges and no unexplained outage or bulk route retrieval in the 16:00–18:00 application window, but those logs and the 17:00 account snapshot do not cover every administrative action. Searchable production audit begins at 18:00; the earlier archive is being restored. There is no established production data exfiltration, but the missing period prevents ruling it out. A relationship between the alert and the attachment retrieval remains unproven. Separate attachment, report-filter and production archive feeds have been requested.

Please review administrator accounts, factor changes and unexpected grants for the period, and retain relevant local references. Tessa can discuss the checklist and optional shorter sessions or tested network restrictions without a premium purchase. Please do not resend the original unredacted archive; it is preserved. The 12:30 secure briefing is reserved with Dris and Asha, subject to your confirmation.

The April presentation's claim that all diagnostics are automatically sanitized was inaccurate: the limited pilot was not enabled for your support workspace and does not remove every secret. The claim of full disclosure within 24 hours should not be read as a promise of a completed report within that time. An external forensic review is being arranged; no engagement has been signed and no independent finding or completion date is available.

Noor Vale owns the next written update by 13:45 UTC today, whether or not new logs arrive; Dris's technical checkpoint is at 13:30. This is an update time, not a final-report deadline. The account explanation may be shared with Alder's board and appointed incident advisers under existing confidentiality duties. Incident cooperation, protection guidance and supported export do not depend on a purchase.

For Ben: the existing term ends May 16 at 00:00 UTC. C-218 offers fourteen days at existing scope and no charge, ending May 30 at 00:00, if Ben gives authenticated written acceptance by May 15 at 18:00 and Operations activates it. It is not active now, has no automatic renewal or release of claims, and does not resolve the investigation. The unsigned annual quote is $198,000; if the extension is accepted, that price can remain available until May 29 at 18:00. Alder may instead plan an exit. Supported configuration exports are available, but live sessions and password factors are not portable; production authentication stops at term end absent an active extension or renewal, while support-console read access continues for 30 days for supported exports. Incident cooperation continues, and evidence is held through June 30 regardless of the commercial decision.

Noor Vale
Incident support lead
