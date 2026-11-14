# PR12 — V184 investigation and first-slice evidence

**Historical V184 findings.** The active implementation, architectural recommendation and remaining work are now in [Composed workspace — V186](PR12-COMPOSED-WORKSPACE.md). Its connected implementation supersedes the next-slice and unimplemented statements below. This report retains the earlier evidence; the commission remains scope/authority.

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

### Published implementation and source reconciliation

- **Live:** Minamo **V184**, https://minamo.jscymru.chatgpt.site/, native commit `13214378458da50e79a07cf84b374ed840c6bacc`.
- **GitHub application:** `c8cd04add3229188805c3a5b4dede60012ceb195`; tree `377c96a81d4157742f1c04f249e537f353ba1075`. Reviewed native changes match the public PR byte-for-byte and mode-for-mode; see `PR12-SOURCE-RECONCILIATION.json`. Public documentation/receipts follow separately without an application redeploy.
- **Deployment:** `appgdep_6af7a5adc704819192bb27ef274a08d9`, saved version `appgprj_6aeba0aa528c81918be19dd51427b2cb~appgver_528b7b9dbb94819199cf029137ad857a`, succeeded, environment revision 5, MCP ready. Existing identity, audience and storage bindings retained.
- First iteration V183 (`b9b55ce…`) passed build/typecheck/36 focused tests, but live use exposed reversed URL/scope arguments to `generationFetch`. It returned HTML rather than data. Corrected in V184 and added an integration-level request contract test covering actual path, owner/principal header, generation header, continuation and exact-edition rejection. Corrected typecheck/build and 13 focused tests passed. No full historical suite was run.
- The initial production version was verified as V182 at native `9c3d68c…`; an old receipt called the same source V178. This discrepancy was a receipt label, not newer native functionality to overwrite.

### Actual deployed browser evidence

| Check | Observation |
| --- | --- |
| Stable default | Existing Making Friends reader opened normally before opt-in; Settings initially showed Stable Minamo selected |
| Opt-in and persistence | Settings → Workspace selected Passage explorer, navigated to experimental Home; selection survived full reload |
| Cross-source discovery | Two genuine Projects; 305 canonical-part/nested-item matches before filtering; 37 `music` matches, a specific `Yann` learner response, and all 18 saved tables found |
| Original attempt/context | Displayed saved `Yann tiersen と einaudi…` response and the explanation distinguishing 聴く/弾く and the actual はい reply, without modifying it |
| Flashcards | Exact rev 21 resource opened after rights/edition check; reveal and next changed Question/Answer and card position |
| Practice alternative | Auto-opened first resource with collapsed chooser; next-resource read another exact resource; `dialogue` narrowed to six saved dialogues |
| Dialogue | Revealed second turn and English translation; existing ruby and play/turtle controls rendered |
| Tables | Exact Making Friends rev 12 table rendered Japanese, natural English and nuance in actual table cells |
| Furigana | Settings → Languages → Hide removed all visible ruby readings in the selected table; restored Show afterwards |
| Exact original link | Open original passage switched to stable Project reader with exact record, rendition, section and part in the URL |
| Narrow layout | Actual deployed browser at 454 CSS px (300% zoom in 1363px window), document width also 454; stacked layout and dialogue translation remained usable |
| Stable fallback | Return to stable Minamo restored ordinary Home; test browser ended with stable selection, original furigana preference and 100% zoom |
| Source integrity | Full canonical MCP readback of both original records compared equal to pre-test reads, including revisions and renditions |

**Acceptance limits and observed defects:** this was responsive desktop-browser testing, not physical-phone/touch testing. Device emulation was unavailable because browser policy blocks DevTools. Speech click reached “Downloading or opening Japanese voice”; audible completion was not established. The shared existing furigana engine rendered one ambiguous `弾き…` as はじ rather than ひ in the piano example; source text is intact, but context-aware reading correction remains needed. The All-scope header does not show the Japanese furigana shortcut for an experimental Home, although Settings changes the shared preference correctly. Candidate snippets currently flatten metadata and title matches can be broad; ranking, matched-term evidence and duplicate parent/card grouping need refinement. Current/historical source-rights projection is reused, but actual source-revocation race/browser caching campaigns were not performed on live genuine data; isolated owner/deletion and exact-edition refusal tests passed.

### What remains from the commission

The owner-visible experimental deliverable, real current corpus, isolated preservation harness, alternative-storage rehearsal and bounded growth comparison are implemented. This is **not** completion of the entire long-term system: a persistent D1 fine-grained index, independent typed capture/provenance MCP flow, saved cross-source arrangements, richer genuine-history/contribution snapshots, realistic multi-year relevance/revision/revocation scenarios, physical mobile/audio acceptance and promotion of a preferred default remain subsequent slices. Keep this PR draft/unmerged. Do not infer that the local work-capture proof authorises silently copying existing Project content in production.
