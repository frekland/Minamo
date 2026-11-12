# PR #99 — language and permissions slice (12 November 2026)

Follows private Lab V162 source 400e23db49a9aad4274f52b230c063b41573ad49. Production V149 unchanged; draft PR; public/private reconciliation and tldraw remain owner-deferred.

## Implementation

- Japanese sentence pronunciation controls sit beside the source when space allows, with existing Slow, play/stop and status behaviour. Longer/mobile content wraps naturally. No speech-generation or voice-model authority is changed.
- Flashcards keep Previous / Reveal / Next as primary actions; reverse, cloze where authored, shuffle and reset are under Card options. The card itself still flips, its explicit accessible name and Space/arrow keyboard controls remain, and long content determines its natural height.
- Each GPT & context setting now explains its practical effect beside the control. Project preview-only and global MCP read-only have distinct descriptions. Cache/refresh and permission-enforcement details are on demand. Descriptions are associated with their fieldset for assistive technology.
- Search cards use calm display titles for explicitly synthetic records and avoid repeating the whole title as a second title-match excerpt. Canonical saved titles and exact search evidence remain unchanged.

## Saved Lab content, distinct from deployed source

Japanese Live · Ten evolving conversations changed from r11 to r12 to arrange all 46 existing canonical parts into a usable current path and adjacent Earlier comparisons topics, retaining the six main navigation sections. Current retelling, final conversation pair, final practice and mixed card set no longer require scrolling past every earlier example. All earlier content remains in canonical comparison sections as well as exact saved history. r13 corrects the remaining prompt that incorrectly implied already-visible Japanese needed opening. This is synthetic GPT-authored presentation work, not a learner conversation, achievement or newly observed language performance.

A competing update based on r11 was rejected with revision_conflict after r12. The existing independent Note remains r1 and retains its original two r10 page pins; exact r10 readback still resolves both dialogue/a3-s9-full-story and grammar/a3-grammar-sequence. Nothing silently upgraded those citations to r12/r13.

## Validation

22 focused tests pass across settings-help-redesign, settings-help-navigation, practice-reader-language, japanese-furigana and collaboration-preferences. The one relevant stale navigation assertion was updated to check the actual accessible primary destinations and single Settings control. Other eight old Home/Continue assertions remain outside this run. Typecheck and build pass. Tests include cached MCP save denial, current-rights lexical occurrence reads and unchanged source offsets, but do not alone establish audible speech quality or deployed mobile behaviour. Browser/MCP results after publication belong in the PR acceptance report.
