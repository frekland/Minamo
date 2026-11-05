# Minamo Visual Lab V6 — native-fidelity build plan and preflight

**Date:** 5 November 2026  
**Status:** Owner-approved direction and build groundwork, **not** implementation or deployment approval for production Minamo. PR #86 remains draft.  
**Target:** Existing owner-private Visual Lab, `appgprj_6aeba0aa528c81918be19dd51427b2cb`. Preserve its owner-only audience.  
**Primary fixture:** Privacy-safe, dense Japanese Live learning content; secondary computing/interactive fixture.

## Why V5 is not enough

V5 is a useful presentation study, but its static HTML/JS app recreates rather than reuses Minamo. It substitutes a one-selected-section Project view for native flat ordered sections on one document; its Notes, flashcards, Library reader and browser-voice TTS are approximations. It lacks the full native arrangement/editing, drawing, Python, image and authenticated asset behaviours. A calmer screenshot may therefore be an artefact of removed functionality rather than a better visual system.

**V6's rule: preserve real behaviour, warts and all, before changing its appearance.** The native baseline must be available for direct comparison. Changes to information architecture, reference expansion, section navigation or controls become separately labelled UX experiments rather than unannounced styling changes.

## Read-only source preflight, 5 November

| Source | Verified identity | Consequence |
| --- | --- | --- |
| Published Minamo Site | V116, deployed native source `fc93ce4bbcffa4298097b8c7fe50fae75555d072` | Use the actual deployed baseline, not old PR #86/V91 text. |
| Native Sites Git HEAD | `d32f713585a9bf320a9ca75457b4f01996893c47` | V116 is an ancestor; two subsequent commits affected policy/docs, not the learner app. Re-check before build. |
| Public `frekland/Minamo` | Public `main` is not application-source-identical to V116; see `docs/V116-PUBLIC-SOURCE-RECONCILIATION-2026-11-05.md` | Do not pull older public app files over newer native components. Public Git remains shared design/review home. |
| Visual Lab | V5 source `e8dbc8075f720ae0fd3f881980534fa58be5975f`, static `dist/` build, four deployed files | Treat as preserved visual reference/rollback, **not** the new implementation base. |
| Native hosting | Worker/React/Next app with native `DB`, `BUCKET` and MCP declarations | Lab V6 needs a deliberate hosting and isolated-storage design. Never copy production bindings or data. |

The actual native source was inspected read-only. Relevant reuse points:

- `app/workspace.tsx`, `app/page.tsx`, `app/layout-workspace.tsx`, `app/projects-index.tsx`, `app/library-browser.tsx`: real shell, routes, collection, navigation, Library.
- `app/project-sections.tsx`, `app/project-sections.css`, `lib/project-composition.ts`: six flat ordered section patterns, content slots, arrangement/hide/collapse/pin/favourite/width, inline edits and reference blocks.
- `app/reader.tsx`, `lib/contracts.ts`: typed rich content, code/tables/diagrams/ruby/media, reading and source/deep-link semantics.
- `app/notes-panel.tsx`, Notes editor/sync/window modules: actual Note selection, autosave, draft retention, page pins, attachments and dock behaviour.
- `app/project-interactive.tsx`, `app/project-language.tsx`, `app/project-speech.tsx`: real flashcards, language patterns/dialogues, speech controls.
- `app/project-drawing.tsx`, `app/project-canvas.tsx`, `app/project-pygbag.tsx`, asset/media clients: drawing, Python and packaged interactive paths.
- `lib/domain-handler.ts`, `worker/index.ts`: native API boundary (including `/api/projects/composition`, `/api/projects/update`, `/api/commands`, assets/media).

**Existing shortcut, with a restriction:** `app/interface-lab.tsx`, `lib/interface-lab-preview.ts` and fixtures already exercise real `Workspace` against synthetic local D1/MCP through a development preview. Their routes are intentionally guarded by `import.meta.env.DEV` and return 404 in hosted production. Reuse their ideas and specimen builders; do **not** simply remove those guards or expose test identity/header shortcuts on a public or production route.

## V6 architecture decision

Build the private Visual Lab as a **reviewed, minimal projection of current native frontend/runtime** with lab-specific fixture and persistence adapters. Keep its existing Site identity and audience. Do not incrementally retrofit the V5 static simulator into an imitation of React/Next Minamo.

1. **Frontend parity:** Reuse the actual shell and relevant components, styles and interactions; create a baseline Classic mode that behaves like the current app. Preserve the same flat ordered Project document and every essential control, including current noisy/default states.
2. **Isolated records:** Use synthetic `WorkspaceRecord` / `ProjectComposition` / rich-part definitions with native validation and stable IDs. The Japanese Live source is a privacy-safe authored fixture shaped like the real experience, not a production database export. Include long tables, 30 cards, dialogue, references, cover, Notes and hidden/folded cases.
3. **Storage:** Prefer lab-only D1/R2 if actual Notes, drawing, image/attachment persistence and revision semantics are to be exercised; provision as separate lab resources. Use exactly the needed endpoints and typed contracts. Avoid real identities, production D1/R2, production API tokens or MCP installation/bindings. A mock adapter is acceptable only where it preserves UI semantics and is explicitly labelled in review evidence.
4. **Security:** Keep owner-only Site access. Do not copy `.openai/hosting.json`, secrets, owner identifiers, protected assets, logs or genuine learner records from production. No dev-only spoofed authentication or synthetic-user shortcut may be exposed outside a clearly isolated internal fixture boundary. Preserve revision/CAS and retry/receipt behaviours for tested writes.
5. **Design tokens:** Add a lab-only presentation selector: native Classic baseline versus candidate charcoal themes, same component tree and same data. Typography, colours, radii, spacing and surface hierarchy may change together. **Behavioural experiments** (e.g. compact reference rows, alternate section navigation, progressive content disclosure) must be independent toggles and measured separately.

**Fallback if isolation proves unexpectedly coupled:** stop before hosting mutation, document the specific auth/storage/runtime blocker and propose a narrower real-component harness. Do not weaken production security or silently fake successful writes.

## Scope by priority

| Must exercise in V6 | May be scoped after the core parity pass |
| --- | --- |
| Home, Projects catalogue/scope icon, Library search/reader/source return, settings | Unused historical views and retired UX |
| Native six-section Project, scroll/outline, arrangement/edit controls, references inline as currently implemented | Entire historical Stage corpus |
| Notes open/close/select/edit/autosave/pin with reload and conflict/error states | Full Notes recovery/export campaign |
| Rich Japanese text/ruby, tables, image-backed flashcards, language dialogue/pattern/TTS controls | Acoustic quality of a particular device voice |
| Image/cover handling and one drawing persistence case; Python canvas or explorer; one Pygbag control if available | Exhaustive media/code execution matrix |
| Desktop plus narrow viewport and Notes-open layouts | Comprehensive browser or repository test suite |

Preserve all existing native affordances in baseline, even if cluttered. A candidate visual treatment can make them quieter, but must not make them unreachable.

## Build sequence — bounded, two stages

### Stage 1 — native-fidelity baseline (before redesign)

1. At start, re-read the Site's latest deployed version, native HEAD and relevant public modules/PR #83/#85. Pin a clean source manifest; annotate every native-only dependency/protected exclusion. Keep a safe V5 rollback target.
2. Prepare an isolated V6 build in the existing lab source repository. Use native components and a lab-only fixture/data boundary. Do **not** modify the production Site, database, plugin or public application branch.
3. Populate **Japanese Live** with the same six layout patterns, ordered blocks, long readings, flashcards, references and Notes, plus a computing/interactive Project. Include default full-reference expansion, current titles and awkward chrome—warts included.
4. Verify the core pathways and persistence without changing appearance. Record real behaviour versus intentionally simulated behaviour.

**Stage 1 output:** A credible native-looking Classic baseline whose controls, reading order and interaction semantics can be compared with production. If something cannot be mirrored, label the omission prominently in the acceptance report.

### Stage 2 — presentation experiments on that baseline

1. Introduce the candidate tokens/themes behind an explicit lab-only selector; Classic remains a stable control.
2. Compare *identical* content and state across treatments. Keep special UX experiments separate: compact references, a primary “continue speaking” cue, reduced heading hierarchy, adaptive Notes/outline, and progressive reveal.
3. Inspect desktop and genuine 320–430px layouts (iframe viewport emulation may provide evidence but is not physical Pixel 8a acceptance). Include open Notes, wide tables, furigana wrapping, long card faces, image/drawing panels and keyboard focus.
4. Record what improved, worsened or was merely moved/hidden. Prefer small, reversible changes and reject attractive treatments that damage important controls.

**Stage 2 output:** Annotated before/after comparisons, specific recommendations, and a short manifest of candidate production changes—not a blanket reskin.

## Focused acceptance, not a campaign

- Same Project and Note data/controls in Classic and candidate: verify no missing actions, wrong defaults or lost scroll/anchor semantics.
- Project open → outline → fold/hide/arrange/edit → save/reload; expected revision and duplicate-operation behaviour where writes are implemented.
- Notes choose/create/edit/autosave/pin → navigate → reload; no loss of drafts or context. Show empty, occupied and conflict states.
- Flashcard flip/image and dialogue/reveal/TTS control states; truthful unavailable-voice behaviour.
- Reference inline versus compact experiment, full reader and return; preserved source/rights information.
- Drawing/image upload/persistence and one Python interactive case; stop/timeout and no unsafe auto-run.
- Desktop and narrow viewport screenshots with Notes closed/open. Focused test/build checks only; full `pnpm test` and broad browser suites are **owner-opt-in**, never automatic.

## Explicit non-goals and handoff

- No production Minamo deploy, data migration, licence/protected-content transfer, public source bulk copy, MCP tool-schema release or owner plugin reinstall.
- No redesign of tldraw internals, Python sandbox, security, Project schema, persistence semantics or general information architecture.
- No learner “achievement”, checkpoints, handoffs or extra mandatory workflows.
- PR #83 (Project/drawing), PR #85 (language/TTS), PR #84 (external integrations) remain independent.
- Keep PR #86 draft. Record each lab build's source SHA, Site version, access, changed-source manifest, observed scenarios, omissions and rollback target. Phase B production adoption remains a **separate explicit commission** based on native lab evidence.

**Commission boundary:** This document authorises preparation/planning in PR #86 and sets the proposed V6 lab scope. It does not claim the V6 implementation or any production build has occurred.