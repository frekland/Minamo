# PR80 production release — 3 November 2026

Public implementation: `bd61c6d7807e76cb509331e3ae8572650a0f3129` plus the final Note-pin toolbar placement/documentation follow-up.

Implemented: bounded semantic MCP Project creation/update/rename/preview/history restoration; canonical content and layout in one record revision; optional atomic Project plus up to eight explicitly changed Notes; six distinct native section patterns; exact inline record references; deterministic existing-Project adaptation; direct title/description/text/code/table/image editing and Add section; private cover and in-section image uploads, cover focal crops and derived thumbnails; scope cycle and Cards/List catalogue; multi-page Note pins through existing autosave; bounded Library/Home/shared-chrome cleanup.

Native provenance: normal descendant of retained V98 `82b35b70d3dc4117c7b22d8a68788f1967944455`, deliberately restoring V91-style page/workspace/navigation/catalogue/Practice source-activity surfaces. V98 Study/contextual entry is disabled. Native exact-selection Reader, Notes coordinator/focus handling, record metadata, current origins, identity, D1/R2/MCP and hosting are retained. No D1 migration/reset, binding/auth/audience change or data deletion.

Checks: public/native TypeScript; successful native production build; five focused disposable-D1 checks covering real MCP create/read/update, stale CAS, owner denial, retry/payload mismatch, direct edit preservation/explicit override, exact retained references, Project/Note late-failure rollback, two-page pins and unpinning, portable recovery round trip. No default full suite or hosted learner scenarios. Source/pin admission and asset guards use existing current-owner transaction checks.

Release target: existing Minamo Site `appgprj_6ad8a4e85eb48191accd6e78976b47e3`, https://minamo.jscymru.chatgpt.site. Existing custom policy revision 1 must remain unchanged. Saved V91 `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_3c8f4b1de4c081918e0595c6d8f4cd47` remains the rollback.

Acceptance boundary: publication and brief browser smoke do not establish host GPT/MCP acceptance. Owner must reinstall the existing personal plugin; then verify host-visible new tools and harmless get_layout_capabilities before new-tool writes. No second plugin. Direct authenticated upload is the supported image transport; MCP does not transport generated image bytes. History reads return the most recent 12 record revisions, with exact older revision retrieval available. Page-pin reverse reads are bounded to 32 Notes and expose truncation. No claim of full corpus or learner-experience acceptance. Issue #81 remains deferred.

## Published result

**V100 succeeded** at https://minamo.jscymru.chatgpt.site, native source `a10709c9cfb7b0de819dc392de01ce29e576e1d4`, deployment `appgdep_6ae9503af8e8819184c1c5d01cd2e4ca`. Initial V99 was followed by a short browser-led cleanup correcting the inherited Project contents panel, generic management label, pagination diagnostic and exact known generated checkpoint boilerplate. Original canonical text remains retained. The final native typecheck/build passed. Shared implementation code is at `65c905f72eab472124958f18ec9a9124087c2b5d` plus release documentation.

Brief authenticated Cloud Browser observation: compact scope icon replaces dropdown; ordinary Projects exclude synthetic fixtures and have Cards/List controls without creation/handoff actions; existing Bandit description/Stages render as inline Notebook/Guide plus eligible related content; Library subject rows open article destinations and retain the Notes dock. No live learner content was written. This is a focused smoke, not a learner scenario campaign or proof of product usefulness.

Site audience rechecked after initial publication: custom policy revision **1**, same two allowed users; runtime environment revision **9** and hosting bindings unchanged. V91 rollback remains available. New tools were not present in the current ChatGPT catalogue; owner reinstallation and a refreshed read-only capability call are still required. No end-to-end GPT/MCP acceptance is claimed.
