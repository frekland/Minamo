# Minamo V2 — Pedagogical golden fixtures and owner walkthroughs

**Companion to:** `INTEGRATED-EDUCATIONAL-ARCHITECTURE-COMMISSION.md`. Fixtures 1–8 are local synthetic acceptance examples and are not automatically inserted into the owner's personal workspace. **Fixture 9 is a separately authorised post-deploy TEST ONLY live-installed-MCP/website challenge, followed by verified recoverable cleanup.**

The old implementation passed data/schema validations but produced weak learning content. The new suite must test a *learner-meaningful distinction* between project guidance, independent reference reading and genuine inquiry. These examples deliberately avoid evidence of completed learner work.

## Fixture 1 — An actionable Journey stage (Sudoku)

**Journey:** Build a Sudoku GUI Solver in Python  
**Stage:** Model a 9×9 board without GUI dependencies (`stage-board-model`)

A focused stage panel should read approximately as follows:

- **What you are building:** one independent Python board representation in which a digit or blank is identified by a row/column coordinate. This will become the input to validation and solving logic; it is not Tkinter code.
- **Try:** write a function returning nine *independently allocated* row lists, each with nine integer values. Adopt `0` as blank. Print/inspect two coordinates and change one cell. Observe whether other rows change.
- **Prediction:** before running, explain what could happen if all rows referred to one underlying list.
- **What counts as evidence:** record the **real** command, code revision, actual values printed and an explanation; if no code ran, leave the observation blank. Check nine rows, nine columns, legal value range and independent row mutation.
- **Understand / related Library:** open **Python nested lists, identity and copying** at its aliasing section, and **Sudoku coordinates and constraints** at the grid-index section. One link should return precisely to this stage.
- **Optional investigation:** *Why can editing one cell unexpectedly change an entire Sudoku column?* (a proposed question, not an assertion about the learner's code).
- **Next:** implement validation of row, column and 3×3 region constraints.

**UI acceptance:** Show stage 2 of 10 clearly, back/next actions, keyboard-friendly stage switcher, concise task content rather than the entire Journey text; on the same screen return links and an optional question are discoverable. The 9×9 board diagram belongs inside the topic/visual explanation where it is useful, not forced as stage decoration.

## Fixture 2 — A canonical Library topic, independent of any Journey

**Topic:** Python nested lists, shared references and independent rows  
**Area:** Python language and data structures  
**Question answered:** Why might changing one entry in a two-dimensional list unexpectedly change several rows?

**Substantive teaching substance:** A list stores references to its elements. Multiplying a list repeats references to the *same inner object*; copying the outer list does not copy the nested rows. A two-dimensional list is not automatically a separate allocation per row. Explain memory identity separately from Sudoku rules, because the concept matters just as much in game maps and other programs.

**Discriminating code example (illustrative, not observed):**

```python
shared_rows = [[0] * 3] * 3
shared_rows[0][1] = 7
print(shared_rows)
# Predict why the second position in every row changes.

independent_rows = [[0] * 3 for _ in range(3)]
independent_rows[0][1] = 7
print(independent_rows)
# Compare without assuming the code has been executed by the learner.
```

**Visual explanation:** show two separate relationship diagrams: all three outer entries pointing to one inner list in the first case, three different inner lists in the second. Use a structured diagram where every reference/arrow is explicit, or an accessible equivalent. The figure should say which identities are shared and why; a random arrow chain is insufficient. A region/grid visual is a distinct concept.

**Pitfall to explain:** `rows.copy()` duplicates only the outer list. For nested row lists, `[row.copy() for row in rows]` is a small comprehensible alternative when rows contain simple immutable elements. Explain why deeper mutable nesting needs more careful copying.

**Discoverable entries:** `list.copy()` (Python function/method), `[[0] * 3 for _ in range(3)]` (language pattern), `is` (identity operator where useful). Entries point to exact code/explanation parts; they do not duplicate the complete topic.

**External source:** link-only official Python data structures reference `https://docs.python.org/3/tutorial/datastructures.html`, labelled with what it explains and **without** implying all code was externally inspected or executed. If specific claims need stronger sourcing, check the precise official passage at authoring time and record its verified status separately.

**Cross-project relevance:** link the **same** Article to Sudoku board state and RPG nested world/inventory data if the relationship is meaningful; do not create a second copy titled "Pip's deeply troubled lists".

**Reader acceptance:** direct search, short description, code-copy, diagram source and readable figure, heading/part deep links, one official reference, focused related reading, return to Journey Stage 2. Text remains the canonical selectable version; optional visuals never destroy exact passages/captures.

## Fixture 3 — A truly optional Investigation

**Proposed question:** Why can a Sudoku board have no duplicate filled digits yet be impossible to complete?

- **Purpose:** examine the difference between local constraint validity and existence of a global solution.
- **Possible prediction prompts:** Is checking each row/column/region enough? What would one impossible branch look like? How could you demonstrate it with a controlled partial board?
- **Suggested research:** revisit canonical constraint checking, candidates, backtracking. Ask how a solver distinguishes invalid givens from a valid-looking but unsatisfiable board.
- **Experiment suggestion:** construct or use an independently verified fixture; predict candidate outcomes; attempt to solve; compare actual output against assumptions. The system **must not invent** an unsatisfiable fixture or claim it was run unless observed.
- **The user's actual record:** initially **empty observation, empty conclusion**, with editable space and optional Note/repository/Run references. A GPT-authored suggestion is not a learner finding.
- **Navigation:** stage context and canonical topic links, with an obvious route back to the last Journey stage. Same question can be linked to another Journey when useful.

An alternative shorter Investigation may explore GUI event-loop blocking; another may examine whether failed recursive branches are fully undone. Do not create twenty shallow prompts merely to populate the tab.

## Fixture 4 — An RPG stage **reuses** canonical knowledge

**Journey:** The Last Meow — retro Python zombie-cat RPG  
**Stage:** Represent kitten and world state.

The stage owns the story-specific challenge: build an initial state for Pip with room, health, inventory and quest flags; predict effect of editing nested state; show actual results if run. **It links to** canonical Library topics on `dict`/`list`/identity and defensive access. No fresh Article entitled "Pip's dictionaries" that just restates the stage's story and task, unless it provides a genuinely distinct *game architecture* idea. A new domain-specific topic could reasonably explain **finite-state machines for dialogue**, if substantial and reusable beyond this game.

The cross-project Library topic should be viewable from both projects with a different **return path**, not duplicated by project name.

## Fixture 5 — Purposeful diagram, not "more boxes"

For a *state machine*, illustrate Editing → Validating → Solving → Solved/Invalid/No-solution and a labelled transition **back** to Editing when the user changes a clue. Acyclic `flow-v1` cannot faithfully show that cycle; the approved `state-v1` (or equivalent) must preserve it rather than invent a false one-way pipeline.

For a Sudoku *region/grid*, a labelled 9×9 board highlighting the 3×3 region of (4,7) is useful; a generic flow chart is not. It should show row/column coordinates, 3×3 boundaries, and an accessible description.

For nested *list aliasing*, show reference identity. A plain table listing positions would not explain why multiple rows point at one object.

**No diagram quota.** One precise diagram beats five decorative graphics. Test graphics with real responsive rendered evidence; code/diagrams can be inspected in source form.

## Fixture 6 — Policy rejection and successful remediation

**Poor package input:** Ten-stage Sudoku Journey and ten purported Library articles, one per stage. Each article says what its corresponding stage teaches, includes a superficial mini exercise, ends with a generic "read more" link, and belongs only to an area named after the project. No actual Investigation opportunity or indexed canonical references.

**Expected authoring policy:**
- Detect and *explain* high likelihood of Journey/Library role confusion, weak independence, one-to-one mirroring, and absence of meaningful coverage review.
- Return bounded affected record keys and the closest actual existing concept candidates; provide actionable replacement strategy (reuse canonical topic, targeted improve, or keep genuinely project-specific material in stage).
- Require revision or an explicit owner override for this bulk proposal, **not** silently publish or invent extra references/diagrams.
- Preserve draft and return path. This is a policy/advisory decision, not a copyright/security or automatic semantic-equivalence finding.

**Corrected proposal:** One navigable Journey, selected cross-project canonical topics, two or three optional questions, linked official source references where relevant, useful visual(s), exact command index entries and no fabricated actual code runs. Policy accepts genuinely distinct material, returns explicit `no-write` when coverage already exists and emits a compact receipt on commit.

## Fixture 7 — End-to-end user test script

1. Open fresh synthetic workspace on desktop; choose Sudoku.
2. Select stage "Model the 9×9 board" from the route, not by scrolling eleven long text sections.
3. Open `list.copy()` reference, copy code, inspect meaningful diagram, open its official source link.
4. Return to the **same stage**, with Notes dock and input state unchanged.
5. Open an optional Investigation; see a question and suggested methods but **no fabricated observations**. Type a prediction and leave/reopen it only after a deliberate save.
6. Search for `python3 -m tkinter`, see the correct command syntax, explanation, GUI requirements and trusted reference; no claim it ran on Kali.
7. Switch to RPG and follow a link to one of the **same canonical data-structure articles**.
8. On 390px phone and keyboard-only desktop, perform steps 2–6 with preserved orientation, no document-level overflow and working accessible controls.
9. Trigger a known invalid / near-duplicate GPT package and inspect the **editorial policy** diagnostics; confirm **no partial saved records**.
10. Commit the valid synthetic package in one operation; read back linked stages, topics and Investigations; replay operation safely; preserve old attached selections.

**Engineering tests are necessary but not sufficient:** a reviewer unfamiliar with the build must be able to follow this script without explanation from the developer. Record friction honestly, correct it and retest.

No authentic learner evidence, progress, screenshots or exercise completion is manufactured by these fixtures.

## Fixture 8 — independent, unscripted agent quality challenge

The implementing agent must commission a critical reviewer **without handing it the golden-script sequence or implementation success claims**. Provide a fresh, reasonably bounded project/question (for example, learning to build a Python CLI log summariser) and access to the actually rendered synthetic V2 workspace and authoring tools. The reviewer independently assesses:

- Can a new learner identify what to do next, complete a meaningful first try and return to the same place after opening reference material, without coaching?
- Does a reusable Library explanation stand alone, answer the actual technical question and include accurate runnable-looking *illustrative* code, honest official links and a genuinely explanatory visual only where needed?
- Does policy-guided authoring avoid stage-by-stage copycat Library items, handle existing coverage and place optional open questions without inventing observations?
- Can the learner find a function/command directly; does the information help more than a list of cards, headings or obvious paraphrases?
- Is the desktop and 390px mobile experience calm, legible and more usable than previous V2 checkpoints, while direct Flag/Annotate and Notes interaction still work?

The reviewer must name concrete friction, misleading wording, shallow content, unnecessary complexity or interaction regressions and may give a **fail** verdict despite passing code/tests. The implementing agent must make substantive corrections, show before/after evidence and repeat the challenge until significant failures are resolved. Do not demand that the owner provide browser annotations to make the independent review meaningful. Use only synthetic material: this is not proof of a genuine learner completing code or learning.

## Fixture 9 — real installed MCP, real published V2 reading, real cleanup

**Timing:** After pre-release EDU-01..EDU-18 and verified scoped owner-private deployment; after MCP reinstall/reconnect only if genuinely necessary. Do not confuse this with the local synthetic Fixtures 1–8.

**Unscripted independent challenge:** A reviewer unfamiliar with the implementation chooses a new small question/project (e.g. learn to build a Python CLI log summariser). No reused Sudoku/RPG script and no pre-seeded direct database content. Through the **installed ChatGPT Minamo V2 plugin**, retrieve policy/coverage, preview and atomically apply a compact `TEST ONLY — PR15` package consisting of a focused Journey, around two substantial reusable Articles, an optional unanswered Investigation, and an Area only where genuinely useful. Retain exact generated IDs, revisions and receipt. Assess actual duplication warnings/reuse decisions, one useful diagram if warranted, code/command lookup, honest official source links, and contextual connections.

**Authenticated Site walkthrough:** Open the saved live Journey through exact deep links in the actual owner-private V2 application; independently discover the first action, work through a stage, open a substantive topic, inspect/copy example code, inspect diagram/sources, open an unanswered Investigation and return to precisely the same stage. Check desktop, 390px Pixel-class viewport and keyboard reading; check continuity of Notes/Flag/Annotate without editing the owner's genuine material. Screenshot/record what is genuinely rendered. The independent reviewer gives a meaningful **pass/fail**, naming confusing interface decisions, weak or misleading teaching, useless visuals, broken navigation or source/authoring deficiencies. Fix significant failures in the product, rerun checks, safely redeploy and retest the actual hosted experience.

**Safety and cleanup:** Before creating anything, record installed client/tool version, release/generation, existing genuine record IDs/revisions and a unique synthetic operation ledger; verify exact-ID recoverable cleanup is available. Afterwards, guarded Trash/retire **only the explicitly created synthetic IDs**, read back all affected surfaces and compare genuine baseline records/settings; keep immutable receipts/tombstones, disclose cleanup limits. This does not authorise changing existing Journeys, 22 personal Articles, personal Notes, Flags, annotations, Runs, Sources, identities or protected state. If real installed plugin/authenticated browser is unreachable, label acceptance blocked/unverified rather than passing a local substitute.

