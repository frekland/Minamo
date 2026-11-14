# PR #12 — Home integration, Workspaces navigation and lightweight presentation inspection

**Status:** Owner-requested follow-up after V189 ordinary-ChatGPT/phone acceptance. **This is a targeted runtime/UI commission, not an implemented change.** Preserve V189's effective GPT-first composition, existing Home/Project sophistication and backend/MCP contracts. Keep PR #12 draft and unmerged.

## Owner's request

- The V189 GPT-composed Japanese learning workspace is now regarded as **good and useful** by the owner.
- They value ordinary-chat **structural MCP presentation inspection**, but do **not** want a prominent screenshot feature in the everyday Minamo interface. Screenshot capture was chiefly intended for developer testing, and Work/browser reviews are more useful for detailed visual assessment.
- They want **Settings to optionally show Workspaces within the existing, attractive Stable Home** (rather than replacing that Home), and **Workspaces in the top-level navigation**.
- The ordinary existing Home, Projects, Library and Your Work experience should stay intact, not be sacrificed to an experimental full-Home switch.
- **Do not add “Keep”/“Bank” controls** to existing saved Project, Article, Home or Workspace passages as part of this navigation change. Those sources are already retained, and copying them would create needless duplication. GPT's explicitly requested independent retention of *new ChatGPT conversation material* is a separate MCP workflow; Notes and learner contributions remain user-owned. See [the architecture RFC, §4](MINAMO-ACCUMULATION-AND-COMPOSITION-RFC.md).

## Verified source findings (V189)

- `app/presentation-inspection.tsx`: after owner-enabled server consent, **structured DOM/geometry observation is already automatic** while a meaningful page is visible: a MutationObserver plus click/scroll/resize and a 20-second interval send bounded `/api/presentation` snapshots. No user click is required for *each DOM snapshot*. The `InspectionSettings` toggle persists owner-side in `v2_presentation_consent`, not merely one browser session. The Site still has to be open and display the target to supply current observed state.
- Pixel capture is separate, deliberately manual: Settings' `Capture current view image…` dispatches `minamo-inspection-image`, whose handler calls `getDisplayMedia`, requires a **verified current Minamo tab** via `setCaptureHandleConfig`/`getCaptureHandle`, crops a single PNG, submits and stops capture. This cannot be made silent with the same API: browsers require transient user activation and a fresh permission prompt on each screen-share request. Current-tab capture is not broadly supported across mobile browsers. The user's 485×944 observed DOM but missing pixels is **consistent with** structured capture working and no eligible PNG; don't assert a specific device failure without its actual error/trace.
- `lib/presentation-inspection.ts` deliberately distinguishes planned hierarchy, recent observed DOM, and optional consented screenshot, with 10-minute expiry and rights/source fences. Retain this distinction and security.
- `lib/presentation-preferences.ts` has one device-local `experience` choice (`stable/explore/practice/studio`). `app/workspace.tsx` substitutes `ComposedWorkspaces` only for `view==='home' && experience==='studio'`. There is **no `workspaces` View or navigation item** in `navigation`; `app/presentation-settings.tsx` places GPT workspaces under the Experimental experience radio choice.
- `app/composed-workspaces.tsx` currently owns both the beautiful saved-workspaces shelf and detail reading, with internal browser history rewriting to `/?view=home&experienceId=...`; direct links and previous connector URLs rely on this legacy shape.
- `app/home-landing.tsx` already has a polished Home composition with a Projects hero and curated shelves for Library, Notes, Questions, etc. `app/learning-home.tsx` owns Home data fetches. Reuse their visual and navigation patterns rather than embedding a whole second Home, copying a giant composer, or introducing another top-level dashboard.
- `/api/experiences` currently pages mixed `work` records and filters arrangements in memory; a Workspaces Home shelf must not incorrectly appear empty merely because arrangements are not in the first 24 returned records.

## Required targeted UX

### A. Normal Home remains normal

- Make **Workspaces an independent top-level destination**: a real `workspaces` View/route, e.g. `/?view=workspaces`, accessible with one click from the top navigation and mobile menu, whether or not a legacy experimental experience mode is selected.
- Present saved GPT-created workspaces with the mature `ComposedWorkspaces` shelf and reader, now styled and routed as part of Minamo. Keep the useful display of rich Japanese source material and section navigation.
- Preserve all established Home, Projects, Library, Your Work, Notes and site controls as they are.
- A workspace deep link should canonically be `/?view=workspaces&experienceId=<id>`, retaining optional saved revision. **Existing** `/?view=home&experienceId=...` links must remain functional as compatibility aliases (including source navigation and browser back/forward). Update newly generated MCP/open URLs to the canonical route only after adding the alias; never strand existing shared links.
- Confirm URL ownership and state: the `ComposedWorkspaces` client currently calls `history.replaceState` itself and may fight the top-level workspace router. Unify route/state ownership enough that refresh, back, forward and saved editions behave predictably, including when the experience view is selected from Home.

### B. Optional Workspaces shelf on existing Home

- Add a **separate device-local Settings → Workspace toggle**, e.g. **Show workspaces on Home** (default off until explicitly enabled; owner can switch it without selecting the old replacement-Home experiment).
- When on, insert a small, attractive **Workspaces shelf/row** within the **existing** Home, showing a bounded number of recently saved workspaces as cards and a **View all workspaces** link. Prefer a section following Projects or another natural place in existing visual hierarchy. The goal is part of the Home, **not an embedded full workspace reader with its own second hero and nav**.
- Use one shared eligible arrangement-source query/presentation model for both the Workspaces destination and Home shelf; avoid duplicate loaders if practical. Ensure only actual arrangements are returned and paging cannot hide them behind unrelated `work` records.
- When off, the exact current Home is unchanged and incurs no workspace-shelf fetch. Persist setting separately from `experience`, maintaining compatibility with existing `minamo-presentation-v1` preferences. Keep current experimental Passage explorer and Practice sequence available if useful, but avoid treating the new Workspaces route as an experiment that hijacks Home.
- Avoid adding redundant home controls or labels merely because new backend record types exist. Fit Minamo's existing card/cover design.

### C. Preserve lightweight MCP inspection; screenshots are developer diagnostics

- Preserve the existing **remembered, revocable consent** for sharing recent visible Minamo presentation with GPT. Once enabled, eligible DOM/interaction/geometry observations should continue automatically while the Site is open. Keep clear, compact sharing on/off and last snapshot time/state in Settings only where useful, without adding routine page banners or image-status indicators. Preserve Notes/private editor/input exclusions and source-rights checks.
- Do **not** silently enable capture for all users without consent. The ordinary-chat workflow should work well with planned and observed **structural** evidence alone; GPT should explain missing screenshot pixels briefly only when explicitly assessing visual appearance or asked for screenshot evidence.
- **Do not add a prominent screenshot/capture affordance to ordinary Home, Workspace or Project pages.** Retain the existing optional explicit capture in Settings as a low-priority developer/diagnostic capability, or tuck it into an advanced inspection disclosure if necessary. Browser `getDisplayMedia` requires a user gesture and fresh permission; do not attempt silent capture, persistent screen-sharing, or platform-specific complexity merely to eliminate this limitation. Use Work/browser inspection for actual visual design and responsive testing.
- **Do not implement automatic rasterisation or alternative screenshot infrastructure in this slice.** It is not a product priority. If explored later for development, distinguish real browser pixels from any DOM-rendered approximation and retain security checks.
- Ensure unsupported/mobile browsers still provide useful automatic semantic DOM and geometry inspection without an image-capture step. Work/browser reviews remain the reference for pixel-level UX assessment.
- Observe that the Home shelf may be device-local while `inspect_minamo_presentation(view:'home')` planned output is owner-scoped; report the variant as **device-observed** where appropriate, not universal planned truth.

## Test and acceptance

1. Current Stable Home remains visually unchanged with the optional shelf off, while Workspaces navigation opens a shelf and saved experience correctly.
2. With shelf enabled, Home displays the newest eligible GPT workspaces as polished cards alongside existing Projects/Library/Notes; clicking one opens it directly. Turning off restores unchanged Home.
3. Desktop header and mobile navigation each show Workspaces without wrapping/clipping/interfering with existing controls. Keyboard and back/forward navigation remain correct.
4. Old saved `view=home&experienceId` deep links still open; new links use `view=workspaces` and survive reload and historical edition changes.
5. Existing Project/Notes/source integrity, rights/revisions, MCP authoring and presentation inspection remain intact. Home does not fetch private work content when shelf is off.
6. Structural presentation inspection works automatically after one-time consent on Home, Workspace shelf/detail and Project; inspect tool honestly reports observed vs planned, screenshot presence and age/expiry.
7. Keep optional existing diagnostic screenshot capture non-regressed **where practical**, but **do not require new screenshot UI, image capture support or pixel evidence** for completion of this targeted slice. Use Work/browser reviews for desktop/mobile visual acceptance. Confirm ordinary MCP structural inspection still reports missing image evidence honestly without insisting on it.
8. Run typecheck/build, focused nav/preferences/Home/inspection tests and deployed Site browser acceptance, including mobile viewport. Reconcile Sites-native code and GitHub PR branch. Record exact version and caveats.
9. Keep PR #12 draft and unmerged; do not destructively alter existing content. Fix the app's real semantics, not merely PR documentation.

## Product outcome

The owner can keep the **existing beautiful Minamo Home**, optionally see a few GPT-composed workspaces alongside Projects/Library, use a dedicated **Workspaces** top-nav destination anytime, and allow ordinary GPT chats to inspect fresh observed structure after one durable consent. Developer pixel-level acceptance belongs primarily in Work/browser reviews; optional screenshot capture stays secondary.
