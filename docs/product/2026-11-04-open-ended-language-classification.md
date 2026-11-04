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

**Owner direction:** In addition to removing the prescribed-language list, make existing Project sections substantially more useful for language study through a small number of reusable, *offline/client-side* content interactions. The owner explicitly does **not** want a text-to-speech service, token-metered language backend or dependence on poor browser speech synthesis. Real conversation can happen through ChatGPT Voice or with people. These additions should also benefit other subjects.

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
- Reveal next turn; optionally reveal translation; restart. Show the conversation in logical DOM order with keyboard access and a readable linear fallback. No live chatbot, TTS or pseudo-assessment.
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
- No TTS, paid speech API, automatic transcription, remote media scraping, unverified playback or copyright-unsafe import. Missing/unavailable audio must leave readable text and an honest source link.
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
