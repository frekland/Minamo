# Minamo — fresh-chat Project continuity and learning UX follow-ups

**Status:** Evidence and candidate improvements; no implementation proposed for merge yet.  
**Date:** 12 November 2026  
**Related:** [PR #4](https://github.com/frekland/minamo/pull/4) (Making Friends organisation), [merged PR #5](https://github.com/frekland/minamo/pull/5) (named reading pages and guarded global editing).  
**Owner workflow:** Ordinary conversations should find, teach from and selectively extend Project content without imposing checkpoints, learner scoring, administrative diaries or mandatory Notes.

## Why record this separately

The owner ran a **fresh conversation** that read an existing Japanese learning Project, held an adaptive practice conversation and, only when later explicitly asked, saved reusable material back into the **Project itself**. The owner exported that interaction to Markdown. A separate MCP read compared the export with the actual revisioned Project. This document captures possible product improvements and an upcoming second fresh-chat continuity test without presenting possibilities as defects or completed implementation.

**Privacy:** This public repository document contains no original private messages, names of correspondents or verbatim learner responses.

## Verified evidence versus reported evidence

### Verified by Minamo MCP readback

- Existing Project had **revision 10**, eight canonical content sections and 63 parts before the session update. The saved result was **revision 11**, nine sections and 71 parts, with exactly **eight added parts** in one new music-practice section.
- The new canonical block has **five reading pages** for focus/resumption, original response with translation, grammar analysis, corrections, and vocabulary. The original learner-authored passage is preserved exactly in the private Project.
- Every pre-existing canonical section and part was unchanged across r10 to r11; existing block IDs and favourites were retained. The change log identifies the saved r11 additions and arrangement update.
- The saved material distinguishes a carefully composed answer from spontaneous language production; preserves a correction to the tutor's earlier interpretation of an affirmative response; and includes an exact next conversational question.
- The saved new lesson is **seven paragraphs and one typed table**, without an interactive native exercise in that new block. No separate Project contribution was recorded.
- An explicit `get_minamo_working_context` call with the Project selected returned its correct latest revision and recent change history, but its ordinary orientation preview was incomplete. It returned no independent related evidence entries; `lastSeenByGpt` was unknown. Therefore a short overview cannot be assumed to contain enough detail to conduct the follow-up lesson.

### Reported by the prior conversation's export (not independently verified by this review)

- The prior fresh chat reportedly found relevant grammar in the Project, taught through naturally evolving questions and saved the material at the owner's explicit request.
- Its first composition read was long and required a more focused read to be useful.
- Two rejected authoring attempts reportedly involved noncanonical typed table projection and an invalid callout representation, before a successful third request. The successful final save is independently verified; the rejected attempts are **export-reported only**.

### Not yet accepted

- A **second truly fresh conversation** has not yet been shown retrieving the new lesson and independently resuming from the saved point.
- Browser interaction, mobile readability, TTS, furigana and cross-view navigation for the newly saved reading pages have **not** been verified by this review.
- A projected reading topic can describe a Grammar or Vocabulary layout while owning a Practice block; test actual navigation before treating that as a defect.
- There is no measured retrieval latency, context/token budget, or learner outcome data.

## Candidate improvement log

| Priority | Candidate | Reason / observable concern | Suggested acceptance |
|---|---|---|---|
| P1 | **Compact orientation + bounded exact reading** | A complete Project composition can be much larger than the relevant teaching material; working-context preview is incomplete. | Starting from an unspecified topic, GPT receives a small Project/page outline, selects the appropriate exact page(s), and correctly uses the saved detail without loading all unrelated parts. Include revision/edition, stable identifiers, and truthful partial-coverage indicators. |
| P1 | **Targeted append-to-Project authoring** | Existing low-level section/block/page declarations make ordinary new-topic additions intricate. | GPT adds a bounded learning resource directly into an existing Project and assigns appropriate learning-purpose destinations without rebuilding its entire composition, while preserving source/translation adjacency, CAS/receipt protections, originals and earlier pages. |
| P1 | **Native content vs GPT continuation guidance** | Saved material includes imperative resumption guidance useful to a future GPT but bulky as learner-facing reading. | Learner sees an inviting, concise “Continue practising” destination; GPT can retrieve the exact resumption guidance without adding a separate Note or exposing lengthy administrative instructions in the lesson. No checkpoint or progress status. |
| P1 | **Source-linked learning relationships / provenance** | New pages contain logically related original, translation, corrections and examples, but no exact page-level `source` links in the saved declarations. | Original learner contributions, prepared answers, GPT suggestions, corrections, grammar and exercises retain explicit section/part links and clear authorship and preparation context. Future chats distinguish prepared text from spontaneous ability. |
| P2 | **Richer reusable practice from conversations** | The saved resource has useful reference material, but no interactive native music exercise despite available patterns, dialogue and flashcards. | When the owner asks to turn learning into study content, publish a few short, varied, contextual native exercises; avoid repetitive templates, inferred mastery, or auto-generated activity histories. Keep the original learner text intact. |
| P2 | **Canonical structured content authoring ergonomics** | The export reports table text/projection mismatch and a confusing callout validation failure. | Derive canonical table `text` from typed metadata where safe; provide a small working sample/clear validator for callouts. Verify actual schema/runtime mismatch independently before implementation. |
| P2 | **Page grouping and cross-view presentation** | One canonical block maps five pages into Practice/Grammar/Vocabulary; structural topic projection is available, actual browser behaviour untested. | Verify all five pages are discoverable by purpose, original+translation adjacent, titles untruncated/meaningful, source navigation correct, and mobile readable. Change code only for reproduced UX defects. |
| P2 | **Conversationally grounded teaching feedback** | The tutor initially failed to interpret an affirmative answer relative to its previous question; it corrected this and stored the distinction. | A subsequent lesson interprets answers in conversational context, distinguishes mistakes from valid ellipsis, and responds to intended meaning without mechanically demanding a model sentence. |
| P2 | **Smaller, explicit save receipts** | Proving a successful publish required a second full read. | Return the exact new revision, added part IDs, page destinations and unchanged/preserved scope; allow a lightweight exact post-save confirmation. Preserve current detailed reads for audit. |

Priorities are preliminary. None is a directive to build every item, alter stored learning data automatically, or replace the existing approach with a universal learning template.

## Second fresh-chat resumption test — owner supplied response (12 November 2026)

**Outcome: successful read-only resumption at the saved handoff question.** The owner started another fresh chat with the short, topic-unspecified request to open Making Friends, locate the most recent Japanese speaking practice, resume naturally, and leave the Project unchanged. The owner then pasted the resulting answer here for evaluation; they deliberately **did not continue the lesson**.

### Observed from the new chat's pasted answer

- It named the latest saved material, **Music, hobbies and spontaneous Japanese**, dated 12 November, without the prompt providing the topic.
- It identified the core music context and relevant constructions: `〜たり〜たりする`, `〜のが好き`, `〜から`, `〜と思います` and `〜やすい`.
- It explicitly distinguished a carefully composed extended Japanese response from spontaneous speaking ability, and proposed shorter spoken practice.
- It retained the corrected conversational interpretation: the learner's affirmative `はい` was already an adequate answer. It also remembered the difference between playing an instrument and listening to music.
- **It asked the exact saved continuation question:** `ピアノを弾くとき、どんな気持ちになりますか？` and waited for one or two short sentences. The prompt did not contain this question.
- It explicitly said it had not changed Minamo. Its response used a friendly conversational format, with one Japanese question, an English translation and no achievement grading or quiz.
- The owner reported **31 seconds** to obtain the response; this is an owner-observed value, **not an independently measured MCP execution time**.

### Independently cross-checked against the live Project

A separate read-only Minamo MCP call after receipt of the new-chat answer returned **revision 11**, unchanged since the first save. The section `music-conversation-20261112`, exact resumption question (`music-resume`) and correction about `はい` (`music-followup`) were present. This verifies consistency with the saved material and confirms **no Project revision was written** during the test.

**Evidence boundary:** The pasted response is convincing evidence of successful source-specific retrieval and appropriate initial continuation, but is **not an authenticated tool trace**. The reviewer cannot establish which MCP actions were invoked, amount of content retrieved, any internal intermediate steps, actual server latency, or that no unpublished actions occurred. The saved unchanged Project revision supports the narrower no-write claim.

### Acceptance against planned checks

| Check | Outcome | Evidence / limit |
|---|---|---|
| Correct latest Project material identified | **Pass (response-supported)** | It named the saved music session and relevant contents |
| Resume without owner specifying question | **Pass (response-supported, exact-match)** | It asked the exact saved Japanese question |
| Preserve prepared-vs-spontaneous distinction and prior correction | **Pass (response-supported)** | Both appeared, without introducing new erroneous conclusions |
| Ask a suitable question rather than a quiz | **Pass for initial turn** | One Japanese question with concise English scaffold; adaptive follow-up not exercised |
| MCP efficiency and selected reads | **Not assessed** | No tool trace, token counts or precise timings available; 31 seconds user-reported |
| Do not modify the Project | **Pass for saved revision** | Live MCP confirmed same revision 11; no new Project revision |

### Implications for candidate backlog

1. The basic **read prior Project → recover exact resumption point → start an appropriate fresh-chat lesson** workflow is now demonstrated twice in different ways, including the previously missing second fresh-chat handoff. Do not classify the core flow as broken.
2. **Compact orientation / selective exact reads** remains a scalability optimisation, not a demonstrated blocker in this test. Avoid over-prioritising it solely from the large first composition read reported in the export.
3. **Separating GPT guidance from learner-facing material, richer interactive authoring, explicit source relationships and simpler write contracts** remain candidates based on the saved content and prior authoring evidence. They were not exercised by this read-only test.
4. Future acceptance should focus on the true remaining gaps: adaptive teaching across multiple answers, browser/mobile presentation of the saved lesson, cross-view discovery, and authoring without excessive metadata. No additional session is required from the owner tonight.

**No changes to Project content, application code or deployment were made during this test review.**

## Scope and safety of follow-ups

- **Documentation-only draft PR.** No Minamo application source or deployment is changed by this PR.
- **No modifications** to the owner's Project are part of this documentation.
- Previous Project editions, exact correspondence, owner-authored material and stable source identities remain authoritative.
- Preserve owner-authorised direct Project editing and natural GPT interaction; avoid mandatory Notes, learning checkpoints, progress dashboards, fake sessions or routine administrative narration.
- Evaluate narrowly and implement in independently testable increments only after confirming which candidates solve real learner-facing problems.
