# PR80 implementation progress — 3 November 2026

Owner commissioned implementation, merge when appropriate and production Sites deployment in this chat. Issue #81 remains deferred. No database reset, new table, access change or synthetic learner scenario is authorised or required.

Verified starting public PR head: 9fcc2d11831fe28844d2ef9558f9791bcae297aa. Native remote HEAD: 82b35b70d3dc4117c7b22d8a68788f1967944455 (V98 retained experiment). Accepted live V91 source: b649c630a6302433c466e251aed1885dc5dc00c6. Existing Site ID and custom access policy retained.

First increment (in progress): strict embedded composition contract, six patterns and rich canonical section renderer; semantic create/update/read/preview/history adapter; shared guarded Project write path; exact admitted references; direct-edit protection; Note pin endpoints; recovery schema extension. Existing transaction handles canonical section content and layout together in one record, including existing image/media attachment admission. No new cross-record content mutation API is claimed. Existing Notes/Articles are referenced, not copied or rewritten.

Remaining: finish focused UI cleanup, persistent dock pin UI, relevant transaction checks, native reconciliation, native build, publish and brief smoke. Do not claim GPT/MCP acceptance until owner reinstalls existing personal plugin and refreshed tools are verified. No full suite by default.

Native source must remain protected. Port shared changes as patches; retain native domain/reading/Notes/auth differences. Deliberately restore only rejected interface entry/surface changes to verified V91 equivalents when preparing a normal descendant native commit. Keep V91 saved rollback.

Second increment: native six-pattern rendering and canonical references, local Edit/Add section, cover crop/focal controls, shared scope cycle and Cards/List catalogue, whole-row Library links, retired handoff/task-pin presentation and conditional Note pin indicators. Notes use the existing autosave coordinator before pinning and advance base revision without replacing editor prose. Added an optional bounded `noteChanges` array: Project and up to eight explicitly changed Notes commit under one nonce-owned D1 batch, including asset/source guards and revision history. Identical retries read the semantic receipt.

Focused disposable D1 checks initially passed 4/4 (MCP loop, CAS/idempotency, direct edit/override, late failure rollback, two-page pins and atomic Project+Note updates). A portable-recovery round trip is being added. Native production build succeeded before final polish; repeat after the final touched paths. Public and native type checks are in progress. No full suite or hosted scenarios run.

Source transfer note: ordinary GitHub HTTPS push lacks runtime credentials; use connected GitHub Git Data API with expected-head lease for shared commits. Native Git uses short-lived Sites credentials via helper stdin. The initial local checkpoint d39d270 is retained locally; the GitHub checkpoint may have a distinct commit hash for the same shared tree.
