# Three workspace modes — implementation and release acceptance

Production-targeted implementation, **not released**. Baseline: GitHub main `51b219a7bcb5400875f1c2668dc1f1f18e006081`, tree `424ae82e9ec93c1283f9f2bea3a9470780cab0be`, private Site V24. This clean implementation selectively adapts [PR33](https://github.com/frekland/minamo-v2/pull/33); its development authentication adapter, bootstrap route, fault controls and fixture runtime are absent from the application.

## Recommendation

Ready for owner review and separately authorised merge/release. No unresolved functional blocker was found in the implemented/local acceptance scope. Physical Android keyboard/touch selection/TalkBack and authenticated hosted multi-layout acceptance remain bounded environment limits; this change has never been deployed. The installed production MCP remains the unchanged V24 contract.

| Preset | Accepted behaviour |
| --- | --- |
| **Classic, default** | Actual V24 Workspace and its global routes, Reader, tools, management and Notes. Shared switcher, exact GPT intentions and direct current-Note access are added. |
| **Focus** | Distinct Book/Technical treatments; spacious reading, contents/section navigation, restrained context, direct Notes. One labelled reading-details/GPT disclosure removes redundant mobile preamble. |
| **Task** | Exact task/stage/edition, actual saved next action, separate authored direction, explicit local references. Visible rail, genuine compact disclosure and above-reading arrangements remain selectable. |

One underlying Workspace, canonical interactive Reader, NotesPanel/NoteWritingEditor and domain/MCP authority serve all three. Quick switching and Settings share one validated device-local preference. Switching keeps the reading and writes no learning. The explicit remembered-mode return remains task-qualified and session-only. Resources are bounded to12 without silent eviction; semantic positions to64 exact edition/stage entries. No dependency or durable-schema change.

## Acceptance outcome

- Final typecheck, production build and **687 tests passed**, zero failures/skips. GitHub checks and exact source head are linked in the implementation PR.
- Actual isolated D1/R2 browser sequences cover Linux references, Windows CRLF/tab/Unicode/path copying, multiple Notes, held/rejected/lost acknowledgements, competing revisions, pending images, source revocation, retained captures, history and reload.
- Twenty preset switches kept the same Reader/editor hosts; immutable-operation count stayed **36→36**.
- Exact semantic code position survived Focus→Task at **3.890625px→3.890625px**, typography reflow **4.078125px**, and reload **3.890625px**. Exact capture reload focused the unique canonical target in retained TCP revision2 after current revision3 existed.
- Mobile Focus title moved from **421.6px to306px** at390×844. Largest canonical prose now computes22px in Classic, Book, Technical and Task. Compact Task context shrank270px→150.8px, leaving517.2px for reading.
- Independent challenge corrected exact-read/action admission, stale captures/tasks/continuation, Notes Escape/revision admission, typography and native modal visibility. An actual second-tab preference test preserves the reading GPT question/selected resource through Focus and Task and returns focus visibly.

[Detailed browser evidence and parity](ACCEPTANCE.md) · [state architecture](STATE.md) · [independent challenge](INDEPENDENT-REVIEW.md) · [Notes](NOTES.md) · [GPT](GPT.md) · [UX](UX.md) · [local review setup](LOCAL-ACCEPTANCE.md) · [safety inventory](SAFETY-INVENTORY.json).

## Deliberately bounded options

Both Focus treatments and all Task arrangements are shipped as owner-selectable coherent options, not experimental alternate save systems. Their preference-dependent value remains for real owner use; no learning-gain or human-usability claim is made. Explicit mode return and the local resource shelf are optional session aids, not durable learning, checkpoints or cloud workspace synchronisation. Semantic positions can survive same-tab reload via session storage; denied storage falls back to same-session memory. Explicit passage/section/hash destinations take precedence over remembered position. Delayed geometry adjustment is bounded1.5s and stops on user input; arbitrary later remote-content shifts are not a restoration guarantee.

No connected synthetic record, genuine learner content, native source, Site version, production setting or audience was changed. Fourteen original local review records,36 committed operations,2 image identities and2 local checkpoints are inventoried. The manually created Home-acceptance checkpoint was corrected then withdrawn at revision3; the seeded Linux checkpoint remains a local example. Ephemeral test backends are disposed. No purge or recovery activation occurred.

## Visual review

All images show original synthetic local data. QA controls are outside the production interface. Desktop screenshots use1363×936 including an82–86px QA toolbar; mobile images crop the actual390×844 iframe. Classic/Task mobile include largest prose; Focus Book uses its normal18px floor.

| Classic | Focus | Task |
| --- | --- | --- |
| ![Classic desktop](evidence/classic-desktop.jpg) | ![Focus desktop](evidence/focus-desktop.jpg) | ![Task desktop](evidence/task-desktop.jpg) |
| ![Classic mobile](evidence/classic-mobile.jpg) | ![Focus mobile](evidence/focus-mobile.jpg) | ![Compact Task mobile](evidence/task-mobile.jpg) |

[Expanded mobile Task](evidence/task-mobile-expanded.jpg) · [actual long Notes sheet](evidence/notes-mobile.jpg).

## Release boundary

This commission authorises implementation and review only. The owner must separately authorise merge, native/GitHub source reconciliation, version save and private deployment. Those later steps should use the existing exact-tree/expected-head procedure, preserve owner-only access, rerun checks if source changes, and record deployed/installed-client acceptance. No additional feature commission or broad architecture rewrite is required before review.
