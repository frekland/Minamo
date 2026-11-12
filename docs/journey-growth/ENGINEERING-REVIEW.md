# Independent engineering and UX challenge

This assessment was performed by a separate review context that did not implement the evaluated capabilities. The review read the owner commission, repository instructions and changed production code; ran synthetic D1/MCP, codec, search and context tests; and used a separate real cloud-browser tab on the development-only `/preview-notes` fixture. All inspected writing and screenshots were synthetic. This is not a human learning study, authenticated production acceptance, physical Android assessment or proof that the installed production catalogue has refreshed.

## Findings and corrections

| Finding | Reproduction / impact | Disposition |
|---|---|---|
| Ordinary Unicode search coverage regressed | New ordinary-text matching used the ASCII-only alias fold. `CAFÉ` failed to match `café`; Greek case also failed. | Corrected: ordinary prose has Unicode case folding with source UTF-16 offset mapping; canonical aliases retain their separate explicit case contract. Independent regression passes. |
| Typed terminal evidence could become literal code | An unclosed Markdown fence in a preceding `noteContent` markdown block swallowed the following deliberate terminal marker. Compilation accepted a body with no semantic terminal capture. | Corrected: compilation verifies the expected typed captures survived parsing and rejects incompatible surrounding fences with retained-input repair guidance. Independent regression passes. |
| Recently active older Investigation could disappear from overview | Candidate breadth was bounded by Investigation authoring time before examining personal activity. A fresh Note on the seventeenth older task could be omitted. | Corrected: stage/Investigation candidate selection now uses explicit personal-link activity before breadth limits, followed by current-rights projection and ordering. No parent revision or checkpoint is fabricated. Dedicated greater-than-sixteen-context regression added by the continuity implementer. |
| Supporting-reading navigation dropped live task context | New Note context links initially performed full navigation without the layout task state. | Corrected in source: ordinary clicks use existing internal navigation; modified-click links retain their exact destination. Task and reading are still distinct saved associations. |
| Closing an unsaved terminal replacement lost the pasted edit | Real browser: Edit output → enter replacement → Close · keep pasted text → Edit output. The original output returned instead of the pending replacement. | Corrected and independently browser-retested: the changed textarea survives reopening with Replace output mode, and applying it updates both actual editor and reading representation while surrounding prediction/interpretation stays intact. |
| Continue-writing action at terminal end could use a stale position | Parent browser acceptance found an out-of-range ProseMirror position on a second terminal block. | Corrected through transaction-level terminal identity lookup and a dedicated regression. Parent owns final browser retest evidence. |

Follow-through review also found that a retained replacement could become a duplicate when resumed in original-source mode, and that one per-Note pending slot could overwrite a different capture’s pending edit. The source now replaces the exact marker span by identity and retains separate pending values per capture. Same-capture close/reopen was independently browser-retested; the source-mode and multi-capture paths received source review plus implementer regression coverage.

Independent regressions are in `tests/journey-growth-independent-challenge.test.mjs`. They were observed failing before the corresponding fixes and passing afterwards. A separate five-suite run of the implementation's synthetic Note interoperability, task+reading links, natural resumption, terminal codec and search tests passed 23 tests; a later independent terminal/challenge rerun passed 16 tests, including the end-caret and pending-edit regressions. `pnpm run typecheck` also passed in the reviewed working tree. Final aggregate validation belongs to the implementation report.

## Engineering judgment

The semantic terminal representation is appropriately narrow: an existing versioned Note body encodes an atomic capture with an exact stable ID and original output. The display escapes control interpretation while preserving original read/copy data. HTML-like text remains text. The typed input compiler does not infer observations, execute commands, create checkpoints or introduce a second durable record system. Expected revisions, generation fences and immutable operation receipts remain on the shared command path; old Note renditions remain exact evidence.

The new resumption path separates identity discovery, grouped Journey triage and exact task detail. Ambiguity remains explicit. New Notes, marks and terminal pointers do not masquerade as formal Developments, and timestamps are not called “last seen by GPT.” Current source-rights projection precedes surfaced prose/quotes. Full terminal output is deferred to an exact Note/capture read. Breadth and partial-history notices remain material limits, rather than proof of complete autobiographical memory.

Search now explains the eligible matched field and passage, including literal `Rust` inside `trust`, late Note text and technical punctuation/aliases. It preserves lexical coverage rather than claiming semantic relevance or changing the corpus into an inference service. Rights-revoked passages cannot remain as hidden-text snippets.

## Independent browser UX observations

The actual terminal panel is visibly distinct from prose, starts compact and keeps a concise header/preview. Prediction appears before the panel; contradiction, interpretation and next question remain separately legible afterwards. Optional metadata is tucked away; the basic paste action does not require a form. Editor and saved-reading representations agree after a replacement. Editing, closing and reopening now preserves the pending text.

The local HTTP preview did not expose a working Clipboard API. Clicking Copy output showed the explicit fallback message and preserved the capture; this is a tested failure state, not successful exact clipboard-copy evidence. Exact output preservation was checked through codec and MCP/D1 tests. HTTPS production clipboard success, physical touch/screen-reader use and the full authenticated three-mode persistence loop remain release/device checks. No production permission or data mutation was needed for this review.

## Residual limits

Journey discovery and activity remain bounded lexical/explicit-link reads; a name absent from eligible titles may require clarification. An overview is triage, not a replacement for reading the relevant exact task/evidence. Source-code and isolated MCP tests cannot certify installed-client schema availability. The browser fixture proves production-component behavior with synthetic in-process source, while D1/MCP tests separately prove persistence contracts; they must not be described as one authenticated hosted browser save.
