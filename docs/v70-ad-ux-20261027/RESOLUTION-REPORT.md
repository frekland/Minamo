# Minamo V70 A–D engineering resolution report

Implementation PR: [#101](https://github.com/frekland/minamo-v2/pull/101). Commission: [#99](https://github.com/frekland/minamo-v2/pull/99). Original review: [#98](https://github.com/frekland/minamo-v2/pull/98). Independent final UX acceptance remains [Terra #100](https://github.com/frekland/minamo-v2/pull/100).

## Release status

Final technical and publication receipts are recorded in ENGINEERING-EVIDENCE.md and the implementation PR. This ledger distinguishes technical resolution, sampled Cloud Browser observations and external validation limits. It is not independent whole-site UX certification. The owner explicitly reserved that review for Terra after deployment.

Baseline reconciled: GitHub main `9a00717e9c34944a4d03ccd5b9fc1985979d9123`, native `07a062b44c2df18a752af3d0de2b4ae02fd0e5ca`, identical tree `bfc770b1c305804243832947e23d03b3ddf7e599`, private V70. Projects commission #92 was treated as a compatible existing contract, not reimplemented afresh.

## Evidence boundaries

“Resolved” below means the technical requirement is delivered and locally covered, with representative Cloud Browser smoke where relevant. A local-only fault/security boundary is identified explicitly; one sampled browser flow does not assert all 60 findings were individually tested on every device. Synthetic mutation tests use isolated D1/R2/browser stores. Genuine owner content is read-only. No Actions, workflow edits, paid services, migrations, access expansion, new Site or retired workspace mode is introduced.

Suite names refer to `tests/<name>.test.mjs`; see ENGINEERING-EVIDENCE.md for exact complete-run totals and browser S01–S08 evidence. This report includes deliberate P3/design deferrals rather than presenting every original suggestion as a mandatory new feature.

## All 60 dispositions

| ID | Final status | Source | Local evidence | Browser observation / outcome / remaining limit |
| --- | --- | --- | --- | --- |
| L01 | Resolved | app/library-browser.css | library-presentation | 390px Subject: compact heading/description; no horizontal overflow. S08 |
| L02 | Resolved | app/library-browser.tsx | library-presentation | Subject and Article titles are native anchors with exact destinations. S01/S08 |
| L03 | Resolved | app/library-browser.css | library-presentation | Introduction aligns with the description and retains its exact edition. |
| L04 | Resolved | app/reference-preview.tsx; app/navigation-context.tsx | library-return; manuscript-reader | One primary Open action; bounded Subject/Project context survives native links. |
| L05 | Resolved | app/search-match.tsx | search-evidence; search-ranking | Short result-field labels replace algorithm commentary; excerpts/coordinates remain exact. |
| L06 | Resolved | app/library-browser.tsx | library-presentation; catalogue-pagination | Loaded counts and More describe bounded coverage; no invented global total. |
| L07 | Deliberately deferred | app/workspace.tsx; app/reader.tsx | reading-continuity | Preview duplication is removed. A wider Reader toolbar redesign is left for Terra: existing exact-return, source and capture controls have different purposes. |
| L08 | Resolved | app/library-browser.tsx | library-presentation | An actually empty view offers deliberate GPT import; filtered emptiness retains clear-filter controls. |
| PRJ-01 | Resolved | app/learning-home.tsx | v70-ad-client | Typed terminal display projection; canonical bytes are unchanged. Genuine V70 defect reproduced before editing. |
| PRJ-02 | Resolved | app/projects-index.tsx | unified-projects-acceptance; record-navigation | Independent questions uses the existing investigations route/history and question heading/create action. |
| PRJ-03 | Resolved | app/journey-route.tsx | projects-home-continuation | Continue uses one resolver for target, label and basis; the contradictory override is removed. |
| PRJ-04 | Resolved | app/investigation-workspace.tsx | unified-projects-acceptance | Admitted linked Projects appear before the Question guide; all parents remain explicit. |
| PRJ-05 | Resolved | app/learning-developments.tsx | foreground-session; v70-ad-client | Shared foreground scheduler, same-target in-flight coalescing and sequence fences; explicit learning changes invalidate the old read. |
| PRJ-06 | Resolved | app/journey-goal-action.tsx; app/gpt-handoff.tsx | layout-gpt-intents; journey-growth-authoring | Connected-tool and reviewed Markdown alternatives are stated truthfully. |
| PRJ-07 | Resolved | app/project-overlays.tsx | unified-projects-acceptance | Automatic Step-first Resources only when loaded Step provenance exists; otherwise All. Explicit user filters remain deliberate. |
| PRJ-08 | Resolved | app/project-overlays.tsx; app/journey-route.tsx | unified-projects-acceptance | Incomplete map links can load the next bounded page inside the existing modal. |
| PRJ-09 | Resolved | app/project-overlays.tsx | unified-projects-acceptance | Narrow/reduced-motion entry uses Outline, with an explicit Map choice; no mandatory map pane. |
| PRJ-10 | Resolved | app/learning-activity.tsx | learning-activity; unified-projects-acceptance | Record-scoped organiser links now say Project-linked or Question-linked work rather than implying exact Step coverage. |
| PRJ-11 | Deliberately deferred | app/journey-route.tsx | project-ui | The authored opening is already bounded to 240 characters and the complete introduction is optional. Further removal needs actual content judgement by Terra, not a manuscript rewrite. |
| PRJ-12 | Resolved | app/learning-home.tsx | ux-home-journey; projects-home-continuation | Concrete next action/open question precedes the longer checkpoint account; evidence remains labelled. |
| N01 | Resolved | lib/recovery-operation.ts; app/recovery-panel.tsx | v70-ad-recovery | Actual isolated D1 activation loses its acknowledgement; reloaded non-secret metadata recovers the original receipt with exactly one activation. |
| N02 | Resolved | app/recovery-panel.tsx | v70-ad-recovery; recovery-panel | Acknowledged activation explicitly asks for Reload; no false automatic Opening claim. |
| N03 | Resolved | app/personal-work-organiser.tsx | personal-work-organiser | Complete empty and filtered empty states offer New Note/clear filters without fake work. |
| N04 | Resolved | app/personal-work-organiser.tsx | personal-work-organiser | Control labels use Project, Question and Subject; stored learner text is unchanged. |
| N05 | Resolved | app/personal-work-organiser.tsx | personal-work-organiser | Filters remain separate from connection authoring, which appears after deliberate selection. Relation labels use ordinary spaced words. |
| N06 | Resolved | app/personal-work-organiser.tsx | personal-work-organiser; security-pagination | The sort control explicitly says loaded results, with a loaded count and continuation. Server-wide sorting is not falsely claimed. |
| N07 | Resolved | app/personal-work-organiser.tsx | personal-work-organiser; notes-writing | Ordinary Note title/Open reaches the editable Notes workspace. Add to bar remains secondary; duplicate Edit is removed. |
| N08 | Resolved | app/notes-panel.tsx | notes-writing | One Hide Notes window control; individual Close tab retains writing. Observed opening, hiding and reopening a synthetic Note. S03 |
| N09 | Resolved | app/notes-panel.tsx | notes-writing | A visible inline Note title uses the existing autosave path. S03 |
| N10 | Resolved | lib/note-sync.ts; app/notes-panel.tsx | v70-ad-client | Explicit discard only for untouched, unsent, attachment-free blank drafts. Actual local blank discard observed; nonempty/uncertain drafts are ineligible. S03 |
| N11 | Resolved | app/notes-panel.tsx | notes-writing; v70-ad-client | Recent Notes keeps admitted rows on refresh failure and offers a same-query Retry. |
| N12 | Resolved | app/notes-panel.tsx; app/annotation-preview.tsx | notes-writing; reading-background-actions | My draft/Saved version comparison; choosing saved Note retains the displaced local version as a separate recoverable draft. CAS and immutable editions remain. |
| N13 | Partially resolved | app/annotation-preview.tsx; app/personal-work-organiser.tsx; app/reader.tsx | reading-background-actions; reading-capture-background | Ordinary existing-annotation editing now reuses AnnotationPreview. Legacy organiser drafts retain their old recovery route, intentionally avoiding an unsafe silent migration. Creation still owns its exact selection-bound draft. |
| N14 | Resolved | app/recovery-panel.tsx; app/archive-files.tsx | recovery-panel; domain-recovery-bundle | Primary recovery labels say Backups/backup files, distinct from learning checkpoints. Wire names and file compatibility remain unchanged. |
| N15 | Resolved | app/recovery-panel.tsx | recovery-panel | Data and recovery leads with Back up, Restore and Recover local drafts; metadata/details remain available. Safe dialog observed; fixture proxy does not supply a recovery list. S06 |
| N16 | Resolved | app/workspace.tsx | trash-purge; workspace-generation | Permanent deletion confirmation focuses Cancel and names the exact item count/action; scope remains all learning spaces. No genuine Trash emptied. |
| PRA-01 | Resolved | app/practice-library.tsx; app/activity-studio.tsx; app/activity-saved-practice.tsx | v70-ad-client | Mounted 503 tests retain admitted task, hints and rows; 403 redacts. Chrome tab away/back preserved the revealed synthetic hint. S02 |
| PRA-02 | Resolved | app/tools-panel.tsx; app/page.tsx | tool-drafts; personal-work-organiser | Tools describes loaded Runs and links to paged Your work → Runs. No complete-count or false empty-history claim. |
| PRA-03 | Resolved | app/tools-panel.tsx | tool-drafts | Storage failure is persistent and the current editor input is selectable for copying; no silent retention promise. |
| PRA-04 | Resolved | app/practice-library.tsx | practice-ux; v70-ad-client | Empty Activities offers Library material as a deliberate next action; no automatic seed or achievement. |
| PRA-05 | Deliberately deferred | app/practice-panel.tsx | practice-core; practice-recovery-complete | Optional review has genuine distinct feedback/history controls. Broader simplification needs Terra learner-flow evidence; no speculative collapse of recovery/admin states. |
| PRA-06 | Deliberately deferred | app/practice-audio.tsx | practice-audio; practice-write-authority-races | No new source-admission cache. Source/media checks remain before use; hardware/controlled hosted audio timing was not qualified. Measure before optimising this rights-sensitive path. |
| PRA-07 | Resolved | app/navigation-context.tsx; lib/practice-return.ts; app/flow-diagram.tsx; app/practice-audio.tsx | manuscript-reader; library-return; record-navigation | Shared bounded native href context covers diagram, transcript and Activity secondary links; exact coordinates are preserved. |
| PRA-08 | Resolved | app/practice-scenario-panel.tsx | practice-character-scenario | Spatial positions use a native captioned table with real rows/cells and labelled coordinates; text/object labels remain available. |
| PRA-09 | Resolved | app/workspace.tsx | activity-production-boundary | Unstaged scientific runtime entry is removed from normal Tools; build reports scienceIncluded:false. Banked modules remain source-only. |
| PRA-10 | Resolved | app/flow-diagram.tsx | diagrams; learning-diagrams | Graphic name uses authored description or genuine node labels; connection counts and exact text equivalents remain. |
| PRA-11 | Resolved | app/workspace.tsx; app/practice-library.tsx; lib/practice-return.ts | v70-ad-client; record-navigation | Practice-launched Activity remains in Practice, with list filter query/edition in native links. Browser observed correct active location. S02 |
| PRA-12 | Deliberately deferred | app/activity-studio.tsx; app/interface-workbench.tsx | ux-activity-learning | Existing Task/Source/Hints/Attempt panes are deliberate and were exercised. Authored provenance is not mass-rewritten; Terra can identify a specific remaining density problem. |
| C01 | Resolved | app/beta-center.tsx | v70-ad-client | Hydration is keyed before retention; clearing Markdown removes only its draft key. Separate proposal survives clear/remount in a mounted test. |
| C02 | Resolved | app/header-learning-space.tsx; app/workspace.tsx | compact-header-icons; learning-spaces-workspace | One main header selector includes Computing, every language, All Languages, All learning and Unclassified. Japanese survives Computing/back; narrow geometry corrected by browser measurement. S04/S08 |
| C03 | Resolved | app/beta-center.tsx | beta-production-admission; learning-spaces-domain | Import starts from deliberate current scope, makes destination explicit, includes both Mandarin variants and requires a concrete choice where scope is broad. Server scope/tenant validation remains. |
| C04 | Resolved | lib/beta-starter.ts | beta-domain; manuscript-adversarial | New starter edition says Projects/Steps/Questions. Existing saved manuscripts are not rewritten or reimported. |
| C05 | Resolved | app/gpt-handoff.tsx; app/journey-goal-action.tsx; app/workspace-help.tsx | gpt-context; layout-gpt-intents | Connected tools are conditional; a complete copy-to-ChatGPT/return-to-reviewed-import path is described without pretending Site access installs a plugin. |
| C06 | Resolved | app/workspace.tsx | settings-help-navigation; reading-interactions | Shortcuts respect defaultPrevented, IME, editable targets and modal ownership. Cloud Browser reproduced V70 stacking and verified candidate Settings remains the sole dialog. S05 |
| C07 | Resolved | app/workspace-help.tsx | settings-help-redesign | Task-oriented entries cover closed Notes, offline/conflicts, backups, study language and GPT, with real links where appropriate. |
| C08 | Resolved | app/presentation-settings.tsx; app/settings-help.css | settings-help-redesign | Sample sizes match Reader 17/19/22px; narrow measure is 58ch constrained by panel; ruby/code sample included. |
| C09 | Resolved | app/beta-center.tsx | foreground-session-integration | Confirmed session fence immediately removes protected content and presents a non-sensitive focused Reload action; late reads cannot repopulate it. |
| C10 | Resolved | app/page.tsx; app/startup-retry.tsx | compiled-worker-smoke; beta-production-admission | Generation lookup failure returns a privacy-safe Retry surface without inventing a namespace or serving stale content. |
| C11 | Partially resolved | app/header-learning-space.css; app/library-browser.css; app/practice-scenario-panel.tsx | library-presentation; compact-header-icons | Targeted CSS viewport/keyboard corrections are included. Physical device, screen-reader and formal contrast/zoom certification are not claimed; Terra retains the broader audit. |
| C12 | Resolved | app/presentation-settings.tsx | settings-help-redesign | Tab orientation follows desktop/narrow layout with matching arrows; feedback explicitly says preferences are on this device. |

## Reconciled counts

**53 resolved**, **5 deliberately deferred**, **2 partially resolved**; **60 total**, no missing or duplicated IDs.

## Remaining work for owner/Terra

Review the five deliberate design/performance deferrals and the two partial boundaries before commissioning another implementation. Independently assess the actual published candidate and challenge this ledger. Do not infer physical-device, invited-account or screen-reader acceptance from synthetic identities or CSS iframe widths. Further discretionary changes are not implemented in this commission.
