# Project presentation and global MCP editing

This change follows the organisation evidence in [PR #4](https://github.com/frekland/minamo/pull/4) and the presentation/authoring boundaries discussed in [legacy PR #99](https://github.com/frekland/Minamo-legacy-2/pull/99). It changes application capabilities; it does not reorganise any saved personal Project automatically.

## Authoring and presentation

A content block can define `readingPages`: stable page IDs, short meaningful titles, ordered canonical `partIds`, optional `purpose` (overview/source/translation/explanation/practice/reference), optional `provenance` (user-reported/GPT-authored/hypothetical/source-excerpt), and an optional exact Project `source` passage `{sectionId,partId}`. These labels are authored attribution, not independent verification. Each part must occur exactly once across that block's pages. Source identities must exist in the Project. Existing Projects retain their current pagination until explicitly edited.

The frontend uses page titles and declared part order, exposes full titles on hover, distinguishes the bottom section count, and offers a source-topic return when available. Parts keep their original section/part identities. `get_project_composition.presentation` returns the same topic projection, with identities and roles, and explicitly identifies it as structural information rather than a screenshot or interaction test.

Authoring guidance favours concise entry points, meaningful destinations, adjacent source/translation where helpful, overview before detailed reference, source-linked practice and compact truthful provenance. It imposes no subject-specific template, checkpoints, progress claims or new Note workflow.

## `edit_project_globally`

Read the current Project, then supply:

- `projectId`, `expectedProjectRev`, `expectedGeneration`, retry-stable `operationId`;
- `mode: "preview" | "apply"`;
- complete `composition`;
- optional title/description/body and complete revised `contentSections`;
- optional `repairMarkdownEmphasis: true`;
- `explicitOverrideIds` only for specifically owner-authorised changes to protected direct edits.

The tool reuses the existing atomic Project writer, owner admission, generation/revision checks, Project editing preferences and operation receipts. Preview writes nothing. Identical apply retries recover the receipt even after the Project head advances. Read-only MCP mode permits previews and denies saves; Project preview-only policy continues to apply. Notes and other records are outside this tool's write contract.

Every existing block ID, canonical source/reference and layout lock must survive. Favourites, protected IDs, code packages and Work threads are retained when omitted and cannot be silently replaced. A revised content section must retain each old part ID and kind. Canonical sections omitted from `contentSections` remain untouched. Existing links, learner contributions and retained editions remain independently stored. Source permission and direct-edit protection still apply; a global request is not an automatic override.

`repairMarkdownEmphasis` explicitly converts balanced `**bold**` in plain paragraph/callout content into native UTF-16 strong spans in a new saved edition. It does not reinterpret code, excerpts, unavailable parts or parts with existing inline/semantic metadata. Old editions remain exact. Other Markdown syntax is not implicitly supported in plain text; use native inline/semantic fields or the manuscript compiler.

## Reading correctness

Automatic furigana now recognises 今朝 and 何時 as whole words, preserves authored inline readings without double annotation, and avoids dictionary fragments inside unknown kanji compounds. This is a conservative curated aid, not a comprehensive Japanese morphological reader. Explicit contextual semantic readings remain the preferred authoring path.

## Verification and remaining acceptance

Focused tests exercise named-page coverage, ownership, no-write preview, explicit direct-edit protection, CAS, receipt replay, preservation of canonical content and old editions, optional native formatting repair, and read-only preference enforcement. Existing Project history and collaboration-preference regression checks also run. Typecheck and production build are required for release.

Installed-plugin discovery and an actual personal-Project edit require a plugin reinstall after deployment. Browser visual, mobile, keyboard, TTS and screen-reader acceptance are separate and are not inferred from these tests. This change does not add a screenshot service or claim that structural MCP output measures visual layout. Exercise reuse continues to use existing exact references; no duplicated practice store is introduced.

## Release receipt — 12 November 2026

- Public implementation: `4ee2831f26c2e91e8e40c0d1c64219687bed06d4`, PR #5.
- Native source: `79f1617fd466b07c79fcf475ec6e272eff648c5a`, based on deployed V173 source `a7d4c6cdf5ce8a298ed9d16ade356cd6bd411f70`. All changed shared-code files had identical public/native baselines; no native-only adaptation was needed. Existing hosting identity/bindings/access were preserved.
- Existing private Minamo Site published as **V174**; deployment `appgdep_6af6007382348191a0125ae3e0fff0c8` succeeded with MCP enabled. URL: https://minamo.jscymru.chatgpt.site
- Verification: 22 focused Project/history/preferences/reading tests passed during development; final focused editor/reading/furigana checks passed 8/8 after the final features. Final `tsc --noEmit` and production build passed. No full-suite run.
- Live installed connector `get_layout_capabilities` returned the new `presentation` contract and `edit_project_globally` guidance after deployment.
- The new tool is not in this conversation's cached installed catalogue. Reinstall the Minamo MCP plugin after this deployment; use a fresh conversation if the catalogue remains cached. Installed new-tool invocation and browser visual/mobile/TTS acceptance remain pending. No personal Project was mutated in this implementation/release.
