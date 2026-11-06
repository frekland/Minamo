# Minamo Lab Integration — A1–A4 evidence and new-chat handoff

**Status:** Documentation-only integration orientation, 6 November 2026. **No production code, Site, data, or MCP tools changed by this PR.**

## Read this first

- **Production:** [Minamo](https://minamo.jscymru.chatgpt.site/) — owner application with real Projects, protected native Sites source and MCP. Its exact current state must be reverified at the start of implementation.
- **Private visual experiment:** [Minamo Visual Lab](https://minamo-visual-lab.jscymru.chatgpt.site/) — separate owner-only Site and synthetic data. The Lab is *not* production.
- **Visual-Lab research PR:** [#86](https://github.com/frekland/Minamo/pull/86) — earlier Lab/visual-system context. Its public PR description reflects an earlier experiment, not the entirety of A1–A4.
- **Related implementation contexts:** [#83](https://github.com/frekland/Minamo/pull/83) (Project composition/interactive surfaces/MCP) and [#85](https://github.com/frekland/Minamo/pull/85) (language speech/furigana). Do not indiscriminately merge these branches.
- **Baseline and workflow:** root [AGENTS.md](../../AGENTS.md), [V116 public/native reconciliation](../V116-PUBLIC-SOURCE-RECONCILIATION-2026-11-05.md), and [Sites release workflow](../SITES-RELEASE-WORKFLOW.md).
- **Architecture and proposed delivery:** [continuity production integration blueprint](2026-11-06-continuity-production-integration-blueprint.md).

The private Lab’s latest reported A4 source commit is **198039c71253914cdce8929685acdfd798cbc28e**, Site deployment **appgdep_6aedd7a55df48191b54304c10c6e9453** (deployed 6 November). The pre-polish A4 baseline is **1a1edd1dc9697dc7f04481e4390443a48bcfb4b2**. These identify the **Lab only**, not a public Minamo revision, branch, or production deploy. Confirm the live Lab version and access before using it as a reference.

## Problem and owner intent

Earlier native Project layouts offered useful rich content but often felt like a succession of records, controls, or small lesson cards. The owner wanted a *living, naturally growing Project* in which GPT and the learner continue an actual subject over many conversations, without session banners, inferred achievement, mandatory checkpoints, artificial GPT handoffs, or repeated exercises. The current material should be useful immediately; genuine saved edits should remain inspectable without dominating the page. The user works at 1080p and at 4K and uses the Site for Japanese and computing.

## Experiment lineage

| Mode | Question | Evidence and what changed |
| --- | --- | --- |
| **Classic / Reading V27** | Earlier reference views | Remain selectable and preserved in the Lab for comparison; they are not production release versions. |
| **A1** | Can real saved edits support continuity without learning-status chrome? | Three synthetic Project histories (Japanese, TCP, Moon Cheese), three revisions apiece, changed-section links and remembered section. Navigation, thin content, and presentation remained unconvincing. |
| **A2** | Can a 3–4-session Project feel like readable current material? | Persistent left navigation, central content, right continuity rail; richer Japanese and Python-ball simulations, interaction cards and corrected kanji-only ruby. Owner flagged whitespace, left padding, header/edit overlap, and small/duplicated furigana. |
| **A3** | Does ten-session accretion overwhelm the UI? | Ten *saved Lab revisions* and six stable sections for a synthetic Japanese conversation, with meaningful revisions to older explanations, dialogues, reveal cards and flashcards. Browser evidence showed a very long grammar section, repeated prompt types and multiple flashcard decks: preserving history alone did not prevent present-day clutter. |
| **A4** | Can current content be curated while preserving exact edits? | Same underlying ten-version Japanese record, presented as four grammar groups, four practice groups, selected dialogue and one 32-card filterable deck; added an independent ten-revision Python-ball record, part-level change links, smaller latest-change surface, and responsive/control polish. Prior modes and records preserved. |

A3→A4 is primarily a **presentation change** over unchanged Japanese revisions. It does not demonstrate an autonomous GPT content curator; A4’s grouping logic uses fixture-specific A3 IDs and must become domain-neutral before integration.

## A4 interaction and visual decisions to carry forward for owner review

- Three-column navigation / current material / compact latest-change panel on desktop, with responsive collapse on narrow displays. Avoid unreadably long 4K prose lines; permit tables, interactive exercises and canvas to use appropriate width.
- Optional history of actual saved revisions, including precise changed-part navigation and highlighting; do not infer visits, mastery, practice completions or conversation transcripts.
- Topic grouping and a reusable flashcard collection rather than duplicating one deck or instruction for every synthetic session.
- In Japanese content: furigana only over relevant kanji, adequate ruby spacing, and a small contextual **漢 / かん** global switch at top right. No duplicated phonetic annotation over kana.
- Tiny icon-only **play** and **turtle** playback/speed controls (with accessible names, focus and toggle state; no visible “Listen” or “Slow” text); simple **Translation** and **Explanation** disclosures.
- More menu avoids duplicating left navigation and dismisses with outside click or Escape; icon-only section editing; Notes retains space and usability; flashcards avoid unnecessary right padding.
- Preserve existing rich content types and six native layouts. The Lab is exploring one continuity *presentation*, not replacing every Project layout.

These are owner-reviewed design directions, not a declaration of production acceptance. In particular, production AGENTS.md previously discouraged a whole-Project layout switcher and a prominent history/restore screen. A4’s optional history and Lab view selector do **not** automatically override those constraints. Resolve the intended unobtrusive production placement with the owner before implementation.

## Actual testing vs simulation

**Observed in the Lab/browser:**
- A3 Japanese record reached ten saved revisions; browser inspection found 35 section-level changes, a 5,000-CSS-pixel-class dense section, mobile scrolling, and overlong desktop reading lines (subsequently adjusted).
- In A4, Japanese had ten revisions and 37 changed part items; Python-ball had ten revisions and 34 changed part items across six persistent sections. Exact history-to-part targeting/highlighting was exercised.
- A4’s 32-card filtered/all-deck navigation worked; the More menu dismissed on outside click; a final Python Canvas example ran in the browser.
- A4 was inspected at roughly 390px mobile width and simulated 3840px desktop width; the three-column arrangement, mobile overflow behavior and canvas aspect-ratio correction were checked.
- Focused typechecking and production build passed for the private Lab implementation.

**Not proved:**
- Ten real learner↔GPT conversations, either in this chat or across independent ChatGPT chats. Session titles and suggested questions in fixtures are fictional; saved Lab patches emulate the Project update path, *not a live Minamo MCP tool conversation*.
- Actual production read/write authorization, conflict resolution between two GPT clients and direct UI edits, independent mobile hardware, long-term performance, accessibility audit, error/rollback behavior, or migration of diverse existing Projects.
- That an arbitrary production Project can be grouped by A4’s current fixture-specific rules.
- That changing the public GitHub branch will change the protected production Site. Public repository and native Site sources differ substantially, including important Project/language/drawing files.

**Safety of fixtures:** A3 and A4 seeding was guarded by TEST-only identity, synthetic/system actor, expected revision and known parts; owner-edited data should not be overwritten. Retain this principle for future tests.

## A4 in-place polish after owner walkthrough — 6 November 2026

The **existing A4 mode** was polished and privately redeployed. **No A5** was created; A3 and other selectable Lab modes were preserved. This work remained entirely in the owner-private Lab; PR #90 itself is still documentation-only.

- Reduced vertical chrome in A4 Projects: compact breadcrumbs/section title; removed redundant “section X of Y”, “organised current material / N focus topics” instructions and the repeated selected-topic heading. The learner reaches the actual material sooner.
- Preserved useful topic organisation but changed the chunky tab buttons to an understated, underlined, single-row tab strip. Shorter conversation labels fit on desktop. Keyboard Arrow/Home/End navigation, ARIA tab semantics and horizontal overflow remain.
- Removed confusing “Next topic” cycling. Bottom navigation now says **Previous section** and **Next section**, which act on Project sections rather than topics.
- Mitigated tab-switch screen shaking by controlling layout/scroll anchoring. Added a restrained ~210 ms expand/fade for newly revealed conversation turns, with delayed minimal focus/scroll, while respecting reduced-motion preferences.
- Focused typecheck and production build passed. After the final deployment, Chrome testing verified eight conversation tabs on one desktop row, keyboard movement between tabs, stable scroll position in the tested tab-switch sequence, and revealing a new turn.
- At a simulated **390 × 844** viewport, the document width and client width both measured **390 px** (no page-wide horizontal overflow); the topic tab strip scrolls internally as intended. The viewport override was reset afterwards.
- **Verification limit:** the connected Chrome session reported reduced motion enabled, so the new animated transition was suppressed as designed; the full-motion appearance has not yet been visually accepted. The reported screen-shake defect was mitigated and not observed in the tested sequence, but should be rechecked on the owner's monitor and scroll position.
- **Latest private Lab source:** 198039c71253914cdce8929685acdfd798cbc28e. **Latest reported deployment:** appgdep_6aedd7a55df48191b54304c10c6e9453. Site: https://minamo-visual-lab.jscymru.chatgpt.site/.

**Owner feedback parked for later, not silently implemented here:** a real Home beyond Project index, content-category navigation, top-bar icon destinations and Settings; Project thumbnails; a rethink of Library and Your Work; an approachable way for learners to add examples or edit Project content and have GPT/MCP pick them up. These need their own UX discussion and backend/contracts review rather than being swept into A4 polish.

## Next-chat orientation: a concrete start sequence

1. Read root AGENTS.md, **this evidence handoff**, the [integration blueprint](2026-11-06-continuity-production-integration-blueprint.md), relevant parts of PRs #86/#83/#85, and the current source-reconciliation and Sites-workflow docs.
2. Open the private Lab; visually compare A3 and A4, both Japanese and Python. Record the actual selected mode, Site version, viewport and any accessibility/function defects. Do not assume the Lab is public GitHub code.
3. Read the current protected **native** production source and deployed version; compare to public main and the Lab. Verify the real MCP tool signatures, Project section/part schema, atomic update path, revision history and permissions rather than guessing them from this plan.
4. Decide with the owner whether A4 is accepted as an *opt-in production candidate*, and pin an exact source/feature boundary before coding.
5. Use the integration blueprint for a bounded PR implementation and testing commission. Keep Classic, data, other layouts and owner content intact.

## Handoff discipline

Facts above distinguish **observed saved Lab revisions**, **synthetic narratives**, **owner feedback**, and **future proposals**. The Lab’s private Site is a visual reference, not an exportable authoritative native patch. Do not copy private production data, tokens, owner notes, protected logs or native-only source into this public repository. This PR intentionally changes documentation only.
