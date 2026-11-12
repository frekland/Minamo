# Sites deployment handoff: Library backup rescue (12 November 2026)

**Owner goal:** Obtain an actual downloadable, verified copy of the old Minamo Library with an ordinary **Export Library** button; then enable the same feature in current Minamo. No command line, DevTools Snippets, or attachments for the owner.

## Two separate Sites

- **Legacy**: https://minamo-legacy-2.jscymru.chatgpt.site/ (V149; source-of-truth for the old Library). Legacy issue: https://github.com/frekland/Minamo-legacy-2/issues/10 . Legacy source and working instructions: see the matching legacy backup-rescue PR.
- **Current**: https://minamo.jscymru.chatgpt.site/ (former Visual Lab V165, originally native source SHA f0c314a0004ff1c42101431134a8d2d19117870e). This repository is a snapshot of that deployed native source, not an automatically connected deployment.

## Source changes already committed in THIS branch

- `lib/library-backup-client.ts`: bounded same-origin GET Library exporter for Article/Area/Source records and available revisions, assets and digest-checked ZIP output. It does not call the unreliable recovery endpoint.
- `app/library-backup-button.tsx` and `app/library-browser.tsx`: root Library **Export Library** button, private-data warning and progress.
- `scripts/legacy-library-backup-snippet.js`: self-contained fallback intended for legacy, not for requiring users to use DevTools.
- `tests/library-backup-client.test.mjs`, `tests/library-backup-snippet.test.mjs`, build script and owner notes.

Focused tests passed locally with:
```sh
node --experimental-strip-types --test tests/library-backup-client.test.mjs tests/library-backup-snippet.test.mjs
```
(6 tests; synthetic HTTP/ZIP cases, **not** a live export acceptance. Full application typecheck/build and browser acceptance remain required.)

## Work commission: deploy and validate, legacy first

1. Inspect the **actual native V149 source** in connected legacy Sites. The public legacy repo may differ from deployed V149. Read the legacy PR's script and handoff; adapt it into a normal UI **Export Library** button, retaining owner-scoped, read-only same-origin requests. Check compatibility of `/api/query`, `/api/context`, `/api/records/changes`, `/api/records/revision`, and `/api/assets`/`/api/media`; repair mismatches. No developer-console actions for the owner.
2. Deploy **only** this bounded export feature to the legacy Site. Preserve user identity, host environment, MCP, all data, and Site URL. Run Site/browser test as the signed-in owner: click Export Library, obtain the ZIP, inspect `manifest.json`, verify current records, retained revisions and original media counts/digests. Distinguish complete from PARTIAL. Large-library performance must be tested; issue #10 remains open.
3. Only after the old Library file has been obtained and independently checked, inspect the actual V165 Sites source and port the changes in this branch into current Minamo. Run typecheck/tests, deploy minimal UI change, verify root Library export, check MCP reads and existing Projects unaffected.
4. Record exact deployed Sites revisions, test outcomes, expected vs actual counts, any missing/redacted assets and remaining gaps in the relevant GitHub PRs. **Do not claim GitHub branch changes are deployed just because committed.**

## Non-goals and safety

- Do not rebuild from the old GitHub snapshot, enable public admission, change credentials/owner, reset recovery generations, restore/replace DB content, alter Projects/Notes or migrate anything between Sites.
- A ZIP is a **private, unencrypted, personal content archive**, not a full workspace recovery file or import package. Do not upload real exported material, user records, credentials, ZIP content, or private logs to public GitHub.
- Do not implement Project import or additive Library import as part of this urgent backup milestone.
- If an actual export fails, report the precise cause without pretending a complete backup exists.
