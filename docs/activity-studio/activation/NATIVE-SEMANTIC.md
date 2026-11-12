# Native semantic authoring — bounded content task

Prerequisite: owner-approved candidate release and actual refreshed native content schema. Use the exact code ref in INTEGRATION-RECEIPT.md; contracts are lib/semantic-content.ts and semanticContentJsonSchema in lib/domain-handler.ts. No migration or new renderer is needed.

Author an original paragraph with contract minamo.semantic.v1, kind ruby, language.version1, exact language.text/language/direction/spans; each span has exact UTF-16 start/end/base/reading/origin. Or author a code part with kind math and the validated minamo.math.v1 expression. The part text is canonical; the server derives omitted text or rejects mismatches. Use the existing guarded command or explicit new manuscript declaration, retain the operation ID, read exact persisted rendition and compare bytes. Do not infer learning from publication.

Check `node --test tests/semantic-content.test.mjs tests/semantic-rendering.test.mjs`; browser-copy exact base text and Flag/Annotate before claiming device support. Rollback the specific synthetic content through recoverable Trash; do not remove genuine source or change permissions.
