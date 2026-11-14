# GPT-first workspaces and presentation inspection — V189

This is the active implementation report following the owner's rejection of V186's administrative frontend. Read [the authoritative correction](PR12-GPT-FIRST-PRESENTATION-INSPECTION.md) with the [Work commission](PR12-WORK-COMMISSION.md). Earlier V184/V186 reports retain storage/discovery evidence; their frontend recommendations are superseded here.

## Product correction

Code and deployed visual review compared `HomeLanding`, `ProjectReading`, its shared topic map and native rich Reader with V186. Home provides purposeful shelves and readable visual hierarchy; Projects provide context navigation and rich material without requiring reference administration. V186 exposed the storage model as forms, repeated source frames and mechanical pagination. That main path has been replaced, not restyled.

Settings → Workspace → **GPT-composed workspaces** opens a shelf of ready-to-use saved experiences. A workspace has a composed introduction, purposeful section tabs and coherent reading, practice, contrast or focus layouts. Canonical tables, Japanese/ruby, flashcards, dialogue, diagrams/code and other rich parts use the shared Reader. Sources and edition history are small disclosures; title/group/order/pin/follow/source-selection forms are absent from the learner path. The earlier manual component remains in source for compatibility/investigation but is not mounted as the experiment. Stable Minamo remains the default and retains its Home/Project experience.

`compose_minamo_workspace` persists/refines an exact-reference arrangement plus a validated presentation plan. Up to eight sections and forty total bounded blocks use four responsive layout choices. Source blocks select exact entry indices; connective note blocks are explicitly derived guidance. There is no model HTML/CSS/JavaScript injection and no copying original source parts into the arrangement. Existing `save_minamo_arrangement` remains compatible, with optional plan support. Legacy arrangements derive a compatible plan rather than requiring migration. Ordered sources, pin/follow, owner/generation/CAS/receipt/recovery guards remain authoritative.

The same `arrangementPlan` and rich-part presentation descriptors drive rendering and inspection. Native Project inspection reuses `projectLearningMap`, also used by `ProjectReading`; Home shelf labels are shared with `HomeLanding`. Home's planned output discloses eligible candidates and missing browser visit/scope/loading decisions, rather than claiming an exact currently open Home.

## Presentation evidence through MCP

`inspect_minamo_presentation` is a compact typed **read-only** server MCP tool for `home`, exact `project`, or exact `workspace`, optionally a numeric saved revision/device and summary/structure/visual detail. It has no browser-control dependency. It returns distinct evidence:

| Evidence | Meaning |
| --- | --- |
| Planned | Deterministic shared rendering plan, source eligibility, saved revision/rendition, component kinds, default controls, layout roles, bounded actual text and disclosure defaults. Available with the Site closed; never called pixels. |
| Observed | Opt-in authenticated Site-submitted DOM measurements: target/revision, capture time/device, selected experimental preference, viewport/breakpoint, accessible names/roles/order, selected/expanded/disabled/busy states, element bounds, typography/display/gap/overflow/clipping, scroll containers and open dialog labels. Includes loading/error states encountered in the bounded rendered hierarchy. Client observations are not independently verified screenshots. |
| Image | An actual PNG from a browser-consented current-tab video frame, cropped to the visible Minamo content region. Own timestamp, viewport and interaction summary; may precede newer DOM state. Delivered as an MCP image content block when eligible, not a reconstructed DOM image. |

The Site's **Share recent Minamo view with GPT** setting defaults off. Enabling it allows bounded captures while the page is visible, after relevant interaction/layout changes and on a heartbeat. Snapshots are owner/generation scoped and expire from inspection after ten minutes. Stored expired rows are lazily removed by subsequent capture; disabling inspection deletes that owner's snapshots. Retention is per device and view, so visiting Home does not erase the last eligible Project/workspace observation. A device's selected experiment preference is reported separately from the exact `target` and planned renderer variant; it is not proof that an experimental renderer was used for a native Project.

Every read revalidates the canonical sources/editions and projected rights against capture fences. Source changes or loss of eligibility withhold stale observations/images. Planned unavailable sources stay visibly unavailable. Observation freshness is `recently-reported` or `last-known`; the tool always says the currently active screen is unknown. If an older edition is actually displayed, it reports that edition and marks the mismatch against the current requested plan. It cannot observe a closed Site, unsaved conversations or another tab.

Pixel capture is explicit: Settings → Workspace → **Capture current view image…**, then the browser's current-Minamo-tab permission. Capture-handle verification rejects another surface before retaining pixels; Notes must be closed. The stream stops after the single frame, with a timeout if no frame arrives. Unsupported browsers get a clear limitation and retain structured inspection. Images are bounded to 1200 pixels and 500,000 base64 characters. The crop may include fixed Minamo navigation/Notes chrome intersecting that viewport; it is not a screenshot of unrelated browser tabs or the desktop. Desktop Chromium was actually exercised; other browser/mobile capture support is not claimed.

The existing `read_minamo_arrangement` also returns `presentationInspection` and a genuine eligible image on its first page. This is an intentional compatibility route for already installed clients with cached tool catalogues. Ordinary website reading avoids this separate inspection projection and resolves up to eight source entries once, rather than repeatedly resolving the complete plan while loading each page.

## Actual connected authoring → rendering → inspection → refinement

The genuine saved arrangement previously called **Playing, listening and talking about music** was deliberately evolved, preserving its identity and history:

- **Revision 3 — Music, in your own words:** four purposeful sections: Listen & play, Your words, In conversation, Say it your way. Seven inspected references combine the original carefully composed Japanese/English, original attempt/correction and follow-up, the saved practice dialogue, and the explicitly GPT-authored retained table/cards.
- Live rendering was inspected through the Site and through connected MCP. The owner-commissioned conversational refinement exercise then saved **revision 4**: Start talking first, shorter introduction, and original Japanese beside its English meaning in a responsive contrast section. Source references were retained; no learner words were rewritten.
- The Site reopened revision 4 through the durable link, rendered dialogue/cards/table/contrast using the canonical Reader, and exposed actual selected section/answer/turn state through independent MCP reads. Direct installed-MCP refinement then saved revision 5, removing the extra guidance block from the opening conversation screen to reduce clutter, with exact replay verified.

After opting in, open:

https://minamo.jscymru.chatgpt.site/?view=home&experienceId=arrangement-27d81e13583662edd587045c2b8fe44da0e23c09

Actual GPT saves used freshly discovered typed page tools routed through the normal authenticated server GPT dispatcher. Independent connected Minamo MCP discovery and readback were also used. In particular, **the installed connector returned both actual DOM evidence and a genuine image content block**, without using a browser-bound tool for that read. The consented PNG was 1200×825, captured at `2026-11-14T09:24:32.917Z`, with Start talking selected and two dialogue turns visible. A later MCP read showed a flashcard answer while retaining that older image with its separate timestamp and interaction summary. This is direct evidence that structured state and pixels are not silently conflated.

During final acceptance the connected catalogue refreshed and exposed both new tools with compact fully typed signatures. **Direct installed-MCP inspection succeeded for the workspace, Making Friends and native Stable Home.** Direct `compose_minamo_workspace` then simplified the first conversation screen at exact revision 4, saving **revision 5** with all seven source references retained; exact retry returned replayed without duplication. This direct connector loop used no browser-bound authoring or inspection helper. The Site then reopened revision 5. Final independent installed-MCP inspection matched planned and observed revision 5, selected Your words, at 1363×936 CSS pixels; the actual two-column presentation was screenshot-verified. A separately started ordinary fresh ChatGPT conversation was not available within this development task; that separate-session check remains unverified, rather than the formerly missing installed-tool acceptance.

## Browser and safety acceptance

- Existing Home and Making Friends were visually reviewed before replacing the experimental path; Stable remained selected until deliberate opt-in.
- Saved workspace retrieval and direct-link reload displayed the GPT-authored plan and final refined revision 5; no source-selection/ordering form was required.
- Dialogue translation/reveal, two visible turns, flashcard answer, tabs and source disclosures were exercised. Independent MCP observed Start talking/two turns and Say it your way/Card 1 Answer correctly. Focus revalidation preserves learning interaction while withholding the view during current-rights checks.
- Desktop contrast displays original Japanese beside its actual English source. At **454 CSS pixels** in the real deployed desktop browser (300% zoom), comparison stacked, document width stayed 454, no clipped nodes were reported, and MCP reported the mobile breakpoint and actual main scroll extent. This is narrow-browser acceptance, not a physical touch-device test; zoom was restored to 100%.
- An exact-original control reopened Making Friends at its retained rendition/section/part. Live native Project inspection returned revision 12 and the actual selected Practice / My music answer topic. Direct installed-MCP native Home inspection returned the shared planned shelves and actual stable Home headings, Project titles and 1363px viewport, with screenshots correctly absent. Both Home and native Project live parity therefore passed; browser visit order remains observed state rather than a server assumption.
- Full returned canonical records for Making Friends revision 12 and Japanese Speaking Practice revision 21 compare equal to the preserved real corpus snapshots, including every section, rendition, links and Project composition. No original Projects or Notes were modified.
- Actual current-tab permission, one-frame capture, stream stop and independent MCP image delivery passed. Subsequent interactions retained image evidence separately. Physical phone/touch, audible TTS completion and cross-browser capture remain unverified.

## Fixes found during actual acceptance

V187 was the first redesigned release. Browser/MCP calibration exposed hidden descendants of closed disclosures in observations, incomplete scroll extents, snapshots overwriting other views, premature loss of images during later measurements, learning interaction reset on focus, and misleading observed/current revision matching. These were repaired and tested in V188. V189 removes redundant full inspection work from ordinary website source loading and prevents the initial list request from ending the deep-link loading state prematurely.

No failed relevant safety checks were waived. Initial release typecheck/build and **48 focused tests** passed. Subsequent source-specific checks passed after each actual fix: 41 tests for early capture fixes; 42 after image retention/compatibility; focused presentation tests for interaction/geometry and revision matching; final V189 typecheck/build and **42 focused tests** passed. No full historical suite or new 50k campaign was run; the unchanged accumulation index and existing D1 growth evidence remain applicable within their original limitations.

`tests/pr12-presentation.test.mjs` uses the existing real corpus, migrations, actual D1/R2 and MCP/HTTP transport. It covers typed plan/schema visibility, source bounds, retry/CAS, revisioned refinement/history, owner isolation, default-off consent, observed geometry, old/current edition distinction, per-view retention, PNG byte transport/image blocks, separate pixel retention, expiry, revocation withholding and disabling/deleting captures. Existing domain, recovery, Project authoring and GPT Note restrictions remain in the focused selections.

## Exact deployment and source

- Existing Site: `appgprj_6aeba0aa528c81918be19dd51427b2cb`, https://minamo.jscymru.chatgpt.site.
- Final **V189**, saved version `appgprj_6aeba0aa528c81918be19dd51427b2cb~appgver_7841200c1ddc8191885528c96dd828fc`.
- Deployment `appgdep_6af8294ff7ac8191a9f6da66b2f30c91`, succeeded, environment revision 5, MCP enabled; existing audience/identity/storage bindings retained.
- Native source `4e3ceeb809e842d264b735a5c61608459a990a41`; public application/test source `4871f824874408ea563033305573a45d420e9d35`.
- [Source reconciliation](PR12-V189-SOURCE-RECONCILIATION.json): all 15 changed application/test files match exact Git blobs and file modes. Native-only source retained. Later public documentation receipts require no runtime redeploy.
- Earlier redesigned V187: native `3e9c84cce26e6dd45815734704561772c99010a7`, deployment `appgdep_6af822c4555c8191995d038bdb19e2a9`. V188: native `1a727bb745b6702913e8ddd6e5b24e072af5a4b3`, deployment `appgdep_6af8283009808191bb03b523ea3ba75a`.

## Recommendation and remaining work

Keep the existing canonical accumulation/revision system and the new typed presentation plan. GPT should compose/refine; the learner should open, read and practise. Evaluate this complete experience before choosing another permanent product taxonomy. Add layout components only when a real purpose requires them; do not expose more manifest controls or allow unrestricted generated markup.

Remaining acceptance: repeat the now-working direct installed-MCP compose/inspect loop in a separately started ordinary fresh chat; physical mobile/touch and audible TTS; cross-browser capture. Remaining product work: owner judgement of visual hierarchy, richness and conversational flow; remembering a chosen section across full reloads if wanted; richer per-component state reporting for diagrams/canvas; tighter bounding of native Project topic detail; ranking/recall and background indexing already documented in the accumulation report. Home's planned output is an explicitly bounded candidate projection, not a full reproduction of browser visit ordering. The current inspection component version is identified; a deployment-specific client build hash would improve diagnostics across updates. Snapshot deletion is lazy after expiry unless explicitly disabled.

Keep PR #12 draft and unmerged. No destructive canonical migration, source move/copy campaign or original learner-material rewrite was performed. This is working deployed software with real GPT/MCP/browser evidence, not a claim that all product quality decisions or client/device acceptance are complete.
