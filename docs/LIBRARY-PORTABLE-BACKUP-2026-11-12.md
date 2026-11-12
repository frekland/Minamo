# Library backup rescue — owner-operated, no Sites redeployment required

This increment addresses the owner priority of **getting a downloadable legacy Library copy** despite [legacy issue #10](https://github.com/frekland/Minamo-legacy-2/issues/10) (monolithic whole-workspace recovery export timed out).

## Use immediately with deployed Minamo Legacy

The standalone snippet in `scripts/legacy-library-backup-snippet.js` is generated from `lib/library-backup-client.ts` using `npm run backup:snippet`. It does not need any new server endpoint, Sites code change or GitHub/Sites synchronization.

1. Sign in to `https://minamo-legacy-2.jscymru.chatgpt.site/` using the original owner account.
2. In desktop Chrome, open Developer Tools (F12), choose **Sources → Snippets** (in the left navigator; `>>` if hidden), create **New snippet**, and paste the complete contents of `legacy-library-backup-snippet.js`.
3. Press **Ctrl+Enter** / **Run snippet**, accept the explicit local-backup confirmation and keep the page open while progress is displayed. The script performs only same-origin authenticated GETs.
4. Allow the browser to download `minamo-library-YYYY-MM-DD.zip` (or a `-PARTIAL.zip` file if original asset retrieval fails). Open its `manifest.json` to inspect record counts, redactions and missing assets. Keep the ZIP private; it is **not encrypted**.
5. If the script reports an error, **do not delete legacy data**. Share only the error text and general progress, not the private archive contents.

The script accepts **only** the specific legacy hostname, does not invoke `/api/recovery/export` and performs no writes. It fetches current Articles, Areas, Sources, available retained record editions, and original eligible attached image/audio/video/document bytes using bounded reads, checks content digests and rechecks current record IDs/revisions before writing the ZIP.

## What this archive is — and is not

- This is a **content rescue ZIP**, not a complete workspace snapshot or import-ready recovery file. `manifest.json` records the format `minamo-library-archive@1`, inventories and SHA-256 digests. ZIP entries are stored without compression; normal ZIP integrity checks apply.
- Includes: eligible Article/Area/Source current record JSON, their retained revisions available through owner-scoped record-history endpoints, and referenced original image/media where accessible. It preserves JSON relationships/links as supplied by the server.
- Excludes: Projects, personal Notes, independent Questions, server operation history, learning/work metadata, catalogue-index sidecars and unattached assets. External URLs are retained as links, not downloaded. Source excerpts that the source says may not be exported are redacted.
- If a previously referenced asset cannot be fetched or its hash doesn't match, the archive is marked `PARTIAL` and lists the missing bytes. **A successful ZIP download alone does not prove that a complete backup exists.**
- No import route has been implemented. The new Minamo Site cannot yet import this archive directly. That requires a separately reviewed, validated additive import flow and cross-Site acceptance.
- This routine reads multiple pages in smaller independent requests; it avoids the known single-response timeout but **has not yet been run against the owner's real legacy Library**. Browser/Sites transport limits could still produce an error. That failure does not mutate saved data.

## V165 UI integration

The new `app/library-backup-button.tsx` and a small `app/library-browser.tsx` edit add **Export Library** on the normal root Library page. This relies on the identical read-only exporter. It is a source-level change only until explicitly deployed to Sites; the legacy console snippet works without that deployment.

## Development verification

Use `node --experimental-strip-types --test tests/library-backup-client.test.mjs tests/library-backup-snippet.test.mjs tests/portable-content-codec.test.mjs` for mock HTTP/ZIP/denied-rights/error tests. Synthetic ZIP opened successfully using Python `zipfile.ZipFile.testzip()`.

## Future work, separate from backup rescue

After the owner confirms an actual downloadable legacy backup, add a manifest-aware **preview/import** tool for the promoted V165 Site, including duplicate-ID protection, source permissions, safe media staging and validated record creation. Reconstituting a catalogue index or carrying revision provenance needs an explicit policy rather than direct table restoration. Project portability can share the existing `minamo-portable-page@1` foundation but is out of scope for this initial backup rescue.
