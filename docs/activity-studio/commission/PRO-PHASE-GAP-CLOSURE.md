# Pro-phase critical-path closure — make the combined Foundry genuinely deployable

**Owner instruction: 25 October 2026.** This is an authoritative amendment to PR40's implementation and release-readiness commission, to be read **first** with INTEGRATION-RELEASE-READINESS.md.

The original phrase “larger gaps may still require a stronger model later” must NOT become a reason to leave predictable hard engineering for a Plus/Sol Light task. **Find and resolve the difficult, cross-cutting work NOW**, using the available Pro reasoning, subagents, integration tools and substantial test capacity. The outcome should be a prepared, cohesive system that future lighter models can actually use, not just a library of impressive but disconnected dormant prototypes.

No amount of research can eliminate every possible unknown, and physical/device/provider approval boundaries are real. But defer only when there is an **evidenced blocker outside the authorised local/prototype scope** or a separately justified security/value decision—not because the engineering is hard.

## 1. The required outcome

Aim to finish with a **single, coherent release candidate (or staged sequence with an exact dependency order)** whose foundations include:

- First Foundry's proven renderer registry and scientific/language/math/data/game adapters, imported into a clean integration branch from actual main, preserving the exact bank SHA.
- Native data/content admission required for **future GPT-generated activities**, not only source-fenced text hacks or a development gallery.
- A versioned activity/template/composition model, secure output/source registry, guarded persistent definition and attempt records, and an efficient MCP authoring, revision, preview, publication and retrieval protocol.
- Integrated Graph/Atlas projections from authentic Journey, Investigation, Library, Notes, Source, Experiment, Run and optional Activity relationships, without redundant owner databases.
- A safe local project interchange path and an **actually tested GitHub connector-mediated** project handoff where authorised; immutable commit and CI/report provenance correctly tracked.
- Feature-flagged, lazy-loaded, production-build-compatible implementations of useful dormant tools and activities, with trustworthy fallbacks, rather than dev-only proof-of-concepts.
- The full native Sites source sync/release plan, exact integration SHA, proven migrations and rollback, and an explicit owner-approval gate. **Do not deploy or merge.**

The target is **no unresolved internal platform-integration blockers** for the primary workflows. A checklist marked “future work” is not a satisfactory substitute for code and tests if Work can implement it now.

## 2. Mandatory integration-gap attack plan

Before researching another optional library or producing additional novelty demos, run an independent multi-agent *red-team readiness audit* of PR39 + planned Activity Studio. Produce a complete dependency DAG of tasks that obstruct actual use. At minimum inspect and test:

### G1 — Durable, schema-valid semantic content

PR39's maths/ruby renderers work with retained source examples, but the reports identify native semantic fields and MCP admission as unfinished. Build and test a **first-class safe authoring path** with server-validated, immutable canonical text and optional structured math/ruby metadata, or a technically demonstrated equivalent that retains lossless editing/search/Flags/Annotations. Cross existing Manuscript, Note, Reader, Library, targeted patch, source-rights and history APIs. Do not silently reinterpret historic Markdown.

### G2 — Persistent typed scientific/visual outputs

Go beyond ephemeral image or table output in a stand-alone Python demo. Implement tested admission, explicit save/read/reopen, versioned output bundles and private R2 media where justified: source-code digest, actual runtime, stdout/error/chart/table/image bytes, MIME and size guards, owner/source/asset revocation, protected encrypted backup/export/import/generation. Reject client-fabricated “observed” evidence; a screenshot of a plot is not an execution receipt. Keep large packages opted-in/lazy/offline.

### G3 — Activity + attempt domain as a coherent owned product feature

Make a deliberate, reviewed decision on first-class activity/attempt types versus a validated bounded companion projection. Test all critical lifecycle semantics: revision CAS/replay/uncertain outcomes, optimistic saves, draft survival, idempotency, rights, Trash, earlier immutable editions, current eligibility, owner isolation, generation changes, rollback/recovery, disabled-feature behavior and old-client compatibility. Avoid duplicating Notes or writing automatic checkpoints.

### G4 — One reliable GPT/MCP authoring and continuation surface

A fresh GPT producer must be able to: discover actual supported capabilities; read relevant Journey/Investigation/Note/Library context by natural name; preview a multi-block Activity; publish in a *single guarded high-level call* or justified small number; retrieve exact current/retained Activity; link a project and later explicit Attempt; recover context after a fresh chat. Publish real source-aligned maths, ruby, visuals, tests, hints and code where supported. Validation errors must be repairable with concrete fields rather than unknown schema/invalid shape cycles. Existing MCP catalogue versioning and fresh-install verification need explicit release criteria.

### G5 — Complete project/starter package interchange

Package actual multi-file code and tests with immutable checksums, deterministic ZIP when supported, honest local Windows/Kali setup and release/return destinations. Use real GitHub connector writes only within explicitly authorised disposable test repositories/branches and only when execution scope permits; otherwise reproduce full commit/diff in an isolated local Git repository and mark external-provider acceptance unavailable. Import a submitted immutable commit and link exact diff/test/CI evidence without automatic repo scanning, arbitrary privileged commands or falsely observed Runs.

### G6 — Real Activity UI from the trusted renderer registry

Not a screenshot-only lab page: Activity authoring/reading and attempt panels mounted within the real Classic/Focus/Task Workspace with existing Notes persistence, correct navigation, deep links, source/capture, exact selection, keyboard/phone fallbacks and live source rights. Compose at least one authenticated-like synthetic D1/R2/MCP published activity that reopens as an ordinary product view. Keep developer galleries 404/inaccessible in release builds.

### G7 — Atlas as an authorised, scalable projection

Produce a tested scoped graph endpoint and at least one functional integrated Journey/Investigation/Library/Note/Activity graph with valid reverse links, versioned edges, current rights, sourced suggestions distinct from accepted relationships, stable destinations, pagination/neighbourhood expansion and accessible list fallback. The user-licensed tldraw canvas may be an optional release lane; do not block the semantic Atlas if licence/host requirements cannot be verified.

### G8 — Runtime/security isolation and real device constraints

Treat arbitrary React/JS/Strudel/Pygbag Sandpack or WebContainers preview as **untrusted executable code**. It must not execute with access to the owner-private origin. If secure isolated host, network and CPU/Worker containment cannot be proven with a concrete test, provide a tested external/local handoff instead and keep that runtime disabled. For Pyodide/browser scientific bundles, test package asset availability, CSP, memory pressure, timeouts, mobile-sized browser, cancellation/cleanup and after-navigation behavior. Simulated phone size is not physical Android; prepare exact owner device verification for release.

### G9 — Production integration, dependency/Site/release continuity

Resolve actual PR38/PR39 stacked ancestry; import implementation into a clean main-rooted staging branch; reconcile Reader/Notes, lockfile, worker, fixtures, build packaging and source manifests. Confirm no accidental import of research docs/dev-only routes or unneeded 50MB package assets into production. Benchmark default-off bundle and first-render; preserve current owner private rights. Rehearse Sites native source parity, migrations, old-client behavior, recovery, rollback and version gate *without saving/deploying production*.

### G10 — Pedagogical and hidden-solution correctness

Activity solver/hint/oracle is a real permission/provenance feature: never include complete hidden solution in the learner starter, default client bundle/DOM, accessibility tree, cache, source maps, generic MCP read or public repo. Use independently runnable red-baseline and green-repair tests. Catch intentionally impossible or accidentally trivially solved variants. Never equate a passing code test, viewed maths, finished puzzle or revealed hint with human learning mastery.

## 3. More independent scrutiny while Pro is available

Run critical-path review by at least these genuinely separate roles:
- Integration architect: source/control-flow/database/selection/contract integration and merge strategy;
- Security reviewer: owner rights, code execution isolation, external GitHub trust, solution leak, asset revocation and sandbox;
- Runtime/packaging/performance reviewer: scientific bundles, Worker/CSP, mobile/CPU/GPU/memory and version compatibility;
- MCP/agent UX reviewer: fresh-chat producer/consumer, publication efficiency, clear repairable shape errors and Light viability;
- Pedagogy/accessibility reviewer: quality of generated activities, nonspoiler hints, authentic evidence and keyboard/phone usability;
- Release challenger: native Sites sync, migration, rollback, production feature gates, catalogue refresh and owner acceptance.

Require reviewers to interrogate real running fixtures and actual source state. Fix found defects, rerun affected acceptance, and independently verify repair. Do not allow one reviewer to mark its own code as independently approved.

## 4. Must-pass integrated stories (not simply unit tests)

Work must provide actual *red/green* test and provenance records for the following scenarios, using synthetic local data and real browser/domain/MCP:

**S1 — Japanese reading from GPT:** An Article/Activity with validated compound-level furigana is published and reopened via typed MCP, displayed in existing Reader, selectable/copyable by exact base-text quote across ruby/kana, annotated/flagged, visible in history and safe after Source revocation. No inferred learning progress.

**S2 — Math + Python:** Proper formula published/edited and rendered in Article/Note; an actual Pyodide scientific computation outputs figure/table/code provenance; explicit saved Run and reopening/recovery retains typed bytes or a truthful supported fallback. Aborted or failed runs do not keep stale success results.

**S3 — Genuine debug quest:** GPT reads an Investigation by natural name, intentionally faulty starter package and tests are validated, one guarded publication creates an Activity, learner opens in Workspace, downloads/clones, a real test proves baseline red and repaired green, exact submission diff/evidence readback and subsequent fresh GPT continuation preserve next intention and uncertainty. Hidden solution not leaked.

**S4 — Visual learning map:** A real owned current Journey/Library/Note/Activity graph renders and navigates exact deep links in Classic/Focus/Task, including explicit vs GPT-proposed relationships, older records, source revocation and 390px/keyboard fallback. No fabricated mastery.

**S5 — Negative/race path:** Simultaneous edits, an uncertain publication receipt, stale Activity revisions, missing/revoked sources, different owner, generation activation/restore, malformed prompt injection, large code bundles and missing/old client catalogue fail safely, with original drafts/evidence intact.

**S6 — Dormant release proof:** Feature-disabled production-compiled build loads existing Minamo unchanged, contains no reachable developer galleries or privileged unsafe runner, excludes unnecessarily huge assets, completes tests and supports documented rollback. Feature-on local preview proves exact machine/code/runtime behavior under guarded synthetic identities.

Any passing claim must distinguish unit/Worker/browser/local synthetic D1/MCP/hosted authenticated/physical Android level. Never invent missing device or production evidence.

## 5. Gap ledger and escalation rules

Maintain a machine-readable gap ledger and concise human summary with, for **each gap**:

- ID, affected capability and learner workflow;
- source/tests and exact observed failure, not “needs investigation” without a reproduction;
- component owner, selected engineering design, implementation commits and tests;
- category: **code-owned resolvable**, **requires owner-only access/device**, **requires external provider credential/service**, **blocked by current browser/Sites/security isolation**, or **deliberately rejected for cost/quality/security**;
- current state, real workaround if acceptable, priority, whether it blocks core release;
- specific future instruction only if genuinely not resolvable now.

**Code-owned resolvable:** Do the implementation in this Pro task. This includes data model migrations, renderer integration, MCP tooling, authenticated-like local tests, CLI packaging and cold-start tutor tests. Never transfer just because difficult.

**Owner-only or external:** Prepare exact user action and subsequent acceptance protocol without assuming credentials, licence keys, physical device or production rights you lack. A blocker that only needs owner physical Pixel testing is not a reason to leave all code unfinished.

**Security/browser impossibility or high cost:** Prove the constraint through a negative experiment when feasible; bank a secure alternative (read-only source/hosted isolated link/local GitHub round-trip) instead of weakening sandbox.

**Newly discovered unknown:** Update the dependency graph, fix if code-owned, rerun tests. Don't stop at the first new challenge.

## 6. Light-model readiness is an engineering acceptance test, not a label

Run an explicit **model-handoff trial**: give a fresh constrained agent only an activation dossier, exact tested code reference and the currently exposed API schema, not the full architecture history. It should implement at least two representative small registrations or activity publications without inferring missing contracts.

A feature may be stamped Light-ready only if:
- the heavy runtime/schema/ownership/source-security implementation is already *done and verified* in the staging candidate;
- the API is stable, typed, documented, and covered by synthetic integration tests;
- the intended remaining work is genuinely a bounded exercise/template, content publishing or controlled feature activation;
- no unplanned migration, new isolation layer, privileged token/CI provider or unknown MCP parameter remains;
- cold-start readback/publishing works against a local simulated tool catalogue and does not require researcher knowledge.

Where release to production is a prerequisite, label **Light-ready after owner-approved deployment**, not already enabled.

## 7. Completion and release economics

Prioritise closing the release-critical path before accumulating a new mountain of optional experiments. Then use remaining capacity to deepen/evaluate high-value additional libraries and activities. Set no arbitrary prototype cap, but do not let breadth conceal incomplete foundations.

Deliver:
- a clean combined main-rooted **draft integration PR** with actual verifiable code and no inadvertent research branch ancestry;
- reproducible full tests and meaningful browser/source/permission/MCP traces;
- docs/activity-studio/CRITICAL-PATH-GAPS.md plus machine-readable blocker ledger (resolved and remaining);
- docs/activity-studio/INTEGRATION-RECEIPT.md, RELEASE-READINESS.md and ACTIVATION-MATRIX.md updated against exact tree SHA;
- detailed rollback/site sync/catalogue-refresh/physical device checklists and no anonymous placeholders;
- several one-step Light activation dossiers tested by a constrained independent agent, with any failed activation proof triggering more Pro repairs.

**Hard stop on dishonest readiness:** If a core pathway has not actually been validated, say so, and do not describe it as release-ready. In particular, a PR with only dev galleries and frozen research cannot claim that GPT can publish activities through Minamo. Equally, don't avoid the hard implementation by merely describing it as future work.

**Owner release boundary remains unchanged.** This commission authorises broad, substantial coding/research/testing and draft PRs, **not** a GitHub main merge, production Site save/deploy, permission change, live learner mutation, paid third-party service or unapproved install/reconnect of the production MCP. At least one owner-approved deployment/acceptance action may still be required later; that should ideally be operational release work rather than new architectural discovery.

