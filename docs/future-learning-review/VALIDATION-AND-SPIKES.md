# Synthesis validation and experiment receipts

**23 October 2026.** Supplements the [original evidence register](EVIDENCE.md). Source baseline remained V2 `fac857a685e49699a737accf0e63484b8f6c2dcf`, native `90804f2c90cacbd369e15206291a116c78f61423`, common tree `04d23f927dce3a6af5cb130f45abac8651c4f7de`. PR27 synthesis started at draft head `e153f126b993175ad7d065ed07eb5a5fcc2d72b3`.

## Actual work, not proposed acceptance

| Experiment | Observed result | What it does not establish |
| --- | --- | --- |
| Two current Readers, synthetic SSR | Four duplicate DOM IDs across two distinct records with common local section/part IDs | Browser selection corruption was not executed or quantified; a second unchanged active Reader is unsafe to assume |
| Hosted installed manuscript preview | Valid prospective Area with two section-scoped curated links; two Articles each with a separate unscoped Area membership; no manuscript warnings | No publish, saved membership readback or new hub UI was tested |
| Fixed 40-case retrieval experiment | FTS AND and local-ranking AND improve labelled destination recall; OR adds irrelevant candidates; exact case/punctuation retained | Not a production-query benchmark, real learner study, or comparison with competent GPT search reformulation |
| Local Miniflare D1 probe | FTS5 create/insert/MATCH/BM25 worked in current dependency runtime | Not a hosted Sites D1 performance/support receipt |
| Synthetic browser interaction study | Task/reference/writing flow, settings and history inspected; focus and off-screen writing deficiencies corrected and retested | Not the real React workspace, canonical selection, save/recovery or physical-phone behaviour |

### Reader rendering

[reader-scope.mjs](spikes/reader-scope.mjs) bundles and renders the actual current `app/reader.tsx` using existing dependencies and two original synthetic records. [Recorded result](spikes/reader-scope-results.json): duplicate `passage-__article-__title`, `section-s1`, `passage-s1-__heading` and `passage-s1-p1`, each twice. React's own generated IDs are not the issue. The test writes only a temporary bundle and removes it; no application records/storage/network are used.

```sh
node docs/future-learning-review/spikes/reader-scope.mjs /absolute/minamo-v2-checkout
```

This is a baseline research diagnostic, not a release test to keep expecting a bug after the Reader is fixed. The design requires either isolated passive output or proper instance-scoped rendering/interaction.

### Hosted subject-hub authoring feasibility

Called installed `preview_minamo_manuscript` once with `synthetic: true`, `detail: true`, test-only identity and a brief explicitly denying publication. Three original documents: one Area with two curated section links, and two Articles declaring meaningful Area membership through the existing catalogue input.

The response returned `valid: true`, no manuscript warnings and only `coverage_not_inspected` advisory. Area links carried section source contexts; each Article received a separate unscoped Area link. [Bounded result receipt](spikes/hub-preview-result.json) contains synthetic titles and structural evidence, not learner data. These were predicted records only; no publish/apply call, source edition, operation receipt or cleanup mutation occurred.

This verifies the authoring representation assumed by the hub design. Current catalogue source separately establishes that membership excludes contextual links. A future implementation still must prove the rendered hub and saved membership/revision behaviour.

### Retrieval

See [method, limitations and reproduction](spikes/RETRIEVAL-SPIKE.md), [fixed fixture](spikes/retrieval-fixture.json), [Python experiment](spikes/retrieval-spike.py), [per-case results](spikes/retrieval-results.json) and [local D1 probe](spikes/retrieval-d1-probe.mjs).

The parent review independently reran both the D1 probe and the complete Python experiment successfully; the same destination/negative-case counts and payload sizes reproduced. Timings varied as expected. The experiment includes a real global-BM25 noninterference counterexample and a per-passage local-score invariance check. Simplified SQL eligibility canaries do not prove Minamo's current-rights, owner/generation and recovery integration. No production index or migration was installed.

### Browser prototype and corrections

[Source](spikes/ui/public/index.html), [behaviour](spikes/ui/public/app.js), [styles](spikes/ui/public/style.css). Buildless, synthetic, local only; no Minamo APIs, execution, external services or server-save claims. The local preview manifest contains no Site identity or production bindings.

```sh
sites-preview start /absolute/minamo-v2-checkout/docs/future-learning-review/spikes/ui
```

Use the exact URL returned by the supported preview command. The preview may replace another task-local preview; stop it afterwards. This is not a deployment command.

Observed sequence:

1. Wrote a test-only scratch thought; navigated Library → Journey; the value remained.
2. Opened a reference. Initial prototype reconstructed primary DOM and put writing below the viewport; closing lost focus. This identified actual weaknesses in the prototype, not new measured defects in production.
3. Corrected stable primary DOM ownership, allocated viewport space and explicit focus return. At a desktop viewport height of 936 px, writing's bottom was 936 px; main/reference widths were 843/360 px. Closing returned focus to the invoking action and retained writing.
4. Checked a 390 px container: reference replaces the primary view; writing remains available, bottom at 920 px in the 936 px browser viewport. This is a constrained desktop layout, not device emulation or an Android keyboard test.
5. Changed local reading size from 16 to 19 px; writing and reference state remained, and settings close returned focus. No source text changed.
6. Opened a reference URL directly in a new tab. Closing retained the task URL and writing rather than blindly leaving the Site; after correction, focus returned to the primary main region when no opener existed.

Prototype URLs/state and local test drafts are not production records. The prototype intentionally omits full canonical interactions, API error states, real Note synchronization and responsive keyboard handling; those remain implementation acceptance work. No screenshots containing private learner material were committed.

## Research and specialist challenge

- Two specialist source/product reviews independently identified Reader DOM/selection isolation, hub membership-versus-curation, explicit reference Note context, existing tutor-read reuse and preference recovery costs. Their findings were reconciled into the selected design rather than treated as a vote count.
- A separate bounded retrieval experiment produced the fixed fixture and reproducible comparisons. Its caveats and negative results remain in the PR.
- A final engineering challenge identified a missing index-readiness mechanism. The plan now specifies a derived version/readiness watermark, immediate literal fallback, awaited bounded rebuild and an atomic generation/version check before readiness. This prevents disposable indexing failures from rolling back canonical publication. Broad namespace invalidation costs must be measured rather than ignored.
- Context7 retrieved primary Cloudflare D1 guidance for FTS/virtual-table export and official React state-preservation material. The first version-pinned React query returned compiler fixtures rather than useful conceptual guidance; the official documentation query supplied the relevant source. No unsupported runtime API was inferred from the poor result.
- [Cloudflare D1 export limitations](https://developers.cloudflare.com/d1/best-practices/import-export-data/) were independently retrieved: virtual tables affect native database export. Minamo uses its own protected recovery enumeration; integrating a derived index still requires explicit validation.
- [React: preserving and resetting state](https://react.dev/learn/preserving-and-resetting-state) supports retaining component identity across pane/layout changes. The current Notes ownership and existing draft safeguards remain the implementation base.
- Stack Overflow for Agents was consulted with generic technical queries, without private project details. No relevant FTS5 post was found; no post was relied on or contribution published.
- Sites metadata confirmed current V21 and no connected-app requirement. Exposed tool discovery still supplied no plugin-eligibility operation. A hosted connector test was therefore not a valid way to resolve that absence; no declaration, credential or access change was made.

No live deployment was needed to establish the tested claims. The owner authorised such experiments if useful, but a production deployment would not resolve the unexposed connector eligibility function. Hosted FTS scale/performance, integrated canonical preview behaviour, fresh-GPT transfer and physical Android acceptance remain explicit implementation gates.

## Focused four-area continuation

See [focused assessment and reconciled decisions](FOCUSED-CHALLENGE.md). Added actual local-domain/D1/MCP continuity cases (seven narrow checkpoints, older correction/withdrawal, optional perspective and one verbose checkpoint), an independent agent tutoring simulation, the actual organiser predicate over 100 synthetic Notes, and richer browser prototype content/feedback correction. Their measurements and limitations are recorded there and in [continuity metrics](spikes/continuity-challenge-results.json). None is an installed fresh-ChatGPT or physical Android acceptance claim. Current production V21 and native source remain unchanged.

The current fixture can optionally emit entirely synthetic response bodies for repeat assessment; no private corpus is required. Primary VisualViewport and W3C target-size guidance supplemented the existing React/focus evidence.

## Validation boundary

Research scripts passed syntax/JSON checks; source rendering and local D1 probes passed; the retrieval experiment's assertions passed. Markdown links/source paths and final remote Git blob/file diff are checked before publishing this draft update. Full production typecheck/build/test suite was not rerun because production source/dependencies are unchanged. No new released capability or full integrated acceptance is claimed.
