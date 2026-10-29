# Minamo SITES Project continuity — stage-1 acceptance and next experiments

**Checkpoint:** 29 October 2026. **Status:** owner-private Sites V75 live; initial scenario controller verified; first independent cold-chat reconstruction **PASS WITH QUALIFICATIONS**; second adaptive-tutor test **not yet run / do not prejudge**.

## Canonical references

- Public source repository: [frekland/Minamo](https://github.com/frekland/Minamo).
- Public [draft PR #6](https://github.com/frekland/Minamo/pull/6): versioned synthetic Mood-to-Music A–E corpus, runnable React v1–v5, replay and fixtures; open, draft, base `main`.
- Public [draft PR #8](https://github.com/frekland/Minamo/pull/8): owner-only MCP `list/load/advance/inspect/reset`; open, draft, **stacked on PR #6**; public reviewed controller source `74ebe56885e7d1c01e9da2faf7e5b959bfe584f3`.
- Public [issue #7](https://github.com/frekland/Minamo/issues/7): controller and hosted test tracking, implemented and tested but PR unmerged.
- Private [umbrella issue #112](https://github.com/frekland/minamo-v2/issues/112): product identity, Project continuity, saved-context learning and phased experiments. [Private draft PR #114](https://github.com/frekland/minamo-v2/pull/114) tracks source-routing and private guidance.
- Exact independent cold-context report, **verbatim**: [2026-10-29-mood-to-music-cold-chat-continuity.md](2026-10-29-mood-to-music-cold-chat-continuity.md). Do not overwrite this baseline when retesting; save each later report separately.
- Public [issue #10](https://github.com/frekland/Minamo/issues/10): recovery defect deferred. Owner declares current Minamo data disposable and waives backup prerequisite; no extra backup work is needed for this experiment.

## What has actually been tested

1. Public CI [run #40918744860](https://github.com/frekland/Minamo/actions/runs/40918744860) green for controller code; full public 1,456 tests passed/4 skipped; native Site integration 1,457 passed/4 skipped; typecheck/build passed. **Do not treat this as a test run of later documentation-only commits.**
2. Source narrowed onto existing GPT Sites V74 code, native integration SHA `6d40b3afc0de362b414bbe415d9673766af9d68c`. Deployed owner-private **V75**, `appgdep_6ae380cd713481919bc15d5b29a998b9`, with controller disabled except for owner-authorised synthetic-only waiver.
3. Genuine signed-in MCP `list/load/advance/inspect/reset` calls succeeded with receipts; duplicate operation replay was idempotent and a stale-revision mutation was rejected. Cloud browser verified Project A–E stages, Question/Library context, Notes/flag/annotation and synthetic cleanup without touching unrelated records.
4. After a verified reset to A in epoch 2, the owner authorised A→B→C→D→E to prepare an independent fresh-chat test. **Current left-in-place test state**: `mood-to-music/1`, phase **E**, controller revision **10**, epoch **2**, Project `TEST-ONLY-m2m-r2-project` revision 3, five Steps, seven Notes, three Questions, four checkpoints, 25 operation receipts, one annotation and one active flag. Independent MCP inspect confirmed. Do not advance/reset during read-only tutoring acceptance.
5. A separate fresh ChatGPT conversation performed read-only MCP discovery/reconstruction. It correctly identified phase E, current and historical Project editions, exact old provider Note edition pinned by checkpoint, seven Notes, linked Questions/Library/annotation/flag, four checkpoints and decisions, without conflating the ordinary owner Project with the synthetic fixture. It distinguished source pointers and scripted claims from independently executed tests. Verdict **PASS WITH QUALIFICATIONS**. Evidence is preserved verbatim in the linked Markdown.

## Product findings and issues

| Finding | Owner feedback and hypothesis | Follow-up |
|---|---|---|
| Evidence gap | A saved code claim does not prove that its source exists at a commit or that tests ran. Link precise GitHub commit/path and independent execution receipts without a heavy Minamo runtime; preserve local CLI as an option when CI is costly. | [Public #11](https://github.com/frekland/Minamo/issues/11) |
| Fixture realism gap | A few Notes and only one annotation/flag are too shallow for longitudinal learning. Extend *the same* versioned fixture with meaningful dense links, revisions, corrections, counterevidence, interruptions and realistic saved work. | [Public #12](https://github.com/frekland/Minamo/issues/12) |
| Library content/organisation gap | References need command-level precision, examples, comparisons, error cases and further reading; an increase in prose length alone is insufficient. Test layered presentation and content models without premature UI redesign. | [Public #13](https://github.com/frekland/Minamo/issues/13) |
| Adaptive tutoring untested | Reconstruction succeeded, but a fresh GPT may still produce a static progress summary instead of a practical, spoiler-safe learning interaction. Test first; let findings determine whether instructions, retrieval, fixture or interface needs work. | Existing private umbrella #112; no new implementation issue yet |

## Immediate next acceptance — short tutor-resumption test

**Do not modify the scenario before this check.** Start a new ChatGPT conversation (preferably outside the Minamo ChatGPT Project), connect the Minamo plugin, and give only:

> I'd like to resume my Minamo Mood-to-Music test Project. Please use Minamo to understand where I left off. I don't want a long progress report. Be my computing tutor. Help me resume from the most useful next activity, taking account of what I've already explored, my unresolved questions and any evidence I haven't verified. Start with a brief explanation of where we are, then give me one manageable challenge. Don't reveal the solution immediately. Ask me to predict what will happen before we investigate. Don't change any Minamo records without asking me.

Evaluate whether GPT independently discovers the correct synthetic Project, discriminates scripted work from owner achievements, avoids reteaching completed material, uses the phase-E personal-label problem, asks a meaningful prediction question, gives one appropriate task and knows when to ask rather than claim an observation. Preserve the answer and tool limitations **as a separate dated Markdown fixture result**. Only then set Stage 2 implementation priority and scope.

## Explicit boundaries

- SITES owner-private track only; unrelated Cloudflare/EXTERNAL remains separate.
- Keep public PRs #6/#8 and private PR #114 draft until explicit review/merge decision. Do not treat native V75 release as an automatic GitHub merge.
- No additional Project examples selected; no Project UI redesign yet; no broad runtime hosting or unauthorised GitHub credential storage.
- Owner considers data disposable and no longer requires a current backup. Scenario controls still operate only on manifest-verified synthetic records; destructive actions require exact authorised targets.
- Use focused tests in development and appropriate full checks before a later release; documentation-only commits do not establish a new tested runtime source.
