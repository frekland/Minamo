# Private documents, audio and video

Original file bytes use V2 R2; opaque references, validation metadata, staged state and attachments use V2 D1. This extends the existing owner/generation boundary and command receipt authority. Images keep their existing path and behaviour.

## Supported admission

| Kind | MIME / bounded container | Actual file limit |
| --- | --- | --- |
| Document | PDF with signature, exact ending and bounded cross-reference structure; well-formed UTF-8 plain text or Markdown without binary controls | 16 MiB |
| Audio | MPEG-1 Layer III MP3 with complete consistent frames; mono/stereo 16-bit PCM RIFF/WAV | 16 MiB |
| Video | Complete nonfragmented H.264 MP4 with optional AAC; VP8/VP9 WebM with optional Opus/Vorbis | 20 MiB |

Container checks are not full decoding, successful browser playback, malware scanning, OCR, text extraction or transcription. MP4 version-1 movie headers/fragmented variants and unknown-length nested WebM elements are refused. PDF cross-reference inspection is bounded to 64 KiB. Browser codec support can differ. Unsupported files fail with a recoverable explanation; they are never relabelled as successful playback. The lower actual limits keep bounded binary handling within the Worker memory budget.

## One attachment authority

1. Deliberately select and review a local file; selection performs no upload.
2. `POST /api/media/stage?uploadId=...` sends the original bytes with their declared supported MIME. The stable upload identity converges on one immutable asset; different bytes under the same identity fail.
3. A rich part is `{kind:'media',text,media:{assetId,kind,description,caption?,transcript?}}`. The description is required (2,000 UTF-16 units); optional caption is limited to 1,000 and owner-authored transcript to 12,000. Canonical text is description, caption and transcript joined by LF, with exact original text and offsets preserved.
4. Existing parent record CAS atomically admits the staged asset and attachment. Failed/stale parent saves do not grant bytes. No standalone finalize operation or second durable autosave queue exists.

Narrow `patchBlock` metadata edits preserve unrelated rich sections; derived canonical text changes only as requested. Captures refer to canonical authored text, never pixels, PDF pages or audio/video timestamps. A separately supplied transcript is never claimed to have been generated from the uploaded bytes.

## Authenticated delivery and revocation

`GET /api/media/:id/metadata` requires an active eligible current or retained parent attachment. `GET`/`HEAD /api/media/:id` uses the same current owner, generation, permanent permission floor and active parent gate. Both full reads and single HTTP byte ranges work. Unsatisfiable/multiple ranges return 416 only after authentication and asset eligibility; inaccessible IDs reveal neither file length nor ETag.

Documents always download with a fixed generated filename, nosniff and sandbox headers. Audio/video use native browser controls only after explicit load; no autoplay or remote import is provided. Native resource URLs carry the exact generation query token because media elements cannot add custom headers. Responses remain private/no-store.

`POST /api/media/:id/revoke` requires the exact metadata revision. Revocation permanently stops display and creates a non-restorable root permission floor. Original bytes associated with any admitted current or historical attachment are preserved. Current and historical descriptions, captions, transcripts, concepts and captured quotation projections are withheld; independent personal prose remains editable. Unreferenced expired staging can be cleaned up only on deliberate mutations.

Complete protected checkpoints and portable encrypted bundles include media metadata, attachment rows and verified original bytes. Missing or corrupt required bytes fail the complete checkpoint. Restoration intersects current/root-floor restrictions; importing an old file cannot reinstate revoked media. Aggregate recovery budgets remain explicit and can reject a workspace larger than supported, rather than silently omit files.

## Verification

`tests/security-media.test.mjs` uses actual synthetic PDF/text/Markdown and tiny ffmpeg-generated WAV/MP3/H.264 MP4/VP8 WebM bytes with real Miniflare D1/R2. It checks staging, MIME/container failures, ranges, privacy, missing bytes, historical attachment gating, restore completeness, generation fencing and permanent revocation. `tests/domain-media.test.mjs` checks exact UTF-16 text/captures, targeted edits, every nested capture/bookmark projection after revocation, independent annotation edits and a real D1 dependency race before parent commit. `tests/media-reader.test.mjs` checks escaped canonical rendering and explicit native loading semantics. Browser/device playback remains separate evidence.
