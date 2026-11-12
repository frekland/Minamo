# Library navigation, foreground continuity and Article terminology

Owner follow-up to commission PR92, 27 October 2026. The commission stays draft and unmerged; this increment uses a separate implementation PR and the existing owner-private V2 Site.

## Result

The Library is a catalogue with compact Subject cards and Article rows, scoped search, a single entry-type filter, explicit ordering and optional previews. Subject introductions remain available as exact, separate content. Authored section/link groups retain their declared order; otherwise Title A–Z is a transparent presentation sort. Shared subject resources have real membership links and a separate Related articles group, with no invented curriculum or progress. Canonical content is unchanged.

Article destinations retain family, rendition, section, part and any selection coordinates. Catalogue history keeps filters, pages, focused row and scroll position. Article navigation retains the Subject context and exact Project/Step return where established. Modified-click links must carry a bounded, same-app return context for fresh tabs. Restoring a catalogue never authorizes a record read or a write.

User-facing Library nouns now use Article/Articles. Shared Project/Step/Question content uses the appropriate record name or material/content; pronunciation labels remain linguistically accurate. Internal identifiers and wire contracts remain stable. Existing stored titles and manuscripts are not rewritten.

## Loading and session fixes

Previously any failed session check cleared the document and redirected to Home. Focus, visibility and polling could duplicate that check. Now temporary network, timeout, malformed and service-failure responses retain the mounted page and drafts; confirmed authentication loss, principal mismatch and generation conflict still immediately fence the session. One flight, cooldowns and a bounded timeout prevent duplicate or hanging checks. Hidden tabs pause polling; foreground/BFCache restoration revalidates.

The previous Library foreground listener explicitly discarded the admitted list and reloaded every page and Subject overview. Bounded, ephemeral, principal/generation/query/learning-space-scoped display projections now provide warm returns and coalesced reads, with quiet refresh. No manuscripts, credentials or cache payloads are persisted in browser storage. Permission changes, relevant commits and stale authority/index responses invalidate cached metadata. Exact content routes retain independent current-rights checks. Restoration callbacks are cancelled on unmount.

Library landing also previously awaited the general 300-record/up-to-2MB workspace collection before fetching its separate catalogue, and hydration repeated that general read. Library browsing now skips that unrelated collection; management/editing or another collection view loads it deliberately. Explicit Article/Subject SSR still admits its exact requested record.

Server catalogue scans apply the ordered candidate bound before the cumulative byte window. Keyset cursors bind owner, generation, query, scope, index epoch and order. Literal search and Source projections remain authoritative. No new dependency, schema migration, hosting audience change, external AI service, learner mutation or synthetic production record is required.

## Verification and limits

Release results and exact native/GitHub common tree, saved version and deployment are recorded on the implementation PR. Automated evidence distinguishes mounted client lifecycle, local D1 and compiled Worker tests from hosted browser observations. Small local endpoint timings are not a claim about production cold-start latency. Physical Android, assistive-device and independent invited-account checks are separate unless actually exercised.

Read-only integrity checks compare a protected existing Note and checkpoint before and after release. No private bodies or account/session identifiers belong in this repository. V68 remains the code rollback version for this increment; reverting code does not change learner data.
