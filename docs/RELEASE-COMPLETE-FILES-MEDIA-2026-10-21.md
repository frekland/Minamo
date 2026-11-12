# Complete recovery files and contextual private media

This increment continues V9 in the existing owner-private Minamo V2 Site. V8 selection/Notes behaviour and V9 generation-safe recovery remain the baseline. Original Minamo and cyber-learning are unchanged. Exact source trees, CI and private deployment identities belong in the issue #1 release receipt.

## Complete files

Recovery can download an encrypted file of the current saved workspace and import it into an inactive namespace. The native format uses PBKDF2 and independently authenticated, ordered 64 KiB AES-GCM frames. It is not ZIP or portable JSON. Ciphertext and original media stream through bounded readers; one original asset is validated at a time. No binary file, passphrase or archive body enters browser draft storage or Git.

Imports validate schema, identities, bounded row/asset inventory, authenticated lengths, complete ciphertext, each original container and SHA-256 digest. File encryption does not confer Source permissions. Current Source grants and permanent root revocation floors remain authoritative across retained records, captures and operation readbacks. Explicit file-specific owner permission can restore validated images/media missing from current metadata; known revocations remain withheld. The file cannot recreate lost hosting identity, provider bindings or independent permission authority.

The existing recovery review remains the only activation path. An import never activates automatically. Activation first checkpoints the current saved generation and checks the generation/version fence. Stale clients retain earlier drafts and cannot rebind pending writes into the replacement generation. Retry/status use the original immutable operation. Portable JSON remains a distinct, non-restorable current-rights export.

Supported budgets are 20,000 product rows, 8 MiB manifest JSON, 64 images/32 MiB image bytes, 64 other media/64 MiB media bytes, at most 80 MiB combined original bytes and 90 MiB encoded file. Exceeding a complete-workspace budget rejects the checkpoint; files are not silently dropped. Foundation lab tables and unsaved browser drafts are excluded.

## Contextual media

PDF, UTF-8 plain text/Markdown and MP3/PCM WAV are bounded to 16 MiB each; admitted H.264 MP4 and VP8/VP9 WebM are bounded to 20 MiB. See the narrower supported container variants in [PRIVATE-MEDIA.md](PRIVATE-MEDIA.md). Documents download with sandbox/nosniff headers. Native audio/video controls load only after deliberate authenticated eligibility checks; full and single-range byte reads use the same owner, parent, generation and permanent-revocation authority.

Rich authoring and Notes can stage a reviewed local file and attach it through their existing parent save. Notes append new attachments with targeted patches, preserving unrelated rich sections and avoiding retained imported quotation content in browser draft payloads. There is one durable command queue. Original filenames are not persisted. Drop selects a local file; it does not silently upload.

Descriptions, captions and supplied transcripts are authored text with stable exact UTF-16 range mapping. They are usable by Reader/captures and the shared web/MCP domain. No OCR, transcription, decoding, pixel/audio interpretation or successful browser playback is inferred. Revocation withholds dependent textual projections across current readings, history, captures, concepts and nested Flags while preserving independent writing.

## Evidence and limits

Actual synthetic D1/R2 tests cover complete media originals, byte ranges, concurrent dependency changes, generation fencing, protected restore, Source export denial and hostile encrypted imports. Independent Node AES-GCM framing tests exercise validly re-encrypted hostile files as well as wrong keys, truncation and ciphertext tampering. Aggregate results are recorded with the release receipt after the final build.

Development-browser checks exercised real pointer selection on a media description, adjacent Flag/Annotate, keyboard passage selection and contextual annotation, rejected-save writing retention, all four Notes docks, actual pointer resizing and maximising without losing rich writing. A 390 CSS-pixel iframe check confirmed contained reading/recovery layouts. The fixtures have no authenticated identity; access failures and disabled recovery transfers were genuine. They do not prove authenticated hosted upload, successful playback/download/import, physical Android or TalkBack acceptance. The owner's earlier Android Flag/Annotate confirmation remains basic owner evidence.

CE-02/03/04/06/07/09/14/16/18/19/24/25 are extended by this increment's shared media, exact-text, permission and recovery tests. Other prior CE dispositions remain unchanged unless the release receipt gives newer evidence. External URL bookmarks, anchor-quote search, authenticated hosted full-flow/device acceptance and independent-provider disaster recovery remain unfinished. No claim of complete original-product parity or complete owner teaching acceptance is made.

PR #12 is explicitly on hold by the owner's later instruction. Its already-merged documentation is retained unchanged; no semantic runtime, service provisioning, private indexing or model usage is part of this increment.
