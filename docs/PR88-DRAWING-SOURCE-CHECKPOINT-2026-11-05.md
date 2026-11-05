# PR #88 — drawing source checkpoint (5 November 2026)

**Scope:** shared public-source reconciliation only. No deployment, native Site edit, MCP-tool exposure, database migration or access-policy change.

## Provenance

- Verified live owner-private Site: V116, custom audience, native release source `fc93ce4bbcffa4298097b8c7fe50fae75555d072`.
- Inspected descendant native source `d32f713585a9bf320a9ca75457b4f01996893c47`.
- Checked draft PR #83 source `a94c855f8f0ee4ed81b4da872a4bbae8f7878382` against the native files. The three files copied in this checkpoint were identical in those two sources.

## Ported now

- `lib/drawing-document.ts`: bounded tldraw document validation, document-only record admission, exact canonical private raster references, historical marker normalization without mutating the input, and rejection of unsupported external assets/session records.
- `lib/drawing-image-upload.ts`: JPEG conversion is permitted only after the specific authenticated server `invalid_image` container rejection; ordinary permission, storage, quota and generation failures are never converted.
- `tests/pr83-drawing-attribution.test.mjs`: real tldraw 5.5.2 URL-validator and six validator/JPEG-regression checks.

This is a **foundation**, not a claim that drawings render or that GPT can yet read/edit them on the public branch.

## Dependency boundary for the next drawing slice

Native V116's `app/project-drawing.tsx` and `app/project-canvas.tsx` match PR #83, but the public branch still lacks their interactive host and typed content contract. Native `app/project-interactive.tsx` and `lib/project-interactive.ts` have since acquired language/TTS and Python/Pygbag dependencies absent from public source. Do not copy that pair or native `lib/contracts.ts` wholesale.

Before wiring the drawing UI or `get_project_drawing`, reconcile the exact typed `interactive:drawing` part, media MIME admission and private document-image redaction, owner/Project/Note identity checks, asset upload and read paths, preview persistence, and original Note revision/CAS rules. `lib/project-drawing-collab.ts` in PR #83/native provides the existing read/shape pagination implementation, but is intentionally **not exposed** until the enclosing rights and media paths are present and tested. No `apply_project_drawing` edit tool was found in the inspected native V116 handler; don't falsely claim one.

## Focused local verification

- `node --test tests/pr83-drawing-attribution.test.mjs`: **6 passed**.
- `pnpm run typecheck`: **passed**.
- `pnpm run build`: **passed** (ordinary chunk warning).
- `git diff --check`: passed.
- Full `pnpm test`, historical browser campaign and hosted acceptance: **not run** under the owner opt-in rule.

Keep PR #89 in draft. Continue with one dependency-scoped commit and relevant owner/CAS/media/asset tests before considering any interactive code. Native V116 remains the deployment source of truth.
