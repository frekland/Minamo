# TEST ONLY — Mood-to-Music longitudinal Project

Versioned SITES engineering fixture, originally issue #112 and extended for public issue #12. Every Project record, dialogue, Note, annotation, Flag and checkpoint is **fictional scripted test data**. The owner's actual private Mood-to-Music Project was inventoried in the issue but **never exported or seeded**. The app uses invented tracks; no Spotify credentials or live API interaction.

This extends the real V2 command/Project/checkpoint contracts using `tests/private-storage-fixture.mjs`, following `tests/journey-resume-fixture.mjs` and the PR30 mood/race foundation. It does not introduce new production tables, Project families or migrations.

## Recreate / advance / reset

From the repository root after a locked pnpm install:

```sh
node tests/project-scenarios/mood-to-music/replay.mjs A
node tests/project-scenarios/mood-to-music/replay.mjs D
node tests/project-scenarios/mood-to-music/replay.mjs E
node tests/project-scenarios/mood-to-music/replay.mjs F
node tests/project-scenarios/mood-to-music/replay.mjs K
node tests/project-scenarios/mood-to-music/replay.mjs reset
node tests/project-scenarios/mood-to-music/replay.mjs reset-long
node --test tests/mood-to-music-scenario.test.mjs
node --test examples/mood-to-music/tests/revisions.test.mjs
node --test examples/mood-to-music/tests/browser.test.mjs
pnpm exec vite build --config examples/mood-to-music/vite.config.mjs
pnpm exec vite --config examples/mood-to-music/vite.config.mjs
```

The browser serves a synthetic runnable example (by default v5); use `?revision=v1` through `?revision=v7`. All seven source modules have pinned content digests: they are **not assertions of seven historical User Git commits**. Version v3 intentionally contains an async race, v4 guards it, v5 changes product direction, v6 experiments with automatic `localStorage` persistence and v7 makes remembering labels opt-in. The controller test drives adversarial completion/rejection order without delays or Spotify; the browser tests separately run v5/v6/v7 refresh and consent behaviour.

The runner **creates a new disposable Miniflare D1/R2 instance** for each reproduction, runs ordinary HTTP commands as a synthetic principal, and disposes it. `advance` applies one chronological state. `reset` disposes the old instance and reconstructs state A (or another selected state). The `reset` CLI rebuilds F twice and compares normalised readbacks; `reset-long` rebuilds the full User-only K chronology. The inspectable manifest and seed operation source are the versioned logical export/import/replay recipe; this is *not* an owner D1 backup, a binary D1 export or a substitute for protected recovery. No destructive production reset or migration is involved.

## Causal paths and test boundaries

| State | Important retained relationship | Typical agent question |
| --- | --- | --- |
| A | Project Steps, linked Questions, authored Library reference | What is a hypothesis versus a verified source? |
| B | API feasibility Question rev 2, research Note rev 1, checkpoint | Why was live integration postponed? |
| C | v1/v2 source-linked Notes and explicit checkpoint | What changed in controls, and where is the code? |
| D | v3 faulty and v4 corrected code Notes, annotation/Flag on exact Article passage, race Question rev 2 | What failed, what is the evidence and which version corrected it? |
| E | Project body and stage structure revised (new personal-label stage with original stage identities retained), v5 pivot Note, earlier source pinned, research Note rev 2 while checkpoint preserves rev 1, unverified capability Note and unrelated garden record | Which direction is current, what was abandoned, what remains uncertain? |
| F | User-authored incomplete persistence observation; Question and supplied terminal capture; no seeded generated Library answer | What should GPT request and write, and what evidence is missing before deciding persistence? |
| G | Two more User Notes, two *brief* annotations and a Flag; GPT Library output is carried forward if created | What should a marked passage mean to a returning conversation? |
| H | Reported refresh result and runnable v6 `localStorage` code; terminal fragment still supplied | Does existing source prove the test ran? What should the user explicitly ask GPT to organise? |
| I | Shared-device privacy concern, more short annotations/Flags and interrupted follow-up Notes | Which decisions are new, and which claims remain uncertain? |
| J | Actual runnable v7 opt-in/clear implementation; updated thinking and reported retest | How does the code and decision change without erasing old evidence? |
| K | Ten-day return, two further User Notes and second edition of an older Note | Can a truly fresh GPT reconstruct cumulative work, keep marginalia contextual and give one useful next challenge? |

Each state is a distinct replay of the **same Project identity**. Scenario dates are authored fictional timeline labels, not falsified persistence timestamps. Minamo's real runtime assigns record timestamps. Scripted GPT/learner dialogue is labelled as such and cannot be construed as the owner's transcript. Test-run results belong only in the PR evidence.

Each source revision file and its shared dependencies have pinned SHA-256 values in `manifest.json`; the test suite rejects an accidental rewrite without a deliberate manifest update. Actual future Git commits and build receipts should be added to the PR, never fabricated as older owner commits.

## Known next validation gaps

- A genuinely independent agent/MCP reading and visual browser walkthrough must be separately executed and recorded; local HTTP tests do not demonstrate fresh-chat GPT orchestration or user comprehension.
- The private Site has **not** been seeded, changed, reset or deployed. No clearing of genuine Minamo user records is authorised. Only isolated TEST-ONLY data is disposable; hosted trials need a dedicated test account, separate approval and recovery preflight.
- This corpus is deliberately one Project subject. The other two subjects have been selected for later separately scoped tests: retired HTB Cap and Automatic Plant-Screamer.

**Public development extension (29 Oct 2026):** E now performs a genuine revisioned Project shape update; A–D deliberately retain the original four stages. `inspect` returns manifest-authored scenario dates separately from actual D1 record timestamps. Notes include version-specific source path and SHA-256 receipts (navigable source integration remains a later UI concern). Full public CI results are tracked in the public draft PR.

## V2 conversational Library-request model (30 Oct 2026)

The critical distinction is **the seed contains a need for Library content, not the answer**. Phase F is a repeatable *pre-conversation* snapshot. Its User has tentatively inferred that personalised labels may persist, has not tested refresh, and has left a technical Question and unverified terminal/source clues. There is deliberately **no generated Library Article**, Flag/annotation against it, or C01 post-refresh correction at F.

See [task-cases.json](./task-cases.json) for simulated User requests and [EVALUATION.md](./EVALUATION.md) for the complete cold-context MCP/content/UI acceptance protocol and observation rubric. `LIB-01` asks GPT to retrieve the existing Library/Project context, author genuinely useful connected Library material via MCP and read back the outcome. `LIB-02` tests navigation, passage interaction and revision. `EVID-01` checks evidence calibration. `C01` later simulates a User reporting a refresh test and expressly requesting Question/checkpoint organisation; it is not a seeded result and does not permit GPT to change a User Note.

The manifest reserves optional deterministic IDs for direct Article writes. The canonical manuscript path instead yields a derived `ms-*` Article: an **exact recorded publication operation receipt** is required to identify it safely. Controller reset preflights registered records, source-linked checkpoints, anchors and generated output; exact-scope cleanup is fail-closed. It does not broadly purge Library content or account data. A fresh empty synthetic test-user dataset can replay phase F with identical input. The returned Library prose is variable by design; evaluate actual writing, receipts, context, search, rendering, navigation and cleanup rather than compare to a fixed passage.

This is local controller/test-corpus engineering. A private hosted deployment, a genuine cold-chat agent evaluation and visual Site acceptance are **subsequent gates**, not outcomes implied by these tests.

## V3 longitudinal extension — six sessions, one evolving dataset

V3 preserves A–F exactly and adds G–K **fictional User actions only**, with actual runnable v6/v7 React source. See [session-cases.json](./session-cases.json) for six consecutive conversation prompts, four required fresh contexts, User actions between chats, specific readback/UI evidence and safe end-of-run reset. The same dataset evolves through the six sessions; we **do not** reset it between GPT conversations. A new clean run begins again at phase F after disposing a local test-user database or exact-scope controller cleanup.

- Notes are **User-authored**, sometimes long-form reasoning, source pointers or typed terminal fragments. A later scripted User edition of a Note does not authorise GPT to edit it. Source files and hash pins are independently inspectable, while fictional build claims remain supplied/unverified. GitHub execution integration remains [issue #11](https://github.com/frekland/Minamo/issues/11), outside this PR.
- Flags are quick bookmarks; annotations are a few words or a sentence, not substantive essays or implied instructions. Some are left open. GPT should retrieve exact passage context, never turn them automatically into Questions, tasks, checkpoints or a mastery score. The one older D annotation deliberately remains unchanged as accepted v1 history.
- GPT-authored Library outputs are **not** seeded in G–K. There are two optional explicit Article slots (direct ID or receipt-derived `ms-*`), two optional output annotations, and four optional conversational checkpoints. They are observable results *if and only if* a test conversation actually performs them. Editorial revisions may retain old passage anchors and must be inspected in Minamo.
- The controller admits only these registered synthetic IDs/operation receipts, inspects all Flags on their exact Articles across older renditions, withdraws authorised checkpoints, and fails closed on foreign/unknown records. This is not a general-purpose deletion tool. Additional real Site-generated user data needs separate deliberate registration or complete disposal of a genuinely isolated TEST-ONLY database.

**Acceptance boundaries:** Passing a seeded G–K local replay proves the fixture's stored User history is reproducible; it does not prove the User operated Minamo UI, GPT continued across chats, or a GitHub/local test was independently verified. Each is separately recorded by the acceptance operator following [EVALUATION.md](./EVALUATION.md).

## First persona overlay: intermittent weekend prototyper (31 October 2026)

The opt-in [weekend-prototyper module](variants/weekend-prototyper.mjs) is a **local-only versioned `intermittent-weekend-prototyper/1` fixture** with `mood-to-music/3` as its immutable A–E foundation. It replaces the default F–K fictional User events with fewer, causally linked Note editions, one short passage reminder, a genuine Question revision and repeated time gaps. It does not rename or copy the 19-Note default history. The two late histories can coexist under separate synthetic namespaces for the **same** disposable test principal.

`TEST-ONLY-m2m-weekend-v1-rN` is an explicitly permitted seed prefix **only in the local replay helper**. The hosted controller, MCP transcript and observer remain registered solely to the canonical `mood-to-music/3` fixture and `TEST-ONLY-m2m-rN`; `personaVariant` in the transcript is not yet a hosted state selector. Do not load the overlay into a Site or change any hosted epoch to run these tests.

```sh
node --test tests/mood-to-music-weekend-variant.test.mjs
```

The test uses actual compiled Worker/domain commands and disposable Miniflare D1/R2. It checks deterministic phase snapshots, canonical Note editions and CAS conflict, exact source anchors, absence of pre-generated GPT outputs, and same-owner/cross-owner isolation. Scripted dates, manually reported browser results and pinned React source are explicitly **not** evidence of independent execution or an accepted UX. This is one early corpus unit under #12, not acceptance of the full 3×3 matrix or a proposal for the Workbench information architecture.
