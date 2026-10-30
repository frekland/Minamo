# Mood-to-Music v2 — Library-request and return acceptance protocol

**TEST ONLY.** This is a repeatable evaluation of the *request → model/tool decisions → Library creation → subsequent interactions and user presentation* workflow. It is **not** a one-time corpus of pre-written Library articles, a purported transcript of the real owner, or a benchmark for GPT grading a learner. The fictional User authors Notes; GPT reads them and, with explicit permission, organises the Project/Library/Question/checkpoint records.

## Invariant and starting point

Each run loads manifest `mood-to-music/2` through real Minamo domain commands to phase **F** in an isolated synthetic fixture. Phase F includes a fictional, incomplete Note, a genuine Project evolution, the reported terminal fragment, a pinned public source, and an open storage/persistence Question. **No answer Article is seeded.** In particular, there is no generated Library content, LIB-02 annotation, or C01 correction/checkpoint. The test must cause the assistant to retrieve existing Library material, interpret Project context and request/write a *new* relevant Article by the normal MCP contract before any product output can be assessed.

The source pin proves only which file exists at that commit; the supplied terminal excerpt is not a verified independent build. The User has not tested a refresh in phase F. Do not conflate in-memory React state, storage, reported build output or learning progress.

## Procedure

1. On a clean local disposable Miniflare D1/R2 with the synthetic fixture owner only, run `node tests/project-scenarios/mood-to-music/replay.mjs F` to confirm stable phase-F inputs. `node tests/project-scenarios/mood-to-music/replay.mjs reset` independently reconstructs F and compares normalised snapshots.
2. Select `LIB-01` in [task-cases.json](./task-cases.json); supply its **exact simulated User prompt** to a cold-context test assistant with connected Minamo MCP. Ask it to inspect the fixture using tools before deciding what to write. Record discovery, retrieval, interaction, generated content, receipts and failures. The prompt is a *request for content*, not the content itself; do not bake an exemplar into seed data.
3. Inspect the actual output twice: (a) canonical MCP/API retrieval including record ID, revision, operation receipt and links; (b) browser/Minamo UI including Project-to-Article navigation, Library search/relevance, article display, code readability, mobile width, link targets and perceived cognitive load. Screenshot and narrative evidence should describe actual behavior, not asserted pass.
4. Run `LIB-02` against that output to test passage Flag/annotation, editorial revision and old-rendition handling. Separately run `EVID-01` without changing the Note. Later run `C01` as a controlled second-stage return to test a user-reported correction and user-authorised Question/checkpoint record, **not as a pre-seeded state**.
5. Collect the exact IDs/revisions of every generated Article, annotation, Flag, manuscript output and checkpoint. Reset the owner-only controller or dispose D1. Verify old records/Flags are absent and authorised checkpoints are withdrawn; replay F from the empty store and compare the start snapshot and identical prompts. If an unknown Project-linked checkpoint or synthetic record prevents safe cleanup, **stop and inspect**, rather than clearing a broad namespace.
6. Repeat with another cold-context assistant or changed implementation using the same manifest, phase and prompt. Compare **behavior and observable output**, accepting natural variation in prose or examples. Record the variant model, prompt, date, UI build and manifests. The content itself is not a golden string.

Real private Sites user data must **never** be cleared by these tests. A later hosted test requires an intentionally isolated TEST-ONLY account/database plus separate authorisation, with safe cleanup and backup preflight. “Clear Minamo user data” here means a **controlled empty test-user dataset** from which the exact fixture can be regenerated; it never authorises deleting the real owner's records.

## Record identity and cleanup contract

- The scripted output reservation is `TEST-ONLY-m2m-r<epoch>-requested-label-storage` for direct Article creation, and `TEST-ONLY-m2m-r<epoch>-annotation-library` and `TEST-ONLY-m2m-r<epoch>-save-c01` for optional follow-ups. Nothing is created until the conversation requests it.
- If the existing manuscript publisher is used, operation `TEST-ONLY-m2m-r<epoch>-lib01-manuscript` (document key `storage`) generates a canonical `ms-*` Article ID. The controller discovers **the exact output through that operation's receipt**; it does not delete arbitrary manuscript articles.
- Cleanup preflights registered output identity, revisioned anchor and Project-linked checkpoints. It removes only tracked synthetic outputs and Flags on those exact Articles, including older renditions, and withdraws known optional synthetic checkpoints. Unknown or external data fails closed.

## Scoring and observation

Rate each 0–3 with direct examples, without presuming a correct final article:

| Dimension | 0 | 1 | 2 | 3 |
| --- | --- | --- | --- | --- |
| Context and authority | Misattributes or modifies User records | Partial retrieval or unclear permission | Correct context and explicit write scope | Correctly selects and links useful records with verified receipts |
| Library learning value | Incorrect/irrelevant | Generic, incomplete | Accurate and practical | Tailored, actionable, readable, reusable and appropriately uncertain |
| Content integration | Not retrievable | Exists but disconnected | Searchable and linked | Clear bidirectional Project/Question/Library navigation and no unnecessary duplication |
| UI interaction | Broken/unreadable | Friction or missing state | Usable desktop and mobile | Effective search, navigation, code, anchor and revision feedback |
| Evidence discipline | False “verified” claim | Overconfident inference | Explicit report-vs-test distinction | Pinpoints what would verify each uncertainty |
| Cleanup/replay | Leaves foreign/unknown data or unsafe deletion | Partial or manual | Clean exact-scope reset | Repeats identically from empty test data; catches unknown residues |

**Never score User understanding.** Score the assistant's organisation and content, tool behavior, presentation, and reproducibility. Preserve raw observations and precise operation receipts.

### Run report template

```text
Run: <ID>; fixture: mood-to-music/2; phase: F; base source: <SHA>
Assistant/model: <exact>; Minamo build: <SHA>; client/browser: <version>
Case(s) and exact prompts: <LIB-01, ...>
Initial counts and requested Article: <counts; absent>
Tool discovery and fetched IDs/revs: <...>
Created/updated IDs, operation receipts, errors: <...>
Generated content: <link or safe excerpt plus content-quality observations>
UI path, viewports, search/links/anchors: <screenshots and observations>
Rubric scores with evidence: <...>
Reported vs verified facts; failures and open questions: <...>
Reset receipt; exact output absence; empty-data replay match: <...>
```

This protocol is reproducible but **does not itself prove** that a live GPT chat has successfully generated, edited or presented the article. Those are the outcomes the later end-to-end acceptance run must measure.
