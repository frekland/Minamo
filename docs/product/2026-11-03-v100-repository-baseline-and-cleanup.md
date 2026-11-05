# V100 repository consolidation and stable-baseline audit — 3 November 2026

**Audit scope:** public repository frekland/Minamo, open PRs, current AGENTS.md, Project composition source, test policy and V100 review/release evidence. **Action taken:** safely merge independent documentation/evidence only. No app code, package, schema, auth, runtime, Site deployment or learner record was changed by this cleanup.

## Stable baseline

- [PR #80](https://github.com/frekland/Minamo/pull/80) was already merged. Its release receipt reports successfully deployed **V100** (native source a10709c9cfb7b0de819dc392de01ce29e576e1d4); protected owner access unchanged, and no database reset.
- Current public Project architecture is directly grounded in lib/project-composition.ts, lib/project-service.ts, app/project-sections.tsx, app/reader.tsx and lib/contracts.ts. It already offers six patterns, canonical section/record references, move/hide/lock operations and safe revision-based writes. It does not yet imply all the planned direct arrangement UI or executors exist.
- The current public package.json includes Pyodide, tldraw and visualization dependencies; package presence is not a deployed capability.
- Independent [V100 desktop review](../reviews/2026-11-03-v100-simulation-playground-learner-review.md) found clear improvements and persisted direct/MCP edits. Mobile presentation, actual clipboard bytes and example execution remain unverified. The named TEST Project is intentionally retained.

## Merged safely during this audit

| PR | Change | Squash commit on main |
| --- | --- | --- |
| [#42](https://github.com/frekland/Minamo/pull/42) | V83 browser/synthetic-isolation smoke report | 9825520bc2ffeb9e625be1ebd3cfa2b7759dc60e |
| [#67](https://github.com/frekland/Minamo/pull/67) | Mood-to-Music S06 cold-context report | b200c5f4536e2fbe4ca57c1e436b519910d698cc |
| [#68](https://github.com/frekland/Minamo/pull/68) | Retired Cap sparse S06 cold-context report | 890f20cf6d5b0aeb1ab85bc497c780ad6d9291fb |
| [#69](https://github.com/frekland/Minamo/pull/69) | Plant-Screamer S06/browser report | f042b5c03069abfaaccdc08548ac9efcf5cb45cc |
| [#70](https://github.com/frekland/Minamo/pull/70) | Three-history comparative report and qualified historical Workbench research matrix | 837146ef35244f349a47ba5928d6709ee4b86942 |
| [#82](https://github.com/frekland/Minamo/pull/82) | Independent V100 simulation walkthrough review from branch review/v100-simulation-playground-20261103 | 242245238321f03ff9787c87408cd82dfcf7ac7d |

Each was checked as a documentation-only file change (with #70's existing research-contract wording correction), and merged with a pinned expected head SHA. No current design was adopted merely by archiving these reports. Their original dated caveats remain: notably incomplete host-level transcript attribution, partly contaminated strict blind tests, and desktop-only browser observations.

## Remain separate — do not blindly merge into V100

| PR/issue | Reason |
| --- | --- |
| [Draft #9](https://github.com/frekland/Minamo/pull/9) — recovery export batching | Actual recovery code/tests changed on an old branch. Valuable potential bug fix, but requires rebasing/reconciling with current V100 recovery schema, targeted export tests and explicit acceptance. Not part of the new Project feature plan. |
| [Draft #4](https://github.com/frekland/Minamo/pull/4) — independent Cloudflare staging | Adds a separate Worker/D1/auth stack and top-level TypeScript changes. Independent deployment and access/security implications; keep isolated unless separately commissioned. |
| [Issue #81](https://github.com/frekland/Minamo/issues/81) — Home/Projects directory/Library/Activities broader UX | Deliberately deferred beyond PR #80. Its scope is not silently folded into the new Project composition/interactive-artefact proposal. |
| [#78](https://github.com/frekland/Minamo/pull/78) and [#79](https://github.com/frekland/Minamo/pull/79) | Previously closed/superseded. Their rejected learning-meta and rigid journeys/steps surfaces are not templates for the next release. |
| [Issues #12](https://github.com/frekland/Minamo/issues/12), [#14](https://github.com/frekland/Minamo/issues/14), [#17](https://github.com/frekland/Minamo/issues/17) and [#18](https://github.com/frekland/Minamo/issues/18) | Historical fixture, transcript, conversational-return and visual-acceptance background. Reuse their defensible observation mechanisms, not fixed mandatory nine-persona lifecycle states. Assess issue closure only after actual replacement capability and scoped verification. |

## Further tidy-ups and follow-ups

1. **Current baseline guidance (addressed in draft #83):** This PR branch updates AGENTS.md to make V100/merged PR #80 the explicit stable baseline and clarify the proposed integrated PR #83 scope. Historical V91–V89 notes remain available. docs/TESTING.md also retains dated fixture gates but its 3 November fast-release override is controlling; a separate documentation-index cleanup can later reduce confusion without rewriting historical observations. Main will retain its older AGENTS.md wording until #83 is merged.
2. **Evidence index:** the repository now retains multiple honest S06/V83/V100 reports. A compact “current baseline vs historical experiments” index would improve discovery, without deleting or rewriting source observations.
3. **Recovery PR #9:** narrow independent reconciliation is worth commissioning on its own. A stale-but-mergeable PR is not proof it is safe against the current production source.
4. **Cloudflare PR #4:** decide separately whether the independent staging architecture is still wanted. Do not merge its 6k+ lines simply to clear the PR list.
5. **Test controller:** do not delete/disable existing fixtures merely because the owner wants lighter on-demand testing. Introduce the new run path and explicit owner-scoped cleanup first; historical evidence must remain reproducible where possible.

**Result:** public main gained only six evidence/documentation commits, with application behavior and the deployed V100 Site unchanged. The new draft proposal is [V100+ flexible Projects and interactive TEST runs](2026-11-03-v100-plus-interactive-projects-and-test-runs.md), on a separate branch.