# Minamo Visual Lab — production-equivalent development source

> Lab reset, 10 November 2026: this existing owner-private Site is a deployment of the production V149 application code with **separate Site identity and D1/R2 data**. It is deliberately not the production Site. Lab-only changes are trialled here first; they must not be deployed to production without a separate owner request. The lab retains its own applied migration history (its migration 0016 has the same SQL as production's differently named 0016). The only runtime-code adaptation is an optional owner-only verified-email admission fallback in `lib/beta-access.ts`, configured by a lab-only secret because Sites user IDs are Site-scoped. Lab `MINAMO_SITE_HOSTS` permits only its own host; scenario control is disabled. This lab-specific guidance overrides references below to the production deployment target or production-only credentials; all security, owner scoping, revision, consent and source-rights invariants remain binding.

## Current owner policy (5 November 2026)

This repository is the **protected native deployment source** of the existing Minamo Site. The canonical public engineering/design repository is [`frekland/Minamo`](https://github.com/frekland/Minamo), not the historical private `minamo-v2` repository. Preserve the existing Site identity, custom invitation policy, signed-in user scoping, D1/R2/MCP bindings, protected native-only material and genuine learner data. Do not create or migrate to another Site.

Use the current [fast Sites release workflow](https://github.com/frekland/Minamo/blob/main/docs/SITES-RELEASE-WORKFLOW.md) and the public repository's current `AGENTS.md` for owner-directed product changes. They **supersede** the older full-suite and exact-cross-repository-tree rules still present in historical files, including `STATUS.md`, `docs/SOURCE-SYNCHRONISATION.md` and earlier release reports. Inspect the current deployed version and actual source before each change; do not assume a historical version pin is still live.

### Fast, risk-proportionate release checks

- **Documentation, test or process-only changes:** check the affected text/tests; no production build or deployment is necessary. Do not promote the Site merely to publish documentation.
- **UI, copy, styling and ordinary language content:** run a successful production build and a few directly affected tests; typecheck when the edited path can affect types. A brief relevant authenticated smoke check is useful after deployment.
- **MCP/domain writes:** add directly affected ownership, revision/CAS, receipt/idempotency and transaction tests alongside a successful build.
- **Authentication, privacy, Source rights, schema, recovery and destructive changes:** verify the specific safety invariants, and stop on an unresolved critical failure or unapproved data effect.

The entire `pnpm test` suite and historical headless-browser campaign must run **only on an explicit owner request**, using the separate manual CI opt-ins when appropriate. Do not infer that authorisation merely from a PR becoming review-ready, a merge, a `main` push, a Sites publication or an agent's generic preference for exhaustive validation. Routine work requires no scenario corpus, whole-tree parity audit or independent review. Critical changes still need their **directly relevant** auth, rights, storage, recovery, CAS and receipt tests; never waive a failed safety check. Never claim a skipped check passed. CI status is useful engineering feedback, not a second publication authority.

For a native release: inspect the current expected HEAD, port only the reviewed changed files with a short manifest of native-only adaptations, use the supported Sites source helper, publish the exact saved version to the existing audience, verify deployment success and report source/version IDs plus checks performed and omitted. A public GitHub PR/merge does not itself deploy the Site. Do not force-push, change access settings or reset D1 to speed up a release.

### Invariants that remain binding

Maintain owner isolation and source permissions, exact retained renditions and UTF-16 passage anchors, Note draft retention, CAS and idempotent recovery, synthetic fixture separation, and explicit learner write authority. Saved work is not proof of mastery or independently observed terminal execution. Never commit credentials, private learner records, provider tokens or protected logs to public Git. When MCP tool schemas change, distinguish server deployment from the owner's separately refreshed installed ChatGPT plugin.

Old `STATUS.md` and `docs/SOURCE-SYNCHRONISATION.md` are useful historical evidence, **not** the current requirement to run the full suite, merge into `minamo-v2`, or establish whole-tree parity before every Site change.
