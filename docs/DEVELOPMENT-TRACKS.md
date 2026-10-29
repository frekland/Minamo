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

## Test and release boundaries

- The Mood-to-Music fixture is **fictional, synthetic, credential-free** and may be published. The owner's actual private Project data, ChatGPT conversations, Library and media are **not** exported by that fixture.
- A future owner-only scenario controller must be authentication-gated and disabled by default in general/public installations, accept only approved scenarios/phases and avoid unrestricted database resets or arbitrary code execution. For the private owner's experiments, valued Library content must have verified recovery before consequential reset/replacement.
- Keep the site-specific and independently hosted environments distinct. Public CI success is evidence about source, not evidence of hosted Sites identity, D1 persistence or MCP behaviour.
- The original private engineering repository retains useful historical decisions; it is no longer a second default place to independently implement identical shareable features.

