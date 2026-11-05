# PR #88 — drawing source checkpoint (5 November 2026)

**Scope:** shared public-source reconciliation only. No deployment, native Site edit, database migration or access-policy change. The public draft branch now includes a read-only drawing MCP tool and the interactive browser/editor source; neither has **been published to the live Site** from this branch.

## Provenance

- Verified live owner-private Site: V116, custom audience, native release source `fc93ce4bbcffa4298097b8c7fe50fae75555d072`.
- Inspected descendant native source `d32f713585a9bf320a9ca75457b4f01996893c47`.
- Checked draft PR #83 source `a94c855f8f0ee4ed81b4da872a4bbae8f7878382` against the native files. The three files copied in this checkpoint were identical in those two sources.

## Ported now

- `lib/drawing-document.ts`: bounded tldraw document validation, document-only record admission, exact canonical private raster references, historical marker normalization without mutating the input, and rejection of unsupported external assets/session records.
- `lib/drawing-image-upload.ts`: JPEG conversion is permitted only after the specific authenticated server `invalid_image` container rejection; ordinary permission, storage, quota and generation failures are never converted.
- `tests/pr83-drawing-attribution.test.mjs`: real tldraw 5.5.2 URL-validator and six validator/JPEG-regression checks.

This was the **foundation commit**. The subsequent checkpoints build on it.

## Media admission and rights follow-up

The next commit also introduces the native V116 drawing MIME in the existing media stage validator and a private read projection. Server admission validates the actual tldraw envelope and rejects remote image URLs; no HTML, scripts or session records are accepted. Reading a drawing document first checks the existing **owner-scoped attached-media eligibility**. For every nested image, the server checks current same-owner asset metadata, removes disallowed image assets, and disconnects affected shapes in the returned copy. Original Note text, revision and original document bytes are not modified by that read.

`tests/pr88-drawing-media.test.mjs` exercises actual D1/R2 stage, commit, cross-owner 404, valid read, image revocation, redacted reread and Note preservation. Targeted local checks: **1/1 new drawing-media**, **19/19 drawing attribution plus existing media safety**, typecheck and build passed. No Site deployment or full regression/browser campaign.

## Interactive contracts and Project/Note MCP drawing read

The next bounded public-source checkpoint brings across native V116's pure `project-interactive.ts` definition (including flashcards, drawing, Python, parameter explorers and language shapes), the `interactive` part contract, MCP JSON schema and server validation. The Project update transaction now requires an owned, current Note for a drawing reference, including Notes created in the same atomic batch, and guards its revision. The existing image transaction/eligibility SQL now covers nested flashcard faces, with current/retained permissions and revocation redaction. Drawing media attached to a state Note must list every nested raster as a separate admitted image part; the server validates the immutable private snapshot before the atomic write. Invalid inventory leaves Note prose/revision untouched.

`get_project_drawing` is now available **in the public branch's tool catalog only**. It reads an exact Project-linked Note, returns bounded saved shape/text/page information, allows a revision-fenced page and an optional private preview delivered separately as an MCP image content block. It does not generate visual interpretations or claim observed execution, and it does not edit a canvas. An unrelated or cross-owner Project/Note returns unavailable. Native V116's `lib/project-drawing-collab.ts` was ported without changing its read semantics. The `pygbag` discriminator is present for type compatibility but intentionally **not admitted** by the public server until its independent package validator and protected media profile are reconciled.

**Targeted verification:** `tests/pr88-drawing-read.test.mjs` **3/3 PASS** (real Project+Note MCP authoring, nested image attachment/revocation, exact shape text/preview, stale Note revision, unrelated/cross-owner denial, drawing asset inventory refusal and Note preservation). Alongside drawing attribution, media, image, and raster security checks: **50/50 PASS**. Typecheck, build and diff check run separately below. No live Site publication, browser campaign or full historical regression.

## Interactive browser/editor source reconciliation

The next public-source change adds native V116's `app/project-drawing.tsx`, `app/project-interactive.tsx`, `app/project-language.tsx`, `app/project-speech.tsx`, `app/project-canvas.tsx` and `app/project-pygbag.tsx`, plus their direct portable helper modules. Their source was compared with the native checkout. The shared Reader now renders a typed interactive part under the authenticated owner scope, and the direct Project editor provides `InteractiveEditor` for authored definitions and flashcard image inputs. This restores the V116 source paths for flashcards, layered language reading/sentence patterns/dialogues, drawing with fullscreen, Python Canvas/parameter explorers and the isolated package viewer. The drawing editor retains draft snapshots on local persistence, checks Note revision conflicts, resolves private raster assets, and persists exact documents and optional previews via existing Note/media/asset mechanisms.

The editor fetches its tldraw licence key only from the **authenticated, generation-checked, GET-only** `/api/projects/runtime-config`; `TLDRAW_LICENSE_KEY` is an optional Sites binding, not committed source material. The public manifest/lockfile now pins native V116's `@mintplex-labs/piper-tts-web@1.0.5`, `piper-plus@0.8.2` and `onnxruntime-web@1.30.0`; the existing native package policy explicitly denies the unused `protobufjs` postinstall script. Successful local install, TypeScript and production build prove source integration, **not** that speech models download on user devices.

Language source classification/navigation is now reconciled with native V116's general canonical BCP 47 tag support, rather than the historical hardcoded suggestion set. The fixed language menu remains a convenient suggestion list, not an eligibility whitelist. One outdated targeted test expectation for `en` was corrected, retaining an explicit malformed-tag rejection assertion.

**Important limits:** the public commit boundary still deliberately refuses new `pygbag` package references until their MIME/digest/profile admission is ported and tested. A native package viewer in this source tree is therefore not proof that new packages can be uploaded and saved through the public server. Server read tests alone are also not a browser UX/persistence acceptance; the production V116 tldraw key, live editing interaction, mobile/fullscreen and microphone/speech-model behaviour have not been retested here. No `apply_project_drawing` MCP editing tool was found in native V116; this work adds no invented write tool. Do not represent the public branch as fully source-identical to V116 yet.

## Focused local verification

- `node --test tests/pr83-drawing-attribution.test.mjs`: **6 passed**.
- `pnpm run typecheck`: **passed**.
- `pnpm run build`: **passed** (ordinary chunk warning).
- `git diff --check`: passed.
- New targeted checks for this UI slice: `tests/pr88-drawing-read.test.mjs` **4 passed**, `tests/pr85-language.test.mjs` **2 passed**, and `tests/pr85-speech.test.mjs` **4 passed** (10/10). The drawing route test verifies licence configuration, method and generation boundaries; the language/speech tests verify bounded language definitions and exact supported voice profiles. Directly related scoped server/navigation tests bring that selection to **21/21 PASS**; drawing-attribution/media tests add **7/7 PASS**, or **28/28 focused checks** in the latest passes.
- A deliberately scoped legacy `learning-spaces-workspace.test.mjs` run still had **two old SSR expectations** (fixture text/old navigation label) that do not match the current compact UI. They were not silently fixed or treated as a release gate. Another old fixed-list language test expectation was updated because it contradicted native BCP 47 support.
- Full `pnpm test`, historical browser campaign and hosted acceptance: **not run** under the owner opt-in rule.

Keep PR #89 in draft. The next source closure should address Pygbag admission and the remaining native/public deltas, then perform a specific owner-requested browser interaction check if appropriate. Native V116 remains the deployment source of truth.
