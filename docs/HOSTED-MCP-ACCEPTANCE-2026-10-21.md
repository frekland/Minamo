# Hosted MCP acceptance — 21 October 2026

After the owner reinstalled the Minamo V2 MCP, the client-visible catalogue exposed all eight implemented V2 tools. These checks used the real installed connector against the existing private V2 deployment (version 2), not a local handler or fabricated identity.

The isolated records used IDs `syn-accept-20261021-article-1`, `syn-accept-20261021-flag-1` and `syn-accept-20261021-note-1`. All titles began `SYNTHETIC TEST ONLY`; all records had `synthetic: true`. No original Minamo data was accessed or changed.

Observed checks:

- A command preview validated without writing; article creation returned committed revision 1 and a content-hashed rendition.
- Repeating the identical create operation returned `replayed: true` and only a record reference. Reading operation status returned the same receipt metadata.
- A multi-part Flag retained `😀 alpha\nbeta Ω` with UTF-16 offsets across two named parts. A malformed legacy range that disagreed with its first segment was rejected before writing; the corrected payload committed.
- Updating the article produced revision 2 and a different rendition. An exact read of the original rendition returned the original introduction. Flag context reported `retained-revision` and the exact original parts.
- A stale revision-1 update was rejected as a conflict after revision 2 existed.
- A separately created, unflagged Note was discoverable through the targeted Note query.
- Note Trash and restore advanced revisions 1 → 2 → 3. Final synthetic cleanup placed it in recoverable Trash at revision 4.
- After the article entered Trash at revision 3, Flag context retained the personal quotation but reported its target `unavailable`, with no retained article body returned. The Flag then entered recoverable Trash at revision 2.

All three acceptance records remain recoverable in V2 Trash; none is active. No permanent deletion was performed. Activity and operation receipts remain as honest synthetic test evidence.

This proves authenticated hosted MCP reads and writes through the shared domain command layer. It does not claim authenticated browser save acceptance. The connected local browser remains unavailable in this execution context, and the supported cloud browser is restricted to the internal preview. Development fixture browser tests provide no API identity; they cannot substitute for a hosted signed-in browser test.

The connector's short app description still says “foundation lab”; the actual reinstalled catalogue now contains the expanded typed operations. Future schema changes must still be checked against client-visible provisioning.
