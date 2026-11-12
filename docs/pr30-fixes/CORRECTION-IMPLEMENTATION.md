# PR30 correction graph repair

24 October 2026. Resolves the verified self/cyclic supersession defect from [research PR30](https://github.com/frekland/minamo-v2/pull/30). The research PR and its defective-baseline comparisons remain historical; none of its generated reports, frozen tutor payloads or experimental wrapper is needed by the production write path.

## Shared write contract

`lib/learning-work.ts` keeps immutable `priorOperation` recovery before all new graph validation. A committed retry therefore returns its original receipt even after legal later revisions, withdrawal or target Trash. Reusing that ID for a changed payload still returns `idempotency_mismatch`.

New active supersession edges inspect same-owner ancestry through one metadata-only recursive SQLite query. Candidate identity is the real event identity, including the deterministic ID used by multi-target batches. Self-reference, repeated ancestry, missing heads and cross-target ancestry reject before an operation, event, history or perspective is written. New writes are bounded to 40 checked ancestry heads and return `correction_chain_limit` rather than silently accepting an unchecked tail. A withdrawn endpoint terminates active ancestry, but its revision and withdrawn state are still checked.

Every inspected head's exact ID, revision, target key, withdrawn state and outgoing edge participates in the existing D1 transaction claim conditions. Concurrent opposing revisions that both finish preflight against the old graph cannot both commit. This extends existing atomic guards; it introduces no graph table/service or separate relationship authority. Removing an edge or withdrawing an existing invalid account remains possible. Creation/revision dates and absent next actions keep their existing meaning.

## Recovery compatibility

`lib/recovery.ts` checks the complete staged current graph after page-based structural validation and rechecks it before activating a previously ready stage. `validateRecoverySupersessionGraph` loads only compact ID/target/withdrawn/edge metadata in 128-row pages, under the existing `RECOVERY_LIMITS.rows` bound. Iterative colouring checks each edge once; no event bodies or recursion stack are retained. Valid legacy chains longer than the new-write window remain admissible. Retained historical revisions are not rewritten or rejected merely because a past revision contains a mistaken edge. Only an invalid **current active** graph is refused. Normal source/media rights intersection remains authoritative.

## Permanent regression coverage

`tests/pr30-correction-graph.test.mjs` promotes the laboratory counterexamples into six corrected-contract tests using actual Worker/D1 and encrypted recovery fixtures:

- HTTP/MCP self and cycle refusal, no partial histories/perspectives/receipts, ordinary correction chronology and absent action preservation.
- Committed replay after later withdrawal/graph edits and target Trash, plus changed-payload refusal.
- Exact owner/target membership, actionable chain bound, actual batch IDs and valid atomic multi-target publication.
- Forced simultaneous preflight of opposing edges and withdrawn-head restoration; only one complete mutation commits.
- Authenticated encrypted cyclic import refusal, valid 45-head V23 import, preserved past mistaken history, and refusal to activate an invalid pre-release stage.
- Second-page and cross-page cycle checks, missing and cross-target recovery edges.

Executed: the six new cases plus the three existing PR27 continuity and one recovery/catalogue case passed **10/10**, zero failures/skips. TypeScript and `git diff --check` passed. An initial synthetic race harness incorrectly shared a pending Promise between Worker requests and was corrected to per-request polling of a shared arrival counter; its failed invocation was not waived. The final race test observes real serialized D1 batches after both preflights complete.

Full-suite/build, independent review, installed-client acceptance, deployment and connected cleanup are the lead agent's release gates; these focused results alone do not establish those outcomes.
