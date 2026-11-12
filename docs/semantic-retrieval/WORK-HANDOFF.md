# Minamo V2 — Server semantic retrieval: Work handoff

**This is an owner-requested implementation brief, not a feature that has already shipped.**

Read [SERVER-SEMANTIC-RETRIEVAL-IMPLEMENTATION.md](SERVER-SEMANTIC-RETRIEVAL-IMPLEMENTATION.md), then current STATUS.md, AGENTS.md, issue #1 latest receipt and docs/SOURCE-SYNCHRONISATION.md. Use the latest actual Site-native/GitHub sources; do not reset to the reviewed V9 baseline (V8 remains the interaction-regression baseline).

**Decision:** do server-accessible embeddings/retrieval first, so GPT can use it via MCP even while Minamo's browser is closed. The preferred conditional stack is Cloudflare Workers AI + Vectorize + authoritative V2 D1. Transformers.js/browser-only retrieval is not a prerequisite or substitute.

**Preserve:** V9 generation-safe checkpoints, restore namespace/permission floors and stale-generation write fences. Every vector, semantic index job and candidate read must bind to the active generation; after restore, rebuild the derived index from newly active D1 records rather than reuse old generation vectors.

**Also preserve:** exact concept aliases and literal search; authenticated permissions and Source revocation; canonical rendition/UTF-16 anchors; authored purpose-labelled relationships; Flag/Annotate UX; rich Notes/docking/recovery; idempotent CAS receipts; the existing eight MCP operations and owner-private Site. All semantic results are suggestions, not automatically authored relationships or evidence of learning.

**Follow this order:** verify Sites-managed binding/provisioning, permissions, usage/cost and data policies → design D1-derived index ledger and idempotent index maintenance → prove permission-fenced server hybrid retrieval and fresh-client MCP from a closed website → add small labelled suggestions to existing search/relationship surfaces → run preservation/revocation/performance/Android tests → private release if gates pass.

The binding is **not verified available on Minamo's Sites deployment**. Do not provision paid/external services or invent a secret/alternate Site to bypass missing capabilities. If blocked, record the blocker and preserve current search rather than delivering browser-only inference under this commission.

Reconcile with V9's implemented protected checkpoints and subsequent ongoing downloadable/importable recovery work. This documentation is not an instruction to interrupt or undo work already completed. Do not modify original Minamo or cyber-learning.

**Documentation-only PR:** no runtime imports, dependencies, D1 migration, model usage, vector index, private content access, Site deployment or original-project write.
