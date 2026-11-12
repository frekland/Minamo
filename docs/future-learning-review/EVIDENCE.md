# Evidence register and review limits

This register supports the [initial exploration](INITIAL-EXPLORATION.md). Observations are dated 23 October 2026. Proposals and acceptance criteria are future possibilities, not implemented capabilities or completed tests. Later synthesis experiments and specialist review are recorded separately in [validation receipts](VALIDATION-AND-SPIKES.md); the [integrated design](IMPLEMENTABLE-PLAN.md) now selects the scope.

The later [UX/UI and Library growth extension](UX-UI-AND-LIBRARY-GROWTH.md) adds a fresh live/source inspection, observations O1–O7, frontend primary references and Sites integration feasibility limits. Its evidence section supplements this register; its proposals carry the same read-only/no-deployment scope.

## Exact baseline and scope

- GitHub V2 `main`: [`fac857a685e49699a737accf0e63484b8f6c2dcf`](https://github.com/frekland/minamo-v2/commit/fac857a685e49699a737accf0e63484b8f6c2dcf), fetched at the beginning and again during review.
- V2 tree: `04d23f927dce3a6af5cb130f45abac8651c4f7de`.
- Existing native checkout: `90804f2c90cacbd369e15206291a116c78f61423`, same tree, clean at inspection. It was not changed for this review.
- Existing owner-private V21: [Minamo V2](https://minamo-v2.jscymru.chatgpt.site). Prior PR26 release/source/acceptance evidence is recorded in [the final receipt](https://github.com/frekland/minamo-v2/pull/26#issuecomment-6374295130). That is prior evidence, not a claim that this review reran the release suite.
- V1 reference snapshot: [`e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327`](https://github.com/frekland/Minamo/commit/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327). Read-only.
- No learner records, attachments, relationship acceptances, Developments, source admissions or classification changes were written. The only product mutations requested by this task are a new Git branch/commit/draft PR containing these documents. No deploy, merge, reinstall or new credentials.

## Current source observations

All S-links are pinned to the inspected V2 commit; line numbers are avoided because long source lines make ranges misleading.

| ID | Source | Observed fact and implication |
| --- | --- | --- |
| S1 | [Architecture](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/docs/IMPLEMENTED-ARCHITECTURE.md), [AGENTS](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/AGENTS.md) | Shared web/MCP domain, retained reading, owner/generation/CAS/operation safeguards. Authentic external work and rich reusable explanations are explicit priorities. Old “unfinished” sections need reconciliation with later implementation evidence. |
| S2 | [Catalogue](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/lib/catalogue.ts), [domain](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/lib/domain.ts) | `queryLibrary` uses `instr(lower(...),lower(?))` for topic prose, exact catalogue terms/aliases for references, keyset pagination and current projection. `queryRecords` also uses literal inclusion plus explicit concept matching. No FTS ranking is implemented in these paths. This supports a benchmark, not a claim that performance is currently unacceptable. |
| S3 | [Manuscript](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/lib/manuscript.ts), [intake](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/lib/manuscript-intake.ts), [package](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/lib/authoring-package.ts), [benchmark](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/lib/manuscript-benchmark.ts) | Text-first compilation and atomic guarded publication already exist, with source editions, stable identity/reuse and structural risk advisories. Preview does not reserve revisions or certify teaching. Existing benchmark material already provides a base to extend. |
| S4 | [Handoff component](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/app/gpt-handoff.tsx), [workspace](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/app/workspace.tsx), [handoff documentation](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/docs/GPT-HANDOFF.md) | Clipboard brief supports exact context and up to eight chosen related records; generic ChatGPT link. The only workspace invocation is guarded by `!isReadingFamily(current.family)`. Documentation describes reading integration more broadly than the current invocation. B1 confirms the observed Article case only. |
| S5 | [Learning work](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/lib/learning-work.ts), [resume projection](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/lib/learning-perspective-view.ts) | Explicit exact stage/Investigation target; typed evidence/facts, decisions/reasons, next action, correction/withdrawal and rights checks. Latest eligible resume is a faithful projection, not automatic semantic synthesis. Existing focused reads avoid a new session/progress model. |
| S6 | [Contracts](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/lib/contracts.ts), [learning evidence checks](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/lib/learning-work.ts), [domain](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/lib/domain.ts) | Repository evidence validates full SHA and pinned GitHub URL shape; it does not fetch repository bytes. GPT cannot author genuine observed Runs by setting `evidence: observed`. |
| S7 | [Tools panel](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/app/tools-panel.tsx), [runtime](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/lib/tool-runtime.ts), [runtime documentation](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/docs/TOOLS-RUNTIME.md) | Five engines: Python, SQL, regex, Unicode, finite Web. Initial synthetic choice is true; Run saves capture classification. No general JavaScript engine. Execution/save are separate and browser fidelity is explicit. Existing draft-replacement checkpoint should be reused. |
| S8 | [Notes implementation](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/docs/pr23-integrated-correction/NOTES-IMPLEMENTATION.md), [recovery](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/lib/recovery.ts), [recovery UI](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/app/recovery-panel.tsx) | Rich Notes and recovery/rights-aware portable JSON already exist. The small materialized JSON path is bounded; private complete checkpoint files are distinct. Proposed selected study exports/offline packs must not bypass either rights or recovery. Physical device acceptance is a stated limitation in prior release evidence. |

## Live browsing and MCP observations

**B1 — Library, technical references and exact reading.** In the authenticated existing Site, navigated Tools → Library → Commands → a command entry → its Article section → Manage. Observed subject areas, dedicated technical-reference filters, explicit exact-name/alias guidance, command definitions/environment, an exact section/rendition destination, Back to Library, readable code with Copy controls, section navigation, source links, optional consent-loaded videos, purposeful backlinks and Notes access. Manage offered Edit/Check for updates; no GPT handoff in that observed Article. Did not edit, flag, favourite, load external players or save anything. This confirms successful capabilities as well as a bridge opportunity; it is not a full accessibility or corpus-quality audit.

**B2 — Tools.** Observed “Browser experiments · no Kali connection”, explicit execution/save separation and the checked “Mark this execution as SYNTHETIC TEST ONLY” option on initial Python view. No execution occurred during this browser inspection. Proposed classification changes require careful product decisions; no existing record was reclassified.

**M1 — installed guidance.** Read `get_minamo_editorial_policy` through the installed connector. Returned `minamo-editorial-2026-10-22.19`, natural manuscript defaults, optional compact preview, role-specific guidance, catalogue/reuse/revision instructions and explicit limits of quality feedback. Installed per-action descriptions match these capabilities. The app-level tool-description prefix still says “Isolated synthetic foundation lab for React, server rendering and private persistence.” This is a wording inconsistency, not proof that current tools are disconnected or require reinstallation.

**M2 — adversarial authoring preview.** Called `preview_minamo_manuscript` twice, sequentially, with `synthetic: true`, compact default output, one new Article, no declared existing coverage and test-only operation identities. The original brief explicitly identified a disposable read-only evaluation and denied publication. The intentionally wrong Article said default JavaScript numeric sorting is numeric; its correction explained default string comparison and a numeric comparator. Both included explanatory prose, code, an illustrative-output label and an MDN link.

| Input | Result | Findings | Observed round trip | Serialized response length |
| --- | --- | --- | --- | --- |
| Plausible but technically wrong | `valid: true` | `coverage_not_inspected` advisory; no manuscript warnings | 4,665 ms | 1,188 JavaScript string code units |
| Corrected explanation | `valid: true` | Same advisory; no manuscript warnings | 4,754 ms | 1,188 JavaScript string code units |

These single observations include connector/network overhead. They do not establish p50/p95 latency, teaching quality rates or comparative architecture performance. Predicted IDs in preview are not saved records. No publish/apply/receipt-writing call was made and no cleanup mutation was needed.

An independent local executor check, using standard Node and no installed dependency, evaluated the disputed expression:

```javascript
const values = [2, 10, 1];
console.log(JSON.stringify({
  defaultSort: [...values].sort(),
  numericSort: [...values].sort((a, b) => a - b),
  original: values
}));
// Actual development-check output:
// {"defaultSort":[1,10,2],"numericSort":[1,2,10],"original":[2,10,1]}
```

This is a developer experiment, never learner evidence. MDN's primary reference independently confirms default conversion/comparison and in-place mutation [R8]. The intended conclusion is narrow: structural acceptance cannot distinguish this factual error. The current guidance already acknowledges that limitation.

## History examined

| ID | Pinned historical evidence | What to carry forward |
| --- | --- | --- |
| H1 | [V1 current owner decisions](https://github.com/frekland/Minamo/blob/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327/reports/owner-review-1/CURRENT-DECISIONS.md), [owner UX update](https://github.com/frekland/Minamo/blob/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327/reports/OWNER-UX-UPDATE-2026-10-21.md) | Substantial, enjoyable learning; personal Notes and precise references; no compulsory administration/mastery claims. Historical authority is interpreted through current user instructions and V2, not copied as an active V1 commission. |
| H2 | [Parked GitHub learning integration](https://github.com/frekland/Minamo/blob/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327/improvement-ideas/PARKED-GITHUB-LEARNING-INTEGRATION.md) | Explicitly parked/low priority because usefulness was uncertain. Exact links/GPT retrieval first; selected read-only access only if genuine demand; commits do not prove learning. Reconsidered here, not executed. |
| H3 | [Portable learning exports proposal](https://github.com/frekland/Minamo/blob/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327/improvement-ideas/PORTABLE-LEARNING-EXPORTS-MCP.md) | Test ordinary reads and available ChatGPT conversion first; eligible human-readable exports differ from recovery archives. V1 shapes/limits are historical, not current V2 contracts. |
| H4 | [V1 MCP authoring retrospective](https://github.com/frekland/Minamo/blob/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327/reports/MINAMO-MCP-AUTHORING-RETROSPECTIVE-2026-10-21.md) | Installed schema/guidance can differ from source. Verify real capability instead of inferring client behaviour; avoid repeated generic audits. |
| H5 | [V2 PR history](https://github.com/frekland/minamo-v2/pulls?q=is%3Apr+sort%3Acreated-asc), [regression review](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/docs/ux-regression-review/V1-V2-INTERACTION-REGRESSION-REVIEW.md), [continuity decisions](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/docs/learning-continuity/ACCEPTANCE-AND-DECISIONS.md) | Reading, stage navigation, diagram visibility and continuity required integrated corrections over successive PRs. Read source and later receipts before calling an old issue current. This review inspected PR metadata/history and selected documents, not every historical diff. PR12 is not revived; PR23 is not modified. |

## Primary external research

Sources were retrieved through connected research tools on 23 October 2026. These substantiate mechanisms/constraints; proposals remain this review's judgement. Search results from secondary blogs were not used to establish technical claims.

| ID | Source | Relevant support and limits |
| --- | --- | --- |
| R1 | [SQLite FTS5](https://sqlite.org/fts5.html) | Ranked full-text retrieval, BM25, snippets/highlighting and external-content consistency responsibilities. FTS is not semantic equivalence; query syntax and technical punctuation require separate handling. |
| R2 | [Cloudflare D1 SQL statements](https://developers.cloudflare.com/d1/sql-api/sql-statements/) | Documents FTS5/fts5vocab support. Does not establish the actual Sites account's quota, runtime performance or automatic support for a particular migration. |
| R3 | [GitHub REST API rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) | Authenticated/unauthenticated primary limits and secondary limits apply. Supports bounded on-demand access; does not grant private repository authentication. |
| R4 | [IES: Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/practiceguide/1), [full practice guide](https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf) | Evidence-based guidance on spacing, worked examples/problem solving, retrieval and explanatory questions. Not a direct evaluation of Minamo, ChatGPT tutoring or adult computing self-study. |
| R5 | [quickjs-emscripten maintainer README](https://github.com/justjake/quickjs-emscripten/blob/main/README.md) | WASM interpreter, context/runtime isolation, memory/stack limits, interruption and explicit handle disposal. It is a candidate requiring a runtime/packaging/licence review and adversarial tests, not a verified Minamo integration or complete OS/browser environment. Firecrawl's initial HTML extraction was uninformative; the GitHub connector retrieved the actual README. |
| R6 | [MDN: storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) | Browser storage is generally best effort; persistence, private mode, quotas and eviction vary. Local draft/offline design needs explicit limitations. |
| R7 | [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions) | Private repositories have finite included allowances. Beyond allowance, usage may bill with payment configured or be blocked without payment. Therefore no learning workflow should require unbounded hosted execution. Exact allowances should be rechecked when implementation is considered. |
| R8 | [MDN: Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) | Default string/UTF-16 ordering, comparator behaviour and in-place mutation support the M2 technical counterexample. |

## Original review limits, before the synthesis experiments

The following records the limits of the first draft. The later validation receipts add synthetic retrieval/Reader/browser experiments and specialist challenge; they do not claim production implementation or physical-device acceptance.

No new FTS index, GitHub adapter, runtime, local helper, export format or offline mode was implemented or benchmarked. Cost/maintenance trade-offs are architectural assessment; account-specific free quotas were not inspected. No physical Android/Windows session, TalkBack assessment, external video playback, long-term learner study or fresh-conversation transfer trial was conducted in this review. The proposed complete stories are acceptance criteria for subsequent work.

Document validation checks source paths, pinned references, Markdown structure, private-data exclusion and the final draft-PR file diff. Runtime typecheck/build/tests were not rerun for documentation-only changes; previous release checks are not relabelled as new results. No specialist agent was commissioned for this review, and the conclusions are not represented as independent multi-reviewer consensus.
