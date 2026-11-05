# PR #88 — drawing source checkpoint (5 November 2026)

**Scope:** shared public-source reconciliation only. No deployment, native Site edit, database migration or access-policy change. The public draft branch now includes a read-only drawing MCP tool; it has **not** been published to the live Site.

## Provenance

- Verified live owner-private Site: V116, custom audience, native release source `fc93ce4bbcffa4298097b8c7fe50fae75555d072`.
- Inspected descendant native source `d32f713585a9bf320a9ca75457b4f01996893c47`.
- Checked draft PR #83 source `a94c855f8f0ee4ed81b4da872a4bbae8f7878382` against the native files. The three files copied in this checkpoint were identical in those two sources.

## Ported now

- `lib/drawing-document.ts`: bounded tldraw document validation, document-only record admission, exact canonical private raster references, historical marker normalization without mutating the input, and rejection of unsupported external assets/session records.
- `lib/drawing-image-upload.ts`: JPEG conversion is permitted only after the specific authenticated server `invalid_image` container rejection; ordinary permission, storage, quota and generation failures are never converted.
- `tests/pr83-drawing-attribution.test.mjs`: real tldraw 5.5.2 URL-validator and six validator/JPEG-regression checks.

This was the **foundation commit**. The following checkpoints build on it; the canvas editor has not yet been ported.

## Media admission and rights follow-up

The next commit also introduces the native V116 drawing MIME in the existing media stage validator and a private read projection. Server admission validates the actual tldraw envelope and rejects remote image URLs; no HTML, scripts or session records are accepted. Reading a drawing document first checks the existing **owner-scoped attached-media eligibility**. For every nested image, the server checks current same-owner asset metadata, removes disallowed image assets, and disconnects affected shapes in the returned copy. Original Note text, revision and original document bytes are not modified by that read.

`tests/pr88-drawing-media.test.mjs` exercises actual D1/R2 stage, commit, cross-owner 404, valid read, image revocation, redacted reread and Note preservation. Targeted local checks: **1/1 new drawing-media**, **19/19 drawing attribution plus existing media safety**, typecheck and build passed. No Site deployment or full regression/browser campaign.

## Interactive contracts and Project/Note MCP drawing read

The next bounded public-source checkpoint brings across native V116's pure `project-interactive.ts` definition (including flashcards, drawing, Python, parameter explorers and language shapes), the `interactive` part contract, MCP JSON schema and server validation. The Project update transaction now requires an owned, current Note for a drawing reference, including Notes created in the same atomic batch, and guards its revision. The existing image transaction/eligibility SQL now covers nested flashcard faces, with current/retained permissions and revocation redaction. Drawing media attached to a state Note must list every nested raster as a separate admitted image part; the server validates the immutable private snapshot before the atomic write. Invalid inventory leaves Note prose/revision untouched.

`get_project_drawing` is now available **in the public branch's tool catalog only**. It reads an exact Project-linked Note, returns bounded saved shape/text/page information, allows a revision-fenced page and an optional private preview delivered separately as an MCP image content block. It does not generate visual interpretations or claim observed execution, and it does not edit a canvas. An unrelated or cross-owner Project/Note returns unavailable. Native V116's `lib/project-drawing-collab.ts` was ported without changing its read semantics. The `pygbag` discriminator is present for type compatibility but intentionally **not admitted** by the public server until its independent package validator and protected media profile are reconciled.

**Targeted verification:** `tests/pr88-drawing-read.test.mjs` **3/3 PASS** (real Project+Note MCP authoring, nested image attachment/revocation, exact shape text/preview, stale Note revision, unrelated/cross-owner denial, drawing asset inventory refusal and Note preservation). Alongside drawing attribution, media, image, and raster security checks: **50/50 PASS**. Typecheck, build and diff check run separately below. No live Site publication, browser campaign or full historical regression.

## Dependency boundary for the next drawing slice

Native V116's `app/project-drawing.tsx` and `app/project-canvas.tsx` match PR #83, but the public branch still lacks the interactive **browser host/editor**. Native `app/project-interactive.tsx` has since acquired language/TTS and Python/Pygbag dependencies absent from public source; the **pure typed contract was reconciled separately** above. Do not copy the host or native `lib/contracts.ts` wholesale.

Before wiring the drawing browser UI, reconcile asset upload from the editor, preview persistence, fullscreen, Note draft/autosave revision/CAS rules, and the shared browser host dependencies. Media MIME admission, read redaction, and **MCP drawing read** now have focused server tests; they do not independently prove a working tldraw browser editor. No `apply_project_drawing` edit tool was found in the inspected native V116 handler; don't falsely claim one.

## Focused local verification

- `node --test tests/pr83-drawing-attribution.test.mjs`: **6 passed**.
- `pnpm run typecheck`: **passed**.
- `pnpm run build`: **passed** (ordinary chunk warning).
- `git diff --check`: passed.
- Full `pnpm test`, historical browser campaign and hosted acceptance: **not run** under the owner opt-in rule.

Keep PR #89 in draft. Continue with a bounded browser/editor closure, then separately reconcile Python/Pygbag and language/TTS dependencies. Native V116 remains the deployment source of truth.
