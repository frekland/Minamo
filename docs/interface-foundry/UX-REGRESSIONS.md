# UX preservation and regression map

The staging interface reuses the existing Workspace, canonical Reader and persistent Notes coordinator. These guarantees are inherited from V1/V2 correction work and PR33/34, then exercised against the combined PR41 Activity/Atlas foundation. A source or test link below is not by itself physical-device acceptance.

| Guarantee | Implemented protection | Evidence/check |
| --- | --- | --- |
| One persistent Notes writer through mode and content changes | Host owns no NotesPanel; Workspace supplies `onOpenNotes` and exact contextual links | Existing Notes tests plus full-workspace browser acceptance |
| Exact source edition and passage identity | ActivityLink forwards unchanged family/id/rendition/section/part; canonical Reader owns capture | `tests/activity-ui.test.mjs` performs local D1 retained source, Flag and Annotation round trip |
| Native code/CJK selection remains usable | Source uses escaped pre/code; host handles keyboard only on section tabs | UI inert-source tests; actual browser selection required |
| No “source file A” choice leaking into project B | File display map is per scope/generation/Activity edition and block ID; selected path is checked against actual package files | `tests/interface-workbench.test.mjs`, existing draft identity tests |
| Pending/rejected saves retain original evidence | Existing serialized operation/payload and exact retry code remain in ActivitySession | `tests/activity-ui.test.mjs` uncertain retry and wrong-edition/owner checks |
| Layout changes do not create progress | Host has no domain mutation API; Attempt save remains one explicit action | Component test excludes execution/checkpoint UI; domain tests distinguish Attempt from Development |
| Phone gets one usable content surface | Container-measured panes, roving labelled tabs, no compressed desktop triple column | Browser matrix at 320–1440 CSS px; physical Pixel/IME gate remains explicit |
| Side-docked Notes cannot force a tiny editor column | Host uses measured available container width; no aside below 900px with a minimum 560px primary and 240px support allocation; source grid reflows through container rules | Browser Task + right Notes at 1024px |
| Focus mode retains source while reducing chrome | Existing outer workspace mode is observed; host forces one surface in Focus; no fourth global mode | Browser Classic/Focus/Task identity and draft checks |
| Hints do not leak through hidden DOM | Server redacts unrevealed text; inactive guidance content unmounts; revealed text can be removed from DOM | Domain/security tests plus browser DOM probe |
| Hint reveal does not discard keyboard focus | Stable enabled button with busy/expanded state and status announcement | Keyboard browser check; physical screen-reader assessment remains separate |
| Closing a view stops its media/runtime | Inactive panes unmount ActivityArtefact; existing registry disposal remains authoritative | Independent lifecycle tests and browser start/switch/stop checks |
| Revoked source is not retained for visual convenience | Exact server revalidation clears Activity; host `eligible=false` mounts no source or actions | Component denied-state test plus source-rights domain tests |
| Source remains accessible on unknown presentation | Explicit unsupported status and trusted canonical fallback; no dynamic component names or user JSX | `tests/interface-workbench.test.mjs` hostile recipe and future-kind cases |
| Oversize recovered Unicode drafts do not acquire broken surrogate pairs | Recovery truncates on scalar boundaries while preserving existing UTF-16 budgets | `tests/challenge-interface-unicode.test.mjs`; CRLF/tab/CJK unchanged |
| No active experiment reruns on reopen | Registry activation remains deliberate; source browser never executes files | Existing Activity UI/runtime tests and browser initial-state inspection |
| Synthetic tests do not pollute production work | Dev-only preview routes use isolated local D1; no genuine learner write | Production-compiled route/feature-off tests and release procedure |

## Cases requiring actual browser evidence

Do not promote SSR/typecheck to a gesture claim. Check exact source selection and Reader return while a Note is pending; Notes docking/minimise/reopen; keyboard tab order; mobile one-surface navigation; source denial after an active visual; long TeX/CJK/code with 200% zoom; stale operation receipt; audio start/stop/background and mode switch. Automated ARIA checks are not broad assistive-technology certification. Physical Android, OS keyboard and TalkBack remain distinct owner/device gates.

The full-workspace lab, screenshot report and combined release-readiness report carry the final observed outcomes and exact source. This table defines intended preservation and the location of concrete protection; it does not silently close unperformed device checks.
