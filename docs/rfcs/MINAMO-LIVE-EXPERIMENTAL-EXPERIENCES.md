# PR #12 — Live experimental experiences on Minamo Sites

**Status:** Explicit owner-authorised development and acceptance policy for PR #12. Supersedes earlier blanket prohibitions on production Site deployment and MCP changes **for isolated, opt-in experimental capabilities**. It does **not** authorise destructive migrations, replacing the stable interface, or modifying genuine learning content without a separate validated request.

## Rationale

Minamo already has a reliable production Site, live MCP read/authoring, genuine content and readily accessible Sites deployment. Restricting new user experience work to local GitHub builds would discard the main advantage of this mature product. A worthwhile prototype should be **directly usable on the deployed Minamo Site**, with real authorised data, real responsive behaviour, actual Japanese ruby/TTS, navigation and rich interactive components.

A real-data fixture and isolated D1/R2 test environment remain useful for repeatable comparison, migration rehearsal, edge cases and stress tests. They are **not** an alternative to live visual acceptance. The desired process is:

**Existing production source + real-content fixture → local tests → feature-gated Site deployment → owner switches among experiences in Settings → browser/MCP acceptance → refine or discard → promote only the proven direction.**

## 1. Multiple concurrently available frontend experiments

- Introduce a small, coherent **experimental experiences** area in **Settings**, initially disabled/closed by default. The owner should explicitly enable a prototype and select one among available alternatives or the stable experience. Names/labels should describe concrete experiments rather than turn casual brainstorm words into product taxonomy.
- The existing Home, Projects, Library, Your Work, Notes, current Project reader and existing navigation **remain the default and continue functioning**. Switching back to the stable interface is immediate and simple.
- A choice should survive ordinary navigation and reloads for its intended scope; use existing `lib/presentation-preferences.ts` / `app/presentation-settings.tsx` where appropriate. Current presentation preferences are device-local; don't silently make an experimental selection global to other devices unless explicitly designed. Preserve backward compatibility with existing stored preference versions.
- For radically different concepts, don't force a variant into the same DOM/layout component. Feature-gated alternate routes/reader shells may be more reliable than nested conditional logic throughout `app/workspace.tsx`. Share canonical source resolvers, permission policies and rich presentation primitives; isolate prototype-specific state/navigation.
- The settings entry is only an access point for experimentation, **not** an excuse to create another large settings dashboard. Avoid experimental banners or switching controls scattered around normal study pages. Provide a simple accessible return to stable experience if the experiment is unusable, broken or incompatible with a record.
- Support more than one prototype at once, so owner/browser tests can compare genuinely different composition, orientation and reading ideas against the **same** real material. Do not let each experiment silently create its own duplicate source corpus.

## 2. Deployment policy

- **Deploy opt-in experiments to the existing production Minamo Site as needed.** This is an intended, repeatable part of the development cycle, not a last-resort exception. Owner has explicitly authorised Site deployment of experimental frontends as part of PR #12 exploration.
- Keep experiments hidden from normal navigation by default and inactive until the owner enables them in Settings. Where an experimental route might otherwise be reachable directly, apply sensible owner/session eligibility and an explicit feature/experiment gate; hiding a link alone is not an access control.
- All new experimental source reads must use established owner-scoped, rights-filtered current/retained record projections. Any experimental persistence should be namespaced/isolated and revisioned, with migration/recovery/cleanup rules. Default prototype flows are read-only against existing canonical content; do not silently rewrite original Projects or Notes.
- **No forced production migration or overwrite** of established record contracts merely to display a prototype. When a backend/schema migration becomes necessary, rehearse it with the fixture corpus and have a tested compatibility/rollback strategy before deployment.
- Run typecheck, relevant unit/integration tests and production build; verify deployment and inspect actual desktop/mobile views. Measure actual discovery, rendering, interactive behaviour, navigation and return-to-stable experience. If a deployment fails, restore the prior functional baseline.
- GitHub is the owner-confirmed current production-aligned source baseline at the start of this work. A native Sites deployment may make deployed source newer: reconcile each deployed change back into GitHub with a reproducible commit/manifest. Never silently overwrite a newer native Sites change with an older GitHub snapshot. Leave PR #12 draft/unmerged even when experimental code has been deployed.

## 3. MCP contract policy: minimise churn, not forbid progress

- Prefer the **existing live Minamo MCP** for authentic read-only corpus discovery, real-world acceptance and user-authorised authoring.
- New MCP operations/schema or policy changes are **permitted if they materially enable an approved experimental product capability**, particularly cross-record retrieval/composition or independent accumulation. They are **not necessary** for each purely visual iteration.
- Introduce the narrowest useful operation, with typed, client-visible parameters and backwards-compatible behaviour. Test it end-to-end through a **fresh real ChatGPT connection** after deployment, not merely backend unit tests or the advertised schema. Avoid opaque parts objects and repeated reinstall cycles due to speculative contract work.
- Apply existing ownership, source-rights, revision, CAS/idempotency, generation, Notes and deliberate-write policies. Allow experimentation with new persisted arrangements **only when explicitly scoped and separated from canonical learning source edits**.
- Document exactly when the connector was extended, why and how tested. Do not claim cached schema clients can discover new parameters until refreshed.

## 4. Reusable test-corpus support

The [real-corpus development harness](MINAMO-REAL-CORPUS-DEVELOPMENT-HARNESS.md) remains a first-class deliverable. It supports fast local tests, model comparisons, migration impact analysis, regression fixtures, and synthetic two-year scale. It should complement, **not delay for its own sake**, owner-visible deployed experimentation. Work may create the minimal fixture/loader required for a slice and grow it incrementally rather than building a comprehensive import/export framework before the first prototype.

## 5. What Work is authorised to do in this commission

- Independently investigate and compare product/architecture alternatives.
- Implement bounded, testable experimental frontend variants on the existing Minamo Site, selected via Settings, using the real existing data; retain stable views as the default.
- Implement narrowly necessary non-destructive backend adapters or feature-gated experimental persistence and **MCP changes when justified**, following end-to-end acceptance rules.
- Deploy iterations through Sites, verify actual URL/revision, inspect desktop/mobile, exercise key interactions, and update GitHub/PR #12 with corresponding source, test evidence and known limitations.
- Iterate on demonstrated UX issues without pausing for approval at every normal code/deployment step.

**Not authorised:** destructive transformation/migration of original production data, silently replacing established Home/Project/Library UX for everyone, deletion of original content, unrequested authoring to authentic Projects/Notes, merge of PR #12, or removal/weakening of the established auth/rights/commit protections.

## 6. Required acceptance demonstrations

1. Minamo's existing production experience still works unchanged with experiments disabled.
2. Settings exposes a compact, understandable choice of stable/experimental experiences. Selection persists as intended; returning to stable is easy.
3. Two substantially different experimental experiences, where feasible, are actually accessible on the **deployed Site** using overlapping real Japanese material—not only screenshots, mockups or local builds.
4. Original learner utterances and corrections, GPT-generated drills, rich typed interactions and cross-Project content retain identity, fidelity and honest provenance.
5. Source permission and version fences survive direct links, refreshes, alternate routes and experimental views; unsupported content degrades safely.
6. Desktop/mobile browser acceptance verifies useful first views, navigation, reading, furigana/TTS where relevant and interactive exercises.
7. Future-growth and data-compatibility tests run locally with the versioned corpus, and their implications are demonstrated in a live representative view.
8. Actual deployed native source and GitHub PR branch are reconciled; owners can reliably return to the last stable deployed experience.
9. If new MCP capability was required, its actual fresh-chat usability and persistence are tested after deployment; unchanged MCP contracts remain functional.

## 7. Commission outcome

Work should produce **research with working evidence**: a defensible architectural recommendation, a reusable dataset/test harness, and one or more genuinely usable deployed experimental experiences behind Settings. Clearly distinguish completed variants and tested deployments from proposals or mocks. Findings should guide which experiment is promoted to become Minamo's future default—not constrain the owner to an undeployable theoretical blueprint.
