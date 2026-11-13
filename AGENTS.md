# Minamo Visual Lab — production-equivalent development source

## Current release policy — 13 November 2026

The former Visual Lab is now the production Minamo Site. Reuse `.openai/hosting.json` and the existing Site; there is no separate Lab target. The owner's current instruction is to minimise unnecessary release checks. This policy and `docs/SITES-RELEASE-WORKFLOW.md` supersede historical blanket full-suite/baseline-audit requirements in old PR commissions and reports.

- Use `node scripts/release-check.mjs --plan --base <verified comparison commit>`, inspect the bounded selection, then run the same command without `--plan`. `docs/LATEST-SITES-RELEASE.json` records the last published native/GitHub application commits; verify current Sites status before relying on it.
- Routine PR implementation/deployment does **not** imply a full historical suite, two complete baseline/head runs, a scenario corpus or browser campaign. Full audits require an explicit owner request and the manual `--full`/Actions option. Investigate a suspected regression by rerunning that affected file on the baseline, not both entire suites.
- Documentation needs no application build or Site publication. Test/process-only changes need their affected checks. UI/CSS needs one production build and relevant checks; typed runtime changes also need typecheck. MCP/domain writes retain ownership, generation, CAS, retry and source-rights checks. Never waive a failed relevant safety check.
- Build the exact native release source once. Do not first rebuild the same source in a public checkout and repeat it in native without a concrete reason. Reuse installed dependencies only when the pinned lockfile matches; install frozen when absent/changed. Do not bypass installation guards.
- Run builds and test selections sequentially in this workspace; use the default two test workers. Do not launch competing full suites/builds. Keep actual failure exit status; repair fixture cleanup instead of waiting indefinitely for leaked runtimes.
- Inspect live version and native HEAD, transfer only reviewed differences, retain native-only files, and verify changed-file bytes/modes. Reuse an established source reconciliation unless current source diverged; do not repeat the whole historical inventory for each small release.
- Mint short-lived Sites Git credentials just before pushing. Keep tokens in process memory. Push without force, gate on the expected native HEAD, build/package that exact commit, and use a gzip tar containing `.openai/hosting.json` and `dist`. Never change audience, bindings or learner data to simplify publication.
- Publish once, poll the returned deployment, and record version/native/GitHub commits and checks. Do not resave a version merely because publication is pending. Tell the owner when new MCP schemas need reinstallation; distinguish server deployment from fresh-chat/browser acceptance.


## Current owner policy (5 November 2026)

GitHub is the shared engineering source; the existing Sites native repository is the deployment surface. The canonical public engineering/design repository is [`frekland/Minamo`](https://github.com/frekland/Minamo), not the historical private `minamo-v2` repository. Preserve the existing Site identity, custom invitation policy, signed-in user scoping, D1/R2/MCP bindings, protected native-only material and genuine learner data. Do not create or migrate to another Site.

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
