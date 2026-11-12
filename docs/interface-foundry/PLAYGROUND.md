# Interface Foundry development and regression laboratory

The laboratory renders the actual shared `Workspace`, `ActivityStudio`, `Reader`, `LearningAtlas` and persistent `NotesPanel`. It is not a parallel application or a replacement evidence store. All material is original, synthetic, marked TEST ONLY and owned by a separate local D1 principal. Fixture Activities are published through the real local MCP endpoint, then read by the ordinary generation-fenced domain API.

## Start and inspect

Install the repository's pinned dependencies using the Sites installer when required. In the managed environment, start only the supported preview daemon:

```sh
sites-preview start /absolute/path/to/minamo-v2
```

Open the exact URL it returns, followed by `/preview-interface`. The daemon owns the preview server. Do not start a second Vite server or rewrite its host/port to work around routing.

The outer story controls select twelve multi-component learning experiences, current/missing record, canonical multilingual Reader, an existing short Note, Atlas, four functional layout variants and a viewport. The selected story renders in a same-origin iframe at actual document widths 320/360/390/430/700/768/1024/1280/1440 and heights 420/568/700/844/1100. Consequently media queries and the Notes viewport coordinator see that document's real dimensions. This is browser layout emulation; it does not demonstrate physical Android, touch handles, a native keyboard, IME, GPU or assistive technology.

The embedded document has a separate DEV-only route, `/preview-interface/workspace`. Ordinary Workspace navigation preserves its route, one Notes coordinator, source identity and local draft keys. A reload stays in that embedded document rather than recursively creating another story host. Switching an outer story reloads the evaluated document; changing Workbench panes, layout variant or Classic/Focus/Task inside the document does not create another Notes owner.

Example direct story (prepend the exact running preview origin):

```text
/preview-interface/workspace?view=tools&family=experiment&id=TEST-ONLY-interface-debug&if-layout=context-first
```

`if-layout` accepts `context-first`, `artefact-first`, `sequence`, `power`; `if-density` accepts `comfortable`, `compact`. These are development comparison inputs, not learner evidence or new global modes.

## What the fixtures exercise

`lib/interface-lab-fixtures.ts` is the deterministic source of the twelve cases. Each has an Investigation/Journey context and multiple actual admitted components. They include:

- the real generated Python fragmented-message project, visible failing tests and server-held progressive hints;
- a multi-file Node project, visible test source, local handoff, exact source digests and supplied trace;
- native Japanese ruby/parallel reading and an exact canonical Reader destination;
- original TeX/native mathematical source and illustrative chart values;
- CSV/table/chart data comparison from the same exact `fixtures/measurements.csv` source; blank counts remain blank and are omitted from numeric pairs, never treated as zero;
- a bounded scene with static/unsupported fallback and explicit activation;
- synthetic PCM source and explicit audio controls, with no microphone request or autoplay;
- source-aware Atlas context, normal list/graph navigation and a short intention Note.

The canonical Article also includes RTL/mixed script prose. Source labels distinguish authored/illustrative/supplied content. A saved explicit Attempt uses the existing `run` companion semantics; publishing fixtures creates no formal checkpoint. The domain test verifies exact CRLF supplied-terminal readback and wrong-owner refusal.

The `missing-source` state opens a genuinely unavailable ID and exercises the ordinary 404 path. It does not fabricate a denial banner over still-readable data. More destructive lifecycle, CAS, generation, revocation and recovery regressions remain in the existing domain/security suites and the Interface recipe contract tests.

## One verification command

For source, schema, UI/ownership and real local D1/MCP regressions:

```sh
node scripts/interface-verify.mjs
```

For TypeScript, normal production packaging and compiled production-negative tests as well:

```sh
node scripts/interface-verify.mjs --full
```

For the browser suite against an already-running local preview:

```sh
node scripts/interface-verify.mjs --browser --url EXACT_PREVIEW_URL
```

The browser runner accepts only an explicit localhost/127.0.0.1/terminal.local origin and refuses production. It never starts a server or installs/launches an alternative browser in the managed task on its own. Execute it in a supported local Playwright development environment with the pinned Chromium version installed. Managed task browser evidence is collected through the supported cloud browser API instead. Dependency pinning alone is not a claim that the suite has run in every host.

The pinned Playwright suite contains 37 listed cases across `tests/interface-browser/workspace.spec.mjs` and `notes-editor.spec.mjs`: six multi-component experiences at desktop/390px, nine responsive geometries, four reviewable layout variants, keyboard/hint/source selection, reduced-height Notes exact canonical source/missing target, and Atlas keyboard/card/refresh/exact-source navigation with Notes host preservation, and direct retained-edition/passage links across all three modes using separately published local D1 editions, and four deliberate renderer activation→pane teardown cases. It records visual and ARIA snapshots, axe serious/critical violations, usable primary-pane width and document overflow. Trace and failed screenshots go to `.sites-runtime/interface-browser`. A read-only preflight checks the pinned Chromium headless executable and exits once with NOT RUN when it is missing; no application assertion is then executed.

For an initial evidence capture before reviewing baseline images:

```sh
node scripts/interface-browser.mjs --url EXACT_PREVIEW_URL --capture
```

Capture mode emits PNG and ARIA evidence but does not claim an approved visual baseline. Reviewed image/tree baselines can then be admitted deliberately:

```sh
node scripts/interface-browser.mjs --url EXACT_PREVIEW_URL --update-snapshots --approve-baselines
```

The extra flag prevents accidental baseline replacement. Never bless an unexpected diff just to make a check pass. Review long code, CJK/math, focus/Notes overlay, source-provenance labels and task identity before admitting it. Keep browser/platform, exact source commit and font environment with accepted baselines. Automated axe success is not screen-reader certification.

## Lab choice and research

Official sources retrieved on 25 October 2026:

- [Storybook React/Vite](https://storybook.js.org/docs/get-started/frameworks/react-vite): isolates React components; documented requirements React ≥16.8 and Vite ≥5. Those ranges do not prove this app's Cloudflare/Vinext/auth/Notes compatibility. A separate builder would require duplicated app setup and cannot itself exercise the single Workspace owner.
- [Ladle](https://ladle.dev/docs/): React-focused Vite story host with code-split stories and a component index suitable for Playwright. Its introductory performance comparison is against an old Storybook version, so that comparison is not treated as a benchmark of this app.
- [Playwright screenshots](https://playwright.dev/docs/test-snapshots), [ARIA snapshots](https://playwright.dev/docs/aria-snapshots): complementary visual and semantic comparisons; official API examples confirm animation disabling and `reducedMotion: 'reduce'`. Context7 retrieved `/microsoft/playwright` documentation for these APIs.

Decision: use the existing full-app DEV-route model plus a small story-control host and pinned Playwright/axe tools. No Storybook/Ladle dependency, second Vite app or cloud screenshot service is introduced. This is a source-grounded choice, not an unperformed compatibility/performance victory over those tools. Stateless primitives can later be exported to either host without changing the canonical integration acceptance route.

## Isolation and production checks

Both lab pages import their client host only inside a positive `import.meta.env.DEV` branch and call `notFound()` otherwise. The Worker proxy is behind the same compiled guard, rejects cross-origin requests and external target URLs, bounds payloads and forwards only a finite domain API allowlist with the fixed synthetic local principal. The browser transport rewrite also requires that exact synthetic scope and DEV mode.

`tests/interface-lab-production.test.mjs` exercises the normally compiled Worker: outer page, embedded document and proxy must all return 404 and initialize zero lab records. No production permission, installed MCP catalogue, native Site version or genuine learner record is changed by this laboratory. Read the final combined release report for the actual executed browser/build results and remaining physical-device gates.

The data-detective specimen’s table and chart now derive from its exact original measurements CSV, including the missing C count. Its one-time `data-coherence-v2` upgrade compares only that synthetic story’s file/table/chart source fingerprints and guidance, uses CAS and a deterministic operation ID, preserves the old edition and makes subsequent initialization a no-op. Source tests cover byte/hash agreement, two valid numeric pairs/one omitted pair, exact upgrade replay and retained old-source readback.
