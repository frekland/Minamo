# Coherent learning experience implementation

Commission: [PR #61](https://github.com/frekland/minamo-v2/pull/61). Review evidence remains in draft PR #60. This implementation uses the verified V38/native and GitHub main common tree `8f73323df6ed2eaf60c24221661262bfac6eb9f0`; neither documentation commission is merged as application work.

## Implemented experience

| Scope | Result and evidence |
|---|---|
| W1 / F01 | Contextual task and deliberate pin are separate URL/navigation state. Authored references retain context; unrelated unpinned reading clears it. New tasks win, domain changes clear context, explicit close survives reload. Notes capture only the actual reading; an optional task link is frozen and deliberate. One GPT scope chooser distinguishes task continuation from reading discussion. |
| W2 / F03 / F08 | Ordinary Note create/edit routes use the existing Notes coordinator and eligible current head. Existing drafts, protected/rich sections, media, undo and immutable uncertain operations are retained. Latest local writing, queued saving, confirmed saving, rejection and Check status are distinguished. Menu rows no longer inherit window-control dimensions. |
| W3 / F02 / F06 / F07 | One guarded result intent drives native links and current-title resolution; changed/retained passage results remain exact. Global Library transitions carry query and scope. Typed Activity search uses permitted display fields, excluding hidden answers/oracles/config before matching. Links retain modifiers, editions and ranges; repeated connections group distinct destinations. GitHub references expose repo/path and pinned versus moving identity concisely. |
| W4 / F04 | Keyboard controls represent logical mark-ID sets outside token/line fragments. Overlap choices and native marked links remain independent; UTF-16 and code copy remain literal. Syntax loading and wrap do not own those buttons. |
| W5 / F05 / F12 | Continue precedes exploration; a bounded genuine Note-only return excludes synthetic content and revision duplicates. Empty task columns and repeated framing are reduced; substantive reading, section navigation and related work remain reachable. Code/diagram administrative narration is secondary. Legacy Journey sections discuss their reading without inventing typed stage targets. Provenance labels use stored evidence classification. |
| W6 / F09 | Dedicated top-level introductory Question paragraphs compile deterministically. Invalid/conflicting declarations give located fallback advisories; source and existing deliberate questions survive unrelated edits. Editorial guidance favours concise subject-first teaching. Two fresh minimally briefed authors produced the original synthetic Computing/Language fixtures committed under tests/fixtures. Their initial live preview used V38/.2; final .3 publication/readback is recorded in the release PR. |
| W7 / F10 / F11 | Activity discovery uses validated records-only reads, preserving owner/rights/scope/fences. First-page changed composition retries once; stale continuation, generation mismatch and invalid input remain distinct. MCP carries typed error detail without inventing an outer proxy enum. Source server identity is production-appropriate. |
| W8 | Existing responsive Notes sheet and visual-viewport handling retained; shared actions stay available across layouts. Actual production and optional-device results are recorded separately in the release receipt. |

## Verification and limits

Focused real local MCP/D1/R2 tests cover committed-response loss/replay, queued Note changes, rich/protected sections, media, source revocation, stale cursors, owner/generation fences, controlled read churn, typed search concealment, exact title/passages and manuscript declarations. These are synthetic local proofs, not hosted identity claims. Independent integration review corrected task resolution outside bounded lists, stale title history routes and async clipboard status.

Repository-required typecheck, supported production build and the complete test suite are run on the integrated source. Final counts and any remote CI qualification are recorded in the implementation PR release comment. No paid Actions rerun or required protection is bypassed.

The supported managed preview returned connection refused; its error page then failed the cloud browser URL gate. The existing isolated browser harness was used as the commission's alternative path; its absolute public SVG resolution was repaired, but the pinned Chromium shell is absent. No browser assertions or mobile screenshots are claimed from that attempt. No substitute binary or policy workaround was used. Hydrated interaction checks use the actual authenticated production app where available; actual phone/IME/screen-reader and pre-highlight timing remain explicitly qualified when unavailable.

The native metadata update tool exposes title only, so it cannot replace the stale stored Site description. Source MCP initialize metadata is updated; an already installed client's cached prefix is a separate propagation qualification. The working connection is preserved.

## Release and data boundaries

Native source is packaged through the Sites helper, transferred through GitHub's Git-data API, and checked for identical tree SHA before integration and owner-private deployment. Final PR/native/GitHub/version/deployment identities are recorded after the terminal deployment result. V38 remains the compatible rollback reference; no learner-data rollback or recovery activation occurs.

Synthetic live tests use only the `PR61-20261026` run and exact recorded identities/revisions. They are recoverably trashed/unflagged and verified absent from active search/resumption. Genuine Notes, evidence, history and links remain read-only. Any narrowly authorised canonical editorial correction has its own revision ledger, separate from synthetic cleanup. No private screenshots or learner prose belong in Git.

## Post-integration correction

The V39 genuine-content walkthrough exposed a roughly 420px pre-title navigation stack on a 1363px desktop viewport. The follow-up consolidates breadcrumb/actions/return/context into wrapping rows, places Favourite beside the title and moves sticky section navigation below it. Logical saved marks follow that navigation; primary GPT/Add Note actions remain visible. Fifteen focused composition/reader tests and typecheck pass before the final release checks.

The same walkthrough confirmed exact duplicate framing around two retained video cards in the current GPT-authored JavaScript reference. A policy-gated authoring package removed only six duplicate paragraphs (`s5/p10,p11,p13,p15,p16,p18`) from article `ms-2d56d55fdecd26b1ed9644462930020bdd6380f5`, revision 4 → 5. Title, body, shape, links, substantive sections, both videos and active-viewing tasks were preserved. All unrelated sections compared exactly. Original revision 4 and its rendition remain retained; this is a canonical editorial ledger entry, not synthetic cleanup or a learner-record mutation. Operation: `PR61-20261026-canonical-js-video-package-v1`.

A subsequent ordinary cross-reference check found canonical inline links retaining scope only on client clicks. The same bounded follow-up now derives native internal hrefs from the existing LearningSpace context and validates only supported scope selectors; modifier/new-tab links retain Computing or the chosen language, while external links remain unchanged. Eight focused manuscript/Reader checks cover these routes.

The V40 production Back test also exposed a lost global search term after a native deeper-Library transition. The final bounded correction retains that term only in its scoped browser history entry (owner, generation and learning selection), restores it on mount/Back/Forward, and keeps native hrefs/modifiers unchanged. It adds no query to durable browser storage or additional URL state. Two focused history-boundary tests and typecheck pass before the final release workflow.
