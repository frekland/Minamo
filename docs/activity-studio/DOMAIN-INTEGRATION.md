# Activity domain and MCP integration

The implementation stores a strict versioned Activity cartridge on an existing `experiment` record and an explicit immutable-target Attempt on an existing `run` record. These are distinct typed product projections; no parallel owner database or new record family/table is introduced. The existing atomic D1 owner/generation/operation claim, revision CAS, guarded context reads, retained editions, Trash, bookmarks, history and protected recovery govern both projections. Merely opening, publishing, revealing a hint or saving an Attempt creates no Development.

`MINAMO_ACTIVITY_STUDIO=1` enables the local candidate. It defaults off. Generic command admission enforces the same gate and validators, and ordinary record projection hides companion metadata when disabled. `MINAMO_LEARNING_ATLAS=1` independently enables the bounded graph API. Both flags are server configuration, not client claims.

## Contracts and typed surface

- `lib/activity/schema.ts`: `ActivityCartridge`, `ActivityBlock`, `ActivityAttempt`; strict inert bounded JSON and Unicode validation. Original-exercise inline assets only. A protected reading is an exact live `reading.ref`, never a copied inline Foundry source. No complete hidden solution field/tier or arbitrary runnable component is admitted.
- `lib/activity/admission.ts`: trusted Foundry registry validation, project SHA/path/command validation and exact current eligibility of referenced readings and retained Activity targets.
- `lib/activity/domain.ts`: economical preview, publication, current/retained read, deliberate one-hint reveal, explicit Attempt save, natural-name continuation and deterministic starter ZIP. A replay recovers its originally committed edition, including after a later edit.
- `lib/activity/mcp.ts`: typed public catalogue, generated through a finite tested Zod-shape converter. New tools are `get_minamo_activity_capabilities`, `preview_minamo_activity_package`, `publish_minamo_activity_package`, `read_minamo_activity`, `reveal_minamo_activity_hint`, `record_minamo_activity_attempt`, `get_minamo_activity_context`; `get_minamo_learning_graph` is also wired in the shared handler.
- HTTP routes are `/api/activities/capabilities`, `/preview`, `/publish`, `/read`, `/hint`, `/attempt`, `/context`, `/project`. They share the authenticated domain handler and its origin/generation fence. All replies are private/no-store; the starter is a validated ZIP download.

The server catalogue is preparation for a future deployment. It is not evidence of a refreshed production installed MCP catalogue.

## Native passage identity

`canonicalReadingParts` includes original cartridge prompts and code without rewriting source:

| Block | Section | Part |
|---|---|---|
| instruction, prediction, reflection | `activity` | block ID |
| source-browser file at retained index i | `activity` | `<block ID>-file-i` |
| Foundry canonical source | `activity` | `<block ID>-source` |

Block IDs are bounded to 64 ASCII identifier characters; generated passage IDs must not collide. Native sections named `activity` are reserved on these records. Hints and source-reading reference copies are excluded from canonical passages. A supplementary character occupies two UTF-16 code units; exact selection, Flags and annotations use existing boundary validation and retained editions.

## Hints and evidence

Generic current/retained/workspace/context reads redact hint text. A deliberate hint request reveals one concept/strategy/mechanic hint, never another hint or an automatic learner state. Explicit Attempt metadata may retain which hints the owner chose to reveal. Protected encrypted recovery preserves original nonspoiler hint data for recoverability; portable JSON redacts hint text. The accepted schema never contains a complete hidden solution.

Attempt evidence is `supplied-terminal`, `learner-report` or an immutable GitHub identity marked `supplied-unverified`. This surface cannot manufacture an observed Run or verified GitHub CI result. Provider-authenticated evidence has its separate exchange contract and must retain its actual receipt. Code/tests remain inert; Minamo has no privileged arbitrary-script runner.

Continuation resolves a natural project name and actual forward/reverse saved links, returns compact exact references plus the latest explicit intention and labelled evidence, and defers full code/history to exact reads. It never treats an opened Activity or passed test as human understanding. Context summaries exclude large companion blobs and include pagination/absence qualifications.

## Observed local tests

`node --test tests/activity-domain.test.mjs` passed 9 tests on the local synthetic Worker/D1/R2 fixture. It exercises typed MCP discovery, no-write preview, one-call publication, idempotent/uncertain replay, stale revisions, cross-owner denial, hint privacy/reveal, immutable Activity target, explicit supplied Attempt, natural project-name continuity, encrypted export/import/activation and old-generation denial. It also demonstrates exact emoji code selection, Flag, Annotation, retained source and ZIP download. Independent tests in `tests/activity-security-lifecycle.test.mjs` separately exercise generic feature-off denial, concurrency/replay, source revocation and hint privacy.

These are actual compiled synthetic local requests. They are not production, installed fresh-GPT, physical Pixel/TalkBack or native hosted release acceptance.

## Rollback and compatibility

There is no database migration. Existing ordinary records and legacy callers remain valid. Same-candidate feature-off rollback hides and preserves dormant metadata, retaining the new server's privacy projection. Reverting to an earlier binary that does not know these companion fields needs a checkpoint and a reviewed metadata-preservation/stripping rehearsal; it must not be assumed to preserve hint redaction or import newly enriched backups. The release owner must use the complete release packet and exact tree before deployment.
