# Single Work task — Project context, reading and MCP integration (A–C)

**Owner commission:** one integrated source, UI, MCP, testing and optional isolated-Lab-acceptance task. **Starting code is present in this PR; not yet qualified.**  
**Source baseline:** existing V175 PR #7 `feature/project-reading-organisation`, starting at `1fdfb8bd5f5a66b820921009def67a0cf6e519f9`.  
**Implementation branch:** `feature/project-context-reader-mcp-v1`, stacked on PR #7.  
**Related product evidence:** current public draft PR #8 and legacy Minamo-legacy / Minamo-legacy-2 PR #54, #73, #76, #77, #99.

## What is already coded

This draft source change is a bounded vertical slice of the three proposed increments:

### A — Optional content-first reader

- `lib/project-learning-map.ts`: shared exact topic/context/purpose projection; no new persistence, no inferred mastery/next step; original block ID fallback for existing Projects.
- `app/project-context-overview.tsx` and CSS: optional **Explore project** view, subjects with expandable related pages, purpose indexes, and explicit continuation action only when authored.
- `app/project-reading.tsx` and CSS: retains existing reader/navigation and adds the optional alternate exploration path. Contextual related links appear on the reading page only for explicitly grouped contexts.
- Existing source/translation/interactive rendering remains the canonical `Reader`, not a cloned learning renderer.

### B — Optional relationship metadata

- `lib/project-composition.ts`: reusable `readingPageSchema`, optional `contextId`, `contextTitle`, exact `relations` and explicit `continuation.target`, with target-existence and duplicate checks. Existing records do not require a migration or metadata rewrite.
- `lib/project-reading-topics.ts`: preserves those fields in the existing shared topic projection. Cross-section `layoutId` from V175 remains authoritative.
- Relationship kinds are a deliberate small initial set (`explains`, `practises`, `corrects`, `continues`, `related`); do **not** start a generalized graph/schema migration without evidence.

### C — MCP reading and targeted authoring

- `lib/project-service.ts` and `lib/domain-handler.ts` expose:
  - `get_project_learning_outline` — bounded metadata-only Project map (no full lesson text), exact revision/purpose/relationships and explicit continuation.
  - `get_project_learning_reading` — exact, owner-scoped typed parts for up to eight selected reading pages or one context; oversized requests reject rather than truncate.
  - `append_project_learning_material` — one owner-requested new canonical Project block with 1–20 typed parts and 1–10 authored pages, current revision/generation and retry-stable operation ID; preview and apply. Relies on existing `applyProjectUpdate` guards/receipts, not a Note or parallel store.
- `tests/project-learning-map.test.mjs`, `tests/project-learning-mcp.test.mjs`: initial pure projection/reference and end-to-end fixture coverage.

**Current status:** code committed, NOT typechecked/tested in this conversation and NOT deployed. Work must treat the branch as an implementation candidate, fix test/build/runtime issues, and independently assess the UX before calling anything accepted.

## Required single Work task execution

1. **Reorient and reconcile:** Inspect this PR and current PR #7; confirm exact head and deployed V175 source. Keep PR #7 as baseline; review any newer changes and reconcile with fresh repo state before editing. Do not mistake the separate legacy PR #99 Lab source for a compatible baseline. Preserve all other source/history.
2. **Compile, run focused tests, fix:** install with pinned frozen lockfile; run `pnpm run typecheck`, `node --test tests/project-reading-topics.test.mjs tests/project-structure-edit.test.mjs tests/project-learning-map.test.mjs tests/project-learning-mcp.test.mjs`, `pnpm run build`. Repair any failures. Also run applicable existing MCP/project/read/rights/navigation regressions, not the full suite by default.
3. **Contract and security audit:** Confirm the new MCP tools are discoverable and callable through normal owner/generation admission; exact historical reads; explicit-owner-only authoring; Project preview-only and global MCP read-only preferences; CAS, replay/idempotency, protected blocks, retained editions and no unrelated mutations. Check that the compact outline does not leak full texts, hidden topics or private cross-owner data, and that selection caps fail explicitly without silent truncation. Add negative tests for invalid relationships, missing source/part, wrong owner, long text, stale revision and denied writes.
4. **Authoring and UI implementation review:** Look for incorrect, overly thin or non-idiomatic code. Validate readingPages cross-view navigation and related-topic links, accessible semantic controls, page return/focus, responsive 320/390/768/wide views and no regression in existing native reader/TTS/furigana/interactive content. Refine the design if the alternative is simply another cluttered index. Avoid presenting a “continue” suggestion unless the exact saved metadata supports it.
5. **Use three representative substantial Projects** (synthetic in the Lab): conversation-language; long computing with real code/observations; research/creative with conflicting or revised interpretations. Compare current reader vs Explore mode on actual learner tasks: locating originals, finding grammar/other references, following an exact source, resuming from explicit continuation, extending a topic, returning from another app/page. Record what is genuinely easier/harder, not just screenshots of pretty states.
6. **Actual cold MCP test:** From a genuinely new conversation, use outline → exact selected reading → teach/answer grounded in source. Then, only for owner-authorized synthetic test data, preview and apply a bounded new topic, read back exact source relationship, old edition, contribution counts and unchanged previous content. Repeat an operation to test replay; reject stale/wrong-owner/permission-denied attempts.
7. **Optional isolated Visual Lab deployment** only after source compatibility, authentication/bindings and protected Lab data are reconciled and verified. The Lab is not necessarily on V175. Do not overwrite its unique features or data, change production, or migrate owner content as a shortcut. If Lab parity is unsafe, use an isolated preview/harness instead and document the blocker. The owner wants to **try the experience**, but production promotion requires a separate explicit decision.
8. **Finish the draft PR:** Commit fixes, tests and visual/browser/MCP evidence with exact version/source hashes, update the status and remaining limitations, and give the owner a straightforward browser URL to try if a safe Lab preview was published. Keep the PR unmerged until owner acceptance.

## Acceptance gates

- Existing Projects remain readable unchanged without a migration; source/translation/interactives and original part IDs are preserved.
- Both website and MCP use the same source-bound Project map; no indexing copied canonical content.
- The new reader is *more digestible*, not just a new layer of tabs/panels. Responsive and keyboard access are usable.
- Two-step MCP retrieval returns the exact relevant material with clear revision/coverage, no hidden/unavailable part leakage.
- Targeted append lands in the intended Project context/purpose without manually rewriting unrelated blocks; can be safely previewed, committed and replayed; never invents learning status or writes a Note.
- An explicit continuation target is shown only when saved; a missing one is honestly absent.
- Strong permission, provenance, source-identity and historical-edition coverage.
- Comparative acceptance must be observed in browser and actual MCP, not inferred from unit tests.

## Critical design risks to resolve, not conceal

- The V175 base PR #7 is deployed to the main private Site but **unmerged** publicly, and Lab V165 is an independently evolved source/data branch. Deploying this feature over Lab without reconciliation is unsafe.
- The initial MCP outline obtains record state via `getProjectComposition`, which may still perform expensive reference/pin scans internally. Output is smaller, but **retrieval efficiency is not measured or proven**.
- Existing long blocks fall back to block-derived contexts; that is safe, but may display too many entries. The alternative could need better progressive disclosure, not more global chrome.
- Context and continuation metadata are optional; existing user content is *not* automatically reclassified. Inferred relationships must not be silently saved.
- The initial append operation creates one new canonical block under an existing layout. It is **not yet** a complete general-purpose edit/merge/rewrite of arbitrary existing sections. Keep `edit_project_globally` / `apply_project_update` available for special cases.
- The first two tests are initial coverage, not comprehensive independent acceptance. Work should expand them, especially for rights and UI interaction.
- Do not confuse a successful MCP reading projection with proof the browser shows exactly the same navigation or a good learning experience.

## Final Work response requested

Provide the draft PR URL/head, exact tested baseline, commits, concise implementation summary, focused tests/typecheck/build results, comparison of original vs alternate reader (desktop/mobile), cold-chat MCP outcomes, any safe Lab URL, and a clear go/no-go recommendation for future production integration. Distinguish actual deployment from merely prepared source, and accepted behaviour from known gaps.

## Copy-ready Work instruction

> Continue the single integrated Minamo Project context/reader/MCP implementation in `frekland/minamo`, branch `feature/project-context-reader-mcp-v1` (stacked on V175 PR #7). Follow `docs/PROJECT-CONTEXT-V1-WORK-COMMISSION.md` in full. This is a code completion, test, critical visual browser/MCP acceptance and safe isolated-preview commission, not another planning-only review. Keep all three A–C layers in one coordinated task. Do not change production or real learner Projects. Fix regressions, add negative tests, compare old/new Project experiences with populated cross-domain projects, reconcile Lab source before any Lab deployment, and update the existing draft PR with honest implementation/acceptance evidence. Leave merge and production promotion for my review.
