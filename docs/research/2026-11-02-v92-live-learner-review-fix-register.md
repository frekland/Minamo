# V92 deployed learner review — PR #78 implementation fix register

**Date:** 2 November 2026  
**Target:** draft PR #78, branch `docs/contextual-implementation-blueprint`; public V92 source `42f92ff383a0860e54ff167a409a9f2d6123120c`, protected native V92 source `e62099e`.  
**Release state:** V92 was deployed to the existing Minamo audience with the access policy unchanged. `?workspace=context` remains opt-in; Classic and V91 rollback remain available. PR #78 is draft/unmerged. The owner waived further tests before this deployment and subsequently commissioned a cloud-browser learner review. The cloud session below is exploratory acceptance evidence, **not** execution of the local interface-browser suite or full C1–C9 sign-off.

## Evidence boundaries

An authenticated learner-style journey followed an independent Computing question about TCP byte-stream framing. The reviewer opened a current Article, followed old/unpinned qualified Activity references, created a source-linked test Note, wrote an Activity Attempt, created a second projectless test Note, compared two selected sources, opened an explicit GPT handoff and used MCP continuity reads. Canonical Notes and Attempt saved and re-opened with source/provenance distinctions; no code execution was observed or claimed. The **three deliberately labelled TEST ONLY V92 records** remain in the protected owner account; this review did not reset fixtures or delete learner data. No live identifiers, private record bodies, private Site URL or credentials are reproduced here.

Observed positive foundations to preserve:

- Current Article shows distinct older-edition/unpinned Activity relationships; exact edition destinations remain available.
- Source-linked and projectless Note capture, autosave/readback and Attempt receipt work; `scope=evidence` returns bounded saved evidence without inventing execution or a new Project link.
- Two-record comparison retains separate editions/provenance; GPT handoff requires a deliberate selection and explicit preparation.
- Primary internal navigation generally preserves `?workspace=context`. The defect below is specific to search-to-Library links.

## Implementation fixes

### F01 — P1 — Keep contextual mode through global search

**Reproduction (observed twice):** Enter the deployed opt-in `?workspace=context` route, from either a Computing Article or the Computing Library. Open the global search modal, search for “Python sockets” or “TCP”, and choose “Search … in the Library” / “Search the Library” / “See more Library matches”. The resulting route has `view=library`, `libraryFacet=search`, `libraryQuery` and learning-space parameters, **but loses `workspace=context`**. The UI shows “Classic workspace” and the opt-in control becomes unchecked. Ordinary primary navigation maintained mode.

**Code seam:** In `app/workspace.tsx`, the global `searchResults` links currently construct `learningSpaceHref(librarySearchHref(query),learningSelection)` without the contextual experience carrier used in `navigate` (`carryWorkspaceExperience` from `lib/contextual-workspace-state.ts`). Inspect all search, Library/Practice/Project, native-anchor and intercepted-link producers for the same contract, rather than patching only one text label.

**Fix/acceptance:**
- A deliberate contextual user stays in contextual mode through all three search→Library actions, click/keyboard activation, search result click, full reload, direct/new-tab link and browser Back/Forward; query/facet/space and exact source return persist.
- A Classic user stays Classic. An explicit mode switch is the only mode-changing action; no write is triggered by navigation.
- Add a regression at the URL/route-helper level and an executable real-browser scenario (`tests/interface-browser/contextual-workspace.spec.mjs` or related); verify native `href` and intercepted clicks, not only React state.

### F02 — P1 — Exclude synthetic fixture Projects from normal discovery

**Reproduction (observed):** On the ordinary Computing Projects screen without selecting owner diagnostics, ten synthetic fixture Projects (Plant Screamer, Mood to Music and retired Cap series) appeared among learner navigation, with duplicate “TEST ONLY” labeling. Owner-only synthetic fixtures are correctly useful in a diagnostics surface, and ordinary MCP evidence already excludes them; there was **no demonstrated cross-owner disclosure**.

**Code seam:** `app/projects-index.tsx:sortProjectRecords` currently filters `family==='journey'` and `!trashedAt`, but omits `!record.synthetic`. It then displays a test label on items that should not be in the ordinary index. Audit `mode=independent` Question results, Practice/Library search and all other normal discovery/continuation surfaces for the same leak; server reads should not rely on title prefixes or a client-only filter.

**Fix/acceptance:**
- Ordinary Projects, independent Questions, search, Practice, Home/recent/context and GPT candidate lists exclude `synthetic: true` by default, including after reload, pagination and navigation.
- Only an explicit owner-authorised TEST ONLY diagnostics control may include registered fixtures, visibly flagged and scoped. A URL parameter alone must not bypass scope checks.
- Add positive/negative regression fixtures for normal versus diagnostics reads and exact counts/pagination. Do not delete/rename the synthetic records and do not change access policy or owner scoping.

### F03 — P2 — Put the selected study material before legacy wrappers

**Observation:** Contextual Article and Activity screens still place a header and “Source and saved connections” surface above the full Classic Reader/Activity Studio. A Project Step remains a long document view; opening Notes can obscure roughly half of the desktop study surface. This weakens the “one primary object” promise of the selected design. This is an observed interaction/layout problem, not a record-integrity failure.

**Code seam:** `app/working-context.tsx`, `app/workspace.tsx`, `app/reader.tsx`, `app/activity-studio.tsx`, `app/journey-route.tsx`, `app/notes-panel.tsx` and `app/working-context.css`. Preserve the sole NotesPanel CAS/autosave coordinator, exact reading/Activity routes and native links.

**Fix/acceptance:**
- Primary Article passage, Activity task, Note draft or Project Step is visually and semantically first; related material is compact and dismissible, not an extra mandatory page above a full old page.
- Notes remains reachable during source inspection without blocking the primary object; close/reopen, interrupted save, draft and original selector recover. Activity does not duplicate a full Reader by default.
- Check desktop and 320/375/390px, narrow height, keyboard traversal/Escape/focus return, IME composition and screen reader landmarks. Preserve retained-edition, source rights and exact passage anchors; do not declare UX acceptance from a static screenshot.

### F04 — P2 — Carry comparison selection into deliberate GPT handoff

**Reproduction (observed):** On contextual Home, explicitly select two saved sources and open Compare. Both render accurately with source bounds. Click “Discuss selected sources with GPT”: the modal opens with **zero selected/checked sources**, requiring the same selection again. The final “Prepare request” remains deliberate.

**Code seam:** `app/working-context.tsx` stores `compared` / `selected`, but renders `ContinuityGptHandoff` with `page={page.evidence}` rather than carrying the selected exact refs. Review `app/continuity-gpt-handoff.tsx` and `lib/continuity-gpt-brief.ts` for a safe explicit preselection contract.

**Fix/acceptance:**
- The chosen exact source identities and renditions appear preselected in the handoff as *proposed* choices; learner can uncheck/recheck, sees coverage and old/denied edition warnings and must still actively click Prepare/Copy/Open.
- Recheck rights and revs at preparation. No silent GPT dispatch, no inferred relation, no D1 write and no shared selection across owner/generation/space changes.
- Test a two-source comparison, separate old/current renditions, revoked source, modal cancel/reopen and zero selected case.

### F05 — P2 — Make recent Attempt resume informative without pretending execution

**Observation:** The Home saved Attempt preview is generic (“Explicit Activity attempt. Supplied evidence is not Minamo-observed execution”) and exposes none of the learner's recorded prediction or next experiment. The original Attempt still opens, and the cautious execution label is correct.

**Code seam:** `lib/working-context-read.ts` / continuity evidence preview, `app/working-context.tsx` and the existing Activity Attempt display. The live MCP read returned `basis=supplied-attempt`, `preview.complete=false` and `detailsDeferred=true`; this is an actual bounded-preview condition, not proof those fields are absent from the canonical Attempt.

**Fix/acceptance:**
- Show a compact, rights-checked excerpt of explicit authored prediction/uncertainty/next action when present and within budget; otherwise label “details not included — open original”, with an exact Attempt link.
- Continue to distinguish supplied experiment notes, simulated output and verified operation. Never promote Attempt to completed execution, mastery, or inferred current plan.
- Regression for missing, deferred, contradictory and denied detail, and a learner re-opening the original Attempt.

### F06 — P2 editorial/discovery task — Review relevant Article's subject placement

**Observation:** The Library source “Python sockets, TCP byte streams, framing and timeouts” was found by MCP and search, but not in the “Networking, SSH and TCP observability” Subject listing. The returned subject/area links were empty. This could be an intentional editorial omission rather than a code defect.

**Implementation decision:** Audit the source's authored taxonomy and visibility. If it belongs in that Subject, add an explicit, reviewed authoring relationship and test the Subject index. If editorially distinct, expose it through a clearly labelled related search suggestion; do **not** auto-save a link based on lexical similarity or rewrite Article edition relationships. No new domain schema is required.

**Acceptance:** Learner can find this relevant source from the normal networking discovery task with clear saved-versus-suggested provenance; rights, edition and subject scope stay correct.

## Not an open fix — M01 dedicated MCP tool exposure

During the original browser review, the connected tool catalog lacked `get_minamo_working_context` although the source blueprint promised it. On **2 November**, a fresh catalog check found `mcp__codex_apps__minamo_get_minamo_working_context`, and a read-only `learningSpace=computing` call returned `minamo.working-context.v1`, owner-scoped bounded evidence, a false saved-selection flag and partial coverage. **This is now a verified pass for current exposure, not evidence of a backend omission.** Include plugin registration/reconnect discovery and rights/error behavior in acceptance; reopen only if the tool disappears or a client-specific reproduction is captured.

## Proposed implementation order and gate mapping

| Order | Tasks | Regression / C gate |
| --- | --- | --- |
| 1 | F01 search mode and F02 synthetic isolation | URL codec/native links and filtering; C1/C6, C5/C7/C9 |
| 2 | F04 selection handoff and F05 Attempt preview | Explicit refs, edit/revocation and distinct evidence; C3/C4/C7/C9 |
| 3 | F03 content-first interaction and responsive editor | Real learner flow and assistive/draft checks; C1/C2/C3/C6/C8 |
| 4 | F06 editorial subject audit | Search/subject index and provenance; C2/C6 |
| Cross-cutting | Keep existing old/unpinned Article→Activity labels, Note/Attempt save receipts, exact source links and M01 read | C2/C3/C7/C9 |

**Explicitly unverified:** The exploratory cloud session does not complete the nine-case matrix, especially Mood contradiction and sparse Cap/Plant return (C4/C5), multi-hop native/back/forward and cross-tab editing (C6), withdrawn/denied/stale cursors (C7), the 320–390px/IME/assistive gate (C8), or deliberate GPT selection with rights changes (C9). The waived local browser fixture remains unexecuted; no automated browser acceptance can be inferred. Preserve the prior full public source gate (`1,569 passed / 0 failed / 4 skipped`) as a **pre-fix** baseline, not post-fix certification.

**Implementation-ready determination:** This register supplies repros, priority, likely code seams, negative controls and acceptance for F01–F06. The next coding pass may start directly on PR #78 without another design election; F06 has a bounded editorial decision after inspecting source authoring. **Merge/normal-route cutover/redeploy are not approved or accepted.** After fixes, run focused tests then full `pnpm run typecheck`, `pnpm run build`, `pnpm test`, interface-browser C1–C9 and native Sites parity/rollback gates on the **exact** candidate; seek owner usability verdict and any separate publication/merge permission. Preserve the opt-in switch, same audience, no new schema/data migration and V91 rollback.
