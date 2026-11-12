# Shared presentation and reading position

Classic, Focus and Task present one production Workspace. The controller changes presentation and performs bounded reads; it issues no record, checkpoint, attachment or recovery writes. Notes identity, pending operations, history and editor memory remain with the existing NotesPanel and generation scope.

| State | Owner and boundary |
| --- | --- |
| Layout, Focus treatment and Task arrangement | One versioned device-local preference. Missing/invalid values use Classic/Book/visible rail. Settings and the quick switcher use the same controller. Browser storage events apply the same normalizer; denied storage leaves a working tab-local choice. |
| Current task | Exact task family/id/stage/rendition URL. A primary Journey/Investigation destination establishes identity even when absent from a bounded record collection; a resolved exact reading fills its edition. A reference does not select a different project. |
| Selected reading / retained edition / passage | Existing Workspace and Reader URL/eligibility owners. Provisional current heads are excluded from the shelf while a requested exact edition resolves. Switching does not navigate. |
| Local resource shelf and optional mode return | Twelve exact resources; explicit closing, no oldest-item eviction. Three in-memory return slots qualified by exact task. Switches retain the visible reading; returning to a mode's earlier reading is a separate action. A reload does not promise shelf or mode-return recovery. |
| Saved next action | Existing target tutor projection, separate from authored direction. Task/generation keys, abort and sequence guards reject old responses. Existing learning-changed events clear and refresh it; visible foreground checks are bounded to fifteen seconds. Unavailable context never borrows another task's action. |
| Reading position | Main canonical Reader only; exact record edition and Journey stage. Section/part plus native UTF-16 line point when available, with part-top fallback. At most 64 positions in generation-scoped sessionStorage; no quotation or prose. Workspace remains the sole history restoration owner and checks the semantic position before its numeric fallback. |

## Position behavior and boundaries

The controller captures before navigation and layout/treatment changes. Typography Settings request capture before reflow. Browser history entries hold their own exact position; the session map permits same-tab reload and returning between resources. Pagehide/visibility changes capture the current location. Scroll serialization is debounced by 150 milliseconds, rather than rewriting history on every animation frame.

Explicit section, part, passage/capture and fragment destinations belong to the canonical Reader or browser, and take precedence over remembered position. A changed rendition is a different key; absent content is never guessed against a current edition. Main-position capture and restoration pause while the passive ReferencePreview owns the visible surface.

Restoration permits intrinsic image/diagram geometry to settle for a bounded 1.5 seconds using resize/load observation. Wheel, touch, pointer or key input in the reading cancels it, so restoration does not fight deliberate reading. Rapid preset/option changes reuse the pending semantic anchor instead of capturing half-applied geometry. Raw scroll offsets are an existing fallback; a text point is not a saved learning checkpoint or cross-device guarantee.

Denied sessionStorage retains same-tab in-memory positions, without a reload guarantee. Neither this state nor Notes drafts are synchronised across devices. Arbitrarily late media geometry beyond the bounded settle window and physical mobile keyboard/selection behavior require separate evidence; the browser acceptance report records the performed results.

## Permanent focused checks

`node --test tests/layout-workspace.test.mjs` — eight passing tests cover preference normalization/options, exact task URL admission and a task missing from the bounded collection, semantic serialization/private-text exclusion, malformed/excessive position rejection, retained-head admission, task-qualified mode return and nonmutating bounded shelves. These are state/serialization contracts. They do not claim React/browser focus, history timing, delayed media or physical-device acceptance; read the separate browser results for those observations.
