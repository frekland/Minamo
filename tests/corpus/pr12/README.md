# Real Minamo corpus, snapshot v1

Two full current Project record projections extracted through the connected Minamo MCP on 2026-11-13, with explicit owner permission for public publication. JSON files preserve returned `structuredContent`, not reconstructed plain text. Manifest hashes cover exact file bytes; IDs, compositions, revisions, renditions and nested interactions are retained. There are 138 canonical parts, 127 cards and 40 dialogue turns.

Run ordinary tests locally without live access:

```sh
node --test --test-concurrency=2 tests/pr12-experiences.test.mjs
node scripts/pr12-discovery-benchmark.mjs
```

`pr12CorpusFixture` creates in-memory local Miniflare D1/R2, applies actual migrations and seeds records and their current saved revisions into the fixed TEST-ONLY principal. It cannot accept production endpoints or credentials. It deliberately seeds canonical snapshots directly, avoiding command compilation that would assign fresh identities or recompute editions. It runs actual rights-filtered application reads afterwards. No production recovery activation is involved.

Deliberate refresh procedure:

1. Use connected `query_minamo_records(family:journey, language:ja)` and confirm the exact two genuine Project IDs.
2. Call `read_minamo_record` on each ID. Save its complete returned `structuredContent` as indented JSON with a final newline, replacing only that source file. Stop on truncation or unavailable rich data.
3. Review content rights and omissions. Never save the tool transport headers or credentials. Additional retained historical editions belong in separate files, not invented history.
4. Update extraction time in `scripts/pr12-corpus-manifest.mjs`, run it, review the canonical diff/hashes/counts, rerun fixture tests and benchmark, then commit. Git retains previous snapshots.

Snapshot limitations are authoritative in `manifest.json`. Separate learner-contribution records and historical editions are not included. Stored source wording sometimes carries authorship distinctions; this is not a complete typed attribution system. Personal exchanges are included under the owner's express commission; no independent external article or protected binary was included. No claim is made to reconstruct original unsaved chats or per-part dates.
