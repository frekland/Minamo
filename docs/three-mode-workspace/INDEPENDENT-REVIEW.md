# Independent source and exact-navigation challenge

This reviewer inspected the production-targeted Workspace, passive ReferencePreview, canonical Reader, layout controller and GPT intent boundary. Evidence below is source review, real component static rendering and actual isolated Worker/D1 execution. It is separate from the owning agent's interactive browser acceptance. No production or connected learner record was read or changed by this reviewer.

## Material findings and disposition

| Finding | Correction reviewed |
| --- | --- |
| An exact retained fetch checked family/rendition but omitted the requested record ID. | Workspace now also checks the exact ID before accepting a retained response. |
| During pending/unavailable retained or capture resolution, reading-level GPT and contextual Note actions could borrow the current head. An old retained object could also enter the canonical Reader for a render before the next read effect ran. | One `exactReadingReady` boundary now gates the displayed reading, canonical Reader, presentation memory, GPT/Note actions and Notes' current reading. Missing/mismatched targets remain unavailable/loading; no current-head substitute is admitted. The actual Workspace render regression below exercises missing and mismatched family/ID/rendition states. |
| A native modifier/new-tab Open exact reading link in the passive preview omitted the task parameters that ordinary client navigation retained. | The href now includes the explicit task family/ID/stage/rendition while preserving the independently selected reference edition and section/part. |
| Task identity was derived only from records already in the bounded local collection. Opening an unloaded Journey/Investigation could retain the previous project's task and saved direction even after the exact new reading resolved. | `primaryTaskFromParams` now derives validated exact primary identity from explicit family/ID/stage/requested rendition in initial navigation, Back/Forward and client navigation, independently of the bounded records. The resolved reading pins its known edition. Actual metadata still validates stage eligibility. The controller owner added a permanent partial-collection regression. |
| Root's follow-up source challenge found that a ready/unavailable capture A could resolve a newly requested capture B on the same Article before its read effect ran. | `captureReadForTarget` now admits only the exact key/ID/family and eligible anchored record. A stale prior completion is pending for the new identity; ambiguous families are never guessed. Two transition regressions verify these cases without lending current-head authority. |
| Task's saved next action was fetched only when task identity/revision changed. Saving, correcting or withdrawing an existing checkpoint emits `minamo-learning-changed` without changing that record revision, so the rail could retain withdrawn direction. | The controller now listens to the existing event, aborts superseded reads, clears the old action while checking, and admits only the current target/sequence. A bounded visible-foreground check refreshes externally changed saved learning. Independent source re-review confirmed these guards; interactive checkpoint acceptance belongs to the owning browser receipt. |

PR #33's cautious preview caveat is resolved at the architectural level: V24 ReferencePreview already renders a deliberately bounded passive projection. It does **not** mount another Reader. Its prose/pre content has no canonical IDs, `data-reading-part`, selection hook or capture coordinates. Retaining that model is preferable to promoting another interactive reading owner. The canonical Reader remains responsible for annotations, Flags and exact UTF-16 passage selection. Root's browser acceptance separately exercises preview opening/closing, mode switches and promotion.

The controller's semantic restoration uses generation-scoped, exact-edition identities and excludes passive preview DOM. Explicit section/passage/capture links remain Reader-owned. Bounded browser-session position metadata contains identities/offsets, not quotations or drafts. User input stops the short delayed-content restoration window. This source review does not establish physical-device scroll/touch-selection accuracy.

## Permanent independent regression tests

`node --test tests/three-mode-navigation.test.mjs`: **6 passed, 0 failed** at the final capture-boundary reviewer run.

1. Actual local D1 creates an Article with literal CRLF, tabs, a Windows path and emoji; captures the exact emoji; rejects a split surrogate; changes the current head; reads the retained edition; renders actual Reader plus a same-record passive preview; checks canonical ID uniqueness and capture marking; verifies exact native destination and GPT focus; then checks current Trash eligibility and retained independent annotation prose.
2. Actual source admission/reuse/revocation reads an old Article edition under current rights. Restricted source content is masked without replacing the edition or independent prose; real Reader/preview rendering and capture rejection preserve that boundary.
3. The production Workspace itself is rendered with absent and wrong family/ID/rendition retained data and a pending capture. None owns a canonical reading or reading GPT/Note action. A positive exact retained case has those actions and displays the correct retained parts.
4. Actual passive-preview markup retains task family/ID/stage/rendition in its native exact-reading href, including the separate exact reference edition.
5. The exact capture-admission helper rejects ready or unavailable capture A when the requested capture changes to B on the same reading; only B’s matching completed read is admitted. Wrong IDs/families, Trash and missing anchors remain unavailable.
6. Same-ID Annotation/Flag identities stay separate; unspecified ambiguous capture families do not guess a record, and a unique eligible family preserves legacy admission.

Fixtures use original synthetic content and ephemeral Miniflare D1/R2. Every backend is disposed in `finally`. These tests do not simulate a React layout switch, browser history gesture, authenticated hosted session or fresh GPT conversation. They strengthen the shared source/edition boundary; the integrated browser report remains necessary.

## GPT and scope disposition

The separate task request reads the exact Investigation or validated Journey stage through the existing `get_minamo_learning_context` tutor projection. It keeps current saved learning distinct from the selected authored return edition, does not embed private body/title/draft bytes, and grants no writes. The reading request retains exact rendition/passage identity and only deliberately selected related records. Whole-Journey continuation is disabled until an exact valid stage is chosen. Both remain manual clipboard handoffs; no connector, model call or automatic checkpoint is added.

Classic retains the actual V24 Workspace branch rather than a recreation. Alternative modes change presentation around the existing Reader/Notes controllers. Source review found no justification for collapsing Book/Technical or the three Task arrangements into one preset. Owner preference and physical Android keyboard/TalkBack acceptance remain distinct from automated functional acceptance.

## Final source disposition

The reviewer re-read all six corrections, including the controller's primary-task derivation and saved-continuation event/foreground lifecycle. No unresolved source blocker remains within this scope. `tests/three-mode-navigation.test.mjs` now has six passing tests. The controller owner's separate tests cover local preferences, bounded exact position metadata and partial collections. Root owns the final aggregate suite/build/CI and interactive browser evidence. This disposition is not authority to merge or deploy, and it does not turn browser emulation into physical-device or hosted-authentication acceptance.

## Mobile-orientation refinement re-review

The later Focus orientation disclosure retains labelled access to breadcrumb/management, reading GPT/Note actions and return routes while leaving section navigation direct. `ReadingOrientation` and `WorkspaceActions` use stable `details`/body element positions in every mode; changing preset updates presentation/open state without replacing their GPT descendants. Exact reading admission remains unchanged. The reviewer found a cascade issue where Focus's summary `display` rule could override its `hidden` attribute outside a resolved reading; the UX owner restricted all reduced-orientation styling to `.is-reduced`. Source re-review confirmed that correction. The affected navigation/state/GPT tests again passed **16/16**. This is source/render validation, not an independent browser focus or top-layer-dialog observation.

The final exact-capture follow-up changed only the Workspace admission block plus its imported helper. The asynchronous read still owns fetching/abort/recovery; the helper guards the committed render before that effect can update state. Root discovered this follow-up during source inspection; the reviewer confirmed, corrected and regression-tested it. The new six-test navigation file and existing eight source-admission tests passed **14/14** together.

## Native modal follow-up

The initial wrapper source/render review established stable component identity, **not native modal visibility**. Root’s later actual browser challenge found that a same-browser Classic→Focus preference event could close a containing `details` while its GPT `dialog` remained natively modal/open but had no rendered rectangles. That is a material defect; preserved React state alone was insufficient.

The corrected shared `useReadingDisclosure` keeps a stable initial `open` value for SSR/hydration, then uses a before-paint layout effect to apply the preset’s disclosure default only when no descendant dialog is mounted. Both orientation and action ancestors use it. The dialog check also covers the handoff’s short mounted-before-`showModal` effect window. There is no second modal owner, no editor remount and no new domain state. An ancestor deliberately remains open after closing the modal so the original trigger stays visible for focus return; a later preset transition reapplies its default. Independent source re-review confirmed the bounded correction, and navigation/GPT tests again passed **10/10**. Corrected native visibility/focus acceptance belongs to Root’s browser receipt.
