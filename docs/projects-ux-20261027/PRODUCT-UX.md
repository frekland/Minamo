# Product and interaction specification — unified Projects

This is the user-visible design contract for `COMMISSION.md`. The goal is not more functionality per square centimetre; it is fewer decisions before the next useful action.

## The mental model in one sentence

**A Project is the place you return to; Steps give it structure; Questions are things you explore while working; the Library supports all three.**

The UI may still open an exact standalone Question without a Project. There is no compulsory Project assignment and no single-parent fiction.

## 1. Information architecture

### Primary app navigation

`Home · Projects · Library · Practice & review · Your work`

Other established functional tools can remain where they already belong. **Investigations** must cease to be an equal-level tab, navigation button, redundant home action or top-level browse heading. **Learning space** selection still scopes everything; Computing and Languages must remain cleanly separated.

**Projects index** contains current Project cards, plus a small, clearly signposted route to **Independent questions** (not a second competing full app). When opened, that area contains only eligible unattached inquiries and any intentionally unassigned standalone work. Do not change the underlying association by browsing it. An investigation connected to several Projects is not "independent"; keep its actual links.

**Search** returns actual Project/Step/Question titles and canonical Library references; result secondary labels use learner terminology. Exact family-qualified old links still work.

### Page and modal responsibilities

| Surface | Its job | Must not become |
| --- | --- | --- |
| Home | Resume meaningful saved work or open a Project | Another Projects catalog with decorative recommendations |
| Projects | Choose a Project or independent question | Two separate Journey/Investigation collection grids |
| Project overview | Orient, continue, choose a Step/Question | A complete manual, Library list or progress dashboard |
| Step | Follow guide, do work, see related questions/notes | A second independent Project homepage |
| Question | Explore this question and save its own work | An opaque sibling app with no route back |
| Resources sheet | Discover genuinely related reusable Library reading | Inline expanding FAQ or unlimited list of AI summaries |
| Project map dialog | Optional spatial view of the same exact relationships | Learning Atlas, auto-open map or mastery graph |

## 2. Project overview: suggested composition

Keep title, first action and ordered Steps visible on a normal 390px phone without forcing an initial scroll through a giant image and introduction.

```text
[compact Project image when set; edit via accessible control]
Build a Python command-line tool
One or two lines of the actual authored purpose, if useful

[ Continue: Step 3 ]   (latest meaningful save: Note, 24 Oct)
  or [ Start first step ] when genuinely new

[ Resources ]    [ Project map ]    [ Manage ··· ]

Steps
1  Understand input and output
   Question: What happens to standard error?

2  Parse command-line arguments
   Question: Which cases does the parser reject?

3  Build a working version
   Brief authored intent

Questions linked to this Project (no Step specified)
   Which tools are useful for debugging?

[Optional: read full Project introduction]
```

The example is illustrative. Do **not** ship the example words, synthetic Note dates, stage counts or seeded learning data to any owner's real workspace.

**Visual treatment:** contemporary neutral-charcoal surfaces, subtly contrasting rows, muted blue/cyan interaction colour, restrained separators and compact typography. One primary CTA. If an image is selected, use a tasteful medium-height cover/header (responsive crop or full-width tile), not an immersive full-screen hero. Keep title and CTA highly legible without laying essential type directly over unpredictable photographs. Without an image, avoid stock placeholders, gradients or forced icon art.

**Steps:** straightforward vertical ordering should be the default. Each row is a large, keyboard-accessible click target with short supporting context. Related Questions sit as clear nested links; resource counts or indicators remain discreet. If a Step has no questions, do not render an empty subheading. If questions exceed a sensible preview threshold, use a small "See all questions for this step" action that opens the Step context—not a collapsing wall of text.

**Long authored material:** project-level introductory canonical sections cannot disappear. Show a brief real excerpt and a link opening the full reading in a meaningful surface. Avoid dumping all original introductory paragraphs on the overview or introducing `<details>` wrappers merely to hide them.

**Status:** the only status shown is an existing owner-authored state when useful (open, paused etc.); do not invent percentage complete, "X of N mastered", arbitrary deadlines, ticks or confidence scores.

## 3. First-time and continuing learner flows

### New Project

1. Open Projects; choose **New project** or **Create with GPT**.
2. Give a specific goal and learning space. Existing authoring (including linked Library) remains accessible without requiring users to understand record families.
3. Land directly on the new Project overview: title, first Step, optional questions, concise "Start first step". Do not require a second "open Journey" action.
4. Optionally **Add image** now, or defer indefinitely. No default generated art.
5. If the Project has no stages, show its genuine reading as the first accessible action; do not show fake empty Step cards or block the user.

### Return later

- **Continue** chooses an eligible exact target and briefly labels its evidential basis.
- When a later linked Note carries actual recent thinking but an older checkpoint carries a formal learning position, make the distinction visible: the primary exact destination follows a documented deterministic policy; a low-key secondary link permits the alternate genuine recent work. No automatic conclusion that the Note "completed" a Step.
- Last opened in this browser session is lower-authority navigation memory. It can be offered when nothing more meaningful exists and must say it is last opened.
- If there is no saved work, take the learner to the first meaningful Step, or choose a Step if ambiguity exists.
- If a checkpoint target is removed, withdrawn or no longer accessible, never point to a different target just because it now occupies the same position. Explain the unavailable target simply and offer Project overview and remaining eligible Steps.

### Open and leave Question

- From Project Step: open Question; preserve that exact Project and Step as navigation context. Show a calm breadcrumb such as `Projects / CLI tool / Parse input / Why did this argument fail?` and one obvious return to the Step.
- Enter directly from search or an old Investigation link: show the Question independently and any explicitly linked Projects as genuine related locations; never guess "belongs to" from title similarity.
- In a multi-parent question, return to the *entry* Project rather than whichever relation was found first. Show other eligible linked Projects under a quiet "Also linked to" control if helpful.
- Following Library reading or a saved Note preserves the exact contextual return through existing deep-link/navigation mechanisms, including reloading or opening in a new tab where the URL can carry it safely. Handle intentionally copied direct links without depending solely on a transient component state.
- Avoid duplicate "back", "return" and "close" bars if a breadcrumb and one correct action already suffice.

### GPT handoff

An unambiguous **Continue with GPT** action follows the active Project/Step/Question and supplies existing exact learning-context target + expected return destination. It must not silently create or update records, decide which question is primary, or save a checkpoint when the learner only asked to discuss something.

## 4. Project resources — a designed panel, not drop-down text

On overview show **Resources** as a single discreet tile/button, optionally with a real count (`Resources · 6`). Optionally show a *single* short, source-grounded descriptor ("Linked reading for this Project")—not a stack of article previews.

**Open behaviour**: desktop right-hand sheet or an appropriately wide focussed dialog, mobile full-height sheet/dialog. Use an actual dialog navigation model with a clear Close button, focus trap, Escape, scroll containment and focus restoration. Do not use HTML `<details>` or dropdown prose as the primary interaction.

**Inside the panel:**

- Header `Project resources` with a concise count and, when useful, a quiet filter `All / This step / Further reading`. Filters are scoped to actual links, not semantic guesses.
- Lightweight cards, each with canonical title, clear origin (`Linked to Step 2`, `Project reference`, `Linked through question: ...`), a genuine short excerpt/subject **only if available from the canonical record**, and an **Open in Library** link.
- On desktop, selecting a card may show a side-by-side preview pane drawn from the existing read/preview component with one-click open. On mobile the preview can be a dedicated in-panel screen with a clear Back to resources action. There is **no nested list of expansion accordions**.
- Preserve exact destination `family/id/rendition/section/part` and return context. The original Library page is the source of full reference material; do not duplicate long article text or move it into a Project.
- Group naturally by Step relevance (and then alphabetically or by authored relation) with stable ordering. User-added explicit links beat algorithmic title similarity. Deduplicate the same Article shown through several paths but retain genuine "Used in Steps 2 and 4" provenance where relevant.
- Bounded, paginated results and "More" when warranted; never silently hide linked articles due to a 12-item read budget.
- Empty: `No Library resources are linked to this project.` and one simple route to Library. No generated fake suggestions or success toast.

The panel is an *optional navigation aid*; it must not obscure the main Project Steps or persist open on ordinary navigation.

## 5. Project map — optional, clickable, accessible

The **Project map** button opens a single purposeful dialog, never automatically displayed or loaded in a normal Project. The map is not a new navigation mode or hierarchy.

**Default visual graph**:

- Ordered main spine of Step nodes, with a clear directional order (left-to-right on wide screens, top-to-bottom on narrow screens).
- Small Question nodes attached only where an explicit step relationship exists. Project-level questions attach to the Project root rather than a guessed Step.
- Library Article nodes appear only on deliberate `Show Library` toggle **inside the dialog**; start with Steps/Questions for readability. Their exact links must be actionable.
- Edges mean either "Next Step", "Question linked to Step/Project" or "Linked Library resource"; distinguish these with restrained line/label styling rather than inventing formal prerequisite edges.
- Clicking a node opens its exact readable destination; hover/focus reveals a concise name or real relation reason; no behaviour depends solely on hover. A clear `Fit map` action can re-centre.
- Support dragging/panning/zooming only if they work reliably and don't eat normal page scroll. Reset or preserve viewport predictably. Touch controls meet accessible size targets.
- Never squish 20-node labels into unreadable shapes, show detached connector fragments, or render a tiny diagram in a huge empty canvas. Prefer a responsive layout and sensible bounded reveal or user-controlled expand.
- Empty/one-Step Project: render an honest small path or explain there is no map to show; the modal can still offer a plain link to Step.
- Under/alongside the visual graph, provide an equivalent **Outline** tab or navigation panel with every eligible Step, linked Question and Library reference—fully usable with keyboard, screen readers and no canvas JS. The regular overview must also remain a complete linear navigational fallback.
- Use the existing React Flow/flow viewport and server-checked graph data if appropriate; do not reactivate Learning Atlas. Never show a "knowledge mastery" or inferred progress overlay.

For multi-linked records, display more than one real connection without duplicating underlying content; if limits apply expose `More linked work` with honest pagination instead of fabricating a complete graph.

## 6. Project image: presentation and controls

- Show a Project cover **only if the owner explicitly selected it**. An image may be uploaded from a device, attached from an explicitly supplied generated file, changed or removed through a small labelled edit action (accessible for touch/keyboard, not hover-only).
- Distinguish `Change image`, `Remove image` and `Cancel`. Removing the cover must not pretend to permanently delete historical image originals.
- A polite resize/crop/framing control is optional if it can be achieved without an unsafe image-edit service; prefer client-side object position for the display and preserve original bytes. Ensure the image doesn't dominate the 390px layout or obscure step navigation.
- All supplied image files follow existing PNG/JPEG/WebP validation, byte/dimension limits, MIME/container verification, owner-scoped R2 and protected reads. A purely decorative cover may use `alt=""`; any image conveying meaning needs a useful owner-supplied description. Do not invent detailed scene descriptions from uninspected pixels.
- An author-requested ChatGPT-generated image is just user-supplied project artwork after an explicit review/attach path; not evidence of learning, external execution or Project completion.
- Include a **Create image with GPT** or equivalent deliberate path from Project management and from new-project creation, but no unrequested image generation on initial render. The request should incorporate actual Project name/goal and the user's image preference, not automatically append motivational art direction. If image bytes cannot be passed directly through MCP/WebMCP, make the user-controlled file selection step elegant and visible.
- Failing upload must retain the selected local file and operation identity when safe. Cross-user, generation-switch and cancelled-upload screens must not display another learner's image or complete a stale cover attach.

## 7. Consistent language, copy and access

| Legacy phrase | New presentation |
| --- | --- |
| Journeys / Open Journey overview | Projects / Project overview |
| Journey stage / Choose a stage / Route overview | Step / Choose a step / Project overview |
| Investigation | Question (or just authored question title) |
| General Journey references / Related reading | Resources |
| Recent thinking across this Journey | Recent work, where actually useful |
| Learning Development | Saved checkpoint |
| Start a Journey with GPT | Create a project with GPT |

Do not globally replace the words inside **user-authored canonical text**, old retained editions, tests requiring exact source bytes, external citations or internal wire protocol. User-authored titles that contain the word "Journey" remain unchanged unless the learner edits them. User-visible structural chrome and GPT-facing human descriptions should change; persistent IDs and protocol enums should not be renamed merely for cosmetics.

**Anti-slop review rule:** every headline, helper, card and empty-state sentence must earn its place by explaining an available action, location, constraint or genuine saved fact. If it is decoration, repeated explanation or ungrounded suggestion, remove it.

## 8. Screen sizes and acceptance walkthrough

Target at least 390×844 phone, 768px tablet and 1280px+ desktop in dark and light modes where supported. Check screen-reader semantics, pointer/keyboard, touch targets, focus and scroll preservation, reduced motion, long titles and language scripts (Japanese furigana, Chinese Pinyin where actual content supports them). The image crop and panels must never create horizontal overflow.

Run realistic, **read-only** production walkthroughs on a real multi-step Project and its linked Questions/Library items, and a separate language-learning Project; also run synthetic tests for empty, huge, multi-parent and corrupted-link cases. Make practical layout/copy corrections before calling the engineering task done. Successful click handlers are not sufficient product acceptance.
