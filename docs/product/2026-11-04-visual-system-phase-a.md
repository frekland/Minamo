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
