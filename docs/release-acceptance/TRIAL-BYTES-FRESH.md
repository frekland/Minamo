# Fresh restricted-context Light banked-bytes trial

Date: 25 October 2026. Frozen source: `9971481` (local clone of the candidate). This is a fresh constrained-agent engineering trial, not a literal future-Light model benchmark. The clone is `/workspace/scratch/10fcadaf9a6c/trial-bytes-fresh`; the candidate was not edited.

## Scope and discovery

Reads were restricted to `AGENTS.md`, the Light activation dossier, SDK recipes, extension catalogue, static registry, producer script, existing byte trial, private fixture helper and the banked bytes module. Current typed MCP tool schemas were discovered with the isolated endpoint's `tools/list`.

The real build-time registration was already `enabled:true` for `source.bytes-v1`, over `text/plain-v1`. No redundant flag edit was made. Server metadata permits explicit selection in `source` and `explore` slots, version 1. The registry's omitted-ID path keeps the ordinary text renderer.

Only these reviewable files were added:

- `tests/release-light-bytes.test.mjs`
- `docs/release-acceptance/TRIAL-BYTES-FRESH.md`

The clone also has a local `node_modules` symlink to the candidate's installed dependencies; this is not an application/dependency change or a deliverable. No frontend, schema, route, CSS or dependency source changed. No production service, browser, credentials or checkpoint was used. The test creates all generated JSON and SDK bundles under `os.tmpdir()`, removes them in `finally`, and disposes isolated Miniflare D1/R2 in `finally`; it does not write test artefacts into the working directory.

## Original exact request

The reusable test invokes the documented producer twice with different `synthetic-` IDs. It supplies `--view source.bytes-v1` only for the selected request, then replaces the passage's exact canonical source, matching SHA-256 and matching payload text with this original synthetic string:

```js
'TEST ONLY — byte observatory.\r\nA😀e\u0301\r\n'
  + Array.from({length:37},(_,i)=>
      `TEST ONLY row ${String(i+1).padStart(2,'0')}: moon 🌙; cafe\u0301; exact line ending.\r\n`
    ).join('')
```

The JavaScript escapes become actual CRLF and combining characters. This exact text has 2,036 UTF-16 units and 2,152 UTF-8 bytes. Its SHA-256 is `0d976c7ce82e730128e775dbe7c3e66e860fc1b2a5e87f8a3fd8af1db9ee6631`. The independently specified prefix `A😀é\r\n` encodes as `41 f0 9f 98 80 65 cc 81 0d 0a`. Full expected bytes are computed with Node `Buffer.from(source,'utf8')`, independently of the renderer's `inspectTextEncoding` and `byteRows` engine.

Both requests retain the producer's original `math/tex-v1` algebraic source `(x+1)^2=x^2+2x+1` and its exact source metadata. Both pass the producer's local `--validate` command. The selected recipe contains exactly one optional view selection: passage → `source.bytes-v1`. The companion recipe omits every optional `viewId`.

## Executed proof

`node --test tests/release-light-bytes.test.mjs` passed **2/2** on the corrected harness, with no skips. It exercises the real build-time loader and actual isolated compiled Worker/D1/R2 typed MCP:

- Native-DOM harness: source denied before admission and after admission/before activation; inactive host empty; admitted fallback exact; explicit activation produces semantic table/caption/column headers, row headers and labelled scroll region. The region exposes `tabIndex=0`, `overflowX:auto` and `maxWidth:100%`.
- At 8 bytes per row, all 269 rows across six pages reconstruct exactly the independent 2,152 expected bytes. No page exceeds 48 rows. Previous/next state and offsets are checked.
- A real native `change` handler switches to 16 bytes per row and resets to page 1. All 135 rows across three pages again reconstruct the entire byte stream exactly, with correct offsets and row bound.
- Rights revocation returns false from revalidation, empties the host and removes button/select handlers. Subsequent events cannot repopulate it. Repeated disposal and separate direct disposal empty the host and remove handlers. Forged payload text fails admission.
- The omitted-view registry renders the exact same long source as ordinary prose with no table while the bytes registration is enabled.
- Isolated `tools/list` exposes typed schemas for capabilities, preview, publication and readback. Capabilities advertise `source.bytes-v1` with its expected source kind/slots and advertise `math/tex-v1`.
- Both original selected and ordinary requests preview successfully without increasing experiment-record count. Both publish with committed receipts and `learningDevelopmentCreated:false`. Readback is deep-equal to each complete submitted Activity, including exact text, math and recipe.
- A foreign synthetic owner receives HTTP 404 for both Activities. A separate source-bound synthetic Activity loses an explicitly linked Note source after that source is trashed; readback contains an unavailable instruction marker and does not contain the source canary.
- Final isolated database counts are zero `run` records and zero learning-development records. No automatic learner attempt or checkpoint is created.

Successful exact local receipts:

| Activity | Rendition | Receipt |
| --- | --- | --- |
| `synthetic-fresh-byte-observatory` | `r-905d3f6aa5f19273f733e4c8703e175fab6330cf2b9bf63020fd80c45f0e888d` | committed |
| `synthetic-fresh-ordinary-observatory` | `r-f349182cebd0d2a98b09d43b452e777e87b0aaf22f45173bc658326e954ac19f` | committed |

Additional executed checks: `node --test tests/interface-extension*.test.mjs tests/interface-foundry-contract*.test.mjs` passed **24/24**; `pnpm run typecheck` passed (exit 0). This bounded trial did not perform a release build or claim whole-release acceptance.

## Error and retry retained

The first run passed the native-DOM test and completed both selected/ordinary preview, publication and exact readback, then failed while building the linked-source negative fixture:

```text
TypeError [Error]: Cannot add property viewId, object is not extensible
at tests/release-light-bytes.test.mjs:113:285
tests 2; pass 1; fail 1; duration_ms 13095.65298
```

The test had assigned `viewId` directly onto a slot returned by `deriveActivityPresentation`. The SDK correctly returns an immutable admitted recipe, as the dossier documents. The correction copies the derived recipe and maps its slots to add the explicit view selection. This is test-author SDK friction, not an architecture defect. No source change or new dependency was necessary. The unchanged original publication requests were replayed against a new disposable fixture; final rerun passed 2/2 in 6,852.784302 ms.

## Evidence limit

The renderer proof is a minimal native-DOM harness executing actual mount and event handlers. It is not a browser, screenshot, physical viewport, keyboard gesture, screen-reader or hosted-authentication result. The style and semantic assertions do not establish a useful 390px visual layout. Browser/Notes mode preservation was outside this assigned no-browser trial and is not claimed. The Note created here is an isolated source-rights fixture, not evidence of a real Notes workflow. Fixture disposal removes the synthetic publication/source records after each run.

The parent programme must rerun this preserved test against its corrected final source before treating it as final-source acceptance.
