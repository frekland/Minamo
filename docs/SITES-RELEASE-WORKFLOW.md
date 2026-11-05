# Minamo Sites publishing — focused, owner-authorised iterations

**Full-suite restriction (5 November 2026):** The complete `pnpm test` suite and historical browser acceptance must **not** run by default on any PR state, merge, `main` push or Sites deployment. They are available only through an explicitly requested manual workflow dispatch (`full_regression` / `browser_acceptance`). Risk-specific privacy, authentication, CAS, rights and recovery tests remain required for changes that touch them. Do not quietly broaden an ordinary change into a full regression campaign.

**Current owner release policy: 3 November 2026.** The existing owner-private ChatGPT Site is the release target. The user wants rapid, reversible Sites deployments with minimal unrelated checks. This policy replaces the previous **full-regression-before-functional-release** requirement in older documents, AGENTS guidance and draft PRs. It does not relax privacy, auth, rights, canonical write correctness, access policy or rollback.

## Default: fast Sites gate, not a 30-minute suite

When the owner authorises a production update or candidate, use the smallest change-specific path:

1. **Select exact Site and source.** Confirm current production version and saved rollback; preserve the existing custom audience, auth, D1/R2/MCP bindings and private native-only files. Public GitHub is the shared code/PR source; Sites has a separate protected native Git source. Do not assume a GitHub merge publishes.
2. **Prepare only the change.** Port reviewed changed shared files to the native Sites source, with a short changed-path manifest or equivalent focused comparison. Do not demand a whole-repository byte-parity audit or mass tree replacement. Check that native source identity is the intended one.
3. **Check only what's relevant.**
   - Docs-only: links and basic diff sanity; no build or Site release.
   - UI/layout/copy: successful production build and a few focused smoke/assertions for touched paths. Typecheck if the edit could affect it. No full test suite, full Playwright matrix or extensive browser campaign.
   - MCP/domain writes: build plus directly affected transaction/owner/CAS/idempotency tests. No unrelated fixture-corpus replays.
   - Auth, database schema, recovery, privacy, external rights or destructive data change: inspect the exact risk and verify the affected safety invariants. Stop for unknown destructive effects or failed critical checks; separate owner authority may be required.
4. **Deploy the exact saved Sites version** to the current authorised audience. For a previously saved version/rollback, deployment can use that immutable artifact directly without rerunning its build/tests.
5. **Verify briefly:** Sites says succeeded; check unchanged audience/bindings/MCP and one relevant authenticated page or MCP operation where feasible. A private Site returning 401 to anonymous HTTP is expected, not failed publication. Keep a rollback version ready.
6. **Report succinctly:** source/native pin, Site version, checks run/skipped, deployment outcome and known risks. Avoid lengthy release reports for a basic edit.

**Not mandatory for an owner-authorised, reversible candidate:** full pnpm test, broad browser/assistive sweep, nine-persona synthetic replay, C1–C9 matrices, independent handoff/review agents, CI completion, a 30-minute test wait, exhaustive source parity or a separate staging launch. Such testing can be commissioned for higher-stakes work, code review or genuine bugs, but must not silently become a publication blocker.

A focused failing safety-critical check, unknown source identity, broken production build, unsafe migration or changed access/binding is a genuine blocker. A skipped *unrelated* full suite is not.

## Personal ChatGPT plugin update handoff

For this owner's **personal Site plugin**, newly added or changed MCP tools have historically **required a quick reinstall of the existing plugin** to refresh the ChatGPT-visible catalogue. Do not assume that Sites republishing automatically updates an already-installed personal plugin. After the **first deployment that actually adds/changes Project or Note-pin MCP tools/schema**, tell the owner to reinstall or refresh that existing plugin, then verify the new tool list and a harmless read-only capabilities call from a fresh chat before relying on new writes. A reinstall is not needed for documentation, unchanged tools or before server implementation. Do not create a second plugin. This owner-observed workflow takes precedence over more optimistic generic guidance in earlier preflight reports.

**Current native caution:** the live learner surface is restored **V91**; saved native **V98** source/history is retained experimentation. New releases must intentionally preserve the V91 learner experience, account for native-only reading/Notes/auth differences and avoid accidentally publishing the discarded contextual/Study interface when reconciling descendant source.

## Scope and operational boundaries

- An owner commission that expressly includes deployment authorises iterative saved-version publication within that scope. Do not deploy from a docs-only design request.
- Reuse the existing Site, URL and custom invitation policy. Do not create a replacement Site or change sharing as a shortcut.
- Preserve canonical learner history, immutable source editions, Note autosave/CAS, signed-in owner scoping, idempotent operation receipts, recovery and permitted-content rules. Do not wipe D1 for a UI rollback.
- The public frekland/Minamo repo is the shared design/source authority. The native Sites Git repo contains protected hosting material and a distinct commit history; inspect and preserve Site-only differences on touched paths. Never publish secrets or learner data in public.
- Do not assume independent Cloudflare staging equals the protected ChatGPT Site. No cross-target promotion unless explicitly commissioned.
- GitHub Actions/tests are a development convenience, not a second Site publication authority. Production truth is the successfully deployed Sites saved-version ID and source pin.
- If status is pending/publishing, check deployment status until terminal. Don't claim success from an initial accepted request.
- For site UI interactions that need authentication, use a short authorised real-browser smoke when useful; avoid broad exploratory UX acceptance during a routine fix unless specifically asked.

## Historical workflow notes — not current release gates

Older V80/V81 parity and release receipts are preserved as useful provenance. Historical statements that a full suite was required before all functional Sites releases are **superseded by the focused policy above**.


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
- Stop before publication if the current native HEAD changed unexpectedly, the selected files cannot be matched, a required native-only adaptation is not understood, tests fail, or the existing private access/bindings cannot be preserved.

The public repository is the source of truth for future shared changes; the native Sites commit and its successful deployment remain the separate truth for what is actually live.

The first verified direct transfer and publication is recorded in the [31 October V81 release receipt](releases/2026-10-31-sites-v81-direct-source.md).
