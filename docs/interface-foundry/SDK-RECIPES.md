# Trusted presentation recipe SDK

This is implemented source, integrated into the real optional `ActivityCartridge.presentation` field. It is dormant with Activity Studio; source inclusion does not deploy or refresh the installed MCP catalogue.

## Tier 0: no frontend code

The Activity template chooses a trusted default. A producer can omit `presentation` entirely. When composition needs a different arrangement, use `minamo.presentation.v1`, version `1`, an advertised pattern and block-ID slots. Every Activity block must remain reachable exactly once. Recipe data contains no original text, copied source, hidden hint, arbitrary component name, URL, HTML, CSS or callback. Optional per-slot `viewId` is a server-allowlisted metadata ID, matched to the exact Foundry source kind and allowed slot; it is not a module name or loader.

Generate a complete original synthetic two-component MCP request locally:

```sh
node scripts/interface-foundry-template.mjs --id synthetic-my-composition --output .sites-runtime/my-composition.json
node scripts/interface-foundry-template.mjs --validate .sites-runtime/my-composition.json
```

The first command refuses an existing output path. Neither command publishes or accesses learner data. Local validation checks Activity shape, renderer payload and exact source hash; the real `preview_minamo_activity_package` must still recheck owner, generation and referenced-source authority. Pass the same request to preview, then to explicit publish. After a write, require `receipt.status === "committed"`; an ordinary CAS conflict returns `receipt.status:"conflict"` and `record:null` inside a transport-success MCP result, so `isError:false` alone is not a save receipt. Use a new operation ID for a changed request; retry the original payload unchanged after an uncertain response.

Discover `get_minamo_activity_capabilities` before authoring. Its `presentation` object advertises twelve pattern descriptor objects (`{id,label,focus,description}`), six role strings, finite action strings and twelve existing Foundry engine-kind strings. Read a pattern as `capabilities.presentation.patterns.find(pattern => pattern.id === "debug-and-repair")`; `patterns.includes("debug-and-repair")` is incorrect because the entries are objects. `publish_minamo_activity_package` and the ordinary domain command share validation. Unknown fields are rejected, including nested slot extras; dropped, duplicate, foreign or wrong-role block references fail with a field path.

```ts
import {deriveActivityPresentation,admitPresentationRecipe,resolvePresentation} from '../../lib/interface-foundry';
const presentation = deriveActivityPresentation(activity);
// Optional rearrangement, still bound to all admitted blocks:
const proposed = admitPresentationRecipe({...presentation,pattern:'predict-explore-compare'},activity);
const view = resolvePresentation(proposed,activity,{
  eligible: currentAuthorityAllowed,
  width: measuredAvailableContainerWidth,
  mode:'task',
});
```

`eligible` comes from the existing authenticated current Activity read, never a producer recipe. False returns no block IDs or action capabilities. The measured width is after Notes docking; do not subtract Notes twice. A container below 720px, or Focus presentation, uses one content surface; 720–1119px uses split policy; larger containers may use the wide policy. The host remains responsible for visible tab/focus behavior and mounting a block only once.

The recipe is immutable after admission. Layout only references blocks; exact source/rendition remains unchanged. Changing a persisted recipe changes the Activity edition through ordinary CAS. Retained editions, encrypted recovery and owner isolation use the existing record authority. Rights revocation replaces an unavailable linked reading with its inert marker; the same supporting slot remains readable without carrying old source text.

## Finite slots and behavior

| Block | Allowed role |
| --- | --- |
| instruction | task, guidance, supporting (including unavailable-reading marker) |
| prediction | task |
| reflection | evidence |
| source-browser | source |
| reading | supporting |
| hint-ladder | guidance |
| Foundry output bundle / external trace | evidence, explore |
| Other admitted Foundry artefact | explore, source |

The twelve named patterns are contextual presentation policies over the existing host, not twelve new routes. They cover reading, overview, debugging, building, comparison, mathematics/science, languages, data, finite games/algorithms, code walkthrough, sound and Atlas context. The existing Atlas remains its own rights-aware product surface; an Activity pattern ID does not create a second Atlas data authority.

Actions are derived from actual available blocks. There is no arbitrary Run/save/checkpoint action in a recipe. Foundry activation still uses its trusted lazy registry and explicit user gesture; unknown engines retain accessible source and get no activation action. Hints still require a deliberate server request. No recipe can release a hidden hint or execute imported project code.

## Frozen constrained producer trial dossier

Give a fresh constrained agent only this file, the exact frozen staging commit and capability catalogue. Task: create a new `synthetic-` Activity combining two already registered Foundry kinds; preview and publish via isolated local typed MCP; read back the exact recipe, canonical sources and retained edition; demonstrate no `run` or learning-development record was created. Make no frontend source edits, do not deploy, and dispose synthetic D1/R2 afterwards.

Record changed files, validation retries, unplanned architecture/dependency choices and actual test evidence. The reusable executable proof is:

```sh
node --test tests/interface-foundry-contract*.test.mjs
```

These tests include real local Worker/D1/MCP publication and encrypted recovery, not just client-side parsing. A successful scripted proof is distinct from the separately executed fresh-agent integration trial or hosted acceptance.

## Primary documentation evidence

Context7 resolved the official Zod 3 documentation on 25 October 2026: [strict object parsing and custom refinement](https://v3.zod.dev/). Zod objects strip unknown properties by default; all recipe and slot schemas explicitly use `.strict()`. Cross-block role/coverage checks occur after bounded inert-JSON admission. The existing finite MCP JSON-schema converter reads this real Zod schema, so optional recipe fields are visible in the staged catalogue.

## Explicit optional view selection

A known view is selected on one slot, for example `{slot:"explore",blockId:"passage",viewId:"source.bytes-v1"}`. Omit `viewId` to retain that block's original renderer, even if other views of the same source kind are enabled. `get_minamo_activity_capabilities().presentation.views` returns descriptor objects with `id`, `sourceKind`, `slots`, `version` and explicit activation semantics. Unknown version IDs, wrong source kinds, non-Foundry blocks and disallowed slots fail shared server admission. The local producer supports `--view source.bytes-v1` as a bounded example; its default output deliberately selects no optional view. New static view code needs both server metadata and a build-time loader entry as described in LIGHT-ACTIVATION.md.

## Tested original cross-domain authoring specimen

The [complete Japanese ruby + TeX request](../release-acceptance/evidence/cross-seed-dishes.json) is original TEST ONLY data validated and published through isolated local typed MCP in the independent acceptance run. It requires no frontend edit. Its [executable regression](../../tests/release-light-cross-domain.test.mjs) verifies exact UTF-16 offsets, astral characters, distinct decomposed/precomposed accents, CRLF, source hashes and the entire saved recipe. Use its shape when the current capability catalogue advertises `language/ruby-v1`, `math/tex-v1` and `language-reading`.

Ruby's payload has `{version:1,text,language:'ja',direction:'ltr',spans:[{start,end,base,reading,origin:'author-verified'}]}`. `start` and end-exclusive `end` count original UTF-16 units, and `text.slice(start,end)` must equal `base`; never split a surrogate pair or silently normalise the original text. Its canonical format is `language-json`; canonical source is `JSON.stringify(payload)`. TeX's canonical format is `tex`, and payload `source` equals the exact canonical source. In both cases compute the UTF-8 SHA-256 from the final exact canonical source after each edit. The authored-example provenance is `{classification:'authored',execution:'not-executed'}`. A displayed formula is not proof of calculation; an author-verified reading is not an independently measured proficiency result.

The current catalogue lists admitted kind names rather than every kind-specific payload schema. This specimen banks two commonly useful exact shapes; it does not promise catalogue-only generation of every advertised domain. For another kind, consult its current typed adapter schema, preserve exact canonical binding, preview before publishing and retain the original draft on a field-specific rejection. Do not guess missing payload fields or transform a known source into a new unsupported kind.
