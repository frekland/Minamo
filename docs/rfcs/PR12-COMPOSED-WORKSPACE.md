# PR12 composed workspace — connected experimental implementation

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

Final release identities, real browser/GPT observations, results, measured limits and source reconciliation are appended after the final accepted deployment.
