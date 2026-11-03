# Minamo V100 — bounded learner-experience review

**Date:** 3 November 2026  
**Subject:** TEST — Simulation Playground (Six-Layout Walkthrough), `test-simulation-playground-layouts-20261103`  
**Reviewer:** independent learner/UX review, not a code audit  
**Live target:** Minamo Site; Sites reported latest version 100. The V100 release receipt identifies native source `a10709c9cfb7b0de819dc392de01ce29e576e1d4`. The live rendered experience and actual interactions below are the basis of this review.

## Overall judgment

This is a promising, substantially calmer reading experience. Real teaching material appears in the Project, the six patterns give it useful variety, and an adult and child have a plausible first experiment to discuss together. The direct-edit → saved Project → MCP update → reloaded page path worked in this bounded trial. The main practical concern is that the page is long: moving between the introductory prediction, code and later challenges takes considerable scrolling. A few pieces of fixture content also imply experiments or visual relationships the supplied example cannot yet demonstrate.

This is an adult reviewer’s assessment of suitability for shared learning, not an observed session with a child. A child’s reaction, comprehension and ability to complete the activity remain untested.

## What was actually inspected

- Read repository `AGENTS.md`, the PR #80 product brief, the relevant opening/experience sections of the implementation blueprint, implementation progress and V100 release receipt. Older planning text describes V91 and is superseded by the release record and live Site.
- In Cloud Browser on a desktop-sized viewport, opened Projects, found the specifically named TEST Project, inspected the six sections and their rendered content, scrolled between the code, Board, Research and Guide, and enlarged and closed the diagram.
- Clicked Copy on the HTML example; the page displayed “Code copied.” The browser clipboard read returned empty in this environment, so the copied bytes and a paste into an editor were **not independently verified**. Did not run the example.
- Followed the MDN reference: it opened the expected Basic animations page in another tab. The Pygame destination was visible but not opened.
- Used Edit on the TEST Project to add “and point to the number” to the first MOVE instruction. Save displayed “Saved.” The text remained after a page reload and was independently returned by MCP at revision 5.
- Read the Project and layout capabilities using Minamo MCP, then added one short practical tip to the existing code section: save the file, refresh, compare with the prediction and restore the original value before another change. The write committed at revision 6. A fresh MCP read showed that the composition was identical to revision 5, the direct edit remained, and all pre-existing content sections were identical after excluding the new paragraph. A browser reload showed both changes inline.
- No genuine Project, other learner content, application source, deployment, fixtures or infrastructure was changed. The two small edits remain in the named TEST Project for inspection.

## Six layouts

| Layout | What was observed | Learner judgment |
| --- | --- | --- |
| Dashboard | Introduction and current focus appear as a broad main column and a narrower supporting panel; callouts are legible and the editing action is quiet. | A welcoming entry and useful prediction. The introductory reference to “Workbench” is less immediately actionable because sections are far down one continuous page. |
| Notebook | Prediction table, question and animation diagram appear inline. The diagram could be enlarged and closed. | Clear separation of predictions from observations is valuable. The diagram’s four small labels are easier to read enlarged, though the drawing does not show the repeat described in the text. |
| Workbench | HTML and observation table appear side by side. Code has line numbers, Copy, Wrap and a horizontal scrollbar. | The pairing is useful and the code remains selectable in context. The long code panel makes the right-hand panel stretch into a large empty area, and narrow code lines require scrolling or wrapping. The table asks the learner to fill in observations, but editing it involves a tab-separated text area rather than an obvious cell editor. |
| Board | “Soon” and “Later” are side-by-side grouped areas containing ideas and possibilities. | The grouping is easy to scan and does not force progress tracking. “Soon” may imply a schedule more strongly than the playful optional content intends; that is a preference, not a functional failure. |
| Research | Reference cards with source label, description, domain and external link sit next to an approach comparison. MDN opened correctly. | The juxtaposition helps an adult compare options. “Link only · unverified” is honest but somewhat technical; the adult-oriented references are not a child’s first activity. |
| Guide | Two vertically connected content blocks contain experiments and reflection, without completion controls. | A useful predict/change/observe conversation and adult extension. Its placement after all other material makes the first experiment harder to find on return. Both guide blocks exposed “1” in the accessibility tree; the visual marker appeared as a circle. This is a potential numbering/accessibility issue, not a broadly tested defect. |

## Confirmed issues and reproduction

1. **The loop illustration omits the loop (fixture content).** Open “Predictions and explanations” → “The animation loop idea”; compare the accompanying sentence saying the process repeats with the diagram, including its enlarged view. The diagram shows a one-way chain ending at “Draw next frame”, with no return arrow. A learner relying on the image alone cannot see the repetition. The prose itself does say it repeats.
2. **The narrow-obstacle question has no matching obstacle in the supplied experiment (fixture content).** In “Code beside investigation”, read the debugging question about speed 8 skipping a narrow obstacle, then inspect “A real first animation”. The supplied example draws a marble and a ground strip and checks the canvas edges; it contains no narrow obstacle or obstacle-collision rule. The question is a valid future thought experiment, but it is not an experiment the learner can perform using the supplied code as written. Label it as a later hypothetical or give an attainable next experiment.
3. **The approach introduction says “Either” while the table contains three choices (fixture copy).** Open “How people make these” → “Which tools could make it?” The introductory sentence refers to either approach, followed by Canvas, Pygame and optional Godot. Change the wording to match the list.

The lack of a section jump list and the long scroll are observed interaction costs, not a claim that navigation is broken. Similarly, the code copy confirmation is not proof that the clipboard contains correct bytes, nor proof of a defect.

## Priorities for straightforward improvement

1. **Correct the misleading learning material:** show the loop in the illustration where supported, distinguish the obstacle question as a future hypothesis, and fix “Either”. These are bounded content improvements.
2. **Make returning to a particular section easier on long Projects**, using a modest, existing navigation affordance if available. Test whether a compact list of the existing section headings would help before adding permanent chrome. In this specific Project, moving the immediate challenge closer to the code or shortening introductory copy could also help without a new interface.
3. **Make recording a real observation easier to discover.** The existing Edit mode does expose the table, but the tab-separated rows require care. At minimum, provide a short contextual instruction or use an existing simple text/Note route. Do not manufacture observations.
4. **Check Guide numbering and assistive output.** Two blocks exposed the same number in the accessibility tree; establish whether this is intentional, decorative or confusing before changing it.

## Preserve

- Content-first presentation, quiet Edit action and persistent but unobtrusive Notes access.
- Native inline code, tables, callouts and diagrams; the code and observation pairing is particularly useful.
- Clear distinction between predictions and actual observations, no inferred achievement, and the invitation to choose and change real values.
- The natural MCP continuation: a bounded update appeared in the existing Project while the direct edit and arrangement survived this trial.
- The open-ended choice of world and the adult extension, which let two learners participate at different levels without turning the child into a spectator.

## Suggested future learner scenarios

These are small, repeatable suggestions based on the observations above, not a new acceptance campaign. Use disposable or explicitly authorised test content.

1. **Find and run a first experiment — visual interaction.** Starting situation: adult and child return to a long Project. Objective: locate the first runnable example and change one value. Actions: find the code, copy it, paste into a local file, open it, predict, change speed and refresh. Success: material is findable, copied bytes are complete without line-number contamination, the example runs, and the learner can identify the changed behaviour. Record what was actually observed.
2. **Record and revisit an observation — visual interaction plus saved-state read.** Starting situation: an experiment has genuinely been run. Objective: record one result and return later. Actions: enter Edit, update one observation using the available table editor or an existing Note, save, leave and reopen. Success: the observation is easy to enter, survives, stays associated with its prediction and does not alter neighbouring rows.
3. **Discuss and update without losing a direct edit — MCP and saved-state verification, with a visual spot-check.** Starting situation: a learner has directly edited one Project instruction and discusses a new possible experiment in chat. Objective: save the new idea while keeping that edit. Actions: read current Project, request a bounded update, then read it again and reload the page. Success: the new idea appears in the intended place; the edit, other content and section order remain intact; no unperformed work is presented as an observation.
4. **Read a long Project on a phone — visual interaction required.** Starting situation: the learner opens a mixed-layout Project on a phone-sized viewport. Objective: read a diagram and table, copy code and follow a reference, then return. Actions: navigate to each, use the diagram viewer and code wrap/scroll, follow the source and return. Success: content and controls remain readable and reachable, scrolling is understandable, and returning retains useful context. This review did not establish that outcome.
5. **Child-led prediction and reflection — visual interaction and real participants.** Starting situation: an adult and roughly eight-year-old have the first example ready. Objective: let the child choose a colour or speed, predict, change it and describe what happened. Actions: take turns pointing to the relevant value, make one change, run it, compare and record a genuine observation. Success: the child can contribute a meaningful choice and see its effect, while the adult can explain and assist without a compulsory progress workflow. Observe the participants rather than inferring success from the page alone.

## Coverage limits

- Desktop visual review only. The available Cloud Browser controls in this session did not expose a viewport/device resize; keyboard zoom attempts did not produce an observable narrow viewport. **Mobile layout, touch targets, mobile code/table overflow and mobile diagram/reference interaction remain unverified.**
- The six patterns were inspected in this one Project, not across other content combinations. No exhaustive accessibility, keyboard, screen-reader, browser compatibility, performance or regression testing was done.
- Copy produced the Site’s success message, but clipboard bytes and execution were not verified. The example and hypothetical activities were not run.
- MDN was followed; the second external reference was not. No external source correctness audit was undertaken.
- The MCP update tested one successful, authorised bounded change after one direct edit; it does not establish all conflict, concurrency, recovery or permissions cases. The comparison covers the returned Project composition and content sections, not the entire database.
- A genuine child/adult session was not conducted, and no claims of learning or mastery are made.
