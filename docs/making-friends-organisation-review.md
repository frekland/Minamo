# Making Friends: project organisation review

## Scope and evidence

Reviewed the current saved Making Friends Project, revision 7, through Minamo's read-only Project composition and content tools on 12 November 2026. This report describes structural findings without reproducing private messages or identifying the other participant. It does not claim a fresh browser or interaction test. The project was not changed.

The review concerns a Japanese conversation-learning project built through natural GPT use and subsequently reorganised once. The owner's experience of continued confusion is the starting point; structural analysis below gives plausible explanations rather than claiming to measure the owner's attention or learning.

## What is currently organised

The Project has three top-level sections:

1. **First conversation** groups four content blocks: introduction, reply and translation, message explanation, and a vocabulary episode.
2. **Kanji, mistakes & learning** contains one large block with **33 parts**, combining a later exchange and its translations with phrase-by-phrase explanation, grammar, example tables, two flashcard sets and other interactive practice.
3. **Speaking practice** groups two blocks for everyday conversation and review.

There are seven underlying content sections, all assigned to a visible composition block. The Project has no explicit record links in this snapshot, and one block is marked as a favourite. The later exchange's block alone has more parts than the other six underlying content sections combined (26). It is therefore a much larger unit of navigation and editing than its neighbours.

## Findings

### 1. One navigation item hides several different tasks — high priority

The second top-level section covers source correspondence, translation, language analysis, examples and practice under a topic-style title. A reader looking for a reply, a specific grammar point or a card set must first know that all of them live inside this single block. The first exchange gets four blocks; the later one gets one 33-part block. This unequal granularity makes the two conversations behave differently.

**Try:** give each exchange a consistent small landing page with distinct entry points for original and translation, reply, explanation, and practice. Keep original messages and their interpretation visibly labelled. Group long analysis into named subsections with a compact contents list.

### 2. Conversation timeline and learning activity compete for the top level — high priority

The first two sections represent particular conversations; the third represents an activity spanning them. The second section's title describes themes instead of identifying its place in the exchange. As more messages arrive, neither chronology nor practice ownership has a predictable home.

**Try:** use a stable **Conversations** area ordered by exchange, plus a separate **Practice** area linking back to the source exchange and exact passage. A short overview can state what each area contains and give the user a way to resume their chosen item. This is a proposed structure, not a claim about the user's preferred learning order.

### 3. Translation and explanation are mixed into long reading paths — medium priority

The current source contains full messages and corresponding translations, with substantial analysis and examples elsewhere in the same block. Comparing a sentence with its translation or returning from a grammar explanation to its source requires locating the relevant part among many siblings.

**Try:** keep each original and its translation adjacent or offer a clearly labelled toggle; link each explanation and example to the passage it explains. Preserve exact original wording and distinguish actual correspondence, suggested replies and hypothetical practice.

### 4. Practice is scattered and duplicated by placement — medium priority

One practice section has flashcards and a language-pattern exercise, while the later conversation's long block also contains flashcards, reveal exercises, pattern exercises and a dialogue. The labels do not provide a single obvious answer to “where do I practise this exchange?” The analysis identifies scattered placement; it has not established that the actual cards are duplicates.

**Try:** give every exercise a visible source and purpose. Offer a per-exchange practice entry and a cross-project practice index that points to the same underlying exercises rather than copying them. Keep the index optional and avoid inferring completion or mastery.

### 5. Future GPT additions need a predictable destination — high priority

A single content block accommodates many types of material, so a GPT can append useful material without deciding whether it belongs in a conversation, explanation, exercise or reusable reference. The current result is evidence of a placement problem; it does not establish which individual GPT instruction or save caused it.

**Try:** provide lightweight authoring guidance and destination choices when adding material: select an exchange, select a role, and create or extend a named section. Show a proposed outline for substantial restructuring, preserving existing block identities and links when possible. Ordinary authorised small edits should not require a mandatory preview.

## A possible revised outline

- Overview: purpose, recent exchange and direct links to Conversations and Practice.
- Conversations: one entry per exchange; each contains source and translation, reply and translation, and links to relevant explanations.
- Language notes: short, named explanations connected to their source passage; move genuinely reusable material to the Library only when the owner wants that.
- Practice: exercises grouped by originating exchange, plus an optional combined view.

This is a proposal for review, not an instruction to reorder or split the owner's Project. Any future reorganisation should preserve source texts, actual/suggested/hypothetical labels, existing editions, favourites, attached Notes, citations and stable destinations. It should preview the effects on existing links and provide a reversible path; no automatic data migration is recommended here.

## Relationship to legacy PR #99

[Legacy PR #99](https://github.com/frekland/Minamo-legacy-2/pull/99) covers connected workspaces, continuity and GPT authoring. Its prior browser review reported issues in an earlier Making Friends arrangement, including contextual reading aids, displayed Markdown and distance between a reply and its translation. Those are historical observations from a different inspection; this review did not reproduce or verify them on the current Project. PR #99 also notes that its navigation rail and Notes strip worked better than an earlier text-only report suggested: do not treat those as confirmed clutter.

This current revision adds evidence for the PR's future authoring and continuity work: a Project needs discoverable, granular destinations; source-linked practice; safe structural edits; and exact-edition continuity. Consider these as acceptance scenarios, not as a mandate to import the legacy Lab or to add mandatory checkpoints, progress dashboards or another persistence layer.

## Suggested acceptance checks

1. In a representative multi-exchange Project, find an original message, its translation, its reply, a named explanation and its exercise without reading unrelated sections.
2. Append a new exchange through natural GPT instructions and check that it has an obvious location and can be revisited without reshaping older exchanges.
3. Move or split a long block in a preview; confirm old citations, favourites, Notes and exact editions still open correctly, and verify undo/recovery before saving.
4. Use the same exercise from its exchange and the practice index without duplicating the saved material.
5. Check current desktop and mobile rendering, keyboard navigation and reading aids separately; reproduce any PR #99 visual defect before calling it current.

No product changes, browser acceptance or Project edits are included in this report.
