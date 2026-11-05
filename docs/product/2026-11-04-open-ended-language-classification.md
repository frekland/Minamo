# Open-ended language classification — draft implementation blueprint

4 November 2026. **Documentation only; not an implementation or deployment commission.**

## Product intent

Minamo should let learners study **any language**, including minority and less commonly taught ones, without shipping a new app version for each language. A genuine **Tetum** Project was created on 4 November (`tetum-neighbours-20261104`) with eight lessons and useful resources, but the current language allowlist prevented classification as Tetum.

This is a bounded change to classification, filtering, MCP schemas and minimal UI affordances. It is **not** a new translation engine, dictionary, curriculum, proficiency tracker, global-navigation redesign or language-specific renderer. Preserve natural GPT/MCP authoring and the current six Project layouts.

## Verified code seams (public `main`)

- `lib/learning-spaces.ts`: `LEARNING_LANGUAGES=['ja','zh-Hans','zh-Hant','fr','es','el','de','sv']`, `SupportedLanguage` union, and rejection in `validateLearningScope` / `parseLearningScopeQuery`.
- `lib/domain-handler.ts`: the same eight choices are embedded in the `learningScopeSchema` and `learningScopeProperties` MCP/HTTP JSON schema enums.
- `lib/contracts.ts`: `WorkspaceRecord.learningScope` references the central contract; `lib/domain.ts` consumes its validation and query helpers.
- `v2_learning_scopes` sidecar and existing record JSON already support arrays; SQL filters bind values and classification uses CAS/idempotent receipts. No new language database or bulk data migration should be needed.
- Existing global scopes remain **All / Computing / Languages / Other**. “Other” is unclassified, not a separate taxonomy.

This is a targeted read of known code seams, **not a complete audit of every UI consumer**. PR #83 is actively shipping Project/tldraw work (V112 when checked), so implementation must reconcile the latest public and protected Sites/native source rather than assume `main` matches production.

## Proposed data contract

Keep `learningScope.version:1`, `spaces`, `provenance` and the optional `languages` array. Change language identifiers from a closed eight-member union to **canonical, well-formed BCP 47 source-study tags**:

```ts
type LanguageTag = string; // bounded and validated at trust boundaries
type LearningScope = {
  version: 1;
  spaces: ('computing'|'languages')[];
  languages?: LanguageTag[];
  provenance: 'authored'|'classification';
};
type LearningScopeQuery = {
  learningSpace?: 'all'|'computing'|'languages'|'unclassified';
  language?: LanguageTag;
};
```

Examples: `['tet']` for Tetum; the existing `['ja']`, `['zh-Hans']`, `['zh-Hant']`, etc. remain valid unchanged. Subtags may specify script/region where appropriate, but must not be presented as guaranteed dialect labels; “Tetun Dili” can remain a Project description.

**Validation:** Use one Worker/web-compatible BCP 47 normaliser (assess `Intl.getCanonicalLocales` or a small standards-aware helper). Canonicalise case, detect duplicates after normalisation, reject malformed/overlong/non-string tags and invalid queries, preserve the current bounded eight-tags-*per-record* limit initially. Require Languages space if `languages` is set. Continue binding SQL parameters. Never infer classifications from titles, passages or UI locale.

**Compatibility:** Existing eight-language records and queries remain valid without migration. Preserve explicit and inherited scopes, Note/Flag associations, owner isolation, revision/CAS, sidecar classification receipts, exact source renditions and recovery. Do not automatically reclassify real Projects.

## Implementation boundaries

1. `lib/learning-spaces.ts`: replace enum validation with shared normalisation/validation for writes, read filters and sidecar classification; keep inherited and SQL semantics.
2. `lib/domain-handler.ts`: replace eight-value JSON schema enums with bounded string tag descriptions in every MCP and HTTP declaration (including optional `language` query argument). Preserve clear errors.
3. `lib/contracts.ts`, `lib/domain.ts` and typed clients: propagate `LanguageTag`, using the same validator and permission/CAS boundaries.
4. UI/Projects/Library: locate fixed language labels or controls and allow arbitrary valid tags through a small accessible text-entry path with optional suggestions. Display names with `Intl.DisplayNames` or existing mapping when available, falling back honestly to the code; no giant hardcoded dropdown.
5. Capability guidance: language refers to **study subject**, not UI locale. After an authorised MCP schema release the owner may need to reinstall/refresh the existing personal plugin for host-visible tools.

Do not add another database table, independent taxonomy, custom NLP adapters for each language, compulsory proficiency scales, language-specific furigana/tone behaviour or changes to the compact global scope switcher. Such features may remain opt-in for relevant languages.

## Focused acceptance

- Creating or explicitly classifying a Project with `languages:['tet']` succeeds. Read, update, composition, refresh and language filtering preserve the exact tag/content; it appears under Languages, not Other.
- Existing `ja`, `zh-Hans`, `zh-Hant`, `fr`, `es`, `el`, `de`, `sv`, mixed-scope and inherited personal records still behave exactly as before.
- Invalid/duplicate/oversize tags and incompatible space/query combinations yield bounded errors; owner rights and SQL parameterisation remain intact.
- Sidecar CAS, idempotent operation receipts and rendition boundaries survive classification updates; no fabricated learner achievement.
- An obscure tag works in the native UI, including narrow screens and keyboard navigation, with a safe name fallback.
- A fresh MCP host session after an authorised deploy (and optional plugin refresh) actually accepts `tet`; compiled code alone is not enough verification.

## Commission and release sequence

1. After current PR #83 work stabilises, inspect current native/public source, generated schemas, UI consumers and relevant tests.
2. Implement only the coordinated contract/MCP/minimal UI change; no migration or broad redesign.
3. Run focused contract, SQL, inheritance, CAS, MCP, compatibility and UI checks plus typecheck/build; follow current AGENTS.md and the fast Sites release workflow for auth/schema safety.
4. Seek **separate owner authority** to implement/deploy/merge. Preserve protected Site access, credentials and data.
5. Classify the existing Tetum Project as `tet` only on a later explicit owner request, with exact current revisions; this planning PR does not mutate learner data.

**Current status: draft proposal only.** No app code, production configuration, MCP schema, database or real Project changes.


---

## 4 November addendum — language-friendly Project interactions

**Owner direction:** In addition to removing the prescribed-language list, make existing Project sections substantially more useful for language study through a small number of reusable, *offline/client-side* content interactions. The owner does **not** want a hosted text-to-speech service, token-metered language backend or poor native browser speech synthesis. **Later 4 November lab testing approved optional browser-local Piper/Piper Plus TTS; see the superseding addendum below.** Real conversation can happen through ChatGPT Voice or with people. These additions should also benefit other subjects.

**Product thesis:** Keep Dashboard, Guide, Notebook, Workbench, Board and Research as the six structural patterns. Improve the **content blocks inside them**, not the hierarchy of Projects or the top-level navigation. Reuse the current PR #83 image-backed flip flashcards, parameter explorers, rich content, source/media handling and native composition where feasible.

### Six selected learner capabilities

| Capability | Existing patterns | Experience | First-pass engineering direction |
| --- | --- | --- | --- |
| Progressive bilingual reading | Notebook, Guide, Research | Target text first; separately reveal translation, word glosses and explanation | Small typed reveal presentation on existing reading content; avoid duplicating canonical source text or requiring a new reader |
| Sentence-pattern explorer | Workbench, Guide | Change selected pronouns/verbs/negation or other authored variables; see a valid sentence and its meaning | Extend the existing parameter-explorer model to **finite textual choices**, not a grammar-generation engine |
| Turn-by-turn dialogue rehearsal | Guide, Workbench | Predict next utterance, reveal it, optionally reveal translation/natural alternative, restart | Bounded authored sequence renderer using local disclosure state |
| Reversible and cloze flashcards | Board, Workbench | Reverse existing cards; hide a specified word/phrase inside a contextual sentence; reveal the missing span | Add modes to the existing flashcard renderer; retain images, shuffle, keyboard and persistence |
| Corrections and discoveries | Notebook, Workbench | Original learner attempt beside corrected form, short why, one reusable example | **No new schema initially:** existing attributed text/table/callout blocks and user-requested MCP Project updates |
| Authentic listening + transcript reveal | Research, Guide | Play an eligible recording, listen first, reveal transcript/translation, optionally repeat | Reuse admitted uploaded or explicitly linked media; narrow transcript disclosure UI only if existing media controls are insufficient |

Add **cultural pragmatics / register** as normal authored explanations accompanying examples (when natural, formal, inappropriate, uncertain), not a seventh renderer or a separate cultural-scoring system.

### Core interaction contracts and important constraints

**1. Reveal block / layered reading**
- Keep the target-language original visible by default. Translation, phrase gloss and grammar notes are independent reveal controls, not one large permanently visible English translation.
- Support Unicode and right-to-left text; do not split text by English whitespace assumptions. Semantic pronunciation/reading annotations (Japanese ruby, future Pinyin/IPA where explicitly authored) are optional overlays, not mandatory language adapters.
- A reveal affects **ephemeral view state** only. It cannot mark something learned, change a source rendition, or silently save a Note. Maintain accessible disclosure labels and keyboard focus.
- Preserve exact source attribution and anchors; never fabricate dictionary entries from a click.

**2. Sentence-pattern explorer**
- Model editable slots as bounded choices (e.g. subject = hau/nia/sira, action = aprende/koalia, negative = yes/no). Present the **authored output sentence and explanation** for a combination, rather than concatenating arbitrary tokens and hoping the result is grammatical.
- Permit authored valid combinations / condition rules with bounded size; reject incomplete or contradictory combinations. Keep all evaluation as inert text/data, not model calls, arbitrary JavaScript or a client-side NLP engine.
- UI offers small selectors or toggles, reset, rendered result, optional grammar explanation and an ordinary text fallback. Reuse the existing parameter-explorer renderer where cleanly possible; a small typed variant is acceptable if it keeps the contract simple.
- Works for languages where changing a subject does alter a verb or word order. Never encode Tetum's comparatively stable verb forms as a universal rule.

**3. Dialogue rehearsal**
- A finite, editable array of speaker-labelled turns; each may contain target text, optional translation, note and a few authored alternatives.
- Reveal next turn; optionally reveal translation; restart. Show the conversation in logical DOM order with keyboard access and a readable linear fallback. No live chatbot or pseudo-assessment. Optional local TTS playback is covered by the later addendum.
- Avoid assuming all dialogues alternate exactly between two people or have a single obligatory natural response.

**4. Flashcard extensions**
- Add an explicit reverse-direction practice toggle (respecting authored cards that only make sense one way).
- Add cloze cards using authored stable text segments/marked blanks, not brittle raw-string replacement. Keep the original intact and show an accepted completion on flip.
- Reuse existing image-backed, shuffle, next/previous, persistence and direct-edit semantics. Do not build a second deck database or spaced-repetition engine.

**5. Personal corrections**
- Keep the original learner wording, the correction, its provenance/uncertainty and a new example together. Distinguish *learner-supplied*, *GPT suggestion* and *native-speaker-verified* where known; never silently upgrade a suggestion to verified fact.
- The learner may ask GPT “add this useful correction to my Project.” Use the existing bounded Project/Note edit flow, revision CAS and explicit authority. No automatic transcription, per-turn write, error score or compulsory review backlog.
- If this later warrants a compare-card presentation, derive it from existing content rather than a new record family.

**6. Authentic listening**
- Reuse permitted owner-uploaded audio or deliberate external links. Simple play/replay and reveal of an **authored** transcript/translation are valuable without generation.
- No generated audio should masquerade as an authentic recording; no paid speech API, automatic transcription, remote media scraping, unverified playback or copyright-unsafe import. Optional local TTS is a separate capability in the later addendum. Missing/unavailable audio must leave readable text and an honest source link.
- Audio looping and time-range segmentation are optional polish, not prerequisites for first delivery.

### A concrete Tetum walkthrough (source-language generic)

- **Guide:** Read `Hau aprende Tetun.` with English hidden; reveal “I'm learning Tetum” and optional word gloss `hau = I`, `aprende = learn`.
- **Workbench:** Explore authored choices like `Hau/Nia/Sira` + `aprende/koalia` + optional `la`, showing each valid resulting sentence and meaning. An authored note explains why Tetum verbs often retain the same form; another language can supply different valid outputs.
- **Guide:** Rehearse `Bondia! Di'ak ka lae?` turn-by-turn, reveal a reply, see a contextual explanation and restart.
- **Board:** Review the same expression as an image-backed card, a reversed card or a contextual cloze (without duplicating the original source record unnecessarily).
- **Notebook:** After a genuine exchange, preserve the learner's recollection and an attributed correction only if the owner asks GPT to add it.
- **Research:** Link to the Peace Corps source/recordings already referenced in the Tetum Project; disclose a permitted transcript only when authored/admitted. Do not imply the recording was fetched, licensed or played without evidence.

These are illustrative examples, not claimed native features or evidence that a learner has completed them.

### Priority and delivery boundaries

The smallest high-value first slice is **progressive reveal + reversible/cloze modes on the existing flashcards**. These should be practical, independently useful and testable without new backend architecture.

Next slice: **textual pattern explorer + dialogue reveal** (some validation and responsive interaction work, but still bounded). Keep a single shared typed artefact/revision mechanism and natural GPT/MCP authoring parity.

**Corrections/discoveries** can work immediately with existing Project rich blocks and explicit GPT updates; only add a specialised presentation if the actual Tetum Project shows a need. **Authentic audio/transcript reveal** follows existing media rights and playback capabilities; do not enlarge this into an audio platform.

This addendum belongs in PR #85's **planning scope**, not an instruction to implement every item in one risky release. During code preflight, reconcile PR #83's exact current flashcard/parameter-explorer contract and Sites/native source. It may be sensible to ship in 2–3 small verified checkpoints; do not build a duplicate UI beside PR #83.

### Focused acceptance for language interactions

1. GPT/MCP can create and revise examples in a normal Project and place/rearrange the blocks using the current composition CAS, while preserving direct learner edits, stable IDs, protected sources and revision receipts.
2. A learner can use progressive reveal and cloze/reverse cards without a network model call. Revealed English does not permanently contaminate source text, and the correct original is still available.
3. A text-pattern explorer has a small finite set of vetted outputs. Invalid options are rejected; no grammatical sentence is invented by uncontrolled token concatenation. Changing/resetting a value is repeatable.
4. A dialogue can be revealed turn by turn, translations toggled and the sequence restarted with keyboard, touch and screen reader support; 320/375/768 px layouts remain readable.
5. Existing Japanese furigana/semantic annotations, Mandarin content, code/diagrams, image flashcards and numerical parameter explorers still work. Test a Latin-script language, a CJK-script example and an RTL layout where available.
6. Source media rights, privacy and unavailable-resource fallback are retained. Never imply TTS, an audio recording or a translation was verified unless that actually happened.
7. No progress/memory score, streak, “mastery” inference or automatic learner-record mutation arises from flipping, revealing, trying or restarting.
8. At least one honest adult-learner scenario (Tetum) is inspected in the deployed browser after a future authorised implementation; schema tests alone do not establish usefulness.

**No code, release, data or MCP changes are authorised by this document-only PR.**


---

## 4 November addendum — local TTS, verified in a separate lab

**Decision update (supersedes earlier blanket “no TTS” language in this draft):** The owner now wants an *optional, free, entirely browser-local neural speech capability* alongside language Project text. The earlier ban on a hosted TTS service, paid speech APIs, per-request tokens and native Web Speech remains. This is a deliberate change following direct device testing, not an instruction to import the entire experimental lab into Minamo.

### Evidence and boundaries from the owner’s lab

The owner tested the separate private **Minamo TTS Lab** on a Pixel 8a, including initial download, generation speed, voice quality, Japanese pronunciation and slow playback. These are **owner observations**, not a full browser/device compatibility study.

| Candidate | Observed decision |
| --- | --- |
| Original Piper, browser-local voices | **Preferred for all individually verified non-Japanese languages.** Fast and useful on Pixel 8a despite a somewhat synthetic timbre. |
| Piper Plus, Japanese CSS10 demo voice | **Preferred for Japanese only.** Japanese was intelligible, good and responsive enough; owner approved the resulting practice pacing. |
| Piper Plus multilingual modes beyond Japanese | **Do not enable.** The owner's trial generated unintelligible speech for other languages, despite the advertised language settings. |
| Kokoro | **Do not integrate in the first slice.** English quality/performance compared unfavourably on the owner's phone, with long load/generation times. |
| Native Web Speech / remote API | **Excluded.** Browser-native quality was unacceptable; paid/hosted inference and token costs are outside the product decision. |

A language tag should **never imply a usable voice exists**. Open-ended BCP 47 language classification remains independent of the optional, finite *verified voice catalogue*. Tetum is a legitimate Project language even if no Tetum TTS model is available. Do not silently substitute a different language or a poor-quality voice.

The lab is a **comparison prototype**, not a new learner-facing Minamo module or a dependency on the lab Site. A subsequent implementation commission should inspect the lab source and pinned versions, reconcile them with the then-current Minamo PR #83 composition and native Sites sources, and extract only the appropriate reusable behaviour. It must not copy a brittle lab-only patch uncritically.

### Small learner-facing contract

- Language Projects keep their six normal layouts and language-practice blocks. Attach a discreet, accessible **listen/play affordance next to eligible authored target-language text** in reading/reveal, flashcards, dialogue turns and sentence-pattern outputs, rather than a separate speech page or a full voice dashboard.
- Expose **Normal** and **Slow practice** as the default everyday choices; repeat the phrase with one action. Optional per-phrase replay is better for study than stretching a long mixed sentence indiscriminately. Never force audio generation just to reveal text.
- **Japanese / Piper Plus CSS10**: the owner-approved synthesis settings are:
  - Normal: \`lengthScale: 1.6\`, \`noiseW: 0.2\`.
  - Slow practice: \`lengthScale: 2.4\`, \`noiseW: 0.2\`.
  These apply to the tested Japanese model/path, **not** globally to Piper voices or to arbitrary future model revisions.
- Use **synthesis-time pacing**, not crude \`HTMLAudioElement.playbackRate\` slowdown, which the owner found distorted. Avoid surfacing \`lengthScale\`, \`noiseW\` or inference terms in the standard UI. Advanced lab controls remain in the lab.
- For other verified Piper voices, start with the model’s readable normal behaviour; establish **voice-specific** slow presets through direct listening before claiming quality. Do not import the Japanese numeric settings as universal defaults. Allow a text-only fallback if a slow preset is unsuitable.
- Play the **source-language utterance**, with correct language/voice mapping. Keep translations, glosses, Japanese authored ruby/furigana and Mandarin authored pinyin separate from the synthesis input. Handle scripts, RTL direction and Unicode without assuming space-delimited words; do not promise perfect G2P or pronunciation.
- Capability should be optional and unobtrusive: if unsupported, offline before cache fill, not yet downloaded, incompatible, or failed, the text and reveal/dialogue/card remain fully usable. State clearly when a voice is unavailable instead of falling back unnoticed to Web Speech, English or a remote service.
- A single small **voice-download/load state** and clear error/retry affordance are sufficient. Most voice selection/diagnostics belong in Settings, not the learning card. Preserve keyboard, screen-reader and touch operation, and respect autoplay/user-gesture restrictions.
- Keep **authentic recordings** separate from generated speech. A cited human recording/transcript is not equivalent to synthetic playback and must keep its original attribution, rights and source status.

### Implementation architecture — limited, browser-local

1. Introduce a small **optional voice capability adapter** at the presentation layer: \`languageTag → verified model/voice → local synthesizer → playable audio\`. Do not tie language classification or existing Project schemas to model availability; no new mandatory Project field, record family or database.
2. Package browser-run inference (WASM/ONNX or the verified browser runtime) as lazy-loaded, worker-isolated code where supported; render text immediately and download/initialise a model **only on user action**. Cache version-pinned model assets using ordinary browser caching where safe. Cancel/reject stale results and release audio object URLs/worker resources to avoid memory creep on mobile.
3. **Original Piper** for vetted non-Japanese voices; **Piper Plus** for Japanese only. Fix the exact runtime/model version and voice file, record expected download sizes, media types, integrity/provenance, availability and feature detection in the implementation report. Keep a bounded catalog that can grow without revising the BCP 47 classification contract.
4. The experimental lab may have exposed Piper \`length_scale\` through a **Vite build-time adapter** because its browser wrapper hardcoded the setting. Treat that as a lab-specific technique requiring a maintainability review; choose a clean pinned adapter/upstream API if possible and test production bundling. Piper Plus has separate synthesis options; do not assume both engines accept identical parameters or audio formats.
5. Model files are generally **downloaded by the visitor's browser**, not sent to a paid inference backend. Someone must host the initial bytes—approved CDN/upstream or a deliberate static-asset mirror—and browser caching does not remove bandwidth, CORS, availability, cache-eviction, integrity or origin-policy considerations. Do not silently bundle large models into Minamo’s initial JS payload or assume Sites can economically host every model.
6. Check **runtime, model/voice weights, phonemizer and supporting library licenses individually** (including any obligations around distribution or asset mirroring) before production. Verify upstream attribution and terms; do not rely on a blanket “Piper is MIT” or “Piper Plus is MIT” claim as a complete commercial/use/distribution assessment.
7. No text-to-speech API keys, per-request billing or server-side inference. Model downloads may contact their permitted host; **the text to be spoken and generated audio remain local to the browser**, barring normal user-selected media and explicitly disclosed telemetry policy. Never record spoken inputs, audio or pronunciation performance in learner records without a separate explicit feature decision.
8. Integrate with current Project block rendering and natural GPT/MCP authoring without changing saved source text or revision receipts. Synthesis is a view action, not a learning-history mutation. Ensure no uncontrolled renderer duplication, new seventh layout or compulsory audio field.

### Sequenced implementation and focused acceptance

**Preflight before commission:** Inspect the currently deployed native source and PR #83 renderer; read the actual independent lab source and runtime/model manifests; assess package and model licensing, cross-origin hosting, size, caching and Japanese text handling. Report any incompatible voice/runtime rather than promoting it.

**First slice:** One discreet play control for vetted original Piper examples and Japanese Piper Plus in a real language Project, with a lazy load/retry, human-readable availability, exact source text, Normal/Slow selection and text-only fallback. Keep the six Project layouts and existing language interactions intact. Expand placements to other rich language blocks only after this end-to-end slice is verified.

**Tests/checks:**
- On the owner’s Pixel 8a, compare the **same Japanese utterance** in Normal \`1.6/0.2\` and Slow \`2.4/0.2\`, with intact words, clear pacing and reproducible output. Test a longer sample, a short phrase and the previously inconsistent middle phrase \`いろいろな国の人と自然に話して\`; quality is an owner listening judgement, not an automated pass.
- Check at least two distinct, licensed, **non-Japanese original Piper voices** in their actual target languages; do not enable unverified multilingual Piper Plus modes. An Arabic/RTL and CJK scenario should be considered when suitable licensed voices exist, with honest coverage limits.
- Cold first download, repeat play, reload/cache hit, offline after caching, cache eviction, unsupported browser, failure/retry and low-memory mobile operation. Observe sizes, startup latency, cancellation and leaks; avoid mandatory preload.
- Confirm locally generated sound and that no utterance text or inference request is sent to a TTS backend; verify model-download origins, version pins, CORS, license notices and relevant hosting policy.
- Confirm keyboard/screen reader/mobile 320/375px, user-gesture playback, focus, text-only usability and no surprise audio. Check reveal, dialogue, cloze, images, note drafts, CAS, native-source editions and GPT/MCP content updates remain unchanged.
- Produce a bounded **real learner-use observation**, not merely green unit tests or claims that synthesised Japanese sounds “native”.

Implementation, release and the final voice catalogue remain **separately commissioned**. This PR is still documentation-only; no lab or production code, voice assets, model downloads, data, MCP schemas or Sites configuration change is approved by this addendum.

### Related design direction — deferred, not part of this implementation

The owner also likes the **TTS Lab’s soft rounded cards, differentiated inset panels, restrained borders and generous spacing**. In Minamo, preserve the existing **charcoal dark theme**, strengthen surface hierarchy (page canvas → raised content card → inset/status area), and soften corners without adding nested boxes everywhere. This is an **app-wide visual-system follow-on**, not a language renderer change and **not a release criterion for PR #85**.

Proposed *curated* Settings themes (illustrative tokens, not yet an implementation spec):
- **Deep Ocean** — charcoal, cool blue-grey surfaces and subdued cyan/blue accents (preferred default, explicitly *not* green).
- **Midnight** — charcoal with restrained indigo-blue.
- **Graphite** — cool grey/steel-blue, almost monochrome.
- **Dusk Violet** — a slightly brighter but **non-neon** smoky violet/lavender accent against charcoal, as approved in discussion; sample palette: canvas \`#191821\`, card \`#2B2839\`, inset \`#393249\`, border \`#514563\`–\`#645477\`, action \`#775A9E\`, accent \`#D2B2FA\`, main text \`#F5F0FA\`.

Prefer **shared CSS design tokens** and a small persisted Settings preset choice over an unrestricted colour picker. Verify contrast, focus, Project/Library/Notes consistency and mobile hierarchy before any future implementation. Commission in a **separate PR** once concurrent PR #83 work stabilises; do not create styling churn in this language PR.
