# Minamo beyond PR26: a better bridge between doing, understanding and returning

**Exploratory review · 23 October 2026 · draft for discussion.** This proposes possible future work. It does not commission implementation, revive PR12, change the live Site, or author/revise learner records. PR23 remains evidence-only.

The review covers current V2 source and owner-private V21 browsing, selected V1 decisions and proposals, installed MCP guidance, two read-only synthetic authoring experiments, and primary technical/learning research. [Evidence, exact baselines and limitations](EVIDENCE.md) distinguish observations from hypotheses. Private learner prose, artifacts, record identifiers and screenshots are deliberately absent.

**Product/frontend companion:** [UX, UI, Library growth and the learning workspace](UX-UI-AND-LIBRARY-GROWTH.md) extends this review with visual and interaction design, subject organisation, Journey/Investigation experiences, settings, content integration and server support. It is an equally important part of the exploration, not optional cosmetic polish. Read its proposed integrated product slice alongside the priorities below.

## My judgement

Minamo's strongest next direction is to become an exceptionally good **bridge between practical work, independent reference reading, personal thinking and a later conversation**. Its value is the quality of what survives those transitions: the exact question, relevant mechanism, actual attempt, evidence limitations, explanation of a choice and useful next experiment.

I would keep the present shared domain, exact readings, guarded persistence and ChatGPT-centred educational judgement. I would invest in the interfaces between them. A replacement framework, another progress model, a permanent agent or a larger list of tools would contribute less than making a few complete learning loops dependable and pleasant.

Three outcomes deserve equal attention:

1. **Return without reconstruction.** A future GPT and the learner can recover the important reasoning and exact artifacts without rereading an entire Journey or treating a summary as proof.
2. **Study without needing a conversation.** The Library provides substantial explanations, precise references, useful examples and natural routes back to practical work; Notes let the learner think in their own words.
3. **Create better future resources through ordinary requests.** GPT spends effort on teaching and technical judgement while Minamo handles identity, linking, indexing, revision mechanics and reliable publication.

The priority labels below express engineering judgement, not measured user demand. “First” means a coherent candidate for a subsequent commission, not authority to implement it now.

| Opportunity | Learning value | Added burden / complexity | Confidence and proposed order |
| --- | --- | --- | --- |
| Exact, quiet handoff across Minamo and GPT | High | Low to moderate | Directly observed seam; first |
| Better capture of real practical attempts, using existing Notes/checkpoints | High | Low if paste/link first; high with a daemon | Strong workflow fit; first |
| Passage retrieval with exact technical lookup preserved | High as the Library grows | Moderate | Source-supported; benchmark before choosing implementation |
| Future-authoring and revision quality evaluation | High | Moderate ongoing review effort | Direct experiment; first |
| Clear practice/test classification and code-to-tool transfer | Moderate to high | Low to moderate before adding engines | Directly observed; early |
| Optional self-study prompts and meaningful revisit | High potential | Low if authored, higher if algorithmic | Research-informed hypothesis; trial with real use |
| Selected, human-readable study exports | Moderate to high | Moderate | Historical proposal; test existing export/read paths first |
| Direct Site access to GitHub | Conditional | Credentials, rights, UI and maintenance | Historically parked; demand gate |
| Local capture helper / JavaScript runtime / offline packs | Conditional | Each adds a distinct maintenance surface | Small feasibility trials only after simpler paths fail |

## 1. Preserve the successful product boundaries

V2 already has the important foundations: reusable Library topics and technical references; separate Journey stages and open Investigations; exact canonical reading and passage marks; rich Notes; immutable observed Runs; explicit evidence-aware Developments; focused tutor reads; text-first atomic authoring; source rights; uncertain-operation recovery; protected archives and portable JSON. PR26 made future authoring, Library discoverability and continuity materially stronger. These are baselines to extend, not missing features to recreate. [S1–S8]

The historical record is unusually helpful about what to avoid. V1's owner decisions favour enjoyable, substantial learning without compulsory sessions, mastery indicators or constant administration. The parked GitHub idea explicitly asks whether exact links and the GPT connector already solve the problem. The V1 portable-export proposal tells us to test the existing read path before inventing endpoints. V2 regressions repeatedly show that correct data and passing unit tests do not establish a good authenticated reading/navigation experience. [H1–H5]

I would retain these boundaries:

- ChatGPT interprets the learner's request, explains, diagnoses, chooses useful examples and exercises educational judgement. Minamo does not acquire a paid inference service.
- The server validates identities, rights, exact destinations, revisions, operation receipts, payload bounds and deterministic projections. It must not silently decide what the learner understands.
- The learner works in their own Kali/Windows environment when the task concerns that environment. Browser tools expose their narrower runtime honestly.
- Saving a resource, opening a page, making a commit and executing a program have different meanings. None establishes learning achievement.
- Checkpoints and personal writes remain deliberate. No activity recorder, inferred learning profile or automatic conversational summary is introduced under a convenience feature.

## 2. Make return to GPT quiet, exact and dependable

**Observed:** the current `GptHandoff` component can construct a bounded clipboard request, including exact reading identity and deliberately chosen related references. Its current workspace invocation is excluded for reading families. In live Library article management I saw Edit and Check for updates, but no handoff action. Reading itself is calm and the exact command destination works. [B1, S4]

The opportunity is to make the existing bridge available without restoring intrusive “Discuss with GPT” controls throughout teaching material. A quiet app command, reading overflow action or explicit selection-menu action could offer **Copy context for ChatGPT**. It should carry the exact current article/passage or stage, a question, and only selected supporting references. A generic Open ChatGPT link can accompany it; do not promise a supported conversation-prefill API or automatic transfer where none has been verified.

On the MCP side, a deterministic resolver could accept an actual Minamo reading URL and produce the existing typed target/selection request. This would remove repeated parsing work from GPT and reduce accidental loss of a stage, retained rendition or return destination. Reject foreign origins, ambiguous parameters and unavailable targets; do not dereference arbitrary URLs or allow a pasted page to issue commands. An existing tool argument may suffice: a new endpoint is justified only if it measurably reduces repeated errors.

The useful handoff is an **intent**, not a transcript: “Help me explain why this attempt failed; use this passage and this saved Note.” The server returns the chosen current/retained evidence and tells GPT what is omitted or deferred. GPT decides whether another read is educationally necessary. Do not force a fresh workspace/policy read on every tutoring turn.

**Acceptance:** on desktop and a physical phone, a learner studying an exact command can copy a context request, close the Site, paste into a fresh connected GPT conversation, and receive help grounded in the correct passage and chosen evidence. A corrected/withdrawn checkpoint or unavailable source must remain corrected/unavailable. The ordinary reading surface must stay uncluttered. Measure mis-targeted reads and reconstruction questions, not just clicks.

## 3. Capture practical attempts with less ceremony

The existing Development model already represents predictions, attempts, reported observations, misconceptions, corrections, interpretations, choices/reasons and next action. Its revision and eligibility rules are valuable. The next improvement should make those fields easier to populate accurately through ordinary interaction, rather than build a second learning journal. [S5]

A learner might say: “I ran this on Windows; save why we chose this fix.” GPT should retain the meaningful reasoning and point to a concise Note or repository reference containing the relevant supplied evidence. A useful attempt normally needs only some of:

- the question and prediction;
- relevant command/code, working directory and environment/version;
- actual supplied output, error location or exit status;
- exact file/commit or saved Note/Run reference;
- the learner's interpretation, unresolved uncertainty and next discriminating experiment.

These are useful prompts, not mandatory form fields. Preserve an original supplied excerpt separately from GPT's explanation of it. A short result can live in a Note; a checkpoint references that exact revision. Long terminal logs should be selected/redacted, not copied wholesale into every checkpoint. No output should be invented to make a record look complete.

**Start with paste, selected file and exact link.** A lightweight optional local helper becomes sensible only if authentic use repeatedly shows copy/redaction friction. Such a helper could run locally using standard Python or PowerShell, collect a user-selected command result and environment facts, and emit a reviewable text/JSON file. It should not watch the shell, collect history, upload automatically, hold Minamo credentials or open a localhost service. Review/redaction is still needed: secret detection can miss values, and automatic removal can destroy diagnostic meaning.

A helper-generated record is supplied evidence. It does not become Minamo-observed execution, establish who ran it, or prove understanding. Retain the existing restriction preventing GPT from manufacturing genuine observed Runs. The simplest workflow may be for the learner to paste the helper output into ChatGPT and explicitly request a checkpoint through the existing MCP tools.

**Acceptance:** reproduce a path error on Kali and on Windows, explain the difference between shell launch failure and program failure, save the agreed interpretation, and resume days later. A new GPT must recover the actual attempted command and reason for the fix without treating a proposed command as executed. Also test “I don't want to save this”: it must create nothing.

## 4. Reconsider GitHub integration in layers

V1 parked direct integration because its incremental usefulness was uncertain and private authentication would be a real new responsibility. The present request authorises reconsideration; it does not make that historical feature automatically desirable. GitHub should remain the original home of learning code and commits. Minamo adds questions, explanations and intentional evidence connections. [H2]

**Layer A — improve exact references first.** Current repository references validate a pinned SHA/link syntactically; they do not fetch or verify file bytes. Make that distinction visible. Where the learner has asked GPT to inspect a file using the connected GitHub app, preserve repository, full commit SHA, path and the selected range, with an optional digest of the supplied bytes and an explicit origin label. A digest proves equality with captured bytes, not their execution or continued remote availability. Avoid importing a whole repository into Minamo. [S6]

**Layer B — deliberate comparison.** Comparing two chosen commits or file versions could support the learning question “what did I change and why?” Preserve exact endpoints and distinguish the code diff from the learner's explanation. GPT can often do the comparison through its existing GitHub connection and save a Note. Minamo need not acquire independent GitHub access to obtain this benefit.

**Layer C — an on-demand Site reader, only if justified.** A small view of a selected repository/file/diff may be useful when self-studying from mobile without GPT. Gate it on repeated actual use cases. First verify a supported authentication/network path in Sites; the ChatGPT GitHub connector does not automatically give the Site credentials. If independently authorised later, use selected-repository read access, bounded responses, conditional requests and clear revocation/outage states. No personal token in browser storage, ambient broad scope, build-time checkout of learning repositories, webhooks or background polling. GitHub rate limits are another reason to keep reads deliberate. [R3]

**Acceptance and stop rule:** if precise external links plus the existing GPT connector let the learner inspect and connect the important artifacts comfortably, stop at A/B. A direct reader needs a demonstrated task that those options do not serve. Private repository access must not imply permission to retain or redistribute its contents indefinitely.

## 5. Improve Library retrieval without paying for embeddings

**Observed:** topic/global search uses literal text inclusion; technical references use exact terms/aliases with meaningful case and punctuation; Library results are paginated and rights-projected. The live command index successfully opened the relevant section of a substantial article, with a return to browsing. This exact path should remain. Broad questions phrased differently from authored prose can still be hard to retrieve. [S2, B1]

I would compare the existing implementation against a **derived, passage-level SQLite FTS5 index** before reopening semantic infrastructure. FTS5 offers ranked retrieval and snippets, and D1 documents FTS5 support. It avoids a new inference API, vector service or always-on process. Its usefulness and deployed performance must still be measured. [R1–R2]

Index eligible current title, headings and canonical explanatory parts with exact article/rendition/part destinations. Keep the command/alias lookup separate: tokenising `??`, `--flag`, `map`, `Map` or a dotted API name can destroy the distinction being sought. A combined result can explain whether it matched an exact technical entry or ranked prose. Short candidate passages let GPT choose an exact deeper read rather than receive several whole articles.

Rights are the difficult part. An FTS hit is never read authority. Avoid returning counts, snippets or cached text from excluded material. Prefer indexing the eligible authored projection rather than controlled source excerpts; recheck eligibility before outward projection; invalidate/rebuild derived rows on relevant changes and restore. A denied result must not consume the whole page budget or leak through ranking metadata. Derived indexes must be disposable and reconstructable from authoritative data.

This is lexical ranking, not semantic understanding. GPT can expand the owner's natural question into a few sensible searches inside the existing conversation, compare candidates and judge reuse. That may provide enough semantic value without paid embeddings. A browser-only embedding model would be unavailable to server MCP reads when the browser is closed; a server model adds deployment and resource constraints. Neither is a free architectural shortcut. PR12 remains untouched.

**Benchmark before selection:** use at least 30 synthetic questions across known topics, exact commands, synonyms, error messages, repeated terms and no-answer cases. Compare useful-passage recall in the first five results, wrong destinations, false positives, eligible empty pages, bytes returned and query latency. Include revoked sources, Trash, restore generations and stale cursors. Stop if ranking provides no worthwhile improvement at the actual corpus scale.

## 6. Make the Library a place for independent thought

The Library should reward browsing even when ChatGPT is closed. Current areas/topics/reference views and purposeful connections are a good base. I would improve their **editorial coherence** before adding a large knowledge graph UI.

Areas can explain their scope and offer a few meaningful entry routes: “understand the mechanism”, “look up syntax”, “diagnose a symptom”, “see a worked example”. These should be authored views over shared Articles and precise destinations, not duplicated content or rigid project folders. A reference can serve several projects. A Journey supplies the order of action; an Investigation keeps a question open; an Article teaches the transferable mechanism.

Useful additional relationships include a precise contrast, prerequisite explanation, application and troubleshooting entry, each with a reason. Reuse existing relation authority where possible. Display a small relevant set in context rather than a graph of everything. Existing backlinks already do some of this; do not rebuild them under a new name. Personal Notes can be deliberately linked as “my question about this”, without making them canonical teaching or public annotations.

**Optional self-study prompts** could invite the learner to predict an output, explain an error before revealing an explanation, reconstruct a small step, or alter a worked example. Store these naturally in authored material first; do not begin with a quiz subsystem. Revealing a worked explanation does not mark an attempt. Saving a reflection remains optional. An explicitly chosen “revisit this question” can create a useful reading list without inferred memory strength or a compulsory spaced-repetition schedule.

The IES practice guide supports spaced learning, interleaving worked examples with problem solving, retrieval and deep explanatory questions. That evidence motivates trials; it does not prove that a particular Minamo interface improves adult programming learning. [R4]

**Acceptance:** a learner unfamiliar with a project can use its linked Article independently, find the relevant function/command, understand an example and its failure mode, and try a small variation. Assess the learner's explanation and ability to inspect a result, not time on page or amount of content published. Try the same reference from a different Journey to test whether it is genuinely reusable.

## 7. Put future-authoring quality into evaluation, not a larger schema

PR26 already supplies natural Markdown authoring, optional catalogue declarations, mechanically derived identities/links, role-specific advisories and compact previews. Preserve that low-friction path. The largest remaining quality gap is one the server cannot solve with a structural validator: plausible, well-formed teaching can be wrong or unhelpful. [S3, M1]

In this review, two disposable **preview-only** Articles about JavaScript sorting both returned `valid: true`, no manuscript warnings and only the same coverage advisory. One incorrectly claimed that default sort always orders numbers numerically; the corrected one explained string comparison and a numeric comparator. A local Node run confirmed the difference. Each preview returned about 1.2k serialized characters and took roughly 4.7 seconds through the connected tool, once each. This is a small illustrative experiment, not a latency benchmark or a defect in the advertised structural contract. [M2]

The implication is to strengthen GPT's educational review and realistic acceptance tests, not add a paid server critic or advertise “valid” as “good teaching”. A useful review asks:

- What mechanism could the reader explain after this?
- Does each code example behave as claimed in its stated environment?
- Does a worked example explain intermediate reasoning and a likely mistake?
- Can the learner inspect a real failure, rather than merely repeat instructions?
- Does the Article stand alone, and does the Journey use it without copying it?
- Are factual external claims grounded in appropriate sources, with honest version/fidelity limits?

Build a small adversarial authoring benchmark from ordinary requests: a beginner CLI project, a web API failure, a conceptual comparison, a short technical definition, reuse of an existing Article and a targeted revision. Include polished-but-wrong material, misleading expected output, generic metatext and unnecessary duplication. Review rendered outcomes and representative executable examples. Keep correct short references valid; avoid mandatory word counts, media quotas, universal headings or a pass/fail “learning quality” number.

This benchmark belongs in development/release evaluation. It must not become a mandatory multi-call publication ritual during every ordinary conversation. GPT can publish a ready owner-requested manuscript directly and inspect the compact receipt/findings. Use a detailed preview for unfamiliar rich layouts, ambiguous targets or meaningful uncertainty. Independent assessment is especially useful for a changed authoring contract or major learning route, not every punctuation correction.

## 8. Make revision and reuse cheaper than duplication

Current source editions preserve original manuscripts, and canonical patches permit small corrections. However a source edition is a publication edition, not necessarily the current canonical article after later edits. Future tooling must keep that distinction clear. [S3]

A useful revision read could return the requested current section, catalogue entries and a bounded account of changes since the relevant source edition. That gives GPT enough context to revise one explanation without recreating a full document or overwriting unrelated work. Reuse current CAS, stable identity matching, patch support and immutable receipts.

Safe server-side mechanical work includes parsing exact Minamo links, deriving reference targets from unambiguous headings, maintaining backlinks/indexes, computing a deterministic changed-parts diff, and checking dangling declared destinations. It may suggest likely catalogue entries extracted from authored syntax, but should not silently publish definitions, decide conceptual equivalence or invent relationships. Existing catalogue declarations are already small; don't replace them with a complicated extraction language.

For environment-sensitive material, optional metadata can state tested environment, versions and the relevant checked source. A diagnostic can identify broken links or references to changed sections on demand. Do not turn every Article into a maintenance form, automatically rewrite it when a dependency changes, or call an old reference false solely because its URL is old. Technical truth and educational usefulness still require judgement.

**Acceptance:** revise a shared explanation after it has Notes, exact marks, catalogue entries and two Journey links. Only the intended explanation changes. Existing exact captures remain exact; independent catalogue data is retained; outdated destinations are explicitly unavailable rather than silently redirected to different prose. Then reuse the revised resource in an unrelated project without creating a copy.

## 9. Connect supporting tools to reading, and clarify real practice

**Observed:** Tools defaults “SYNTHETIC TEST ONLY” to checked. A learner doing genuine practice with illustrative input should not accidentally save a record classified as disposable product-test data. Existing record classification is immutable, so this choice matters. This is an interaction/design issue to resolve carefully, not permission to reclassify existing records. [B2, S7]

Separate two questions in future UI/contracts: **is this a product/test fixture?** and **what does this result establish?** A real browser experiment can use invented input and still be a genuine observed browser Run. It remains neither Kali execution nor understanding. Preserve existing immutable meanings for historical records and review any migration separately. Product acceptance fixtures stay conspicuously synthetic.

Reading code currently offers Copy. An explicit **Open a copy in Tools** action for supported examples could reduce manual transfer. Carry exact source identity and declared runtime, retain the existing editor replacement checkpoint, and let the learner edit and run deliberately. Loading must never execute or save. A Python filesystem example needing the real host must not be offered as equivalent browser execution merely because its language matches.

The current Web tool is intentionally finite, not a general JavaScript/React environment. If genuine use demonstrates a need for small JavaScript value/function experiments, evaluate a narrow isolated interpreter. QuickJS compiled to WASM is a candidate with memory/stack limits and interruption APIs, but adds memory-lifetime management, bundled assets and a different runtime. A terminable Worker is another candidate with different limits. Compare cold/warm startup, download size, mobile memory, infinite loops and output floods before choosing. Do not expose host APIs casually or promise Node, DOM, npm packages or React fidelity. [R5]

For full apps, actual local Node/browser tools and GitHub remain the better learning environment. No free cloud runner, remote Kali, arbitrary package installer or commercial sandbox API is required. Improve the capture/return path instead of imitating an operating system inside Minamo.

## 10. Make mobile continuity and portability trustworthy

Rich Notes now exist; physical-device ergonomics are the next evidence gap. Validate text selection, code editing, keyboard occlusion, focus return, long Notes, reload after an uncertain save and a restricted connection on actual Android and Windows hardware. A desktop narrow viewport does not establish those behaviours. Do this before committing to a native app rewrite. [S8]

The learner needs a clear distinction between “retained in this browser” and “acknowledged by Minamo”. For larger drafts/assets, IndexedDB may be more suitable than expanding localStorage use, but storage quotas, eviction, cleared site data and private browsing remain real limits. Persistence APIs do not make a browser an unlimited backup. Owner/generation scoping and conflict handling remain essential. [R6]

An optional owner-selected offline reading pack could be valuable on mobile. It needs a visible capture date, exact versions, deliberate deletion and a clear explanation that a previously downloaded copy cannot be remotely recalled while offline. Do not silently cache all authenticated content or assume current rights can be checked offline. Start with selected original explanations and own Notes; controlled sources need separately valid export permission. A queued offline-write system is a much larger project and is not the first step.

Portable JSON already exists alongside protected recovery. The historical **human-readable study export** idea is still useful: selected learning material as Markdown plus original code files, a manifest and exact links. First try existing eligible reads/portable export with ChatGPT's available file tools. Add a scoped server export only if measured omissions, scale or traversal issues require it. Do not expose raw archives or confuse readable exports with complete restorable recovery. Exporting is not authority to publish to a public GitHub repository. [S8, H3]

**Acceptance:** study one deliberately selected pack without a connection, distinguish unavailable external media, return online and identify its version, then resume from a fresh GPT conversation. A readable export should make sense outside Minamo while reporting exclusions. Do not claim offline revocation or binary portability that has not been implemented and tested.

## 11. Engineering improvements that protect the learning experience

The present React/Vinext/Worker/D1/R2 architecture does not need replacement to support these ideas. Preserve the single web/MCP command authority. Incremental engineering could make it easier to change safely:

- **A current capability map.** Installed tool descriptions still carry the old “isolated synthetic foundation lab” app prefix while action guidance describes real private learning operations. Older handoff documentation also describes a wider UI presence than current code. Reconcile product identity, installed guidance and a compact source-backed current capability document; keep historical receipts as history. This is clarity, not a reason to reinstall blindly. [M1, S4]
- **Feature boundaries around an authoritative core.** Gradually separate discovery/read projections, authoring compilation, evidence and recovery orchestration where changes require it. Share contracts and validation. Avoid a rewrite motivated only by dense source layout, or a second ORM/model that bypasses guarded commands.
- **Bounded reads that preserve reasoning.** Keep focused tutor context and explicit deferred details. Measure whether GPT can explain why a choice was made and recognise a corrected misconception under a smaller response. Truncate administrative duplication before evidence/rationale. A shorter response that removes decisive reasoning is worse.
- **Safe mechanical caching.** Request-scoped reuse and immutable runtime assets are useful. Any longer-lived private read/index cache must include owner, generation, revisions and current-rights invalidation. Do not cache a GPT synthesis as authoritative memory or let a derived cache resurrect withdrawn evidence.
- **Release checks based on complete loops.** Add a small authenticated walkthrough for discovery → exact reading → Note/capture → explicit checkpoint → fresh-GPT retrieval → correction. Include delayed responses and uncertain saves. Existing unit tests remain valuable; their count is not a proxy for a finished learning experience.
- **Source receipt automation.** A small script can verify GitHub/native tree equality and produce release facts using existing authorised tools. This reduces manual release mistakes without a new bot, service or secret. Documentation-only exploratory PRs do not require Site deployment or a second copy in the native runtime repository.

## 12. Keep the “free” constraint concrete

Free software and a provider's free allowance are different. The design must not require an additional payment, paid AI API, new subscription, metered overage or an always-on server. Existing Sites-managed storage is the current platform, not evidence that a separate Cloudflare account would be unlimited or cost-free.

| Option | Cost position | Constraint / decision |
| --- | --- | --- |
| Better Markdown/compiler/indexing/context on existing Sites | No new paid service | Stay within actual Sites runtime/storage limits; measure database work and payloads |
| FTS5 on existing D1 | No new search/embedding provider | Verify deployed support, index size, rights handling and query cost |
| Browser tools and optional local standard-library helper | User's existing hardware | Download/memory/battery and maintenance costs remain; no new account required |
| Existing ChatGPT GitHub connector | Uses already available capabilities | Actual plan/tool availability and repository permissions vary; retain manual-link fallback |
| Direct GitHub API reads | Can use existing free API allowance | Private auth is not automatic; bounded on-demand reads; no dependence on paid capacity |
| GitHub Actions for learning execution | Finite included allowance for private repos | Do not make study depend on it; excess can bill when payment exists; local execution is the default [R7] |
| Offline packs / readable exports | Browser/local files | Storage and rights limits; export does not establish permission to share |
| Paid inference, hosted vector/search SaaS, cloud IDE/runner, VPS | Adds a service/cost dependency | Exclude from the recommended design |

External videos can remain optional supporting links/consent-loaded players, with readable alternatives. No third-party playback, subscription or API availability should be required to understand a Library explanation.

## 13. What I would do first, and how I would decide whether to continue

I would commission one small integrated slice around **returning to a real learning question**:

1. Validate quiet exact handoff and normal-practice classification with the owner on an actual device.
2. Make one selected practical attempt easy to retain in existing Notes/checkpoints, preserving command/environment/output and the reason for the next experiment.
3. Evaluate future resource creation/revision using adversarial teaching examples and rendered independent reuse, including the sorting counterexample.
4. Benchmark useful passage retrieval; implement ranking only if it improves the complete workflow while preserving exact command lookup and permissions.

Then test three complete stories:

**Kali/Windows → GitHub → future GPT.** A learner makes a small change, encounters a genuine error, pushes an artifact, inspects a reference, saves an explicitly requested explanation and returns later. GPT should identify what was tried, what the artifact does and does not prove, and the next useful experiment. Different paths/shells must not be collapsed into the same environment.

**Mobile self-study → Note → optional discussion.** A learner browses an area, follows an exact reference, annotates a confusing distinction, writes a personal explanation and chooses whether to ask GPT. They can return to the same source passage. Opening, reading and abandoning the activity records no learning achievement.

**Ordinary GPT creation → independent reuse → targeted revision.** A request creates a substantial reusable explanation and a separate practical route; the server derives mechanics. A second, unrelated learning task reuses the explanation. A later correction changes only the intended content and preserves old exact captures and personal Notes.

Evaluate wrong assumptions, missing evidence, extra reconstruction questions, resource correctness/usefulness, time to a useful next action, and manual copying. Record MCP response size and call count as supporting operational measures. Compare quality first; never trade away the learner's reasoning merely to save a tool call. Use synthetic data for reproducible measurements and only separately authorised real observations. No private logs in Git or new analytics service.

Direct GitHub access, a local helper, an extra runtime and offline packs should each have their own stop rule: **if the simpler workflow serves the learning need, do not add the subsystem**. Their value is conditional. The core opportunity is already clear: preserve the reasoning behind practical learning and make it available at the moment it can help again.
