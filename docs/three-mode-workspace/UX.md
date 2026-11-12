# Mode design and responsive source challenge

This report concerns the production-targeted integration of PR #33. The browser acceptance report supplies observed dimensions and interactions; the source review below does not claim a human preference study or physical-device acceptance.

| Mode | Deliberate presentation | Available alternatives |
| --- | --- | --- |
| Classic | Existing V24 Workspace, global navigation and full reading actions. No reconstructed shell. | Existing reading comfort and Notes docking; the same named layout switcher. |
| Focus | Centred reading, restrained chrome, explicit task/reference disclosure and immediate Notes access. Reading/GPT actions remain a named disclosure. | Book keeps a comfortable prose measure and wide-screen contents; Technical gives code, diagrams and tables more width while keeping prose within the configured measure. |
| Task | Exact selected task/stage, actual saved continuation, distinct authored direction and supporting/local resources. | Visible rail, compact trail and context above reading remain selectable. Narrow viewports and side Notes present context above reading without losing controls. |

## Concrete defects corrected

- PR #33 hid Book/Technical below 700px and Task arrangement below 1000px. Both now remain available through named native disclosures. A smaller viewport does not remove the owner's alternatives.
- The research mobile header consumed three rows before task context. Focus and Task use two rows: navigation/search, then named Classic/Focus/Task choices and the existing support buttons. Redundant branding is omitted there; search and navigation stay available. Classic retains its brand/search hierarchy with space for the same presets.
- Focus's repeated task/orientation material no longer precedes every reading in full. `Task & references` opens the actual task return and bounded resource list; `Reading options` exposes both treatments. These are real closed/open disclosure semantics, not visually hidden open content.
- A full-height Task rail plus a full-width passive preview could create an implicit second grid row below the available viewport. Preview presentation now has an explicit context row and remaining-height preview row.
- Global screen-width rules could expose a second contents rail beside side-docked Notes. Book's optional wide contents uses the actual Reader container width. Technical and Task retain the native section selector without repeating the entire index.
- Book honours the configured larger/largest text and narrow measure. Technical/Task permit wide practical material without making ordinary paragraphs span that entire width.

## Refinement after actual mobile review

The first integrated 390px browser review still placed the canonical title around y=422px and first section around y=550px in an 844px viewport, despite the shorter header. That was a substantive concentration problem: breadcrumb/management, reading actions, return links and connected context repeated orientation before the Article.

Focus now combines those existing top-level administrative routes in one `Reading details & GPT actions` disclosure. The actual section selector, canonical title and introduction remain direct. Notices about unavailable/current rights or newer readings stay visible outside this fold. Classic and Task retain their existing flow through the same stable wrapper and action owners; changing modes does not recreate the GPT action subtree merely to alter disclosure chrome.

The corresponding CSS gives the disclosure a readable 14px label and a 44px target, and avoids a second nested action disclosure inside it. Focus's task/reference/options strip also avoids unnecessary two-line wrapping at the reviewed phone width. The repeated 390px browser check measured title y=306px (previously about 422px), context 53px (previously 70.6px) and header 119px, with no horizontal overflow. This demonstrates reduced preamble in that fixture; it does not measure learning or owner preference. The initial numbers above remain the refinement-triggering observation.

The same browser pass found a separate comfort regression: Focus Technical advertised Largest and exposed the correct 22px variable, but its paragraph still computed to 17px because later mobile Reader styles had equal specificity. Shared presentation CSS now explicitly scopes canonical prose to the workspace's reading-size owner, covering ordinary paragraphs, introductions and rendered Note Markdown, callouts, reference explanations and excerpts. Book's higher-specificity 18px floor remains intact; code and small interface labels are deliberately outside this rule. Final computed-size rechecks are recorded by the owning browser run.

## Discoverable equivalents

All three modes use the same search, primary collections, supporting tools, Sources, Trash, Settings, Help and recovery. Alternative modes expose the existing primary navigation through `Open navigation`. Task and Focus do not remove structural management, annotations, Flags, current-source information or exact retained-reading return: their underlying components and actions remain authoritative.

Task's context area scrolls within a bounded height when positioned above reading, including reduced-height windows. Long next actions remain fully readable in that area; they are not clipped into an unexpandable line clamp. Native disclosures keep authored detail, local resources and options manageable. Notes retains its independently owned full-height narrow sheet; no CSS editor clone or layout-keyed Notes state is introduced.

## Verification scope

The stylesheet parsed and minified with the existing esbuild dependency without warnings. The shared full build, functional suite and browser captures are recorded separately. Required browser challenges include 390px and narrower reading, largest text, Book/Technical, each Task arrangement, reduced height, code/table/diagram overflow, side Notes, preview geometry and focus after minimising Notes.

Responsive-browser checks establish geometry and keyboard behaviour in that environment. They do not establish physical Android keyboard resize, native touch-selection, TalkBack or which option the owner prefers. These remain bounded environment/user-acceptance limits, not an assertion that physical use was tested.
