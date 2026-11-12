# Implemented architecture — issue #1

Minamo V2 uses the existing Vinext App Router / React / TypeScript Site on Cloudflare Workers. This is a Vinext compatibility runtime, not conventional Next.js. Next16.3.8 compatibility dependencies and patched transitive dependencies are locked. Server Components provide identity-dependent initial records and direct-link context; one persistent client Workspace owns route history, selection context, Notes and tool hosts. No embedded GPT chatbot exists.

## Ownership

- `app/page.tsx`: Sites-authenticated per-request initial workspace/rendition, opaque owner draft scope; no writes on render.
- `app/workspace.tsx`: responsive navigation, actual relationships, bounded search, Home activity framing, organiser/Trash, deliberate rich authoring and acknowledged API commands. Browser history is presentation state; it never grants record access.
- `app/reader.tsx`: canonical authored part DOM map, exact UTF-16 multi-part selection, immutable rendition return, annotations, Flags, code copy and safe rendered diagrams. No arbitrary HTML/SVG evaluation.
- `app/notes-panel.tsx`: persistent writing host, owner-partitioned retained drafts, docking/focus/collapse, single debounced mutation path, CAS review and pending-operation recovery. No side effect is replayed by a route render.
- `lib/contracts.ts`: typed transport/domain records and canonical authored-article part projection.
- `lib/domain.ts`: server validation, content hashes, owner-scoped reads, atomic D1 command/receipt/history/activity batch, source URL/use admission limits and exact retained rendition resolution.
- `lib/domain-handler.ts`: HTTP and typed MCP adapters over that same domain. Reads are bounded; tool calls declare current purpose. Caller-provided actor/owner/rendition hashes are not trusted durable fields.
- `worker/index.ts`: single routing boundary retaining existing foundation endpoints and adding the workspace API/MCP.
- `lib/tool-runtime.ts`, `app/tools-panel.tsx`, `public/tools`: client-only runtime ownership, local Pyodide/SQLite/regex/Unicode and finite Web DOM experiment. Browser drafts are independent of server Run evidence; execution never automatically saves.
- D1: new v2 tables coexist with unchanged foundation tables. R2 remains the independent V2 binding; no original Minamo resources or private records are touched.

Built-in React context/state is sufficient for this bounded first product delivery. A second server cache/mutation queue would add competing authority and recovery paths, so no Zustand/TanStack durable queue was added. Expensive editor modules are loaded dynamically; engine runtimes live outside route components. Official React Context7 guidance on external stores and subscriptions informed this boundary.

## Durable contract

Each command has an immutable operation identity, exact target and expected revision. A receipt insert with a random transaction nonce fences the mutation, history and activity in one D1 batch. Concurrent identical retries commit once; changed payload under the same ID is rejected. Replays/status provide metadata and references, avoiding stale-content disclosure. Clients resolve current eligible readback before using that acknowledgement. Conflicts preserve drafts; uncertain outcomes keep the original operation/payload.

Articles retain original authored sections and content-derived canonical title/introduction/heading/part renditions. Anchors identify a retained rendition and exact ordered UTF-16 segments, with quote equality, well-formed Unicode and surrogate-safe boundaries checked server-side. Current record eligibility gates historical reads. Editing content does not silently relocate earlier captures. Independent personal prose survives an unavailable origin.

## Deliberate limits

This is a substantial working implementation, not complete parity with the original Minamo contracts. Imported-source excerpt admission/permissions, protected full archive/generation recovery, non-article exact reading domains and large-corpus pagination remain unfinished. Sources currently support original/link-only metadata and pinned-commit URLs; they do not pretend to import external source text. Web permits HTML/CSS with one bounded event handler, not arbitrary hostile JavaScript. See release evidence for actual browser/hosted acceptance limits rather than inferring them from source or green tests.

## Family-qualified retained reading

`canonicalReadingParts` is now shared by admission and the React reader for Journeys, Investigations, articles, areas, Notes, annotation own prose, Source reference descriptions, experiments and Runs. The compatibility export `canonicalArticleParts` remains available. Flags are bookmarks rather than a separate teaching-text rendition.

An anchor's existing `articleId` field is the target record ID; optional `recordFamily` defaults to `article` for old captures. New nonarticle anchors carry their actual family. Identity, history lookup, current eligibility and commit-time admission bind owner/family/ID/rendition together. Same text and IDs in different families cannot exchange renditions. Annotation origin quotations are never mapped as the annotation's own prose. Run code and output are separate literal canonical parts; experiment code is mapped without executing it.

Existing pre-generalisation nonarticle rows and revisions have no rendition. Reads project a deterministic `legacy-<family>-<id>-r<revision>` identity and resolve that exact saved history row; GETs never backfill or mutate data. Subsequent deliberate writes generate content hashes. Current active target eligibility still gates all retained reads.

Workspace URLs include family and can refer to the capture ID/family; the server resolves its saved anchor rather than inventing a quotation from current text. Invalid or unavailable captures fail closed. Opaque pending operations and local drafts remain separate from server acknowledgement. Notes and tool runtimes stay mounted across view changes.

Source-reference rendering only calls an already-full-commit GitHub file URL syntactically commit-pinned. It preserves the literal URL and line range and states that the bytes were not fetched or verified. Mutable and ambiguous references are never rewritten into guessed paths. External text remains link-only unless a separate source-use admission capability is implemented.

## Large collections and targeted reads

Workspace and literal-text query reads use keyset continuation by update time descending, then family and ID. Each page reapplies authenticated owner and current eligibility, record limits and a roughly 2 MB serialized-record budget (with space for legacy projections). Returned cursors carry a validated version/key and a scope hash for owner, read kind, query, family, Trash selection and page size. They are continuation data, not signed authorization tokens or immutable database snapshots. A concurrent edit can move an item to an earlier position; refreshing starts from current ordering.

The interface offers Load more, merges by family/ID and revision, and uses cancellable server queries rather than limiting global search to the initial collection. Direct record and related-context reads query eligible records independently of the initial 300-record page. Related summaries never become full editable Notes. A retained selected Note omitted from the page receives one guarded exact read, rather than being recreated as a new Note. Pending operations keep their original immutable identity.


## Protected workspace recovery continuation

`lib/recovery.ts` snapshots complete bounded product state and immutable image objects, verifies/stages a separate namespace and activates with pre-backup, pointer CAS and a trigger-maintained mutation watermark. `lib/generations.ts` supplies request-scoped namespaces without shared environment mutation. HTTP/MCP and SSR use the active namespace; browser scopes fence old reads/mutations and preserve earlier own-writing drafts for manual review. Current restrictions survive namespace changes. The original prototype lab remains outside product checkpoints. Portable JSON is a separate rights-aware, non-restorable export. See [release evidence](RELEASE-PROTECTED-RECOVERY-2026-10-21.md) for actual verification and limits; old milestone statements about source admission, exact reading and pagination are historical, superseded by the subsequent release sections and STATUS.
