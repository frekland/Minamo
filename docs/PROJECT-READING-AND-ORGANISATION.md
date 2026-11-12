# Project reading and task-based organisation

## Reading fixes

Japanese automatic readings now use a pinned, locally bundled Kuromoji 0.1.2/IPADIC dictionary in one same-origin worker, rather than relying only on a short curated list. The worker is loaded lazily for Japanese text when furigana is enabled. It fetches only the bundled JavaScript and dictionary; no passage is sent to an external service or persisted. Requests and in-memory results are bounded. Worker errors/timeouts fall back to the curated readings and literal source.

Only known dictionary tokens with usable kana readings are annotated. Unknown words remain literal. Exact inline authored readings suppress automatic annotation, while the existing typed semantic-reading renderer remains available for explicit contextual annotations. Kana/kanji alignment preserves the full canonical source. Irregular whole-word counters such as 一人/二人 must not acquire per-character IPADIC readings. Machine analysis is not infallible, particularly for names and ambiguous words; explicit contextual readings remain authoritative.

The package, lockfile and asset-preparation script reproduce the dictionary build assets under ignored `public/runtime/kuromoji`. The package's Apache licence and IPADIC notice are copied alongside it. Official package/browser documentation: https://github.com/takuyaa/kuromoji.js .

Topic buttons now wrap their complete titles rather than ellipsising in a horizontal strip. Source-action buttons have content-sized widths. The learning-space label precedes its icon, with an intrinsic-width button overriding the shared fixed icon geometry; it cannot spill into the adjacent furigana control.

## Organisation contract

A global edit must inspect all current parts, map them by purpose and evaluate the resulting top-level outline. Merely renaming numbered pages is insufficient when the owner asks for a new organisation.

`readingPages.layoutId` optionally places a page into another top-level composition section. The canonical block keeps its source section/part IDs, editions and references. This allows different parts of one old long block to appear under Grammar, Vocabulary or Practice without copying content or physically splitting passage identities. The target layout must exist; hidden destinations are not exposed. Every part still occurs exactly once across the block's pages.

The global-edit preview returns `organisationReview`: the actual shared reading-topic outline, purpose/part mapping, and a warning when source-message material shares a destination with explanation or practice. This is structural evidence, not a screenshot. Source words, saved learner material and exact retained editions keep the existing protections.

For a conversation-language project, a useful owner-selected outline is:

- **Messages:** received text and replies, with translations close by. Preserve original wording and truthful source labels.
- **Grammar:** named explanations and examples, linked to the passages they explain.
- **Vocabulary:** useful words and expressions with contextual readings and meanings.
- **Practice:** sentence variation and conversation rehearsal.
- **Tests:** optional recall cards and independent-use checks. No invented results, scores, completion or mastery.

Adapt the roles for different subjects. Omit empty categories; do not manufacture content to satisfy a template. New manuscripts should use meaningful native headings from the start; existing projects can use page-level layout placement. Keep dates/provenance detail out of primary learning prose unless it is necessary to understand the material. Learner Notes remain independent of this organisation.

## Acceptance boundaries

Synthetic tests cover actual browser-worker bundle/dictionary loading, representative compound and inflected readings, exact text preservation, irregular-word handling, unknown/explicit-reading behaviour, cross-section routing, hidden targets, global-edit preview, ownership, CAS and retries. The worker test uses a local VM/XHR harness; it is not a claim of browser visual or mobile acceptance. Browser control still failed to initialise during this work. Current screenshots supplied by the owner identified the clipping/overlap; CSS changes require a user/browser smoke check after release.

Making Friends is reorganised through the revisioned global-edit tool after release, with complete part coverage and source text preservation checked by readback. No private correspondence is included in this engineering document.

## Release checks

- 19 focused reading/tokenizer/organisation/permissions tests passed; five header/canonical-offset tests passed.
- Typecheck and public/native production builds passed. Frozen public lockfile installation passed. Native build reused that verified dependency tree; a separate native install refused the checkout-local symlink, as designed, rather than replacing dependencies outside its root.
- The wider Project overview smoke tests reproduced two unchanged V174 failures (legacy saved-work continuation expectations and the removed “Checking saved work” text). These are not new failures from this change. Two previously stale header tests were updated to the actual current four-scope control and the requested label placement, and now pass.
- Full historical suite and real browser/mobile/audio acceptance were not claimed. The actual browser worker bundle was exercised with its actual dictionary in a VM/XHR harness.
