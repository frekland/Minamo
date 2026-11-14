# PR #12 — Authoritative Work commission

**Implementation update:** The first deployed Work slice and current architectural recommendation are recorded in [PR12 implementation findings](PR12-IMPLEMENTATION-FINDINGS.md). Use that report for completed work, observed limits and next implementation slices; this document retains the original scope/background.

**Status:** Owner-approved execution commission. The first deployed Work slice is complete; remaining architectural/product work is itemised in the implementation findings. Read this commission for scope and authority. This document supersedes *older task-scope/deployment limitations* in PR #12 descriptions and RFCs wherever they conflict. Other PR #12 documents supply context and technical evidence, **not a requirement to implement a predetermined architecture**.

**PR:** https://github.com/frekland/minamo/pull/12  
**Repository:** `frekland/minamo`  
**Branch:** `feature/project-reader-v2-first-slice-20261113`  
**Production Site:** https://minamo.jscymru.chatgpt.site/  
**Working source baseline:** GitHub `main`, owner-confirmed aligned with production as of the beginning of this commission. Verify any actual newer Sites changes before overwriting; record and reconcile every subsequent Sites deployment back to GitHub.

## Mission

Investigate and **demonstrate in working software** a fundamentally better way for Minamo to accumulate useful information/interactions from ordinary GPT work and learning, then retrieve and creatively arrange that existing material into purpose-built user experiences **without first assigning everything to Projects or Library**.

Current Minamo already has rich canonical content, multiple useful readers, working MCP, stable ownership/revision rules, substantial genuine Japanese material, and convenient Sites deployment. Capitalise on those strengths. The objective is **not** to reorganise a larger Project, invent another taxonomy, or build an expensive knowledge graph that pretends to model what the learner has mastered.

**Treat PR #12's source/arrangement/presentation separation as a hypothesis to test, not prescribed implementation.** Think laterally and recommend a better design if empirical findings support it. User-facing clarity, reading/practice quality and accumulated value matter as much as database elegance.

This task should produce **independent architectural thinking, a real reusable data/test foundation, and owner-visible deployed experimentation**. Do not stop at an RFC or at a local API test.

## 1. Inspect the live product and code, not merely the proposal

- Read [the architecture RFC](MINAMO-ACCUMULATION-AND-COMPOSITION-RFC.md), [code-path audit](MINAMO-PHASE0-CODE-PATH-AUDIT.md), [real-corpus harness brief](MINAMO-REAL-CORPUS-DEVELOPMENT-HARNESS.md), and [live experimental Site policy](MINAMO-LIVE-EXPERIMENTAL-EXPERIENCES.md).
- Inspect current GitHub source, relevant persistence contracts, indexing/search, revision/rendition/permission checks, existing Project composition, typed content parts, reader/interactivity, Settings, and MCP operations.
- Use the live Minamo Site and existing MCP **read** operations to examine real stored content and browser UX. Investigate the disconnect between what GPT understands through MCP and what a person can actually navigate/use directly.
- Distinguish proven architecture constraints from historical assumptions. Do not reintroduce outdated Visual Lab vs production distinctions. GitHub is the owner-confirmed aligned starting source; detect genuine drift instead of redoing full reconciliation without evidence.

## 2. Make the existing corpus a permanent, versioned engineering asset — early in the task

- Extract a **representative but substantial, faithful canonical snapshot** of the genuine `Making Friends` and `Japanese Speaking Practice` Projects using the existing Minamo MCP. Capture complete available rich parts, interactive payloads (nested cards, dialogue turns, reveals, patterns), authentic learner attempts/corrections, GPT explanations, translation tables, diagrams, relevant source identities, relationships, and actual revision/rendition information where available.
- Add representative computing or other record types if they materially test a different design constraint. Do not require manually creating additional dummy Projects.
- **Owner expressly authorises publication of existing Minamo learning material in this public GitHub repository.** No elaborate privacy/anonymisation workflow. Still exclude credentials/secrets and externally authored/licensed content without publication rights; record justified exclusions. Do not invent unavailable historical chat turns, editions, assets, timestamps or provenance.
- Commit a **versioned corpus and manifest** with source IDs, content hashes, saved edition information, counts, extraction date, completeness/omission statements, deterministic refresh procedure, and enough structure to replay tests. Capture reality; avoid stripping rich content down to plain text.
- Build a **small reusable isolated D1/R2/Miniflare fixture loader**, leveraging `tests/private-storage-fixture.mjs` and existing migrations/revision validation, so different architectures and readers can test the exact same input without new live MCP calls on each run. Do not use production recovery activation or a live writable owner namespace for this.
- Treat the corpus harness as enabling infrastructure, **not a month-long detour**: build the smallest robust version and improve it as the vertical slice demands. Ordinary regression tests should run against local versioned fixtures; MCP is for initial extraction, deliberate refresh and bounded live acceptance.

## 3. Independently compare real architectural alternatives

Analyse whether the right enduring model uses existing WorkspaceRecords, an independent material record family/subtype, source events with derived projections, reference-based arrangements, or another simpler architecture. Evaluate alternatives rather than merely adapting existing Project composition.

Address what it takes to retain and retrieve valuable interactions **unassigned**; preserve genuine order, user-authored attempts vs generated exercises and exact provenance; support multiple composed presentations of overlapping source content; manage source deletion/retention, revisions, rights, interactive resources, and meaningful updates over years.

**Explicitly address the actual limitation in current search:** bounded discovery works with rights-filtered canonical records, but currently returns record-level results/limited match evidence, not fine-grained discovery across many parts or nested cards/turns. Recommend and prototype only as much indexing as the real corpus and scale tests justify; do not predetermine a new vector database or full schema migration.

Compare viable alternatives on data fidelity, complexity, runtime cost, recoverability, MCP integration, UX quality and long-term maintenance. The user must not have to invent an organisational container at capture time. Do not infer or display learner mastery or progress from saved volume.

## 4. Explore actual frontend alternatives on the **deployed Minamo Site**

**This is approved, important and expected—not a forbidden production change.** Minamo's convenient Sites deployment must be part of the research process.

- Implement a compact experimental experience choice inside existing **Settings**, defaulting to the stable current Minamo UI. Support **more than one concurrent alternative** when feasible, with a clear choice, persistent selection, and immediate return to stable. Avoid new top-level navigation clutter or turning illustrative words into hard-coded product categories.
- Experimental implementations may use alternative routes, reader shells, navigation, content composition and visual structure, sharing safe current read/interactive primitives. Do not force unrelated layouts into one giant conditional component. Experiments should be gated, opt-in and hidden from the ordinary UI until selected.
- **Deploy usable, bounded frontend increments to the existing Site** after relevant tests. Use real authorised canonical learning material from the live backend. Explore at least two genuinely different ways of making overlapping Japanese material useful if feasible; prefer a working comparison over piles of static mockups.
- Inspect and interact with the actual deployed experience in browser on **desktop and mobile**. Evaluate initial clarity, hierarchy, navigation, original Japanese attempts and corrections, explanations, tables, furigana, TTS, interactive flashcards/dialogues, provenance, history and returning to the stable reader. Record defects and improve via iterative deployments rather than declaring success after a build.
- The local corpus/test harness is **not** a substitute for real browser acceptance on deployed Minamo. A UI proposal that only runs locally is an incomplete result unless deployment is genuinely blocked.
- Existing Home/Projects/Library/Your Work and current readers must still work by default. Experimental variants must not silently rewrite original Japanese content or learner-owned Notes. Where a new arrangement needs to persist, isolate its state and protect identities/rights/revisions.

## 5. MCP: reuse what's working, extend only when useful

- Existing Minamo MCP reads should bootstrap and refresh the corpus and help validate the user-facing experiments. Do not require a connector reinstall or new API schema for each visual idea.
- **MCP extensions or policy changes are authorised when a real, validated experimental capability requires them**, e.g. cross-record selection/composition or independent capture. Use the smallest **typed, backwards-compatible** client-visible contract, preserving owner scope, source/permission fences, revisions, generation/CAS/idempotency and Notes ownership.
- If MCP changes, perform **fresh-ChatGPT post-deployment acceptance**, confirming actual discoverability, argument usability, permission and persistence, not merely passing server tests or relying on cached schema. Do not make unnecessary connector churn an obstacle to product research.
- Existing production authoring and reader behaviour remain intact.

## 6. Long-term growth and compatibility

Using the genuine source baseline, generate deterministic extensions representing six months to two years of mixed Japanese and computing activity, including repeated concepts, explanations, authentic attempts, corrections, generated practice, nested interactive items, editions, shifting relevance, missing provenance and revoked sources. Test representative 100/1,000/10,000/50,000 discoverable part/sub-item scales where feasible; these are engineering fixtures, not predictions.

Measure whether larger accumulated material **improves retrieval and creates more appropriate experiences** rather than simply generating more content or navigation. Preserve bounded model context, controlled index/query costs, readable first views, targeted discovery of older authentic attempts, and stable saved experiences.

Run baseline-vs-candidate **compatibility comparisons on identical data**. Verify canonical content/part identity, exact passage and nested-item references where actually durable, relationships, current/historical availability, rich rendering, permissions, source revocation and existing Project readers. Do not mistake an adapter referencing a Project-owned passage for proof that the material survives deletion of that Project. Any proposed migration requires a rehearsed mapping, loss report and recovery/rollback story.

## 7. Execution sequence and sensible autonomy

1. **Orient and assess:** Inspect PR #12, source, live MCP and UI; identify major real constraints, challenge the hypothesis, and outline a few distinct viable directions.
2. **Make test evidence reproducible:** Commit the first genuine corpus/manifest plus a modest isolated loader and preservation tests. Extend only where needed.
3. **Implement an owner-selectable experiment entry in Settings** while preserving the current experience. Build an initial meaningful cross-source frontend concept from real Japanese material.
4. **Test → deploy → use → critique → improve** on the actual Minamo Site, iterating on errors and UX problems. Where productive, deliver a contrasting second experience behind the same Settings selector. Adapt architecture based on the evidence, not attachment to the first prototype.
5. **Benchmark growth and compatibility** using the versioned fixture; recommend the simplest defensible durable architecture and the next incremental product deliverable.
6. **Document findings in PR #12**, with actual commits, build/test results, deployed Site revisions, browser/MCP acceptance, comparisons and a precise continuation roadmap. Ensure newer Sites source is reconciled to GitHub; avoid leaving the repository behind the deployment.

Work autonomously in substantial engineering/research slices. Make reasonable implementation decisions and investigate failures without stopping for approval of minor choices. Do not spend all effort on a perfect framework before delivering a usable live experience.

## 8. Boundaries

**Approved:** source investigation, architectural experiments, public versioned fixture corpus, local isolated tests, backwards-compatible experimental adapters, opt-in Settings-driven frontend variants on production Sites, iterative non-destructive Site deployment, and justified MCP extensions, with tests and live acceptance.

**Not approved:** destructive production migration; removal or breaking change to existing record/MCP/auth/permission contracts; silent mutation or deletion of authentic Japanese Projects or learner-owned Notes; unrequested canonical content rewrites; changing the stable frontend for everyone by default; merging PR #12; automatic ingestion of unshared GPT conversations; fabricated learner achievement/mastery.

Ensure straightforward fallback to the stable experience, verify deployed revisions and maintain a consistent GitHub source. If any proposed experiment presents a material data-integrity or security risk, validate it on the isolated corpus first and feature-gate it before live deployment.

## 9. Required outcome and acceptance

Produce and report:

- **Actual versioned real-content corpus** with documented completeness and reproducible isolated loader/tests, not merely an extraction plan.
- **Critical architectural recommendation** comparing viable alternatives and explicitly saying what in PR #12 should be revised.
- **One or more working deployed experimental experiences**, selectable from Settings, with authentic cross-Project Japanese content; ideally two contrasting designs, with truthful limitations if only one is feasible.
- **Evidence of quality**: browser inspection on deployed desktop/mobile, preservation of real examples and interactive components, direct comparison to today's reader, stable default/fallback, permission and revision handling.
- **Compatibility and accumulation assessment** using repeatable existing and extended data, including measurable retrieval and UI quality under growth.
- **Next implementation roadmap** with boundaries, dependencies and a smallest valuable subsequent slice; distinguish completed work from recommendations.

Maintain PR #12 as a **draft**. Update its documentation and PR description so there is one active architectural recommendation at the end—not several contradictory briefs. Record actual deployed Site revisions and GitHub hashes, known defects and precise next steps. **Do not claim a live experiment was accepted unless it was actually deployed and used.**

### Success standard

At the end of the Work task, the owner should be able to **open the existing Minamo Site, enter Settings, select an experiment and genuinely explore existing saved learning material in a new way**. Work should have used that hands-on result, not just theoretical architecture, to decide what Minamo should become.

The system should make accumulated GPT interactions increasingly useful without making the owner continually file, move and re-author the results.
