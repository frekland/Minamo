# Native semantic source and durable scientific output

PR40 G1/G2 implementation uses existing records, editions, generation authority, image attachments and encrypted recovery. It introduces no second owner store and no new database table.

## Native semantic content

`PassagePart.semantic` accepts the strict `minamo.semantic.v1` union: `ruby` wrapping the existing Foundry `LanguageText`, or `math` wrapping a Foundry `MathExpression`. Canonical identity remains `part.text`, containing exact original UTF-16 base text or exact TeX. Metadata must match character-for-character; an omitted text field is derived by `compileAuthorData`. Metadata-only corrections change rendition identity because the ordinary sections participate in the existing hash.

This works on paragraph/code parts and admitted Source excerpt parts, in Articles, Notes and other existing readable records. Paragraph metadata does not grant Source rights. Excerpt metadata is projected only after current exact Source permission validation. Revoked source parts contain only the existing empty unavailable sentinel, including for retained editions, protected export and portable export. Ordinary text edits remove stale decorations; explicit replacements validate the new source together. Flags/annotations still use exact part/rendition/UTF-16 base coordinates.

Newly submitted manuscripts can use explicit JSON fences `minamo-semantic`, `minamo-language` and `minamo-math`. These compile to native parts; archived original manuscript bytes remain unchanged. Unsupported declarations remain literal code with a warning. Old Markdown is never automatically scanned or migrated.

`app/semantic-reading.tsx` exports `semanticReadingAdapter` for an enabled Workspace Reader. Ruby maps base spans independently, with reading text outside canonical ranges. Copy emits exact base text through the existing Foundry DOM mapper. Formula source remains visible/selectable; deliberate “Typeset formula” loads the existing safe KaTeX renderer lazily. Viewing and revealing never create progress. Physical Android/assistive-reader acceptance remains an owner release check.

## Durable scientific output

`Run.outputBundle` accepts `minamo.outputs.v1`: exact `codeSha256`, runtime, status, stdout/stderr/error and up to eight typed tables or same-Run private PNG attachment references. Metadata is limited to 96,000 UTF-8 bytes. Tables use finite scalar cells and bounded dimensions. Images reference ordinary owned image section/part identities, with actual image/png MIME verified against D1 asset metadata; raw bytes, data URLs, HTML, SVG and remote resource URLs are not admitted.

Outputs use **supplied-output** or **browser-reported-output** provenance. The API rejects `evidence:observed` even for a synthetic Run. A browser POST cannot prove to the server that Python executed; the stored report therefore never acquires server-attested execution authority. In-browser observation and persisted transport classification remain distinct. Failed/interrupted runs cannot retain successful figure/table outputs.

`preparePythonOutputSave` converts an explicitly selected actual local Foundry Python result into a normal Run command data proposal. It validates the captured source digest, stages exact PNG bytes through an injected existing image transport using deterministic retry identities, and returns the typed bundle plus ordinary image sections. Only the existing parent Run CAS finalizes staged assets. It does not execute, create records, retry operations, or write checkpoints automatically. Staged assets left after a rejected save use existing expiry/cleanup behavior.

Normal current/retained reads, portable exports and protected encrypted bundles remove typed image metadata when the attachment is revoked. Figure bytes use existing R2 read, owner/generation, attachment, revocation-floor and recovery paths. Exact tables/code/runtime metadata survive save/reopen and encrypted import/activation. The read-only `TypedOutputView` presents tables and reported provenance; the normal Reader owns private image rendering. The lazily mounted `ScientificOutputStudio` in enabled Tools provides explicit load/run/cancel/save actions. It preserves pending save commands in owner/generation-scoped session storage before sending, pins expectedGeneration, retries exact operation identity, and discards stale asynchronous projections after scope changes. Missing scientific assets produce an explicit unavailable result and external/local handoff guidance, never fabricated output.

## Reproducible acceptance

Run `node --test tests/semantic-content.test.mjs tests/semantic-rendering.test.mjs` from the repository root. The suites exercise eleven actual local tests/subtests: malformed metadata, Unicode boundary failures, unsafe TeX, forged observation, stale output, digest binding, exact PNG staging, explicit manuscript compilation, native D1/MCP publication/readback, CAS, retained editions, owner isolation, real R2 attachment, protected export/import/generation activation, Source revocation and image revocation, authenticated hostile import with forged code digest, and native SSR mapping/fallback. The D1 fixtures use synthetic supplied output; they do not claim Python execution. Actual Foundry runtime acceptance is recorded separately by the programme.

Core source paths: `lib/semantic-content.ts`, `lib/typed-outputs.ts`, `lib/python-output-save.ts`, native hooks in `contracts.ts`, `domain.ts`, `author-input.ts`, `manuscript.ts`, `content-edits.ts`, `recovery.ts`, `recovery-bundle.ts`, typed MCP schema hooks in `domain-handler.ts`, and the presentation components above, including `app/scientific-output-studio.tsx`.

No production catalogue reinstall, hosted save/deployment, physical device test or genuine learner write was performed by this workstream.
