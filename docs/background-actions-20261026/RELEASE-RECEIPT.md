# Background personal actions — 26 October 2026

The owner requested faster Flags/Annotations management, simple Yes/No unflag confirmation, independent background edits/removals, and brief bottom-left tick notifications. This correction starts from private V37 / PR58: native `3e31be997818bd2e3e875c3aa60846f268ec473c`, GitHub main `e09cc9fa12b6d73358e0150d275b549594a00a65`, common tree `5a3fb1bd25a6d0e939961dbdffc900b5bbef50f2`.

## Delivered behavior

- Flags and Annotations in Your Work use per-record pending operations. Unflag/delete/restore require one short Yes/No confirmation. Different records continue independently, including out-of-order acknowledgements; the same pending operation retains its exact ID, payload and expected revision.
- Annotation body edits save directly from their row. Drafts and uncertain operations remain recoverable. Reader mark creation, changes and Favourites use the same acknowledgement-driven local updates rather than waiting for whole-workspace or Home refreshes. A retained Reader selection has its own exact in-flight identity; another selection can be annotated while the first save completes, without losing either draft. Note/Annotation/Run disposal also uses the short confirmation and background completion path.
- Success appears as a tick and a short content-free label, bottom-left for 2.4 seconds. Errors and uncertain saves retain persistent recovery controls instead of disappearing. Note autosave does not generate repeated success toasts.
- Acknowledged rows update in place. Searches, pagination and other edits retain their current state. Metadata-only commit overlays fence older query responses, newer server revisions still win, and genuine Trash remains discoverable/recoverable. Explicit next-page reads restart a stale namespace cursor without an acknowledgement-triggered list refresh.
- Owner/generation boundaries, bookmark target clocks, durable original operations, revision checks and current Source permissions remain enforced. A delayed response admitted before a permissions change cannot reintroduce restricted source quotation. Independent personal writing remains intact.

## Verification

Final integrated source: 1,223 tests total, 1,219 passed, zero failures and four explicit skips. Typecheck and the full production build passed. The full suite was rerun serially after the completed build: an earlier overlapping run encountered a build-output ENOENT while the build replaced dist; that invalid run is not counted as a pass. Exact publication identities and authenticated production acceptance are recorded in the implementation PR completion receipt once those identities exist. No remote GitHub Actions job is represented as green. Meaningful integration includes actual isolated Worker/D1/R2 commands, concurrent delayed acknowledgement, original-operation replay, duplicate-control in-flight identity, uncertain-save recovery, source revocation, generation changes, genuinely newer server revisions, stale query tombstones and recoverable Trash.

Local browser acceptance used original TEST ONLY fixture passages through the ordinary Reader and Your Work UI: two passage Flags, two Annotations, unflag → edit another → save → delete another, followed by Trash restore and return to the active Annotation list. The list stayed present and other controls remained usable. This is browser layout/UI acceptance, not physical device or assistive-technology certification.

## Preservation and rollback

No dependency, migration, durable record family, permanent Library revision, feature activation or access-policy change is introduced. The existing protected checkpoint `archive-35421d9612b5d4d68d377e6f151bc2b43636ec9e22c744a4` verified valid before release at `legacy@0`, version4706:335 records,824 revisions,865 operations,52 manuscript editions, three image originals and two media originals,11,228,008 bytes. No production restore, purge or generation activation is performed. V37 remains a compatible runtime rollback; these writes use the existing domain and recovery format.

Production synthetic acceptance, if performed, is separately itemised in the PR completion receipt with exact owned IDs and recoverable cleanup. No genuine learner Flag, Annotation, Note or progress is used as disposable test data. PR52 remains open as the specification; PR48/49 retain research roles and PR51 remains staged/unmerged/unpublished. Existing optional/device gates are unchanged. No monetary spend is incurred.
