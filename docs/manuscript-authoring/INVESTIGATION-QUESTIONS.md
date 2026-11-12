# Investigation question declarations

An Investigation can have a short navigation title and a fuller explicit question:

```markdown
# Count differences

Question: Which differences in error text should the counter preserve?

Compare one controlled change at a time and explain your prediction.

## Try a variation

Change letter case before trying trailing whitespace.
```

The compiler recognises a literal `Question:` label (case insensitive) at the start of a dedicated top-level introduction paragraph, before any heading other than the document title. It projects the paragraph's visible question text into `learningShape.question`, preserving punctuation, case and wording. Markdown formatting contributes its visible text. Whitespace around the value is trimmed; line breaks within the paragraph remain line breaks. The original Markdown and its rendered paragraph remain intact.

Code blocks, inline-code labels, quotations, lists, tables and paragraphs after section/example headings do not declare metadata. Do not put the label and its value in separate paragraphs. No other paragraph is inferred to be a question.

The value must contain 1–1000 UTF-16 characters. An absent declaration uses the title. Identical repeated declarations project one value with an advisory. Empty, over-limit or conflicting declarations use the title without choosing a winner. The advisory includes the document path, source offsets and repair guidance; the complete source is retained. Preview and publication use the same compiler.

For an unrelated targeted update, absence preserves an existing non-title question. A new valid introduction declaration intentionally replaces it; an invalid explicit declaration instead takes the documented title fallback. Targeted updates still require exact `document.target` and matching `existing` revision declarations. Existing section/part identity preservation and CAS apply. No genuine records are inferred or backfilled.

`tests/investigation-question.test.mjs` covers the structural exclusions, duplicates and fallbacks, exact source retention, actual local MCP preview/publication, guarded revisions and unchanged section/part identities.
