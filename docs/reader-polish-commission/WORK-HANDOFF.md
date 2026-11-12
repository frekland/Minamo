# Work/Sites execution handoff — CodeMirror 6 and reader polish

**Repository:** `frekland/minamo-v2`  
**Implementation branch:** `commission/codemirror6-reader-polish-20261023`  
**PR:** the draft implementation commission opened from this branch into `main`.  
**Primary instructions:** [IMPLEMENTATION-COMMISSION.md](IMPLEMENTATION-COMMISSION.md)  
**Acceptance gates:** [ACCEPTANCE-MATRIX.md](ACCEPTANCE-MATRIX.md)  
**Read-only evidence:** [PR #23](https://github.com/frekland/minamo-v2/pull/23)

## Copy into ChatGPT Work when ready to execute

> @Sites @GitHub @Context7 — Execute the **CodeMirror 6 + targeted Minamo V2 reader polish** implementation PR on branch `commission/codemirror6-reader-polish-20261023` of `frekland/minamo-v2`. Read `docs/reader-polish-commission/IMPLEMENTATION-COMMISSION.md` and `ACCEPTANCE-MATRIX.md` and follow them in full. Consult PR #23 solely for the specific in-scope evidence IDs, while keeping PR #23 **draft and evidence-only**.
>
> Implement the actual code and tests on **this implementation PR branch**, not an additional planning branch or a different PR. Ship **CodeMirror 6** for readable source code, preserving Minamo's exact UTF-16 passage/Flag/Annotate mapping, and correct C-01, C-02 (layout partial), C-03, C-04, C-08, C-09, C-10, C-12, C-14 and A-10 as bounded in the commission. No highlight.js substitution, no V1 UI transplant, no unrelated redesign or learning-history mutations.
>
> Complete implementation, integrated regression tests, actual desktop/mobile browser verification, independent engineering + learner-experience review, corrections and evidence mapping in **one continuous task**. Do not ask for interim planning/approval or produce repetitive file-by-file status messages; exercise judgment and correct discovered regressions. Do not execute unrelated PR #12, PR #14 or other backlogs. Reconcile branch/main changes safely; do not force-update shared branches.
>
> When acceptance gates are demonstrably passed and this Work invocation authorises release, reconcile verified GitHub/native source tree, merge this implementation PR and deploy the exact tested source to the existing **owner-private Minamo V2 Site**, following `docs/SOURCE-SYNCHRONISATION.md`. Do not deploy V1 or touch V1 records. If permissions or a genuinely required MCP reinstall prevent a verified step, explain the precise blocker rather than claiming completion; only involve the owner for genuinely necessary actions.
>
> Deliver a concise receipt with exact commits, tests, browser observations, deployment/client-MCP state, unresolved limitations and per-evidence-ID pass/partial/not-fixed outcomes. Keep PR #23's historical observations unchanged and treat a tested source change as distinct from owner-observed acceptance.

## Expectations for Work's final report

- CodeMirror integration mode: complete read-only `EditorView` vs tested CM6 syntax-rendering fallback, reason, and canonical selection proof.
- Per-finding changes and before/after visual observations, explicitly including real Android-width **connected** diagram rendering and source-code legibility.
- Explicit network consent check before third-party media activation, and preservation of Flag/Annotate.
- Validation contract tests and client-visible MCP result (or separate truthful pending state) for A-10.
- Full `pnpm run typecheck`, `pnpm test`, `pnpm run build` results and targeted browser screenshots.
- GitHub commit/PR/merge and existing V2 private Site release identifiers only if verified.
- No user-authored learning content or private data in documentation, logs or public links.

**Until this handoff is actually invoked, the PR remains an unimplemented commission.**

