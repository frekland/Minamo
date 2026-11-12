# Acceptance matrix — targeted reader polish and CodeMirror 6

**Status:** implementation and local automated/desktop/viewport verification completed. See [actual evidence and explicit limits](IMPLEMENTATION-EVIDENCE.md); hosted release details follow in PR24’s release receipt. Physical-device and installed-client freshness are not inferred.  
**Source observation record:** [PR #23](https://github.com/frekland/minamo-v2/pull/23) (must remain draft, evidence-only; do not silently resolve the findings).  
**Implementation specification:** [IMPLEMENTATION-COMMISSION.md](IMPLEMENTATION-COMMISSION.md).

## Required per-finding verification

| ID | Verifiable acceptance gate | Evidence required from Work |
|---|---|---|
| **C-08** | Read-only **CodeMirror 6** syntax appears on real article/stage code; line numbers, language label, Copy, Wrap. Native selection + exact Flags/annotations behave with emoji, multiline, saved marks and old rendition; no code editing or copying decoration text | Screenshot mobile/desktop, runtime UI test, exact UTF-16 anchor/copy assertions, shipped integration mode and rationale |
| **C-09** | At 320–390px, learner sees a **connected graph** with arrows/nodes, not a vertical card list; can pan/enlarge, access source/alternative, use keyboard | Screenshot 320, 390, desktop and enlarged; interaction test; no diagram data or rendition changes |
| **C-03** | No `Capture passage` / repeated `Capture this heading` controls or empty utility gutters beside passive paragraphs. A normal tap does **nothing**, while selecting a real text range still opens Flag/Annotate. One unobtrusive optional keyboard path must exist without paragraph buttons | Screenshot same mobile Stage 1 before/after; Android tap, text selection, keyboard action and focus tests |
| **C-04** | Ordinary paragraph tap causes **no blue rectangle/full-paragraph focus box**; saved Flag/annotation is subtly indicated without full-block underline or unnecessary `1 saved`; markers remain focus/touch accessible and edit/delete/unflag exactly correct | Android ordinary paragraph tap before/after; screenshot with 0, 1 and overlapping saved marks; keyboard focus and bookmark identity checks |
| **C-12** | GPT-authored/provenance/Edit/Check-for-updates actions no longer dominate article entry but owner capabilities, history and relevant change notices are still discoverable | Screenshot and click-through authorised menu/disclosure; retained version notice |
| **C-10** | Video card exposes a clear Load player and succinct context; no duplicative provider chrome; explicit activation required before any third-party request, iframe, image or DNS preload | Pre/post click DOM and network evidence; unload/reload/failure and external-link tests |
| **C-01** | On Android-width Journey overview and Stage view, Start/Continue/actual task is clearly prominent, administration does not occupy the first viewport unnecessarily; breadcrumb and location intact | Screenshots with first viewport and scrolled content on 320/390/desktop, keyboard nav |
| **C-02** *(partial)* | Improved overview scan hierarchy by layout alone; no claim that authored Journey prose has been pedagogically rewritten | Before/after first-screen comparison; note residual authoring issues |
| **C-14** | Library sections clearly differentiated, headings/code/examples visually scan well without destroying text selection, semantics or responsive reading | Screenshot with multiple sections/code and 200% zoom; accessible headings |
| **A-10** | Web/MCP normal `update` command shape is discoverable as top-level family/id/rev; bad `command.target` on non-flag action is refused with targeted actionable error; valid `setFlag` unaffected | Schema snapshot, negative preview, positive update/Flag, no-mutation-on-error, connected catalogue read after actual deployment |

## Cross-cutting non-regression gates

**S1 — Canonical fidelity:** For all modified reader paths the underlying text, `rendition`, `sectionId`, `partId` and UTF-16 start/end remain stable; copying exact source works, including CRLF, emoji/surrogate and combining marks. Test historical rendition and out-of-date selection without retargeting.

**S2 — Security / source rights:** Owner-private auth, Site scope, source excerpt withholding/rights, live embed consent and no third-party preactivation fetch. No unsafe HTML, remote script injection, new unreviewed dependencies or prototype access route.

**S3 — Learning integrity:** No automatic learner Development, stage completion or activity claims. Stored Notes, flags, annotations, Journey progress, bookmarks and old publications remain intact. The old-rendition **earlier capture retained** safeguard must still appear when applicable, not be treated as removable flag styling.

**S4 — Recoverability:** If CodeMirror fails to mount, readable source remains. Annotation drafts/queued operations recover; no lost ACK replay duplication, stale revision silent overwrite or changed Trash semantics.

**S5 — Accessibility:** Mouse, keyboard and touch selection; visible focus on **genuine interactive controls**, not passive paragraphs tapped on Android; deep-link/target focus remains discoverable. Readable contrast, reduced motion, high/forced contrast, meaningful headings, no purely colour-coded marker, diagram alternative text, media privacy announcement and accessible copy feedback.

**S6 — Responsive:** 320px, 360/390px, 768px, 1280px and 200% zoom: no full-page horizontal scrollbar introduced. Local code/diagram horizontal scroll may exist by design and must be discoverable.

**S7 — Build/regressions:** `pnpm run typecheck`, `pnpm test` and `pnpm run build` successful. Extend targeted cases in `tests/reading-interactions.test.mjs`, `tests/anchor-reader.test.mjs`, `tests/rich-reader.test.mjs`, `tests/learning-diagrams.test.mjs`, `tests/external-video.test.mjs`, `tests/domain-bookmarks.test.mjs`, relevant protocol schema tests. A server-rendered snapshot **cannot** replace live browser selection testing.

**S8 — Real source/release:** Source tree parity of GitHub and private Site if deploying, plus hosted smoke/real screenshots. Record exact GitHub/Sites IDs and deployment details only if verified. Installed client MCP contract must be checked live or labelled pending/reinstall-required; don't call source-only schema tests proof of refreshed MCP.

## Receipt table — Work fills after implementation

| Finding | Changed file(s)/commit | Automated test evidence | Browser/connected evidence | Result / limitation |
|---|---|---|---|---|
| C-08 | reader.tsx, read-only-code-viewer, reader-code-syntax/lines | Unicode/CRLF/fallback/capture tests; full suite | Native multiline selection and exact clipboard; desktop/narrow code | Verified locally; CM6 syntax mode, physical Android pending |
| C-09 | flow-diagram.tsx, reader-notes.css | Diagram integrity/render tests | 320/390 fit, connected arrows, zoom/enlarge | Verified viewport; no diagram identity changes |
| C-03 — Capture controls / passive tap | reader.tsx, reader-notes.css | Passive markup and withheld-selector tests | 320px passive click, native contextual selection | Verified viewport; Android device pending |
| C-04 — Focus box / saved marks | reader.tsx, reading-interactions.css | Overlap/old rendition/bookmark tests | No passive outline; direct saved annotation Edit/Delete | Verified locally; persistent D1 effects automated |
| C-12 | workspace.tsx, reader.tsx | Existing owner/history tests | Collapsed options and preserved owner controls | Verified locally |
| C-10 | external-video.tsx, reader.tsx | Consent/no-provider-DOM tests | No provider media before Load; opt-in iframe/private-video notice | Verified DOM boundary; network trace unavailable |
| C-01/C-02 partial | journey-route.tsx, workspace.tsx, CSS | Navigation/learning suite | Phone overview Start + Stage 1 entry | Layout verified; authored prose unchanged |
| C-14 | reader-notes.css, CM viewer | Semantic/render checks | Desktop/multiple narrow widths, differentiated sections | Verified viewport; actual 200% zoom unavailable |
| A-10 | domain.ts, domain-handler.ts | Shared-D1 rejection/no mutation, positive preview/Flag, catalogue | Post-release actual connected runtime/catalogue in PR receipt | Source verified; client refresh not inferred |
| S1–S8 | Integrated source | 589 tests, typecheck, production build | See IMPLEMENTATION-EVIDENCE.md and release receipt | Device/trace/hosted-gesture limits explicit |


**No premature closure:** This table can become a verified implementation receipt without altering PR #23's original incidents or implying owner acceptance. A later owner verification can be logged in its own dated addendum in that draft, identifying the implementation commit/release and whether the originally reported friction is now absent.

