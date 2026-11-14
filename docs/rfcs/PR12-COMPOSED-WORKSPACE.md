# PR12 composed workspace — connected experimental implementation

**Active GPT-first implementation:** [V189 report and acceptance](PR12-GPT-FIRST-IMPLEMENTATION.md) supersedes the earlier experimental frontend and its product recommendations. The authoritative product correction is [GPT-first presentation inspection](PR12-GPT-FIRST-PRESENTATION-INSPECTION.md).
> **Owner verdict (2026-11-14):** The V186 frontend is **not accepted** as the desired product experience. The manual Explore & compose/Retain UI is clunky and user-burdensome relative to the established Home and Project views. The owner wants **GPT to compose sophisticated workspaces for the user**, not a learner-operated reference editor. Moreover, GPT must inspect what Minamo actually presents via ordinary connected MCP, without reliance on a Work browser session. **Do not promote or cosmetically polish the manual composer as the primary UI.** The next authoritative product requirement is [GPT-first composition and MCP presentation inspection](PR12-GPT-FIRST-PRESENTATION-INSPECTION.md). The test and implementation results below remain valid as engineering evidence, not a positive UX verdict.

This report supersedes the V184 first-slice recommendation where it describes independent accumulation, server discovery or saved composition as unimplemented. The owner explicitly commissioned the full connected experimental product before deciding the long-term direction. Stable Minamo remains the default; no original Projects or learner Notes are migrated or rewritten.

## Implemented product flow

Settings → Workspace → Experimental experience → **Composed workspace** provides three connected surfaces:

- **Retain material:** independent ordered original wording, author-as-supplied, role and optional genuine origin. Corrections append without overwriting originals. The web form captures prose; GPT tools accept all supported typed rich parts, including tables, diagrams, cards, dialogue, code and permission-checked assets/excerpts.
- **Explore & compose:** server-side lexical discovery across eligible Projects, Articles, Questions and independent material, down to parts/cards/turns. Inspect a current-rights source, add its exact reference, choose pin/follow, order/group it and add clearly derived connective notes.
- **Saved experiences:** durable revisioned arrangements. Reopen, read, practise, compare sources side by side, change composition or presentation, inspect earlier saved revisions and check source updates. Arrangement membership does not copy or own its sources.

The rendering path shares the canonical rich Reader and source identity. Reading pages resolve at most four sources, practice one and comparison two; unavailable material is visibly withheld. Saved arrangement links reopen in the opted-in workspace. A stable user is not silently opted into an experiment by a URL.

## Canonical model and lifecycle

Material and arrangements are discriminated `experience` metadata on existing `work` records. Existing owner namespaces, generation fences, revisioned records/renditions, operation receipts, CAS, source admission, image/media checks and recovery transport are retained. Canonical schema change is additive; there is no new family, destructive migration or new revision system.

Material preserves ordered sections with matching attribution. Prior section bytes and attribution cannot be changed through either the new tools or generic command patches; later developments are appended. Creation/update retry IDs are deterministic and use an exact normalized request digest. Capturing a new independent item does not require a Project or Library destination. Supplied author/role/origin is not independently verified; no absent conversation URL, date or learner mastery is invented.

Arrangements store bounded references (up to 32) with exact family/id/section/part/rendition, source revision, explicit pin/follow, group and optional derived annotation. Save admits actual eligible source parts and fences source heads in the same canonical transaction. Referenced arrangements are not recursively admitted as source material. Existing unavailable refs may be retained unchanged or removed; new unavailable refs fail. Pin follows a saved edition subject to current rights; follow resolves the current eligible source. Numeric arrangement history remains separate from source rendition selection.

New independently retained material survives deletion of a Project that happens to discuss the same idea. A reference to a Project-owned part does not survive that Project's loss of eligibility; the reader shows it unavailable. No broad source copying or automatic ingestion is performed.

## Scalable discovery

Four owner-scoped derived tables hold documents, term postings, completed source heads and a dirty queue. Idempotent runtime setup creates only derived tables/indexes/triggers. Canonical insert/update/delete triggers enqueue affected records atomically. Bootstrap and maintenance are bounded; partial indexing is disclosed. Current canonical revision joins suppress stale entries, and actual rights-projected source reads regenerate/verify candidate evidence before any result is returned. These tables are disposable and excluded from canonical recovery backups; restored namespaces rebuild them from canonical records.

Latin words and overlapping CJK characters/bigrams support lexical lookup, not inferred equivalence. The candidate/output budget is bounded (up to 24); owner scope, current versions, real source parts and source rights remain authoritative. Some filtered pages may be empty with a continuation. Search ranking/semantic recall are deliberately not claimed to be solved by a term index.

## GPT capability

Four new typed operations are exposed in the server MCP catalogue:

1. `retain_minamo_material`: create independent material or append at an exact revision; typed rich parts, supplied attribution/origin and generated structural IDs.
2. `discover_minamo_material`: bounded current-eligible part/sub-item discovery with explicit index completeness and continuation.
3. `save_minamo_arrangement`: owner-requested ordered composition from inspected exact source references, or deliberate evolution at an exact arrangement revision.
4. `read_minamo_arrangement`: read current/historical saved composition with bounded rich source resolution and unavailable/newer-source evidence.

The optional page advertises fresh schemas through WebMCP and uses the same GPT dispatcher through an authenticated API bridge, preserving scope, generation, tool access preferences and actor restrictions. Ordinary website editing remains a signed-in owner action. Read-only MCP preference hides and blocks new saving tools. No GPT Note-authoring exception was added.

The existing installed ChatGPT connector may cache its previous tool list; a separate connector refresh is required before claiming fresh installed-connector discovery. Fresh page-tool discovery and actual live authoring are reported separately from that external client condition.

## Verification and acceptance

`tests/pr12-accumulation.test.mjs` uses the existing real corpus fixture, actual migrations, D1/R2, HTTP handlers and MCP JSON-RPC dispatch. It exercises capture, append, rich table/card fidelity, retries, stale CAS, immutable originals, cross-source discovery, saved arrangements/evolution/history, source deletion, owner isolation, schema visibility, the authenticated page bridge and read-only policy enforcement. Existing domain/recovery/Project/source-permission tests remain selected for release.

`scripts/pr12-d1-growth.mjs` exercises the production index/query/resolver against the untouched real corpus plus actual isolated D1 records representing explicitly fictional mixed activity over two years. It tests 100/1,000/10,000/50,000 synthetic passages, older authentic retrieval, bounded result bytes and deletion withholding. This is engineering scenario data, not a reconstructed learner history or a production latency claim.

## V186 release and actual acceptance

- Live **V186**, existing Site `appgprj_6aeba0aa528c81918be19dd51427b2cb`, https://minamo.jscymru.chatgpt.site. Settings → Workspace → **Composed workspace**; Stable Minamo remains the default. Earlier Passage explorer/Practice sequence choices remain available.
- Native source `9db6e39da88ee10ce70acf17b4e5f8e48187573e`; public application/test source `117e9db29f87e271665896e8e97c5a5be7dbe5bc`. All 20 changed source files compare byte-for-byte and mode-for-mode. Native-only files were retained. Subsequent public documentation receipts require no application redeploy.
- Saved version `appgprj_6aeba0aa528c81918be19dd51427b2cb~appgver_1ae8b89a8e748191b156cf1b2ec212a1`; deployment `appgdep_6af815b6ad808191be65c44960ba39b0`, succeeded, environment revision 5, MCP enabled. Existing audience, identity, storage and bindings retained.
- First connected V185 passed typecheck/build and 51 focused tests. Real browser use found page `/mcp` invocation failed. V186 routes page tools through the authenticated guarded GPT dispatcher. Typecheck/build passed; 46/47 selected tests passed initially. The remaining test spread an unrelated preference field into an exact preference schema; fixed that fixture and the affected comprehensive test passed 1/1. No runtime source changed after the successful build. No full historical suite was run.

The real GPT-authoring campaign used freshly discovered page tools, not hard-coded guessed schemas or a simulated tool stub. It retained new attributed rich Japanese prose, a comparison table and flashcards, replayed the exact operation without duplication, appended a later explanation while preserving the first section, discovered these alongside genuine Projects, saved a cross-source comparison, read all four sources, evolved it into a differently ordered practice experience, and reopened historical revision 1. All saves used exact generation, revision and operation identity through the normal GPT actor dispatcher.

The useful new material **Piano and listening · retained contrast** is at revision 2, with two independently retained sections. It is explicitly GPT-authored teaching material, not a learner attempt or proficiency evidence. No absent conversation date or URL was invented. The saved experience **Playing, listening and talking about music** combines the genuine Making Friends response, the new contrast table/cards and the original Japanese Speaking Practice dialogue. Its revision 1 is comparison; revision 2 is practice with a new order. It is available from Saved experiences, or after opting in at:

https://minamo.jscymru.chatgpt.site/?view=home&experienceId=arrangement-27d81e13583662edd587045c2b8fe44da0e23c09

Actual live browser acceptance verified saved-list retrieval, practice card reveal, original dialogue translation and second-turn reveal, paged resource navigation, historical side-by-side comparison, the followed-source change marker after append, pinned revision-1 content after the source reached revision 2, and full navigation through the durable link reopening revision 2. Shared ruby and speech controls render. Final full canonical reads of Making Friends revision 12 and Japanese Speaking Practice revision 21 compare equal to their pre-authoring records, including their sections, renditions and composition metadata. The browser is left on the new experience for review.

## Actual D1 accumulation measurements

The run uses isolated D1/R2 and real canonical records, not an array-only index simulation. Synthetic passages are explicitly fictional engineering workload distributed over two years; authentic source bytes remain intact. Search for older authentic `Yann` material returned one result (1,892 bytes) at every scale; deleted-source content was withheld. Full machine-readable evidence is in [PR12-D1-GROWTH.json](PR12-D1-GROWTH.json).

| Added passages | Indexed documents including real corpus | Seed/index time | Query/resolution time |
| ---: | ---: | ---: | ---: |
| 100 | 405 | 3.65 s | 93.87 ms |
| 1,000 | 1,305 | 7.69 s | 68.09 ms |
| 10,000 | 10,305 | 80.45 s | 65.30 ms |
| 50,000 | 50,305 | 387.20 s | 115.74 ms |

These are single-run local D1 observations, not production latency guarantees, semantic relevance scores or actual learner history. The run preceded the added reverse-term repair index, so it does not claim to measure that improvement. Serving bounded results remains practical; first indexing and large record repair are the cost to address before broad adoption. Runtime bootstrap discloses incomplete coverage, prioritises retained material and Projects, and continues bounded indexing while the composer is open.

## Active architectural recommendation

Retain the additive `work.experience` model and canonical Reader for this experiment. Actual capture, immutable append, composition, revision history and source resolution now work on the existing record/generation/recovery system, without requiring a new family or parallel event store. The original separation is useful logically: original material and arrangements have different lifecycles, but need not occupy separate revision infrastructures. A new family remains an option if real work-subtype semantics conflict; no such requirement has yet been demonstrated. Do not flatten or copy source content into arrangement membership. A rebuildable lexical D1 projection is sufficient for the measured retrieval tasks; a vector database or global inferred graph is not justified by these observations.

Evaluate the complete interaction before promoting a default. The owner can assess whether retaining without filing, finding earlier wording and composing for a current purpose reduces organisational effort, whether reading/practice/compare cover real needs, and whether pin/follow should be exposed per entry or simplified. These are product decisions, not prerequisites for trying the implemented loop.

## Remaining work and explicit limits

- **Installed connector:** this session's existing Minamo connector still advertises its older cached catalogue. Server schemas and real fresh page-tool GPT authoring pass; refreshed installed-connector/fresh-chat authoring is not yet accepted. Refresh/reinstall the Minamo connection to expose the four new tools there.
- **Discovery quality/operations:** lexical only; tune Japanese recall, matched-term evidence, duplicate parent/card grouping, filtered empty pages and long-term relevance with owner queries. Add background index maintenance/checkpoint scheduling if actual accumulation makes browser-assisted bootstrap insufficient. No automatic ingestion is implemented.
- **Frontend polish:** the web retention form captures prose, while GPT can retain typed rich content. The composition detail currently exposes supplied attribution as JSON; a friendlier provenance view and keyboard/mobile editing polish remain. Bounds are deliberate: 8 sections per retain request, 30 per material record, 32 references per composition and bounded resolved pages; accumulated material can span independent records.
- **Language/media:** physical phone/touch and audible TTS completion remain unverified. The existing context-free furigana engine still misreads ambiguous 弾き in an original piano passage; original text was not rewritten. Image/media source rights use shared guards, but no new live binary asset campaign was performed.
- **History/recovery:** current real snapshots plus newly created genuine revisions are retained; missing older conversations/history are not reconstructed. Revision/deletion/isolation/CAS/retry/rights/recovery tests passed in isolation. No destructive production restore or live revocation campaign against genuine learning content was performed.

The connected experimental product is usable end to end; the above acceptance and polish work remains before stable promotion. Keep PR #12 draft and unmerged. No destructive canonical migration or original learner-material modification was performed.
