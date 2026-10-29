# Source development and deployment tracks

**Owner decision: 29 October 2026.** This repository is the preferred public, reviewable source-development home for shareable Minamo application code, synthetic fixtures, tests and future Project/MCP improvements. Its standard GitHub-hosted Actions workflow may run for repeatable checks without consuming private-repository minutes.

This does **not** make a GitHub commit an automatic ChatGPT Sites release, nor does it join the separately hosted Cloudflare application's identity or data to the private GPT Site.

| Responsibility | Source of truth / workflow |
| --- | --- |
| Shared code and synthetic test fixtures | Public `frekland/Minamo` branches and PRs, with reproducible tests and exact commit SHA |
| Owner-only product discussion and historical decision record | Existing private engineering notes and issues remain private; publish only deliberately sanitised summaries |
| Owner-private GPT Sites runtime | Protected native Sites source and deployment, with an explicit reviewed promotion of public code and exact commit/tree mapping |
| Independent Cloudflare runtime | Separate deployment, Auth0/OIDC identity, D1/R2 and release checks; no implicit promotion from a Sites-oriented PR |

## Promotion procedure

1. Start a public draft PR for reusable source and fictional test data. Confirm no owner records, private URLs, credentials, deployment bindings or personal information entered the diff.
2. Run full tests against that exact public commit; track blocked checks separately, including browser acceptance where possible. Keep development in small incremental PRs.
3. Review compatibility with the target runtime and identify the changed files, migrations, APIs, feature flags and expected test-only namespaces. Record an explicit source SHA/file mapping; do not silently overwrite unrelated native Sites changes.
4. Prepare a narrow, separately authorised GPT Sites source transfer/release. Existing owner-private Site and library/backups remain unchanged until reviewed promotion. Use the native Sites workflow and confirm the deployed revision.
5. After release, use ordinary ChatGPT with Minamo MCP and Cloud Browser for most live verification; use GPT Work for the necessary native Sites delivery step, not recurring test execution.

## CI feedback cadence

- **Draft pull requests:** typecheck plus directly changed tests and a small, explicitly mapped set of affected feature tests. See `scripts/ci-focused-tests.mjs`; it is deliberately conservative and **not a guarantee of regression coverage**. When a test is not automatically selected, run the relevant test command manually during development.
- **Ready-for-review pull requests:** full typecheck/build/test suite plus relevant browser/example checks. Each subsequent push to a non-draft PR reruns the full gate.
- **`main` pushes and manual dispatch:** full regression. Converting a draft to ready-for-review triggers the full suite. Keep PRs as drafts during rapid iteration, then mark ready only after the targeted work is complete.
- Public CI is source evidence. Hosted GPT Sites functionality still requires a separately reviewed deployment and live MCP/browser acceptance.

## Test and release boundaries

- The Mood-to-Music fixture is **fictional, synthetic, credential-free** and may be published. The owner's actual private Project data, ChatGPT conversations, Library and media are **not** exported by that fixture.
- The owner-only scenario controller is authentication-gated and disabled by default in general/public installations. It accepts only approved scenarios/phases and avoids unrestricted database resets or arbitrary code execution. The owner has declared all user-created learning data disposable for development; [issue #10](https://github.com/frekland/Minamo/issues/10) waives a fresh current backup prerequisite for bounded synthetic-only scenario operations. Retain exact fixture identities, collision checks, owner scoping and privacy. No recovery/export success is implied, and an unrelated-data reset is outside this controller's API.
- Keep the site-specific and independently hosted environments distinct. Public CI success is evidence about source, not evidence of hosted Sites identity, D1 persistence or MCP behaviour.
- The original private engineering repository retains useful historical decisions; it is no longer a second default place to independently implement identical shareable features.

