# Future Plus / Sol Light integration economics — a practical contract

**The aim is cheaper future work, not a claim that a lighter model can solve every new UI problem.** Invest today's Pro capacity into reusable interaction architecture, tested templates, canonical integration and narrow API boundaries. The UI should become capable of showing *whole new Activities created by GPT via MCP without modifying code at all* when they only use approved registered components.

## Three economically distinct future tasks

### Tier 0: Compose a supported activity — no app-code change

User asks GPT to create a new debugging/language/math/data/game challenge within an existing Journey. Once live Activity MCP supports the required kinds, GPT:
1. Gets the actual supported template/renderer catalogue from Minamo; reads linked current learning context.
2. Authors accepted Activity data with source checks, hints and optional project starter assets.
3. Previews and explicitly publishes a versioned Activity via MCP.
4. Uses prebuilt Interface Foundry patterns/slots for desktop/phone; no new React UI implementation.
5. Reads back the precise record, link and any later Attempt/Notes; no fake learning progress.

**This is the main desired user experience on Plus**: zero new Work engineering tasks for ordinary creative learning activities.

### Tier 1: Register/activate an already-bankable capability — bounded Light code

The renderer/runtime, schema, component states, rights and UX pattern all exist in an immutable tested engineering bank. Light gets one source link, a small task, precise files and validation scripts. It registers one adapter/slot or disables/enables an approved flag with no architecture invention. Visual and semantic fixtures prove it works. Requires an authorised release for production if not already deployed.

### Tier 2: Invent a truly new capability family — use the remaining Pro to prepare this in advance

A new data authority, sandboxed execution engine, major accessible interaction model, source mapping or licence/provider integration is not intrinsically Light-ready. This commission must anticipate common future categories and build the foundations now. A genuinely unforeseen engine may still warrant stronger work; do not mislabel it.

## SDK surface to implement (actual names chosen after PR40 source audit)

Provide a narrow documented and typechecked API under a stable module, not a requirement to edit 3,000-line app/workspace.tsx for every renderer.

Conceptual manifest:

    {
      "interfaceContract":"minamo.ui-plugin.v1",
      "componentId":"waveform.inspect",
      "componentVersion":1,
      "sourceFormat":"minamo.pcm.v1",
      "approvedPatterns":["explore-and-explain","audio-workbench"],
      "slots":["primary","inspector"],
      "capabilities":["inspect","copy-source","play-explicit"],
      "behaviour":{
        "runOnMount":false,
        "needsNetwork":false,
        "microphone":false,
        "requiresOwnerRights":true,
        "willWriteOnInteraction":false
      },
      "staticFallback":"Accessible textual amplitude/time table",
      "mobileFallback":"Linear timeline and optional play control",
      "fixtures":["waveform-short","waveform-long","audio-unavailable","revoked-source"]
    }

This is a research candidate, **not** an existing server/MCP/Code registry schema. Remove redundant fields when actual PR39 artefact contract already supplies authority. The server should expose only supported capabilities, not trust a client manifest's self-asserted rights. Unknown component/version remains readable static output.

Potential typed developer interface:

    registerView({
      id: 'waveform.inspect',
      version: 1,
      sourceFormat: 'minamo.pcm.v1',
      load: () => import('./trusted-waveform'),
      allowedPatterns: ['audio-workbench','explore-and-explain'],
      fallback: AudioTableFallback,
      stories: ['short','large','unsupported','revoked','mobile'],
    });

The registration must automatically receive **authority-checked eligible source and standard onOpenNotes/onNavigate/onCopy action adapters**, not raw owner tokens or free-form backend access. Heavy modules lazy load only on demand. This is an example API shape to prove against actual code, not a demand for this exact function signature.

## Deliverables needed to make Light work reliable

1. **UI component registry:** known stable typed kinds/patterns/slots, adaptive layout and proper fallback. No future task should add its own app-wide context provider unless truly necessary.
2. **Context adaptor:** one shared, rights-checked viewmodel for current source, actual task, attempt, Note selection, accepted related Library, save and progress status, with exact destination links.
3. **Action adaptor:** known actions with permissions/explicit user gesture, status and error/retry. No model-defined event handlers, arbitrary URLs, automatic recording.
4. **Style variables/design tokens:** full source-linked semantic tokens with concrete examples and allowed variants. Default charcoal/cyan; no new per-feature color system or theme.
5. **Layout recipes:** responsive patterns for reading, editing, graphing, simulation, multi-file code, hints/steps, comparisons and atlases; desktop and phone automatically supported by pattern.
6. **Component story/test generator:** one command to scaffold a new registered component and deterministic fixtures for idle/loading/empty/unavailable/revoked/large/mobile/keyboard/pending-save. If generation is too complex, bank copyable tested templates and a strict checklist instead.
7. **UI source map:** exact current file entrypoints, exports, routes, tests, fixture hosts and PR source SHA; frequent past mistakes and anti-patterns.
8. **Work order snippets:** one copyable Sol Light instruction per tested extension point, with exact tasks/test commands and stop-before-deploy.
9. **Local complete acceptance:** renderer appears in a real synthetic Activity and linked Journey inside Classic/Focus/Task and can open existing Notes/Library, not just render in isolated Storybook.
10. **Source permissions:** invalid source/denied owner hides content and cancels computations even when view persisted or live graph is on screen.

## Minimum Light simulation (prove it, don't just assert)

Have at least three **fresh constrained agents**, each provided only a module activation dossier, catalogue and exact tested repo commit, attempt independent tasks:

A. **Add already-proven Foundry N01 byte inspector** to a code exercise's inspector slot with automatic mobile fallback and no permission bypass.

B. **Publish one completely new synthetic activity composition**, combining two existing unrelated registered components (e.g. Japanese ruby + source encoding or code/diff + test trace), via simulated/staged typed MCP without changing UI code.

C. **Register one new known-safe visual renderer** (e.g. PR39 table/chart or finite algorithm trace), add one fixture story and regression suite, and show in the real Task Workspace with persistent Notes. No changes to unrelated Notes or global navigation.

Challenge the agents independently, with the task that they genuinely execute code/test. Count:
- unplanned source files/functions modified;
- speculative new dependencies/architecture;
- validation errors and retries;
- manual design decisions required (should approach zero for Tier0/Tier1);
- elapsed iterations and actual run/test coverage where measured;
- production invariants broken;
- documentation/SDK failure points.

If an agent cannot finish without new architecture or undocumented state behavior, **fix the underlying framework with Pro, rerun the exercise**, and update the activation dossier. Don't blame the model or call it Light-ready by changing the definition of finished.

## Example future Plus-era requests and correct routing

- "Use Minamo V2. Make a Japanese sentence-ordering and furigana exercise about directions." → Tier0 if language activities/patterns live; GPT publishes content by MCP and opens browser link.
- "Give me a deliberately broken Python Sudoku solver with hints, tests and a small board." → Tier0 with existing safe bug-hunt/game primitives; real project ZIP/GitHub requires owner-authorised distribution path.
- "Enable the already-tested timeline viewer for Activity attempts." → Tier1 if merged/deployed platform supports it and source/UX manifest exists.
- "Integrate real-time WebGPU molecular dynamics using arbitrary Python packages from the internet." → not safely Tier1 by mere resemblance to an existing 3D viewer.
- "Can you redesign Minamo's entire mobile navigation and Notes interactions again?" → should NOT be required for ordinary features. Large owner-preference redesign remains exceptional and deserves review.

## Governance / cost controls

- Do not introduce recurring SaaS like Chromatic as a prerequisite to Light activation. Use local deterministic browser tests and present package performance before/after.
- Do not entangle production feature admission with a parallel remote design system service.
- Keep unneeded dormant JS/asset imports out of Home and the default bundle.
- Explicit production release from owner needed after draft PR review; source being in GitHub does not mean a client/runtime/MCP is deployed.
- If a heavy migration or UI shell refactor is needed to support Activity/Atlas, **complete it during Pro** or clearly and honestly label it not ready for deployment.
- Maintain a final cross-PR dependency graph: PR39 artefact bank → PR40 combined staging integration → Interface Foundry UX SDK/companion staging branch → owner's approved release → Light Tier0/Tier1.

