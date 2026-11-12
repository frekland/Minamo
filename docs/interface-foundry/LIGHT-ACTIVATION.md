# Light activation: bounded engineering tasks and frozen trials

This is an executable SDK over the actual Activity/Foundry implementation. It introduces no runtime-authorable React/JSX, new source format, owner state, Notes editor or alternate shell. Feature activation still requires the owner's separate release approval. The final runtime is GitHub c337084feffdb6667994fe7f9b102d1b506c7b2d / local a2c78d8332d330efaaad3f14fa1565292827ce87. Three fresh restricted-context agents completed the trials below; initial failures, Pro corrections and exact outcomes remain in their separate reports. This is not a literal lower-model speed/cost benchmark.

## The one extension seam

`lib/interface-extension-catalogue.ts` owns the finite server metadata (`id`, exact source kind, allowed slots, version). `app/interface-view-registry.ts` owns trusted **build-time loaders**, never Activity/MCP executable data. An Activity may choose a known metadata ID in one presentation slot as `viewId`; it cannot supply a component name, URL or loader. Multiple views may be banked for one source kind because selection is explicit per block. A new source format, arbitrary runtime, network/provider integration or ownership mechanism is outside this seam.

```ts
{
  id:'source.bytes-v1',
  sourceKind:'text/plain-v1',
  enabled:true,
  load:()=>import('./interface-view-bytes'),
}
```

`interfaceActivityRegistry(viewId)` preserves each existing adapter's schema, hash/source binding, fallback and kind, overriding only its lazy `load()` for the **one explicitly selected enabled ID**. Omitting `viewId` always retains the original adapter, even when bytes or other views are enabled. Ordinary prose must never turn into bytes merely because a registration was enabled. Unknown/unavailable UI registrations keep the original readable renderer; shared server admission rejects unknown versions or mismatched source-kind/slot selections before publication. `ActivityArtefact` invokes this factory only inside the existing explicit activation path after rechecking the exact current Activity. The original `ArtefactRegistry` still performs admission, WeakSet identity checks, source/revocation rechecks, mount and exactly-once teardown. An extension receives admitted artefact data and a DOM host; no owner credentials, fetch adapter, Note writer, mutation queue or arbitrary route.

In this combined candidate, both `source.bytes-v1` and `trace.signal-ledger-v1` are already banked with `enabled:true`. Their presence does not enable Activity Studio in production and does not replace ordinary renderers. An existing prepared view needs only an explicit data-only recipe selection; edit a loader flag only when the actual current catalogue says that registration is disabled. Registering a new safe module changes three bounded files: its module, server metadata and static loader registry. Source facts, saved attempts and canonical reading identity remain in their existing authorities. Original canonical source and accessible text fallback stay available if a view is unavailable, unsupported or fails within its budget. Module load on mount is prohibited: the learner must deliberately open the interactive view.

## Prepared components

| Bank | Source kind | Default | What is real |
| --- | --- | --- | --- |
| Exact UTF-8 byte inspector | `text/plain-v1` | Banked/enabled; explicit `source.bytes-v1` selection only | Existing `inspectTextEncoding`/`byteRows` engine; exact astral/combining/CRLF bytes; paged table; 8/16-byte width; keyboard buttons; bounded DOM; teardown |
| Finite supplied-event factory | `trace/external-v1` | Signal-ledger view banked/enabled; new view needs metadata + loader + explicit selection | Source-bound existing trace parser; previous/next/first controls; supplied provenance; full textual alternative; no timers, execution or recording |

Both use native DOM text nodes, bounded existing parsers, shared inherited style tokens and scroll regions; neither imports a new dependency. Byte inspection supports the existing `NOVEL_LIMITS` of 16,384 text units / 65,536 bytes, with at most 48 visible rows. Larger exact source remains available through the host's static fallback. The trace template supports the existing admitted finite event budget, retains original ordering/timing and never calls its supplied command strings.

## Local commands

```sh
# Verify SDK, security and original lifecycle before and after a registration.
node --test tests/interface-extension*.test.mjs tests/interface-foundry-contract*.test.mjs

# Scaffold one safe finite presentation module and an original synthetic Activity fixture.
node scripts/interface-view-scaffold.mjs --id trace.my-steps-v1 --title "Supplied event steps"

# Validate that generated fixture with existing Activity and Foundry admission.
node scripts/interface-foundry-template.mjs --validate .sites-runtime/interface-view-trace-my-steps-v1.json
```

The scaffold refuses existing module/fixture paths, creates `app/interface-view-trace-my-steps-v1.ts`, and prints one exact metadata entry plus one loader entry to add. Its generated recipe explicitly selects the new ID; it correctly fails server shape admission until that ID is added to the metadata catalogue. It creates no remote records and changes neither metadata nor registry automatically. Its safe module delegates to the banked finite factory, rather than requiring Light to invent a new interaction model. Generated fixture data uses the existing `trace/external-v1` kind with an exact source hash. Unknown ID/source-kind combinations, duplicate IDs and remote loader data are rejected by registry validation. Per-slot source-kind/allowed-role checks remain shared server validation.

For browser integration use the existing synthetic full Workspace laboratory, with its original Notes owner. In that development-only route, same-origin `/preview-interface/api?path=%2Fmcp` forwards typed MCP calls to isolated local D1, not production. A newly published synthetic Activity can open at `/preview-interface/workspace?embedded=1&view=tools&family=experiment&id=ACTIVITY_ID`; its initial snapshot includes the exact local record. Actual trial agents must use the route returned by the managed preview and must not invent a host/port or production authentication route.

## Fresh constrained trial A — Tier 0 publication

Give a fresh agent only this dossier, `SDK-RECIPES.md`, the exact frozen commit and staged capability catalogue. Task: generate a new synthetic original Activity combining two existing registered component kinds; preview and publish via real isolated local MCP; open its exact Activity in Task, activate the components deliberately, open existing Notes and read back exact saved sources/recipe. Make **no frontend code change**. Verify zero saved Attempt/learning-development records unless the trial explicitly asks to save synthetic evidence. Dispose owned synthetic fixtures afterward. Report actual changed files, errors/retries, rights/Note source identity and browser outcomes.

## Fresh constrained trial B — Tier 1 activate banked bytes

Give a different fresh agent only this dossier, the exact frozen commit and the active registry catalogue. Task:

1. Inspect `interfaceViewCatalogue()` or the static registration. The combined candidate already has `source.bytes-v1` enabled: make no redundant frontend edit. If a future frozen checkout has it disabled, change only that registration's `enabled:false` to `true` in `app/interface-view-registry.ts` and record the exact diff.
2. Generate an original synthetic text+math Activity using `node scripts/interface-foundry-template.mjs --id synthetic-bytes-replay --view source.bytes-v1 --output .sites-runtime/bytes-replay.json`, then preview/publish in isolated local MCP. Verify `activity.presentation.slots` selects `viewId:"source.bytes-v1"` only for the passage block. Generate a second ordinary Activity without `--view` and prove that its text remains prose even with the registration enabled.
3. Open that Activity in the actual Workspace, choose Explore, deliberately activate the text artefact and inspect `A😀e\u0301`/CRLF or another precisely reported source. Check byte values against the literal canonical source. Show a useful 390px view and semantic table access.
4. Open the existing Notes host, preserve a synthetic draft across Classic/Focus/Task, then switch away and verify the view disposes. Source/owner denial must withhold content under the inherited host checks.
5. Run shared extension/contract tests and TypeScript. The existing combined candidate needs zero application changes for this selection. No Workspace, Reader, Notes, schema, route, dependency, CSS architecture or runtime source changes are needed. If they become necessary, stop and report the SDK gap for Pro to resolve.

Record any extra files changed and undocumented decisions. Do not enable production, publish a Site, merge, or edit learner records. A passing native-DOM harness is useful but is not screenshot/gesture evidence; retain actual browser outcomes separately.

## Fresh constrained trial C — Tier 2 known-safe finite module registration

Give a third fresh agent only this dossier, the exact frozen commit and active catalogue. Task:

1. Run the scaffold for a new `trace.NAME-v1` ID. Add the printed server metadata entry to `lib/interface-extension-catalogue.ts` and static loader entry to `app/interface-view-registry.ts`. These plus the generated module are the only three required application source files. The generated Activity explicitly selects that new ID on its trace block; ordinary unselected traces must retain their original renderer.
2. Inspect the generated module and exact metadata kind/slot/version; retain its banked finite factory/source parser. Change no global Workspace or Notes module. No new dependency or source kind is needed.
3. Preview/publish its generated fixture through real local typed MCP and open the exact Activity in Task. Deliberately activate the supplied trace; use previous/next/first, accessible full-text fallback and existing Notes. Confirm that supplied command text does not execute and that no Attempt/checkpoint is auto-written.
4. Verify desktop, 390px, keyboard focus and current-rights teardown with the shared tests and actual browser. Add a targeted fixture only if evidence reveals a missing state; do not rewrite the architecture.
5. Report generated module and registration diff, validation retries, any unplanned files/dependencies, source identity and exact browser readback.

This is a safe **new presentation module over a prepared interaction family**. It is not a claim that an unforeseen sandbox, input device or domain can be cheaply implemented. The expensive generic source/rights/state work is banked; difficult truly new engines remain an accurately labelled stronger-engineering task.

## Evidence available before independent trials

`tests/interface-extension.test.mjs` executes real Foundry admission and lifecycle with enabled test registrations: unchanged source schema/fallback, forged payload rejection, unloaded inactive modules, duplicate registry rejection, late revocation, exact cleanup, Unicode byte values, paged table behavior, native control handlers and source-bound event stepping. A minimal native-DOM harness is explicitly used; this is not Chromium, Android or assistive-technology certification.

`tests/interface-foundry-contract-domain.test.mjs` separately executes actual local Worker/D1/MCP recipe publication, exact retained editions, owner isolation, source denial, encrypted recovery/import and generation fencing. The parent programme must append independent trial receipts and real browser screenshots rather than relabelling these unit/integration proofs as fresh constrained-agent completion.

## Architecture correction before final replay

The initial engineering trials used source-kind-wide adapter replacement. Independent challenge found that enabling the bytes view could unexpectedly replace ordinary prose. Those original trial reports are retained as historical evidence, not final Light-readiness. The corrected contract selects a server-allowlisted `viewId` per exact block/slot and preserves original rendering when omitted. Final trial replays must demonstrate both selected and unselected behavior and report their own frozen source ref.

## Executed fresh-agent outcomes

| Trial | Actual result | Evidence |
| --- | --- | --- |
| A: zero frontend code | New original prose+TeX Activity; real typed MCP preview/publication/revision/exact readback, retained edition, owner denial and zero Run/checkpoint records | [TRIAL-ZERO-CODE.md](TRIAL-ZERO-CODE.md) |
| B: banked bytes | Flag-only activation plus explicit recipe; 34 exact UTF-8 bytes, ordinary omitted-view prose, desktop/390 controls and local scroll, long saved Notes/modes, disposal | [TRIAL-BYTES.md](TRIAL-BYTES.md) |
| C: safe finite module | Three-line module + bounded metadata/loader entries; actual revision2 explicit-view publication/readback, keyboard event controls,390px, long saved Notes/modes and route-away teardown | [TRIAL-NEW-VIEW.md](TRIAL-NEW-VIEW.md) |

The first attempts exposed catalogue-envelope ambiguity, missing publication harness, global view replacement, renderer cancellation, long-Note updates and narrow table sizing. Pro resolved those and the agents reran the affected work successfully. These were useful architecture trials, not artificially friction-free demonstrations. Normal supported Activity authors now need no frontend change; prepared extensions still require the documented source checks and separate production release authority.

## Independent five-task replay dossier

A release acceptance run must distinguish five fresh constrained tasks: ordinary zero-code creation, new cross-domain composition, banked-view selection, exact typed source/Attempt readback and registration of one safe finite view. Each fresh agent receives only this dossier, SDK-RECIPES.md, current catalogue and the reusable fixture/test code needed for its bounded task. The parent must identify the exact tested tree and retain initial errors, fixes and reruns. Do not represent these tasks as measured Sol Light pricing, latency or physical-device evidence.

For local publication and exact Attempt readback use the existing `tests/private-storage-fixture.mjs` Worker/D1/R2 harness, not a simulated JavaScript storage map. `tests/interface-trial-zero-code.test.mjs` supplies the ordinary typed RPC envelope; `tests/activity-cold-handoff.test.mjs` supplies the typed Attempt and natural-name context pattern. Discover `/mcp` `tools/list` and `get_minamo_activity_capabilities` before composing requests. Tool results are an MCP envelope: check `result.isError` before parsing `result.content[0].text`. For writes, also require the parsed `receipt.status` to be `committed`; a CAS conflict is an application receipt (`status:"conflict"`, `record:null`) inside a successful transport envelope. Refresh the exact current revision and retain the draft; never treat transport success as a committed write. Current Activity tools live in `lib/activity/mcp.ts`, not `lib/mcp.ts`.

An explicitly saved synthetic Attempt uses `record_minamo_activity_attempt`, pins `{family:'experiment', id, rendition}` under `attempt.activity`, and labels pasted output `supplied-terminal`. Read back using `read_minamo_record` with `family:'run'`, exact Attempt ID and returned rendition. Preserve CRLF, ANSI escapes, tabs and astral Unicode exactly in stored source/evidence, including after an Activity revision; do not reinterpret terminal output as observed execution. The Attempt's existence is an explicit evidence save, never an automatic checkpoint or learning claim. A natural-name resume may return bounded summaries; use its `exactRead` descriptor for complete evidence. When comparing dry-run storage, inspect application tables (`sqlite_master` names beginning `v2_`) and fixture R2 objects; Cloudflare-owned `_cf_` tables are protected and must not be queried as application data. Tests must dispose their isolated fixtures in `finally`.
