# UX engineering infrastructure: component lab, deterministic visual/interaction testing and release gates

> **Verified concurrent implementation update:** Read [PR41-SOURCE-DELTA.md](PR41-SOURCE-DELTA.md) first. A combined PR41 already contains real Activity Studio and four-lens Atlas UI but its release report states managed-browser acceptance was blocked by preview routing. This Interface Foundry must inspect/harden/reuse PR41 (not rebuild it), establish actual integrated browser evidence, unify reusable patterns/tokens and deliver the Light-ready frontend SDK on a separate staging branch. No merge/deploy authority.

## What is being tested

A UI foundation is not complete when screenshots are pretty. It is complete when existing Minamo behaviors remain usable while a new renderer/Activity/Atlas module is introduced, data/provenance remains exact, the screen adapts to real width/input restrictions, and a future small agent can rerun the acceptance in one command.

## Lab choices to compare in real current source

### Storybook React/Vite vs Ladle vs in-app isolated fixtures

- **Storybook React/Vite** (https://storybook.js.org/docs/get-started/frameworks/react-vite) supports interactive component stories, controls and documentation; source current app is Vinext/Vite/React, but **dependency and CSS/tool alias compatibility must be proven**, not assumed.
- **Ladle** (https://ladle.dev/docs/) is a Vite-native lean React component story host with Playwright-friendly routes; may be preferable for a small owner-private project if it truly renders the same component tree and tokens.
- **Existing development-only routes** are ideal when a component needs the actual Minamo Workspace, persisted D1 domain or auth-like preview. Keep any dev route absent from the compiled production Worker, as PR39 already proves for its gallery.
- Choose a lightweight hybrid if useful: component isolation lab for stateless/primitives + one actual Workspace QA route for integration. Do not run two competing story systems merely to chase novel tools.
- **No paid Chromatic or screenshot SaaS as a default**: its cloud uploads may expose private source/fixtures and incur costs. Use local Playwright screenshot snapshots with pinned environment; optional cloud tooling requires separate owner privacy/expense approval.

### Playwright and accessibility

Official docs:
- screenshot comparison with expect(page).toHaveScreenshot: https://playwright.dev/docs/test-snapshots
- accessibility/ARIA structure snapshots: https://playwright.dev/docs/aria-snapshots
- Storybook accessibility addon can flag a subset of violations, not certify a screen reader: https://storybook.js.org/docs/writing-tests/accessibility-testing

Implement a reproducible synthetic lab:
- Fixed viewport/browser/font/device scale/environment and deterministic time/animation disables for screenshots. Commit reviewed snapshots and compare deviations deliberately, not automatic reference overwrite.
- Visual screenshots PLUS semantic assertions of headings/labels/controls, correct readable source, focus return, keyboard tab navigation, touch interactions, exact React Reader IDs, preserved Notes and domain receipts.
- Axe/WCAG automated checks on component states and end-to-end user flows, supplemented by manual AT checks if available. Automated axe success is not human comprehension or physical Android accessibility proof.
- Multimodal viewers: raster image math, WebGL, audio and CJK must all have meaningful text fallback and keyboard-only control/announcement.

## Deterministic fixture matrix

Mandatory fixture classes:
- blank new Journey; populated long Journey with 20+ stages and many linked Investigations; no saved checkpoint; formal checkpoint plus *newer Note intention*; wrong-project return;
- long Article/Library area with many commands, code, rich tables, flow diagrams, private media, searchable concept aliases, reading/source permission revoked and retained edition;
- Activity no attempts / one failing attempt / imported GitHub source / verified CI test / reported output / half-revealed hints / explicitly denied source / unknown renderer kind;
- CodeMirror multi-file 5–30 files, 5k+ line exercise, inline diagnostics; terminal ANSI+Unicode, tabs, CRLF, large output, interaction with existing Note editor;
- Japanese paragraph with word-level ruby/ambiguous compound, long sentence, mixed kana/kanji/emoji, phone IME and an untrusted furigana proposal;
- Maths dense inline formula, 300 display equations, huge matrix/scroll, source copy, computed-vs-display provenance;
- data tables large and wide, missing values, charts with alternate source fallback, mismatched dataset digest;
- Three/WebGL successful and unsupported GPU fallback, physics game state, audio unavailable voice, playback interrupted on route change, oversized canvas;
- Atlas: dense 2k–10k synthetic graph, partial source revocation, Notes/Activity revisions after graph mount, tldraw key unavailable, list/tree fallback;
- backend: separate owner/generation, delayed save, lost receipt, CAS conflict, media permission revoked, malformed/oversized source, default-off module and stale installed catalogue.

Fixture publication: use actual local D1/R2 domain when claims depend on persistence. Do not insert into genuine production records or create synthetic Home pollution. Persisted fixture data must be deterministic and resettable; a dev-only account cannot bypass real production domain rights.

## Viewport/interaction matrix

Use purposeful pairs and all catastrophic known combinations:

- Widths: 320, 360, 390, 430, 700, 768, 1024, 1280, 1440 and larger as appropriate. Height: 568, 700, 844 and dynamic mobile keyboard-reduced. Landscape where relevant.
- Displays: default/large/22px reading, compact spacing, code wrapping on/off, dark/theme tokens, high contrast, reduced motion, native zoom 200%+, Japanese language/script and RTL/bidi where supported.
- Inputs: mouse selection and drag, keyboard Shift+Arrow/Tab/Escape, touch/long-press selection, IME composition, screen reader (where accessible), drag-reorder with keyboard alternative, no hover.
- Modes: Classic, Focus and Task; Notes four docks + collapsed + modal phone; Atlas/Activity/Reader/Tool/Library navigations, Back/Forward, source return.
- Data states: ready, unknown, loading, no privilege, stale, unsaved, pending receipt, conflict, interruption, hidden spoiler and deliberately unloaded optional renderer.

For responsive geometry include **actual usable pixels of the primary code/text pane**, not only lack of document overflow. Verify no unscrollable code panes and no action hidden behind a mobile OS keyboard. Track heading/content position after semantic source restoration, not raw scrollTop.

## Regression classes

A. **Data/identity**: exact family/id/rendition/section/part, link permission/canonical quote. Never substitute current edition while reading retained one.

B. **Notes**: persistent single host across mode/pattern switches, four docks, multiple Note tabs, autosave characters, rich/source editor, conflict/lost receipt, pending attachment origin, focus/keyboard.

C. **Navigation**: route/history, layout preference, task stage, reading selected ranges, quick return to Library/Investigation, no mystery newly created work.

D. **Activity**: definition/attempt separate, hint state and spoiler, code file identity, test status provenance, repo/version diff, local-vs-browser Run boundary.

E. **Visual**: tokens, cross-viewport layout, mathematical/CJK typography, code overflow, panel hierarchy and motion; mobile note sheet.

F. **Security/privacy**: permission revoked after renderer mount hides source from interactive DOM/caches, GPU screenshots, retained canvases, and copies. Untrusted Activity JSON can't inject CSS/HTML/event handlers.

G. **Performance**: default Home JS/CSS/assets before/after; lazy large renderers not eagerly bundled; runtime heap/resource lifecycle and repeated mount/unmount; 390px render input delay and long content responsiveness; note no invented benchmark.

H. **Failure feedback**: fail with accessible explanation and preserved drafts, no vague modal "unknown error", no spinner forever. Offline/401/409/partial scan/renderer unavailable have deliberate states.

## Concrete end-to-end user stories for acceptance

1. **Bug Hunt**: enter task from Journey, inspect code, scroll terminal, see expected-fail test vs real-pass CI, reveal concept hint, open Notes, switch Task→Focus→Classic, return to correct file and preserved short Note, submit/reopen an Attempt by precise id.
2. **Japanese Reader**: use native ruby, reveal one word, select exact kanji/kana, Flag and Annotate, switch orientation/text size, compose in IME on phone, open Note and return without losing source or choice.
3. **Maths+science**: math source and plot share owner source identity but represent different evidence; enlarge chart, change parameters, run/cancel genuine engine deliberately, save/reopen actual Run or available safe fallback.
4. **Atlas**: graph and list both link to exact current and historical sources, existing Notes and Activity; revoking a linked source removes cached content, not own independent note prose.
5. **No surprises**: start on clean owner-private Home with all dormant features off; normal reading/navigation/notes identical in behavior to pre-Foundry baseline, no new automatic Write or background bundle load.
6. **Failed command/recovery**: edit Note during a pending save while switching Activity source and note dock; late ACK never attaches old note text to newly selected Project/Activity.
7. **GitHub return**: explicitly selected repository commit appears with verified GitHub source vs supplied terminal log distinct, and "Open locally" never implies Minamo can access Kali filesystem.
8. **Light activation**: new test-only declared component inserted via documented extension point, appears in Task and phone fallback with existing notes/rights/empty states, no component-specific nav rewrite.

## CI and reviewer protocol

- One deterministic test command for source/TS/build and a separate reproducible browser UI suite; run targeted checks during work and full integration suite at release-candidate boundary. Screenshot tests must be stable under a pinned test environment; avoid platform-dependent goldens.
- Record exact tested commit, build tree, CI source, screenshot and ARIA traces, platform/mode/viewport/state. Tests that were not run must be listed unverified.
- A dedicated independent frontend implementation reviewer and UX/persona reviewer examine the actual compiled app, not only code snippets and design documents.
- Adversarial stage tests existing and proposed technologies without assuming the model can certify screenreader, haptics, native IME or GPU support from a simulated browser.
- No UI acceptance signoff without a strong negative test set, especially source rights, Note writing and mobile reading selection.

## Release readiness and cost of future work

A “deployable dormant component system” needs actual tested native Site build/source sync rehearsal, default-off flag, no unauthorised loading, rollback, and a reviewable visual diff to current app. Integration must preserve the source/notes contracts under PR40.

**Future Light acceptance target:** add one new registered already-secure renderer/pattern with a small self-contained task, no schema rewrite, and reproduce its desktop/mobile/Notes/source/permission visual fixtures. If the Light trial needs design architecture or refactoring, the Pro commission fixes the framework before calling it ready.

