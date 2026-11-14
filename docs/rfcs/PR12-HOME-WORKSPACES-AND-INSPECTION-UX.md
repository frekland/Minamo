# PR #12 — Home integration, Workspaces navigation and frictionless presentation inspection

**Status:** Owner-requested follow-up after V189 ordinary-ChatGPT/phone acceptance. **This is a targeted runtime/UI commission, not an implemented change.** Preserve V189's effective GPT-first composition, existing Home/Project sophistication and backend/MCP contracts. Keep PR #12 draft and unmerged.

## Owner's request

- The V189 GPT-composed Japanese learning workspace is now regarded as **good and useful** by the owner.
- They dislike repeatedly enabling presentation inspection or manually requesting image capture to let GPT understand the Site.
- They want **Settings to optionally show Workspaces within the existing, attractive Stable Home** (rather than replacing that Home), and **Workspaces in the top-level navigation**.
- The ordinary existing Home, Projects, Library and Your Work experience should stay intact, not be sacrificed to an experimental full-Home switch.

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

### C. Presentation inspection with far less friction

- Make **one-time consent** intelligible: “Share recent visible Minamo presentation with GPT” once (remembered, revocable), with automatic eligible DOM/interaction/geometry updates whenever the Site is open. Provide clear “sharing on/off”, last captured time, target/view, image availability and expiry in Settings or a small unobtrusive indicator, not an intrusive banner on every page. Keep Notes/private editor input exclusions and source-rights checks.
- Do **not** silently enable capture for all users without consent. An owner choice to enable inspection can remain durable. The important improvement is **no repeated manual activation for structural inspection** and clear feedback about why the optional image is missing.
- Screen capture via `getDisplayMedia` **cannot silently auto-authorise**; every initiation requires user activation and permission. Improve its usability with an obvious one-click “Capture this Minamo view for GPT” affordance on eligible reading/workspace views rather than burying it only inside Settings, correct browser-supported/unsupported states, immediate success/error feedback and a preview/status of the most recent usable image. Keep it opt-in and scoped only to the current Minamo content. Do not keep a persistent screen-sharing stream running as an accidental workaround.
- If exploring an **alternative automatic page rasterisation** (e.g. a rendered DOM export), validate fidelity and same-origin assets; explicitly label it as a **DOM-rendered approximation**, not a real captured screenshot or automatically observed current pixels. Never invent screenshots; do not weaken current-tab identity verification.
- Ensure a user on an unsupported mobile browser still gets useful automatic semantic DOM and geometry inspection, without insisting on image capture.
- Observe that the Home shelf may be device-local while `inspect_minamo_presentation(view:'home')` planned output is owner-scoped; report the variant as **device-observed** where appropriate, not universal planned truth.

## Test and acceptance

1. Current Stable Home remains visually unchanged with the optional shelf off, while Workspaces navigation opens a shelf and saved experience correctly.
2. With shelf enabled, Home displays the newest eligible GPT workspaces as polished cards alongside existing Projects/Library/Notes; clicking one opens it directly. Turning off restores unchanged Home.
3. Desktop header and mobile navigation each show Workspaces without wrapping/clipping/interfering with existing controls. Keyboard and back/forward navigation remain correct.
4. Old saved `view=home&experienceId` deep links still open; new links use `view=workspaces` and survive reload and historical edition changes.
5. Existing Project/Notes/source integrity, rights/revisions, MCP authoring and presentation inspection remain intact. Home does not fetch private work content when shelf is off.
6. Structural presentation inspection works automatically after one-time consent on Home, Workspace shelf/detail and Project; inspect tool honestly reports observed vs planned, screenshot presence and age/expiry.
7. On a screenshot-capable desktop browser, one explicit capture action produces a genuine image accessible via installed Minamo MCP; unsupported mobile gives clear explanation while retaining DOM inspection. Do not promise automatic capture that the browser prohibits.
8. Run typecheck/build, focused nav/preferences/Home/inspection tests and deployed Site browser acceptance, including mobile viewport. Reconcile Sites-native code and GitHub PR branch. Record exact version and caveats.
9. Keep PR #12 draft and unmerged; do not destructively alter existing content. Fix the app's real semantics, not merely PR documentation.

## Product outcome

The owner can keep the **existing beautiful Minamo Home**, optionally see a few GPT-composed workspaces alongside Projects/Library, use a dedicated **Workspaces** top-nav destination anytime, and allow ordinary GPT chats to inspect fresh observed presentation automatically after one durable consent. Genuine screenshot pixels remain separately permission-controlled and available when the browser supports a capture flow.
