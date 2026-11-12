# Independent Activity, exchange and Atlas adversarial review

25 October 2026. Synthetic local engineering execution only. This specialist did not deploy, access genuine learner content, create checkpoints for the owner, or claim physical-device acceptance. Root owns the final source tree, full-suite/build receipt and real connected GitHub receipt.

## Findings corrected

### P1 — natural Journey resume lost linked Activities and short Notes

The existing Activity context searched titles/body literally and returned Notes only from those lexical matches. A short Note such as “A later intention” linked to the correct Investigation could disappear when resuming by Journey name. `readContext` deliberately strips large Activity companions, so checking its related summaries for `.activity` could not recover that companion. A forward-only Journey → Investigation → Activity chain also stopped before the Activity.

`lib/activity/domain.ts` now follows bounded exact owned Journey/Investigation links, resolves Activity identities under current rights, and reuses bounded personal Note queries for each eligible context. It deduplicates recent Notes/Attempts, retains immutable Activity editions, labels duplicate exact names as requiring selection and discloses bounded related omissions/cursors. A namespace-version and generation fence rejects a mixed continuity result after concurrent mutation.

Terminal captures are summarized separately; ordinary continuity emits commentary and exact `terminalId` pointers. It does not emit a truncated JSON terminal marker or thousands of console lines. Short Notes remain reported thinking, distinct from explicit checkpoints and verified execution. The MCP tool guidance describes this contract.

The new regression initially failed because the forward-only Investigation bridge was not traversed. After correction, it finds both nonlexical short Notes and the Activity by Journey name, retrieves exactly persisted CRLF/ANSI/tabs/Japanese/emoji terminal output, confirms no record/history or checkpoint write, denies a second owner and excludes a trashed Note. A separate duplicate-name test requires exact target selection.

### P2 — modified test oracle insufficiently distinguished in GitHub receipt

An exact starter-package match establishes starter bytes, not that submitted tests stayed unchanged. The exchange receipt now includes `visibleTestIntegrity` separately from `starterPackageMatch`. Complete immutable comparisons explicitly identify modified, removed or renamed visible tests; unverified starters report unknown integrity. An unchanged visible test is expressly not a hidden oracle, sandbox or execution result. Malformed/duplicate comparison paths, invalid rename metadata and nonboolean completeness reject.

The additive receipt is backward compatible for existing consumers. No arbitrary source is executed by Minamo and commits still report `execution: not-executed-by-minamo`. New adversarial cases preserve that classification for altered, deleted and renamed visible tests.

## Executed evidence

| Command | Actual result |
| --- | --- |
| `node --test tests/activity-domain.test.mjs tests/activity-resume-adversarial.test.mjs tests/atlas-domain.test.mjs tests/activity-exchange.test.mjs` | 25 tests/subtests passed, zero failure; ran before the final additive exchange assertion and bounded-omission refinements |
| `node --test tests/activity-exchange.test.mjs` | Final exchange source: 6/6 passed, including 12 templates and 18 seeded variants actually executed red/green plus modified/deleted/renamed test-oracle checks |
| `node --test tests/activity-resume-adversarial.test.mjs` | Final continuity source: 2/2 passed, zero failure |
| `node --test tests/activity-cold-handoff.test.mjs tests/activity-exchange.test.mjs` | Earlier baseline/correction check: 6/6 passed; public compiled JSON-RPC schema, two publications, immutable readback, supplied Attempt, exact downloaded ZIP |
| `node node_modules/typescript/bin/tsc --noEmit` | Passed after the receipt and continuity corrections; root runs final integrated typecheck/build |
| Original fixture command `python3 -B -m unittest -v` | Deliberate faulty source: 3 failures/5 tests. Independent repair: 5/5 passed. Exact output/hashes in `fixtures/EXECUTION.json` |

The combined real Miniflare D1 Atlas run inserted 10,000 original synthetic records, returned 60 nodes and 20,649 serialized bytes in its first page, and returned a second disjoint 60-node page. In this loaded container: seeding 70,750 ms; first query 138 ms. This is actual bounded local D1 evidence, not hosted latency or a 10k-node browser layout benchmark.

Atlas tests also exercised exact retained source destinations, foreign-owner denial, default synthetic exclusion, revoked-source removal, Trash, cursor owner/lens/limit/mutation scoping, unaccepted GPT proposals and an older explicit checkpoint remaining distinct from a newer short Note intention.

Raw scoped logs are in `evidence/provenance-{domain,resume,exchange}.log`. Fixtures and logs contain only synthetic content.

## Original GitHub/local exchange specimen

`fixtures/stream_reader.py` and `fixtures/test_stream_reader.py` are a new original finite-EOF TCP stream challenge. The callback receives deterministic supplied chunk boundaries; this is not a fabricated live network trace. Tests cover empty, single chunk, three chunks, split UTF-8 bytes and accumulated-byte overflow. `fixtures/stream_reader.repaired.py` is an engineering reference repair only. It is not part of a learner starter package or imported by app/runtime code. Root is responsible for selecting the starter and test files for real connected GitHub commits and recording the exact immutable provider results.

## Scoped disposition and remaining limits

No unresolved P0/P1 defect remains within the reviewed local exchange, continuity and Atlas domain paths. This is a scoped recommendation to continue release gates, not independent authorization to deploy. Full production-compiled browser/axe checks, private owner Site verification, hardened recovery signoff, real GitHub provider round-trip, installed MCP refresh and physical Pixel/IME/TalkBack remain root/owner gates. Source-pinned provider failures cannot be described as green remote CI.
