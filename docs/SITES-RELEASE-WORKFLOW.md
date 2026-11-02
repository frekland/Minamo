# Publishing the owner-private ChatGPT Site from public Minamo source

**Workflow decision — 31 October 2026.** `frekland/Minamo` is the single active GitHub source, issue, PR and release-evidence home for shared Minamo application development, including work intended for the existing ChatGPT Site. The historical private GitHub engineering repository is a retained reference, **not a second mandatory implementation or promotion repository**.

The existing Site still builds from its **separate native Sites Git repository**. A public GitHub commit is neither that native commit nor a deployment. The Site's audience, identity, D1/R2 storage, MCP bindings and runtime environment stay separate and private. Independent Cloudflare/Auth0 staging is another distinct release target; nothing in this procedure promotes to it.

## Fast owner-authorised Sites deployment gate — 2 November 2026

**Owner policy: a full regression suite is not required before a Sites deployment.** A draft-PR candidate may be published to the **existing unchanged audience** for opt-in evaluation before full automated/browser C1–C9 acceptance. Do not call that deployed candidate accepted, merge-ready or production-complete merely because it builds and publishes. The full suite is valuable for later merge/default-route/product acceptance, but **must not be silently reintroduced as a pre-deployment condition** by a checklist, earlier release receipt or implementation blueprint.

For each authorised Sites release, use a **bounded, change-specific gate**:

1. Pin the reviewed public candidate and native Sites HEAD. Verify the selected file manifest/content hashes, preserve native-only hosting/identity, D1/R2/MCP bindings and access policy, and identify a known-good rollback. No mass tree replacement, surprise migration or permission widening.
2. Produce a deployable build/package from the exact native candidate. Run **focused tests for the changed paths** and a relevant typecheck/smoke check when feasible. For edits touching authentication, owner isolation, rights, canonical writes, recovery or schema, verify those **directly affected invariants** before exposing them. **Do not require** the entire `pnpm test` suite, a full Playwright/browser matrix or all C1–C9 as a condition of publication.
3. Record **which checks ran, passed, failed or were skipped** and why. A missing full run is a disclosed limitation, **not** a failed gate. An actionable failure in a directly affected safety-critical path, a failing build, unknown source/native parity, an unreviewed migration or inability to preserve audience/bindings **does** stop release; resolve it or obtain an explicit, risk-specific owner decision where appropriate.
4. Deploy with the current Sites access policy, then run **post-deployment** smoke/learner-browser/MCP checks appropriate to the change. Log honest findings, keep a rollback ready, and revert or fix newly observed serious regressions. Release receipts must distinguish focused preflight, post-deploy observation, full-suite status and product acceptance.

**Separate later gate:** PR merge, making `?workspace=context` the normal route, broad product claims, and schema/permission changes have their own explicit acceptance/authorisation requirements. Full automated/browser suites remain appropriate for those decisions; they are **not prerequisites for a reversible, authorised opt-in Sites deployment**. This changes the ongoing release policy, not the historical fact that V92 happened to have a full public suite pass before deployment.

## Direct public-to-native Sites release

1. **Select the SITES target explicitly.** Identify the existing Site by an authorised, privately held project ID and read the current saved version, deployed native source SHA, access mode and environment/binding revisions. Inspect public `main`, open PRs and current source. Never create a replacement Site just to simplify the repository arrangement.
2. **Develop and review in public.** Use a focused public issue/branch/PR. Keep real learner records, credentials, IDs, private endpoints, private assets and deployment configuration out of public Git. Use the **fast, change-specific Sites gate above**: a successful exact-candidate build plus focused relevant verification and documented limits. Do **not** hold a functional or opt-in release for the entire regression suite or full browser acceptance matrix.
3. **Classify a bounded source manifest.** Compare the affected public files against the current native Sites checkout, including exact content hashes. Apply only reviewed shared-code changes, plus clearly documented Site-specific adaptations. Never overwrite an unrelated, newer native change or blindly copy/delete either entire tree. Do not require an impossible full-tree SHA match between unrelated Git histories.
4. **Retain protected native-only material.** The private `.openai/hosting.json`, source identity and allowed-origin configuration, access/secret bindings, owned brand assets and separately reviewed Site-only source remain native. Runtime values should be configured through the host when supported. Never infer permission to publish native-only files from their presence in a checkout.
5. **Build and verify native source.** Apply the manifest to the current expected native HEAD, preserving its ancestry. Check every ported file's blob/digest against the approved public version or record an explicit adaptation. Confirm it builds/packages, run directly relevant safety/function checks where feasible, and report the exact native commit/tree, tested public SHA, file exceptions and **all skipped tests including any omitted full suite**. A full-suite run is optional before Sites publication.
6. **Publish to the existing audience.** Push the new native commit to its configured Sites Git branch using short-lived scoped credentials, then save that exact native HEAD. Select the Sites deployment operation from the *actual access policy*: owner-only sites may use the owner-private operation, but an existing custom invitation list must use the standard saved-version deployment operation **without changing the access policy**. Verify success, unchanged audience and D1/R2/MCP configuration, and absence of unauthorised fixture or learner-data mutations. A GitHub merge alone does not publish.
7. **Close the loop in public.** Record a sanitised release receipt with the public commit, selected file manifest/digests, native commit, user-facing Sites version, test matrix, observed smoke/MCP evidence, residual gaps and rollback target. Keep operational secrets, owner identities and sensitive logs private. Fix shared-source regressions in a new public PR; avoid untracked hotfixes that live only in native Git.

The native repository is an **output/deployment surface**, not another place to independently develop shared features. The private historical GitHub repository can stay readable without accumulating new implementation PRs, routine release reports or mirrored source changes. A private operational note may still be needed for genuinely sensitive decisions; it must not become a parallel code authority.

## V80 baseline comparison (31 October 2026)

An exact read-only comparison was performed between public `main` at `4e3b38d96be9a916f0e9bb28028d302f5d3ab3a1` and the existing Site's native V80 source at `e7a7c111490bbf1b56da3473ca6ca62a8fe99a03`. Most shared application modules were byte-identical, but **whole-tree parity was not established**. Differences must remain intentional until individually reviewed:

- Native-only hosting/origin defaults and configuration, plus protected branding and test assets.
- The existing native recovery-export batching/cache implementation, associated with still-draft public PR #9, and a portable-export error message not yet integrated into public `main`.
- A native-only development-preview benchmark fixture, separate from general synthetic acceptance fixtures.
- Small build configuration, package identity, licence/attribution, test and documentation differences.

This comparison **does not authorise deleting native files, backporting the pending recovery fix, changing access/auth or rewriting owner-specific settings**. For the first direct-transfer smoke release, use a documentation-only public file as the source manifest and preserve all V80 application bytes; verify the process before attempting functional code promotion. Every later source change must still inspect the current actual native version.

## Non-goals and failure conditions

- No GitHub Actions auto-deployment, force-push, mass native tree replacement, automatic data migration or cross-deployment release.
- No weakening of host identity, signed-in principal isolation, revision/CAS, recovery or source-rights checks.
- No assumption that the current independent Cloudflare staging runs the complete owner-private Sites app.
- Stop before publication if the current native HEAD changed unexpectedly, selected files cannot be matched, a required native-only adaptation is not understood, the candidate fails to build, a directly affected security/data-integrity test demonstrates a serious regression, or the existing audience/bindings cannot be preserved. **Not running the full suite is not a stop condition.** Record other failed or unrun checks and make a scoped decision.

The public repository is the source of truth for future shared changes; the native Sites commit and its successful deployment remain the separate truth for what is actually live.

The first verified direct transfer and publication is recorded in the [31 October V81 release receipt](releases/2026-10-31-sites-v81-direct-source.md).
