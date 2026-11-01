# V88+ S06/K cold-context acceptance — Mood-to-Music / provider-documentation-sceptic

**1 November 2026 · TEST ONLY · one separate ChatGPT conversation · documentation-only evidence.** No Site deployment, UI/schema change, Project/Note/checkpoint mutation, Flag change, scenario advance/reset, or real learner activity.

Related: [three-layer protocol](three-layer-reconciliation-protocol.md), [V89 baseline](2026-11-01-v89-workbench-research-baseline.md), [Workbench information contract](../PROJECT-WORKBENCH-INFORMATION-CONTRACT.md), [#12](https://github.com/frekland/Minamo/issues/12), [#17](https://github.com/frekland/Minamo/issues/17), [#51](https://github.com/frekland/Minamo/issues/51).

## Verdicts — keep separate

| Gate | Verdict | Evidence boundary |
| --- | --- | --- |
| Hosted tool/controller implementation | **PASS for this read-only path** | Exact variant inspected before and after: phase K, controller rev 1, epoch 1, generation `legacy@0`, committed load, 20 registered synthetic records. All correctly formed canonical reads succeeded; one out-of-range limit returned a typed validation error. No build, auth stress test or release correctness revalidation. |
| Canonical source/retained-revision fidelity | **PASS, sampled** | Rev 4 Project; rev 2 and rev 3 historical Project editions; Stage-B checkpoint pin to research Note rev 1; current research rev 2, provider Question rev 5, audit Note rev 3, return Note rev 1, Article rev 1, annotation anchor. Repository v5 source text inspected but not executed. Not all 20 records or their original historical versions were audited. |
| Cold-context GPT continuity | **PARTIAL / qualified** | This is a genuinely separate ChatGPT conversation from V89 research, with actual connected Minamo MCP reads and a natural answer. However, the prompt required reading the V89 baseline **before** canonical reconstruction; that document contains a persona-specific expected-outcome synopsis. The answer was re-established by exact canonical reads, but strict blind exposure cannot be claimed. The next sessions should defer such outcome tables until after independent reconstruction. |
| Three-layer reconciliation | **PARTIAL under strict per-call protocol; bounded agreement** | One immutable run with 12 transcript events; 18 server-observed qualifying read attempts including one error; matched D1 before/after snapshots show **0 changes across 62 entries**. The model logged five grouped pre-dispatch attempt/result pairs rather than 18 individually paired segments. Counts/tools/order/outcomes are corroborated; no shared per-dispatch correlation token or host-complete trace. |
| Conversation usefulness | **PASS, qualitative within one fictional request** | Reply identified the changed decision, original unsupported premise, current source and verification boundary; suggested one small document/eligibility investigation and allowed staying offline; no progress invented or saved. No fictional learner follow-up or measured learning outcome. |
| Information architecture | **Confirmed read-projection inconsistency; UI untested in this run** | Project-root `get_minamo_context` omitted latest Question-linked return Note with `relatedTruncated:false`, while exact provider Question context, Project `get_minamo_learning_context scope:journey`, its target read and the focused graph recovered it. No canonical Note loss; no fresh browser/mobile measurement. |

## Exact fixture and run

- Scenario `mood-to-music`; variant `provider-documentation-sceptic`; fixture `mood-to-music/3`; phase **K**, session **S06**, generation `legacy@0`, epoch **1**, controller revision **1**, Project `TEST-ONLY-m2m-docs-v1-r1-project` rev **4**.
- Source pin: `fixture-files/1:080a58316bbd890d4640bae60f2374ecec6ace7968f111436c0ee80c78be5b23:bbf0ec873c555419f0c246590d120b106a305340fd416d88f9b558ffcfba0c5b:87e970a028ad1fbc3bbb3774899912a575182c08d1a030635d649d5c529267bb`. Matching list/inspect/run/observer pins; file SHA-256 values were not independently recomputed. The transcript exposes `sourceCommit:null`; Site label `V88` is model-reported, not a native deployment attestation in this run.
- New run `TEST-ONLY-m2m-docs-s06-20261101-cold-a1`; no prior runs or observers for this exact variant. Transcript event 1 is the fixture-provided user turn; events 2–11 are grouped read attempts/results; event 12 is the actual intended learner-facing response. Run retained **open**, observer **paused** at revision 1.
- Observation checkpoint pair `TEST-ONLY-m2m-docs-s06-before`: before `2026-11-01T05:49:35.491Z`, after `05:57:35.356Z`; namespace version **8104** at both ends; **62 unchanged, 0 added/removed/changed**; phase/epoch/revision unchanged. One earlier after-only snapshot under a different checkpoint name is harmless instrumentation clutter, not a diff pair.

## Independent reconstruction from canonical records

1. **Old assumption (scripted, not independently verified):** checkpoint `...save-b` points to `note-research` rev **1** rendition `r-61005323b541d22402df5270f4bf38a0b6fdde81af49e31ae19bf1df134334f0`. Its scripted learner assumed audio-feature access; its scripted GPT correctly stated access was not verified and no call made. That is retained source history, **not** a host-authenticated conversation or an executed provider test. Current research rev 2 retains the correction.
2. **Decision change:** Project rev **2** had four stages for local mood-driven exploration; rev **3** added `personal-labels`, abandoned objective emotional scoring and made provider integration contingent. Rev **4** and the later `note-docs-boundary` uphold the offline direction and preserve the earlier race/provider questions.
3. **Current code:** public `examples/mood-to-music/src/versions/v5.jsx` imports local `TRACKS`, holds tracks/mood/label with React `useState`, and uses `addPersonalLabel`. Component source supports local tab-memory labels without visible Spotify calls or durable persistence; this **does not** establish browser execution, access, playlist saving or user achievement.
4. **Provider evidence:** provider Question rev **5** asks for a specific permitted OAuth scope and safe sandbox request. Audit Note rev **3** acknowledges a mistaken claim that public documents guarantee app access. `note-docs-questions` distinguishes endpoint description, client eligibility and an authorised response; only a URL, not an archived dated capture, was reported. The linked Article `reference` rev **1**, `rights/p`, is an original fictional internal reference, not first-party Spotify documentation. `annotation-docs-rights` rev **1** pins that passage, UTF-16 range 0–13, and warns that a documented endpoint is not authorisation. `note-docs-consent` records refusal to paste a token into shared materials. `note-unknown` speculates about playlist saving without evidence. No real eligibility approval, scope receipt, token or live provider call was established.
5. **Latest request:** `note-docs-return` rev **1** (Question-linked, not Project-direct) asks for current offline source, earliest unsupported assumption, one small evidence task and no automatic checkpoint. The submitted tutor reply proposed a single dated first-party documentation/eligibility inquiry with an explicit `unknown` outcome, leaving the offline direction optional.

Dates in fictional Note bodies describe scripted events, whereas many record `createdAt` fields are fixture-load times on 31 October; do not conflate them. Record actor `user` also does not turn embedded `SCRIPTED GPT` lines into real user speech.

## Three-layer reconciliation ledger (sanitised)

The same run/session/source are bound across layers. Grouped Markdown attempts precede the corresponding calls; results follow them. Each server event has a unique `callId`, but **no shared correlation token** attaches it to a particular model segment. These are defensible tool/order/time group matches, not host-level dispatch proof.

| Transcript events | Declared operations and observed server events | Result |
| --- | --- | --- |
| 2–3 / A01 | `get_minamo_context` (030fa2d1); `get_minamo_learning_context` (15f32dc5); `read_minamo_record` (28a61184) | 3 success; Project root omits latest Note while Project overview finds it via Question |
| 4–5 / A02 | Seven `read_minamo_record`: 4e29c686, 715fcd83, 640ee2a7, 62fe71e3, 993a1455, 10ac6717, fcb419da | 7 success; provider Question, Notes, Article, annotation |
| 6–7 / A03 | `get_minamo_learning_context` (c2b9e907), `get_minamo_learning_graph` (8cf33993), `get_minamo_context` (4a8c8c6c) | 3 success; full Question/graph closure |
| 8–9 / A04 | `get_minamo_learning_context` (b4acfd0c) | Error **`invalid_activity_limit`** for 30; corrected retry (f8348305) success at 20. Separate GitHub v5 source read is not an observed Minamo event |
| 10–11 / A05 | Three retained-edition `read_minamo_record`: 3e717c95, 20c85c9e, 37886afc | 3 success; research Note rev1 and Project rev2/rev3 |
| 12 | Submitted actual tutor reply | Model-submitted answer, no server learning write |

Totals: `get_minamo_context` **2 success**; `get_minamo_learning_context` **3 success + 1 validation error**; `read_minamo_record` **11 success**; `get_minamo_learning_graph` **1 success**. **18/18** observed events accounted for at grouped tool/order level; **17 successes + 1 error**. The canonical D1 diff is empty as required for a read-only session. The model did not perform provider requests or execute React.

Other candid instrumentation issues: two rejected `append_minamo_test_transcript start` attempts occurred before run creation (missing operation ID, then forbidden session ID); a first `diff` without `checkpointId` was rejected before the matched pair was queried. These are control/setup errors not eligible for observed-call capture, did not change learning records and are reported here rather than invented into immutable transcript history. No Flag activation/deactivation was attempted.

## Workbench information-architecture interpretation

- **Missing canonical data? No observed loss.** Exact latest return Note was available at rev1.
- **Missing relationship? No.** Note→provider Question and Note→audit Note were explicit, graph-readable; the Project links to that Question.
- **Weak Project read projection? Yes.** Project-root `get_minamo_context` stops at a direct-related set and reports `relatedTruncated:false` without signalling that a Question-mediated latest Note remains outside its traversal. A naive tutor could mistake “not in root response” for “not current”.
- **MCP retrieval limitation? Mixed.** `get_minamo_learning_context scope:journey` already traverses the Question group and surfaces the Note, and exact target/graph reads recover the rest; but callers must know which projection/target path to use. The original research Note edition was discoverable via the old checkpoint's exact rendition, not by merely asking for current Note content.
- **UI problem? Not freshly established.** This run made no authenticated browser/UI or narrow-viewport measurements. Project-first entry and contextual return-path hypotheses from V89 remain separate, historical evidence, not fresh S06 observations.
- **GPT interpretation risk:** Project-only summaries can miss the latest return, and record-level `actor:user` can misattribute scripted GPT lines. Proposed Workbench read projections should preserve bounded two-hop source closure, original revision pins, speaker/claim uncertainty and a visible coverage boundary before considering new schema.

## Limitations / next comparison

No independent official provider entitlement check, browser execution, real human response, external terminal receipt, or tested UI writing persistence. The observer is best-effort and scoped; controls and unscoped GitHub fetches are deliberately excluded. The report does not claim nine-way acceptance, complete host capture, a Workbench redesign PASS or participant UX success.

For the next independent chat, defer any persona-specific V89 conclusions until **after** canonical reconstruction; use the exact Cap selector and verify its own source pin, phase, epoch, transcript and observer identities afresh. After the third distinct Project test, compare the three source-fidelity errors, latest-return discoverability, unsupported assertions, evidence layers, and interaction costs before selecting additional variants.
