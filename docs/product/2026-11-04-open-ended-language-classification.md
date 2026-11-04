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
