# Minamo V2 — Autonomous Capability Foundry Research and Prototype Commission

> **Owner scope expansion (25 October 2026):** Read [SCALE-UP-EXECUTION.md](SCALE-UP-EXECUTION.md) before proceeding. It overrides conservative caps in the original plan: execute many high-value independent work packets, use subagents, deliver real verified code/prototypes across languages, maths, graphics, games and scientific tools, then keep going. No merge/deploy or genuine learner-data mutation is authorised.

**Working mode:** substantial autonomous ChatGPT Work task using the strongest available reasoning and engineering tools while the owner has substantial remaining Pro allowance.

**Repository:** frekland/minamo-v2  
**Production:** https://minamo-v2.jscymru.chatgpt.site/  
**Research bank branch:** research/capability-foundry-20261025  
**Authority:** docs/capability-foundry/{README,ARCHITECTURE,LANGUAGE-MATH,EXPERIMENTS,SOURCES}.md and verified *actual* current repo; PR #37 merged/released V27 as of 2026-10-25, subject to later current-state verification. PR #36 is research-only, unmerged; use as relevant evidence, not production authority.  
**Allowed tools:** GitHub, Sites read/preview, Minamo V2 read-only production, Firecrawl, Context7, Stack Overflow For Agents, browser/computer tools as available, subagents and local test runtimes.

## Mission and philosophy

Invest heavily **now** in research, architecture, working prototypes, difficult compatibility/security/integration challenges and reproducible acceptance. Produce a library of well-tested, ready-to-integrate capabilities so that a future Plus-plan / Sol Light session can activate small units with minimal architectural invention. Make Minamo an unusually versatile place to learn coding, maths, languages and scientific/technical subjects, but preserve its identity as a calm learning workspace.

Take independent initiative beyond named ideas. Research broadly and compare genuinely useful candidate capabilities: Japanese furigana and other language annotations; LaTeX/MathML; mathematical authoring and exploration; Pyodide plots/scientific Python, graphics, 2D games, Three.js/glTF, portable interactive charts, timelines, geometry, graph algorithms, external code/terminal traces, JS/React/Pygbag browser previews, interactive audio, scientific data and practical project artefacts.

**Build a substantial breadth-and-depth portfolio through autonomous chunks.** Deliver reusable foundations, multiple deeply integrated dormant features and as many genuinely verified additional modules as capacity allows; refuse half-tested claims, not ambitious scope. See SCALE-UP-EXECUTION.md. Use independent agent tracks where valuable. Conduct actual code experiments; do not stop at general advice, a backlog list or superficial mockups.

## Authorised and forbidden changes

You ARE authorised to:
- Research online/source/docs widely, inspect all app code and existing research PRs, test through local synthetic D1/R2, create isolated disposable examples and launch safe local browser experiments.
- Commit research, source-linked comparisons, fixture code, test harnesses, measurements and **dormant, flagged adapters** to a dedicated draft research/laboratory PR, with precise integration boundary and rollback notes.
- Split into separate draft implementation PRs if a single PR becomes difficult to review; cross-link them from the research index. Keep source commits and evidence reproducible.
- Refine the capability matrix based on evidence, reject weak ideas, pursue valuable novel categories and return with a ranked plan.

You are NOT authorised to:
- Merge to main, save/publish/deploy production Sites source, change owner-private access, install/refresh production MCP on the owner's behalf, activate dormant product features for genuine users or mutate genuine production learning records.
- Treat an implementation document as release authorisation. Do not execute unrelated PR #12, rework completed #37 continuity, merge frozen #36 personas, or create new services with recurring costs.
- Run hostile arbitrary third-party JS/React/Pygbag inside an origin that can access private owner tokens, automatically fetch arbitrary packages over the network, reclassify supplied outputs as observed Minamo execution, or silently grant new permissions.
- Rewrite old Notes/Library passages/anchors or create noisy learner activity through testing. Synthetic data only in local isolated contexts, or explicitly marked disposable external test scope when demonstrably safe and cleaned up with exact receipts.

Do not ask owner for routine approvals or break into serial “plan-only” reviews. The only owner approval boundary is a future merge/production release. Complete as much of the *research and prototype* work in one continuous autonomous task as is responsible.

## Phase 0 — Truthful baseline and controls

1. Verify actual main/head, release #37, current Site, source synchronisation, test baseline, installed MCP catalogue boundaries and existing tool/runtime/editor paths. Treat stale STATUS and historic docs as history.
2. Inventory available renderer/editors, media, exact reading anchors, Notes, ProseMirror, GPT/MCP authoring and recovery before proposing new schema.
3. Establish disposable local D1/R2 and authenticated-like fixture boundaries without impersonating hosted sign-in.
4. Record baseline app JS/load/memory measurements if tools permit. Set realistic comparable budget thresholds, not fictional numbers.
5. Draw a minimal ownership/lifecycle diagram; document where new types and adapters **must not** be added.

## Phase 1 — Research opportunities beyond the obvious

Run independent focused research tracks; compile primary-source-backed decisions with realistic version, licence, download size, runtime, isolation, offline, Android, UX and educational considerations. Rank using explicit E/R/L/O scores and security risk.

Required comparative tracks:
- **Multilingual typography:** native HTML ruby and Japanese typography; curated readings vs Kuroshiro/Kuromoji suggestions; pinyin/zhuyin/IPA; bilingual layout; writing modes; audio.
- **Mathematics:** KaTeX vs MathJax 4 vs native MathML; MathLive editor; accessible equation navigation; computational SymPy vs display; JSXGraph/other interactive math.
- **Python:** exact Pyodide 0.28.3 dependency loading into current CSP/opaque Worker, locked offline NumPy, Matplotlib, SymPy and Pillow; typed text/images/tables; performance and cancellation.
- **Games/Web:** safe typed 2D Canvas, user-generated 3D with Three.js/glTF; Pygbag/Pygame feasibility; Sandpack/React preview and COOP/COEP/worker CPU limitations. Say **no** to insecure previews.
- **Scientific/technical:** Observable Plot vs Recharts/Plotly, Cytoscape, code/terminal/packet traces, scientific plotting, bioinformatics outputs, Jupyter import, data tables and chemistry/audio ideas.
- **Pedagogy/interaction:** genuine learner workflows from short Notes → Investigation → Journey; benefit of hide/reveal, visual experiments, predictions and source-linked correction; avoid automatic mastery scoring.

Challenge the list: propose at least five additional genuinely useful capability candidates and explain why they beat or lose to those above. Source links should be exact, current and auditable. Don't treat generated graphics as proof of scientific correctness.

## Phase 2 — Design and prove shared capability contracts

Implement or convincingly prototype:
- A **versioned renderer registry** with strict schema admission, exact source format, static fallback, lazy renderer, instance disposal, provenance, owner permissions and no second persistent authority.
- A **run-output manifest** separating stdout/errors from PNG/SVG/table/chart/scene, exact input snapshot/engine hash and safe source/asset staging. “Observed” only from an actual execution receipt; imported results remain supplied.
- A **canonical reading extension** supporting original-base-text + ruby spans and whole-source maths, with UTF-16 retained captures across historic editions, search, Notes, Flags/Annotations, GPT readback and no hidden auto activity.
- Detailed typed authoring interface candidates (MCP commands/manuscript syntax/rich Notes), including precise validation and editor round-trips, not raw trusted HTML.

Build a conformance harness reused by every adapter: contract/version/provenance, permissions/revocation, exact source, loaded/unloaded fallback, navigation/draft retention, deterministic replay or readback where applicable.

## Phase 3 — Deliver real working vertical slices

**Priority A: Japanese and maths on actual reading components.** Use LANGUAGE-MATH.md acceptance corpus. Render curated ruby over the canonical sentence; hide/reveal; select across ruby/kana without corrupted quotation; save/reopen/version; explicit glossary/suggestion provenance where time allows. Render real inline and display formulas in Reader and Notes using justified engine selection; typed GPT/manuscript authoring with meaningful errors; no unrestricted macro/URL expansion; preserve old Markdown. Validate 390px viewport, keyboard, source copy and screenreader where available.

**Priority B: Python plotting.** Keep the current Python isolation, no unrestricted network. Pin/host offline package assets, execute a real Matplotlib/NumPy example, return a typed PNG and stdout, save/reopen only through explicit Run command, test exception, interrupt, stale results and output bounds. Experiment with a simple SymPy computation linked to a displayed equation. If too expensive/heavy, capture the measured limitation and build a smaller actual plot first.

**Priority C: Selected visual adapters.** Implement an actual Three.js declarative scene/glTF viewer with disposal and mobile/fallback behavior; one structured chart or graph algorithm visualiser; one CLI trace view. Prefer the cross-cutting adapters that can be reused by different programming-language and subject projects. Prototype a bounded 2D game if the execution isolation design is defensible; otherwise keep the game a deliberately local/external build.

**Priority D: Active exploratory engineering extensions (implementation where feasible).** Test feasibility of Pygbag and React project previews, voice pronunciation and audio alignment, bilingual/vertical reading and Jupyter importer; bank notes, source prototypes and activation dossiers. Do not violate the sandbox to force a positive result.

At least **three end-to-end case studies** must work with actual code as an initial milestone, and more case studies should be added across subjects where feasible:
1. Japanese beginner: a curated passage with furigana reveal, a small contextual Note, evidence of an ambiguous kanji reading and a retained source reading; do not claim learning gains.
2. Maths + Python: a displayed integral, learner prediction, real Python plot and/or SymPy execution with a distinct saved Run and canonical equation source; illustrate what was calculated vs merely displayed.
3. Coding game/science/3D: a small 2D maze or 3D scene/data experiment plus external Rust/Bash trace if feasible; include provenance and mobile UX.

Use synthetic local only. No fake production Study records.

## Phase 4 — Independent challenge, measurement, corrections

Have separate reviewers for:
- Security and executable isolation (CSP, network, owner auth, CPU timeout/worker, glTF textures, TeX injection, malicious ruby/CSV/code, rights/revocation/recovery).
- Core data/revision contracts, canonical UTF-16 ranges, old source editions, Notes rich/source serializer equivalence, ambiguous MCP shape and operation replay.
- Learning quality, readability and accessibility on desktop/phone (including Japanese compound ruby and math speech).
- Pragmatic “could a light model integrate this?” handoff quality, dependency complexity and actual next steps.

Correct material findings and rerun. Record failures, blocked tests and negative results instead of smoothing them away. Browser emulators are **not** physical Android, and local fake sign-in is **not** hosted authentication. Verify real source/asset readback whenever environment permits.

## Phase 5 — Bank the work so Sol Light can use it later

For every viable capability, write an activation dossier following EXPERIMENTS.md. The minimum must include:
- A tested exact source ref; actual files/modules and exported API; schema/example; local fixture/screenshot; dependency/license/asset budget; hard integration boundary.
- Measured verification commands and results (green/red), branch/release flag, no-op when disabled, fallback, resource cleanup, rollback.
- A **self-contained one-task Sol Light prompt** with touched files, constraints, input/output examples, expected tests and a draft PR deliverable, no architecture invention and no prod deploy.
- A candid verdict: **working integrated**, **working standalone prototype**, **research only**, **infeasible without policy/runtime changes**.
- A dependency-ordered implementation queue, with maximum reusable effect before complexity.

Produce one concise executive recommendation stating which foundational capabilities deserve activation now, which remain dormant until needed, which need a more powerful model or new provider, and which should be rejected.

## Evidence/reporting format

- Add docs/capability-foundry/RESULTS.md with a compact status dashboard by feature, live links to code/fixtures/PR/CI/screenshot, “done” vs “not run,” actual total effort/size measurements where observed.
- Include one dependency tree and cross-capability integration map.
- Clearly state whether any source code was merely proposed, compiled, run in Worker, rendered in browser, hosted authenticated, or validated on physical device.
- Preserve user genuine records; verify all synthetic records are cleaned, or state explicitly what remains local/disposable.
- Do not declare success from a mock UI, static code read, generated sample output or green typecheck alone.
- Do not create an empty PR with only aspirational prose: show working lab proofs and correct evidence, or accurately report constraints.

## Completion boundaries

A successful task produces **more future options at lower integration cost**, not more permanently visible Minamo UI. Large dormant modules should be behind lazy loading, independent flags and review, rather than bloating release. Stop short of merge/deployment; report the finished research/implementation PR links, demonstrated capabilities, open issues and recommended next owner review.

If you encounter a hard blocker in one candidate, choose the next highest-value feasible candidate autonomously and record why. The owner intends to make extensive use of available compute today; put the effort into robust prototypes, adversarial acceptance and reusable activation packages rather than repeated progress approval gates.
