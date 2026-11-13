# PR12 — Working evidence and current recommendation

This document is the active recommendation resulting from the Work commission. The commission remains the scope/authority; older RFC diagrams are hypotheses, not competing implementation decisions.

## Implemented slice

Two Settings → Workspace experiments run against actual current owner-eligible Japanese Project material: **Passage explorer** (cross-source discovery of canonical parts and nested cards/turns) and **Practice sequence** (one existing interactive resource at a time, with an optional chooser and previous/next). Existing stable Home, Projects, Library and Your work remain default. Selection is browser/owner-scoped, versioned, whitelisted and reversible. No canonical source is rewritten. Original passage links retain source rendition, section and part. The normal rich Reader renders selected material: tables, diagrams, ruby, speech and interactive components are reused, not transcribed into a second renderer.

The experiments load up to eight rights-projected records per discovery request, with an explicit continuation; search reaches saved nested wording. They show counts for loaded sources, never imply global search completeness, and render twelve result rows initially. Search results contain source/title and the saved resource kind, not inferred learner authorship. Nested matches reopen the containing resource, preserving context; a nested ID is a search locator within its parent/edition, not a newly promised global durable identity. Exact selected edition is fetched through existing `/api/context` before display. Focus return clears discovery and detail and rereads current rights. No experimental content is cached in localStorage.

Limit: this is Japanese Project discovery, not yet a general cross-family accumulation frontend, saved arrangement editor or independent live capture contract. Source attribution remains only as good as existing saved wording. Experiments depend on existing Projects and do not survive their deletion. The UI is an architectural probe, not the final product taxonomy.

## Reusable evidence

`tests/corpus/pr12/` contains complete returned current canonical projections for Making Friends (rev 12) and Japanese Speaking Practice (rev 21), source IDs and byte hashes, all 138 parts, 127 nested cards and 40 dialogue turns. Current compositions and returned revision/rendition metadata are retained. There is no invented transcript or chronological history. Manifest/README explicitly disclose absent historical editions, separate contributions and external binary assets.

The isolated loader applies real migrations to local Miniflare D1/R2, uses a fixed TEST-ONLY owner and seeds exact current record/revision bytes. It accepts no production endpoint or credentials. Preservation tests read actual application projections, compare sections and renditions, reject a second owner and withhold deleted sources. Existing `work` creation was also rehearsed locally: a rich capture exists with no Project or links, remains readable after deleting the original Project fixture, and can be referenced from two manifests. This proves storage capability, **not** an approved live capture policy, typed attribution contract or production saved-experience implementation.

## Compare the alternatives

| Alternative | Fidelity and lifecycle | Cost / complexity | Decision |
| --- | --- | --- | --- |
| Existing Project-owned refs only | Exact rich source editions; removing the Project removes eligibility | Lowest risk; no migration; useful for immediate UX comparison | Use for deployed probes; insufficient for independent accumulation |
| Existing WorkspaceRecord `work` with a discriminated capture contract | Existing owner/revision/rendition/rights machinery; can exist unassigned; needs explicit ordered origin/author semantics | Modest additive contract and editorial policy, no second revision system | Preferred next vertical slice, subject to policy and fidelity tests |
| New independent material family | Clear domain identity and lifecycle | Touches family enums, permissions, navigation, MCP, import/recovery and many readers | Reserve if a work subtype causes real semantic conflicts; no evidence yet that a new table/family is necessary |
| Append-only source events plus read projections | Strong ordered provenance going forward; cannot reconstruct missing old history | Event replay, evolving projection versions and more operational complexity | Reuse actual revision receipts; defer separate event store |
| Copy sources into each saved presentation | Easy initial rendering but breaks update/deletion semantics and creates divergent duplicates | Growing reconciliation cost and ambiguous authority | Reject as default arrangement model |

**Recommendation:** keep canonical rich records and the existing revision/rights system. Introduce a narrow discriminated independent capture shape on `work`, explicitly distinguishing retained author text, correction, generated instruction/practice and unknown attribution, with genuine order and capture provenance. Do not call every capture a task or require a Project. Persist arrangements as bounded exact-reference manifests with explicit pin/follow policy, derived connective text and ordinary revision/CAS protection. Arrange without moving sources. A new global graph or vector database is not justified by this evidence.

The reference separation in PR12 is useful as a *logical* model, but revise its implication that a new general material schema/storage layer must precede useful frontend experiments. Existing work records already prove unassigned storage is possible. Conversely, Project refs alone must not be sold as independent retention. A deliberately retained copy may be appropriate at capture time, with explicit rights and provenance; arrangement membership itself never makes that copy.

## Discovery and growth

`node scripts/pr12-discovery-benchmark.mjs` compares the same canonical-derived entries at 100 / 1,000 / 10,000 / 50,000 deterministic repeated item scales. It preserves parent refs and rich-item wording, adds a small mixed-computing marker and compares bounded lexical postings with the browser's scan. Output is in `PR12-DISCOVERY-BENCHMARK.json`. At 50k the sample scan took about 77 ms CPU vs about 0.02 ms for a prebuilt lexical lookup; building postings took about 1.1 seconds. These are single-run local CPU observations, not Worker or network latency claims. Returned candidate payload is capped at twelve (about 20 kB in the sample).

This supports a rebuildable owner-scoped part/sub-item discovery index before expanding the live corpus substantially. It does not prove relevance, ranking, Japanese recall or better learning outcomes. Repetition tests cost/fidelity, not a realistic two-year history. Current prototype tokenization is deliberately incomplete (paired Japanese characters are not overlapping); do not deploy it as a full Japanese search index. Recommend a small D1 lexical projection plus tested CJK n-grams, exact canonical ref/rendition/eligibility markers, transaction/incremental update hooks and source reread at resolution. Start with lexical evidence and real queries; assess semantic search only if measured recall requires it.

## Next valuable slice

1. Tighten discovery UX from owner comparison and deployed browser observations; retain both experiment choices during evaluation.
2. Add a rebuildable D1 part/nested discovery projection and bounded server candidate endpoint; benchmark real D1 reads and update/revocation repair rather than copying the whole corpus to browser memory.
3. Add the discriminated independent capture contract with literal author/provenance/order, a tiny typed backward-compatible MCP operation and full ownership/generation/revision/idempotency tests. Verify through a fresh installed ChatGPT connector after deployment. No MCP schema changed in this slice.
4. Persist one exact-reference arrangement using shared source rights and explicit edition policy. Test pin vs follow, unavailable sources, refresh and recoverability on the same corpus. Keep owner Notes separate.
5. Expand snapshots with genuine retained historical editions and separate contributions. Add deterministic six-month/two-year scenarios for corrected ideas, shifting relevance, source revocation and missing origin, with measured task relevance and rendering cost.

No destructive migration has been performed or is required for this slice. A future migration needs a rehearsed identity mapping/loss report and rollback before production adoption.

## Release and acceptance

Exact deployment IDs, source hashes, focused checks, browser observations and unresolved limits are recorded in the release evidence appended after publication. Local builds or passing fixture tests alone are not live acceptance.
