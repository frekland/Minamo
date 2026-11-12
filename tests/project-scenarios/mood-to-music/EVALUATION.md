# Mood-to-Music v3 — longitudinal Library, code and return acceptance

**TEST ONLY.** This is a repeatable evaluation of the *request → model/tool decisions → Library creation → subsequent interactions and user presentation* workflow. It is **not** a one-time corpus of pre-written Library articles, a purported transcript of the real owner, or a benchmark for GPT grading a learner. The fictional User authors Notes; GPT reads them and, with explicit permission, organises the Project/Library/Question/checkpoint records.

## Invariant and starting point

Each complete run loads manifest `mood-to-music/3` through real Minamo domain commands to phase **F** in an isolated synthetic fixture. Phase F contains a fictional unfinished Note, Project changes, an unverified terminal fragment, a pinned public v5 source and an open storage/persistence Question. **No answer Article is seeded**, nor any later conversational correction/checkpoint. The assistant must retrieve actual Project/Library context and, on the User's request, produce useful Library material using existing MCP operations.

Six phases **F → G → H → I → J → K** then form **one continuous evolving synthetic test-user dataset**. Advance only *between* model conversations; never reset between sessions. The later phase transitions author **fictional User actions only**: ten additional Notes, one User Note revision, eight brief passage annotations and five additional passage Flags, together with source references to two new runnable React versions. They do **not** manufacture GPT replies, generated Library text, approval to write checkpoints, GitHub commits or execution receipts. Those outcomes are what we must observe. The original A–F record chronology remains intact.

The original GitHub commit pin proves only which file exists at that commit. New v6/v7 source paths are real testable files with pinned SHA-256 digests, but fixture Notes do **not** claim historical commits or independently verified execution. The User's terminal excerpts are *supplied*. Phase F has no refresh test; H introduces a reported one. Do not conflate React state, browser storage, source identity, tests, user observations or learning progress.

## Procedure

1. In a disposable synthetic Miniflare D1/R2, run `node tests/project-scenarios/mood-to-music/replay.mjs F`. `replay.mjs reset` rebuilds F from an empty store and compares normalised readbacks. `replay.mjs reset-long` rebuilds the entire scripted User-only K history the same way. These are *local reproductions*, not hosted GPT/UI acceptance.
2. Use [session-cases.json](./session-cases.json) **in order**. S01 starts at F with a cold-context chat and an explicit Library request (LIB-01 in [task-cases.json](./task-cases.json)). Capture tool discovery, content, receipts, exact IDs and current Site screenshots. The text GPT writes is an **observed outcome**, not test fixture input.
3. Advance the *same dataset* to G using the owner-gated controller. These actions are authored by the fictional User, not GPT: Notes about their own experiment and quick passage annotations/Flags. Continue with S02, then H/S03, I/S04, J/S05 and K/S06. Several sessions deliberately require **new independent chats** without inherited conversation context. A fresh GPT must reconstruct from Minamo and appropriately pinned external source, not a prior transcript.
4. Inspect each interaction twice: canonical MCP/API retrieval including edition and receipt, then **actual Site/UI** navigation, reading, Notes, Flag/annotation organisers, search, code snippets, mobile view and return to context. A seeded User action verifies only the domain model; a real Site user action requires a separate browser observation. A model response is not a Site acceptance result.
5. At each pause, log what changed and what didn't: requested Library authoring/revision, Question/checkpoint only when explicitly requested, User Note editions untouched by GPT, transient Flags and annotations treated as quick cues. If a Flag remains unresolved, that is normal. Do not automatically promote it to a Question, task or instruction.
6. Inspect the external v5/v6/v7 source and its actual independent engineering tests as available, but link execution evidence only to the specific source and run. User-supplied terminal fragments are *not* CI or independent reproduction. GitHub-artifact architecture and verification receipt investigation remain separately tracked in [#11](https://github.com/frekland/Minamo/issues/11).
7. **Only after S06**, collect every generated Article, rendition, annotation, Flag, checkpoint and operation receipt. Reset the exact synthetic run through the controller or dispose the local test-user D1. Confirm generated records and Flags disappear, authorised synthetic checkpoints are withdrawn, unknown records block cleanup, and a clean replay of F/K has the same canonical pre-GPT inputs.
8. Repeat the *entire six-session experiment* with another GPT/build. Compare behavior and user experience despite naturally variable generated prose. Record the model, exact prompts, Site build and fixture version—not an imagined golden teaching passage.

Real private Sites user data must **never** be cleared by these tests. A later hosted test requires an intentionally isolated TEST-ONLY account/database plus separate authorisation, with safe cleanup and backup preflight. “Clear Minamo user data” here means a **controlled empty test-user dataset** from which the exact fixture can be regenerated; it never authorises deleting the real owner's records.

## Record identity and cleanup contract

- Optional direct Articles are `TEST-ONLY-m2m-r<epoch>-requested-label-storage` and `...-requested-privacy-review`; optional direct Library annotations are `...-annotation-library` and `...-annotation-privacy-library`. Registered optional conversation checkpoints are `...-save-c01` through `...-save-c04`. None are created by phase transitions.
- The ordinary manuscript publisher instead uses exact registered operations `...-lib01-manuscript` (document key `storage`) and `...-lib04-manuscript` (key `privacy`), yielding canonical `ms-*` Article IDs. The controller discovers each **through its exact operation receipt**; it never deletes arbitrary manuscript articles.
- Scripted User Notes and quick reminders use deterministic fixture IDs. Genuine additional site-created records that do not fit this exact registry require deliberate test preparation/registration or disposable local D1; the owner-only controller correctly blocks unknown outputs rather than guessing what to delete.
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
| Longitudinal return | Uses the previous chat or guesses latest state | Recovers fragments but misses changes | Independently identifies current code, changed decisions and open questions | Resolves recent-vs-historical evidence and gives a useful next step with exact links |
| Learner marginalia | Treats Flags as actions or rewrites Notes | Lists cues without context | Finds exact passage, brief annotation and linked User Notes | Helps return to context without turning reminders into tasks or mastery scores |
| Cleanup/replay | Leaves foreign/unknown data or unsafe deletion | Partial or manual | Clean exact-scope reset | Repeats identically from empty test data; catches unknown residues |

**Never score User understanding.** Score the assistant's organisation and content, tool behavior, presentation, and reproducibility. Preserve raw observations and precise operation receipts.

### Run report template

```text
Run: <ID>; fixture: mood-to-music/3; phases F–K; base source: <SHA>
Assistant/model: <exact>; Minamo build: <SHA>; client/browser: <version>
Session S01–S06 conversation IDs and exact prompts: <...>
Initial counts and requested Article: <counts; absent>
After each session: <User actions, new chat cold/warm, Note/Flag/annotation counts, prior GPT outputs retained>
Tool discovery and fetched IDs/revs: <...>
Created/updated IDs, operation receipts, errors: <...>
Generated content: <link or safe excerpt plus content-quality observations>
UI path, viewports, search/links/anchors: <screenshots and observations>
Rubric scores with evidence: <...>
Reported vs verified facts; failures and open questions: <...>
Reset receipt; exact output absence; empty-data replay match: <...>
```

This protocol is reproducible but **does not itself prove** that a live GPT chat has successfully generated, edited or presented the article. Those are the outcomes the later end-to-end acceptance run must measure.
