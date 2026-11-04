# Minamo visual system — Phase A acceptance brief (4 November 2026)

> **Status:** Design study and implementation of a separate Visual Lab; this is NOT approval to change production Minamo. A draft documentation PR only. Phase A is a controlled, interactive visual prototype; Phase B (native app integration) requires a fresh commission and reconciliation against the then-current production source.

## Why this exists

The owner likes the rounded, clearly distinguished card/surface treatment of the Minamo TTS Lab, but wants to retain Minamo's charcoal identity. The present production interface can feel blocky and weakly differentiated. Initial ideas explored a muted deep cyan/blue as the default, a slightly brighter yet restrained purple option, and a small curated theme palette (Deep Ocean, Midnight, Graphite, Dusk Violet), retaining Classic as a fallback.

The first Visual Lab prototype proved that palette and radius changes can look promising. **It did not establish that Minamo would feel better in everyday use.** The owner's critique is binding:

- Project layouts and Notes were too shallow to judge against the actual application.
- A fake Notes textarea/dock does not show pinning, note selection, autosave, attachment handling, or long-form work.
- Realistic navigation, editing, Library and Project controls were missing or were presentation-only.
- Meta prose, promotional headings, design-explainer cards and repetitive generic AI-generated filler masked the interface rather than testing it.
- A promising screenshot alone cannot justify adopting a design system.

## Binding design contract

1. **Visual system, not information-architecture reset.** Preserve the Project composition model, six native layout types, Home/Projects/Library separation, Settings, Notes dock, page pins, responsive navigation, source reading and GPT/MCP continuity. No new learner-facing handoff, assessment or journey machinery.
2. **Content-first.** Only realistic learning content, navigational labels and ordinary interface affordances in the app. No product-pitch hero, "visual rules", synthetic journey labels or backend/changelog jargon on the learner screen.
3. **Charcoal base with separated surfaces.** Clear canvas/panel/control/raised/inset tiers, restrained hairline borders, comfortable radii, and purposeful whitespace. Do not tint the whole app green. Deep Ocean uses dark cyan/blue accents; Dusk Violet is modestly brighter than the first muted proposal without becoming neon. Midnight and Graphite provide alternative tones. Classic remains a direct comparison.
4. **Readable over decorative.** Contrast, focus and hover states, code/diagram readability, mobile tap targets, sidebars and scroll confinement must survive every theme. Accent colour is for focus, action and meaning, not every heading or surface.
5. **No behavioural regression.** Phase B should introduce shared semantic colour/radius/spacing tokens and a controlled preference flag. It must not replace existing Project persistence, Notes semantics, MCP schema, asset handling or auth/storage configuration.
6. **Native UI is authoritative.** The Visual Lab can fake server persistence but must disclose this; interactions should be faithful to production behaviours, not imply that prototype edits reach Minamo.

## Phase A — realistic private Visual Lab (commissioned)

**Existing isolated Site:** https://minamo-visual-lab.jscymru.chatgpt.site  
**Sites project ID:** `appgprj_6aeba0aa528c81918be19dd51427b2cb`  
**Initial reference:** V1 commit `e814437da6c5719d2091d87dca69d39affb41b40`.  
**Audience:** owner-private; do not change invites or access policy.

Replace the illustrative marketing-like shell with a **believable Minamo work session** using synthetic fixtures, including:

- App-level navigation among Home, Projects, a substantial Project, Library and Settings, with realistic side navigation and mobile treatment.
- A full representative Project containing the six native section layouts (Dashboard, Notebook, Workbench, Board, Research, Guide), navigable ordered sections; enough genuine language/computing work to test reading and action density.
- Project controls that can be exercised: section selection, subdued edit affordance and contextual edits, Add section pattern choice, collapse and navigation. Preserve content when moving among screens in the same browser session.
- Faithful Notes dock: open/close, select/create note, edit/autosave indicator, pin/unpin to the current Project or article, optional attachments/visual demonstration, and small-screen usable behavior. Label any simulated attachment/server behavior truthfully.
- A believable Library subject/article reader with TOC, code/copy or source snippets, and Notes dock context.
- Search or catalogue navigation, Settings with all curated themes and Classic, display density/width controls if practical.
- Real controls and keyboard/focus behaviors; narrow mobile rendering, long text, wrapped code, empty/occupied states.

Use local/browser-only synthetic data; no production API connections. Every action should either work within the lab or be explicitly disabled/labelled. Avoid adding controls purely for the sake of a screenshot. Test navigation state and key interactions after refresh; where the lab cannot emulate server state, explain that outside the app's main learning surface.

### Acceptance evidence

Report, separately:
- Which surfaces were built and what interactions actually work.
- What remains a simulation or is omitted.
- Desktop/mobile screenshots or browser observations, including Notes and a full Project.
- Any observed visual or behavioral defects, with honest reproducible steps.
- Source commit, Site version and access-policy preservation.

**Phase A is accepted only as a design evaluation environment, never as production feature acceptance.**

## Phase B — not authorised here

After owner reviews the fuller prototype, reconcile the **then-current native Sites source** with public `frekland/Minamo`; introduce semantic CSS tokens and curated optional theme preference; selectively migrate the surrounding chrome, controls, Project/Library/Notes surfaces behind an opt-in setting; maintain Classic. Do not restyle embedded tldraw/canvas internals or syntax colours indiscriminately. Use visual and focused behavioral checks before any production deployment. No production Minamo code is to be changed in this PR.

## Coordination and continuation

- PR #83 is concurrent Project/tldraw functionality, **outside this draft design PR**.
- PR #85 is the language/TTS work to follow after the visual decision, **outside this draft design PR**.
- The separate TTS Lab and its chosen voice defaults are unrelated to this visual Phase A.
- Read `AGENTS.md`, PR #80 product decisions, and the live Minamo UI before any production integration; do not assume default-branch source equals native source.
- Continue by inspecting this draft PR and the private Visual Lab, not by reconstructing an unspecified previous chat.
- **Current status at creation:** design contract recorded; Phase A implementation and deployment evidence will be appended to this document after the lab is updated.


## Phase A implementation receipt — 4 November 2026

**Outcome:** The existing owner-private Visual Lab was rebuilt and published as **Site V2**. This is a visual/interaction acceptance fixture, not native Minamo production implementation.

- **Live lab:** https://minamo-visual-lab.jscymru.chatgpt.site
- **Site project:** `appgprj_6aeba0aa528c81918be19dd51427b2cb`
- **Deployed source commit:** `2e70dc3222f927f57cd17db0f0000647a956d1eb`
- **Saved version ID:** `appgprj_6aeba0aa528c81918be19dd51427b2cb~appgver_7c40a883120c81918d724b810d035dbc`
- **Deployment ID:** `appgdep_6aebae3fe2d08191b163e4d2f164a919`; Sites returned `succeeded`.
- **Access:** `custom`, owner-only allowlist of one user; unchanged from V1.
- **Source:** the Lab Site's separate source repository, not `frekland/Minamo` production app code.

### Actual lab surfaces and behaviours

- A credible Home, Projects catalogue (search and cards/list), two synthetic Projects (Japanese and networking), and Library subject/article reading, with everyday learner content and no marketing hero or explainer cards in the learning space.
- A six-layout Project with an ordered outline, contextual section editing and saved additions, Project title/summary editing for the Japanese fixture, and Add section with a layout and title. Sections and edited fields use browser-local storage. Project fixtures remain separate when switching.
- Dashboard, Guide (Japanese furigana, translation reveal, typed response), Notebook, Workbench (interactive subject changes and code/diagram example), Board (flip/next cards), Research (source questions and Library navigation).
- Notes dock with note list, creation, title/body editing and debounced local autosave, pin/unpin on the current section/article, and dock resizing. Supported image types up to 500 KB can be previewed and saved locally; there is **no real upload or sync**.
- Library subject filtering, search, an article reader with table of contents, code/copy affordance and contextual Notes.
- The agreed Deep Ocean, Midnight, Graphite, Dusk Violet and Classic-reference themes; control radius and card-density settings are remembered on the device.

### Verification performed

- `node --check dist/app.js` passed; static deployment packaging and source push succeeded.
- Browser preview inspected visually on a desktop-size viewport. The Japanese Project and all six outline section labels rendered. Guide navigation and translation control were present.
- Notes dock opened; title/body and note selection were shown; editing changed content, autosave transitioned through “Saving…” to “Saved on this device”, and unpinning reduced the current-page pin count. The edit remained after refreshing and reopening the dock.
- Add section created a seventh section, navigated to it, and remained present after refresh and switching out to the catalogue and back.
- Library subject filter reduced the article list; opening the article displayed its reading content and TOC.
- Settings theme selection changed the visual palette; Dusk Violet and Deep Ocean were visually inspected.
- A concrete bug was found: with the Notes dock open, Dashboard cards became too narrow and the floating Notes trigger overlapped the dock. CSS was changed to stack these cards, hide the redundant trigger and contain the Note-list overflow, then the corrected docked view was visually checked.
- The Sites connector independently confirmed V2 active with the same custom owner-only access policy.

### Known limits and next decision

- **Mobile-width browser QA was not achieved** in this session; responsive CSS was implemented but its usability requires an actual 320–430 px inspection on a mobile device/browser. No claim of mobile acceptance.
- This is browser-local illustrative content, not actual Minamo auth, Notes transactions, MCP, Project CAS, Library source rights, tldraw, asset service or persistent server editing. Appearance and interaction fidelity—not backend parity—is the evidence it provides.
- More complex rendering such as large tables, rich media, real tldraw canvas and advanced PR #83 composition features is **not comprehensively represented**. Owners should check those in the live native app before Phase B.
- The specific Notes image handling is a small local demonstration with a 500 KB limit; production has independent private asset handling. Do not migrate this fixture as production code.
- **Next:** owner explores V2 on Pixel 8a and desktop, judging the full Project/Notes experience and colour palette. Record feedback in this draft PR. Only then commission Phase B against fresh native/public source identities. Do **not** merge or deploy Minamo production from this PR.

### Fresh-chat continuation prompt

“Review draft PR #86 in `frekland/Minamo`, especially `docs/product/2026-11-04-visual-system-phase-a.md`, and inspect the owner-private Minamo Visual Lab V2 at https://minamo-visual-lab.jscymru.chatgpt.site. Treat the lab as an isolated synthetic UX fixture. Do a candid visual/functional acceptance on desktop and mobile, especially a full Japanese Project with Notes open, Library article, theme switching and contextual editing. Identify oversimplifications and design regressions against current Minamo, not just superficial aesthetics. Do not change production Minamo or PRs #83/#85; add findings to PR #86 and propose a bounded Phase B only if warranted.”
