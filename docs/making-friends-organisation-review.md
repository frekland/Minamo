# Making Friends: project organisation review

## Scope and evidence

Reviewed the current saved Making Friends Project, revision 7, through Minamo's read-only Project composition and content tools on 12 November 2026. This report describes structural findings without reproducing private messages or identifying the other participant. The structural findings below are based on that earlier connector inspection. A separate, clearly labelled browser review follows. The project was not changed.

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

## Current browser review — 12 November 2026

**Evidence and limits:** Inspected the signed-in production Project in the connected Chrome browser at revision 7 on a desktop viewport. Navigated the three Project sections, the first conversation's introduction and reply topics, both speaking-practice topics, and all five numbered pages of the longer exchange. Tested a translation disclosure, a flashcard answer reveal and next control, dialogue progression, and a sentence-explorer selection. No Project content or saved data was edited. This was a targeted inspection, not exhaustive accessibility, mobile, audio, persistence or authoring acceptance.

### Observed navigation and organisation

- The desktop view presents the three Project sections in a left rail and the selected section's topics across the content area. The first conversation has four meaningfully named topics; the inspected introduction places its translation immediately after the original, and the reply topic similarly places its translation after the Japanese reply. This qualifies finding 3 above: separation is not universal, and a future design should retain these useful pairings.
- The longer exchange is **not one uninterrupted screen**: its 33-part block is presented as five selectable numbered topic pages. Page 1 places the original, translation, response and its English meaning in sequence, followed by analysis; subsequent pages include grammar, examples and practice, and page 5 includes an expression bank. This qualifies finding 1: pagination reduces the amount shown at once, but the pages repeat the same long topic name with only a number distinguishing them. In the desktop screenshot the labels were truncated, making their differences and destinations difficult to predict. Page 3 itself contained several substantial grammar explanations and example tables. Named, content-specific destinations or a compact contents list could make the existing pagination more useful.
- The two speaking-practice topics are clearly named. One includes a dialogue rehearsal and the other combines flashcards, an adjustable sentence and a speaking challenge. Practice also appears within the longer exchange, confirming dispersed placement in this view; this does not establish duplication or prove that a single central practice area is the preferred solution.
- The bottom Previous/Next controls identify the position among the **three Project sections** rather than the five numbered pages. This distinction is visible in the labelled controls but may be worth checking with users when navigating a long section.

### Observed interactions and rendering

- A reading exercise's translation disclosure opened and displayed its translation. A flashcard reveal changed the question to its answer; the Next control was activated, but its resulting card was not separately inspected before navigating away.
- Reveal next turn added a second dialogue turn and changed the counter from 1 of 8 to 2 of 8. Changing one sentence-explorer selection with the keyboard updated both the Japanese sentence and English meaning. Speech controls and slow-speech toggles were present; audio playback was not assessed.
- The current desktop rendering visibly displayed literal Markdown bold markers around a translation heading, corroborating that specific class of the historical PR #99 rendering concern in this view. This is an observation of the displayed content, not a diagnosis of the renderer or evidence that all Markdown is affected.
- Furigana was enabled in the inspected view and the global control was visible. Reading quality, alignment across examples, toggle behaviour and mobile layout were not systematically tested. The Notes strip and navigation rail were visible; this review does not establish that they are cluttered.

### Implications for future work

Keep the existing original/translation pairings and working practice interactions while making long content destinations identifiable by purpose, not just page number. Consider source-linked navigation between explanations and exercises as a testable design option rather than adding a new mandatory workflow. For PR #99 continuity and authoring work, test whether naturally added material can acquire a clear destination and retain stable links and editions; this browser review did not verify the underlying link model or persistence. Reproduce the literal formatting issue with representative content before choosing a fix.

## Relationship to legacy PR #99

[Legacy PR #99](https://github.com/frekland/Minamo-legacy-2/pull/99) covers connected workspaces, continuity and GPT authoring. Its prior browser review reported issues in an earlier Making Friends arrangement, including contextual reading aids, displayed Markdown and distance between a reply and its translation. Those are historical observations from a different inspection. The current browser review above separately reproduces literal bold markers in one heading; it does not establish the other historical defects. PR #99 also notes that its navigation rail and Notes strip worked better than an earlier text-only report suggested: do not treat those as confirmed clutter.

This current revision adds evidence for the PR's future authoring and continuity work: a Project needs discoverable, granular destinations; source-linked practice; safe structural edits; and exact-edition continuity. Consider these as acceptance scenarios, not as a mandate to import the legacy Lab or to add mandatory checkpoints, progress dashboards or another persistence layer.

## Suggested acceptance checks

1. In a representative multi-exchange Project, find an original message, its translation, its reply, a named explanation and its exercise without reading unrelated sections.
2. Append a new exchange through natural GPT instructions and check that it has an obvious location and can be revisited without reshaping older exchanges.
3. Move or split a long block in a preview; confirm old citations, favourites, Notes and exact editions still open correctly, and verify undo/recovery before saving.
4. Use the same exercise from its exchange and the practice index without duplicating the saved material.
5. Check current desktop and mobile rendering, keyboard navigation and reading aids separately; reproduce any PR #99 visual defect before calling it current.

No product changes or Project edits are included in this report. The targeted browser review above is not full browser acceptance.
