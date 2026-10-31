# V83 production browser and synthetic-continuation isolation smoke — 31 October 2026

**Verdict: production deployment verified; owner-visible visual inspection works; MCP synthetic exclusion is inconsistent and requires follow-up.**

This is a sanitised, user-authorised, read-only smoke investigation of the restricted Minamo Site and connected Minamo MCP. No scenario advance/reset, transcript append, checkpoint, learning-record mutation, authentication change or deploy occurred. Browser actions opened existing records, resources and prepared (but did not send) GPT continuation requests. This is **not** a full independent visual/UX acceptance run under [#18](https://github.com/frekland/Minamo/issues/18).

## 1. Deployment provenance

The Sites production-control API returned:

| Signal | Observed |
|---|---|
| Production origin | `https://minamo.jscymru.chatgpt.site/` |
| Site | Minamo |
| Saved production version | **V83** (newest returned version) |
| Version source commit | `1e9f5c615eba4df9b9dad3a382c5a11f4d455f8a` |
| Archived source hash | `sha256:46011c487c7124d56423a50e715d45efe6447daea2fda4390d9aab00ce454f1a` |
| Deployment ID | `appgdep_6ae5b41e7e84819180600454f2d8723b` |
| Deployment result | `publish / succeeded`, production URL matches |
| Deployment status updated | 2026-10-31 09:26:10 UTC |
| MCP capability in deployment status | `has_mcp: true` |

The cloud browser independently loaded that exact production origin and rendered the fixture UI. The source SHA is **Sites-attested source provenance**: a separate GitHub commit lookup against `frekland/minamo-v2` returned 422 (commit not found). Do not mislabel this SHA as a verified GitHub mirror commit or assert cross-repository parity. V83 and its archived source hash are verified even though GitHub mirror identity remains unproven.

## 2. Browser observations

| Probe | Observation | Assessment |
|---|---|---|
| Home banner | Owner-visible `mood-to-music/3` fixture identified at **phase K, epoch 3**, with a `TEST ONLY` affordance and direct Project link | PASS (visible access) |
| Standard Projects grid | The TEST ONLY Mood-to-Music Project appears as a labelled card among ordinary Projects | PASS for owner-directed visual analysis; intentional visibility must not imply genuine progress |
| Project detail | Normal Project page opens; five Steps and their linked Questions resolve | PASS |
| Project resources | Resources modal resolves technical Library references, including the React labels/state/refresh/privacy reference | PASS |
| Linked Question | Storage Question opens in normal UI with related Project, earlier checkpoint, revised Notes, bookmarks/Flags, Annotations and source pointers | PASS |
| Chronology | Question shows S03/H saved checkpoint while newer fictional Notes remain separately labelled as edited after that checkpoint | Observation only; not a stale-build finding |
| Non-synthetic GPT handoff | On an ordinary Bandit Project, `Continue with GPT` prepared an exact `get_minamo_context` request targeting that ordinary Project/Step, without fixture IDs | PASS for this **one** selected-context handoff |
| Synthetic GPT handoff | On an explicitly opened TEST ONLY Question, `Continue with GPT` prepared an exact `get_minamo_learning_context(scope: target)` request targeting the synthetic Question | Explicit synthetic handoff available; no request sent to ChatGPT |

The Site banner says the fixture is excluded from ordinary Home and GPT continuation. Browser-only observations cannot establish that **all** MCP retrieval paths honour that statement.

## 3. Read-only MCP exclusion probes

All calls used the connected owner-authorised Minamo MCP. No scenario or transcript mutations.

| Probe | Observed result | Interpretation |
|---|---|---|
| `get_minamo_workspace`, no synthetic opt-in, limit 30 | Returned 30/30 records and 12/12 activity items marked `synthetic: true` on the first page | **FAIL** as a default general-workspace isolation expectation; synthetic fixture dominates the initial context |
| `get_minamo_learning_context(scope: "resume", query: "Mood-to-Music")`, no synthetic opt-in | Resolved `TEST-ONLY-m2m-r3-project` and returned its Project/activity context | **FAIL** if ordinary title-based GPT resume must exclude synthetic by default; this tool has no explicit `includeSynthetic` argument |
| `get_minamo_learning_context(scope: "resume", query: "Bandit")` | Returned ordinary Bandit choices; no TEST ONLY fixture context | Control PASS, not a global exclusion proof |
| `get_minamo_activity_context(query: "Mood-to-Music")`, default | First page: no synthetic target or activity; `truncated: true` and `searchIncomplete: true` | Bounded default filter observed, **not** proof of exhaustive absence |
| Same activity query with `includeSynthetic: true` | Resolved synthetic Mood-to-Music Project and returned test activity | PASS for explicit opt-in contrast |

**Finding:** the boundary differs across MCP tools. The activity-context route exposes an explicit synthetic opt-in and filters the initial default response; general workspace and title-based learning-context resume did not enforce an equivalent boundary in this test. An ordinary fresh GPT could encounter fictional records unless its chosen tool/purpose/prompt guards against them. Conversely, owner-directed visual analysis and explicitly chosen synthetic test work should remain possible.

This is a **contract/isolation fidelity defect**, not evidence that a real learner's checkpoint was corrupted, that every GPT continuation leaks synthetic content, or that a Site deployment failed.

## 4. Recommended next correction and tests

1. Define one server-enforced default policy across **ordinary** workspace, title-based resume, recent/home discovery and related context projections: synthetic records must not become unrequested continuation candidates. Keep owner-visible `TEST ONLY` cards and explicit fixture access for visual acceptance.
2. Provide an intentional, authorised, bounded synthetic-test selection mechanism (for example an explicit registered scenario/exact-target test scope or an `includeSynthetic` contract where appropriate). Avoid breaking independent cold-context tests that deliberately use the registered fixture. Make the difference between ordinary continuation and explicit synthetic testing evident in tool descriptions and UI copy.
3. Add regression checks for default vs opt-in reads: workspace first page, ambiguous title discovery, target resumption, activity search, related graphs, and selected-context handoff. Assert that pagination cannot reintroduce excluded records, and that the ordinary learner's eligible results are not crowded out by fixture records.
4. Track Sites V83 source SHA/archive hash and any future matching GitHub mirror SHA separately; do not assume equivalence without a verified mapping.
5. Repeat this bounded smoke after correction, then proceed with the planned context/projection comparisons under [#14](https://github.com/frekland/Minamo/issues/14) and trace/state-diff stages under [#17](https://github.com/frekland/Minamo/issues/17).

## Limits retained honestly

- The observed live UI and Sites deployment-control status establish production V83, but not a byte-level browser asset-to-archive comparison.
- The default activity search was incomplete; no exhaustive negative assertion is made from its first page.
- No external ChatGPT conversation was opened from the prepared handoff; the test inspected the exact request and independently exercised ordinary MCP read paths.
- No UI write/restore flows, mobile viewport comparison, two-account isolation or qualitative redesign acceptance were run.

**Cross-references:** [#14](https://github.com/frekland/Minamo/issues/14) continuation fidelity, [#17](https://github.com/frekland/Minamo/issues/17) transcript/tracing architecture, [#18](https://github.com/frekland/Minamo/issues/18) deferred persona-driven visual acceptance.
