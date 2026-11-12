# Source ownership and synchronisation

> **Historical V2 policy; superseded 31 October–5 November 2026.** `frekland/Minamo` (public) is now the canonical engineering repository and the current owner-approved [fast Sites workflow](https://github.com/frekland/Minamo/blob/main/docs/SITES-RELEASE-WORKFLOW.md) governs routine deployment to the existing private Minamo Site. Native Sites source is a protected deployment artifact; private `minamo-v2` PRs, whole-tree SHA equality, full-suite release gates and GitHub merge are **not** required for a routine Sites change. Preserve the security, rights, storage, exact-source, expected-head and no-force-write invariants below. This page remains historical provenance, not a separate release gate.

Canonical engineering repository: `frekland/minamo-v2`, private. Runtime publication: existing owner-private Site `appgprj_6ad8a4e85eb48191accd6e78976b47e3`.

Sites uses a separate artifact-backed native Git repository. Connecting GitHub does not automatically synchronise it. The initial 129-file foundation was transferred through the connected GitHub Git-data API to `build/learning-workspace`; the returned GitHub tree SHA `720cb48153586d313aa7738944393e450b0973a7` exactly matches the native foundation tree. Foundation GitHub commit `f8359880bea86dfdd4ebdc0a39227bf0b853ca6b` preserves the initial GitHub README commit as parent. Native foundation evidence commit was `e91e9e88a391f1e1b260e72d8eb07ecd7375a016`.

For each integrated release: finish local checks, commit/push the exact native source through the supported Sites source helper, transfer the source tree to a bounded GitHub branch using the Git-data API, verify identical tree SHA, create/check/merge a V2 PR, and package/deploy the verified native source. Record both commit IDs and their common tree. Never fabricate a GitHub SHA or claim commit identity where only tree identity is verified. Preserve changes by checking the expected GitHub head before updating a ref; no force writes.

Ordinary HTTPS GitHub clone/push from this executor has no GitHub credentials; the connected GitHub API is the supported transfer route. Credentials for native Sites Git remain in memory and are passed via hidden stdin, never stored in source.

Original `frekland/Minamo`, its Site and records, and `frekland/cyber-learning` are read-only/out of scope for writes. New product records belong only to V2. Tests identify synthetic data explicitly.
