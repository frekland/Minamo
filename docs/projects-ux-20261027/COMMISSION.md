# Minamo — Unified Projects, orientation and personalised project presentation

**Owner commission · 27 October 2026 · documentation only until separately executed**

## 1. Mission

Minamo currently gives Journeys, Journey stages and Investigations overlapping, equally prominent places in the learner experience. The records are intentionally distinct, but a first-time user cannot reliably tell which is the main home, what an Investigation belongs to, where to save work, or which surface to resume. Changing labels alone would leave that problem intact.

**Deliver an intelligible Projects experience in which the interface hides the unnecessary data-model distinctions without weakening the learning engine.** Prioritise easy orientation, useful next actions, clean layouts and calm, modern visual quality. Retain Minamo's detailed, trustworthy canonical resources and GPT/MCP context.

This is more than cosmetic rebranding and less than a database rebuild. Complete the full source/UI/MCP/acceptance cycle. Do not respond with only a prototype, another audit, recommendation list or a stop at "awaiting owner review" when it is possible to finish safely.

## 2. Authorised product decisions

| Concern | Required experience | Internal implementation stance |
| --- | --- | --- |
| Overall learning programme | **Project** / **Projects** | Existing `journey` record family remains canonical unless a strictly necessary compatible change is demonstrated. |
| Ordered unit | **Step** (not Stage) | Existing stable stage ID and section coordinates continue to address content/checkpoints. |
| Open-ended inquiry | Normally display the **actual question/title**, with optional "Question" context | Existing `investigation` persists as an independent target; avoid compulsory new "Exploration" vocabulary. |
| Recorded learning | **Saved checkpoint** / "Latest saved work" where accurate | Preserve original learning-development event identities, evidence, supersession and target keys. |
| Unassigned or standalone inquiry | **Independent questions** or **Independent work** in an obvious home | No loss, guessed ownership or auto-parenting. |
| Reference material | **Library** | Existing canonical Articles, editions and permissions. |

The learner should not face top-level **Projects** and **Investigations** as competing destinations. Consolidate primary navigation. Do not bury standalone inquiries: give them a discoverable, clearly labelled entry within the Projects / Your work experience and search.

Do **not** create the new category "Explorations" purely to rename Investigations and reproduce the old confusion. Specific questions have ordinary readable titles; optional helper labels communicate their purpose, not technical family names.

## 3. Core UX deliverables

### A. Project list and home

- Primary nav: **Projects** replaces Journeys; retire Investigations as a top-level primary destination. Preserve Home, Library, Practice & review, Your work, space/language selection and settings.
- Project cards show title, optional modest cover thumbnail and one meaningful context hint only where evidence exists. Prioritise recent *actual saved learning* over mere editorial publication dates; show ordinary authoring recency only when labelled.
- Home should surface direct continuation for genuine recently saved work, but offer access to whole Projects too. No new dashboard clutter or repeat of the same content in three carousels.
- Clear empty states: **Create project**, **Ask GPT to set up a project**, **Independent questions** where applicable. Do not manufacture a seed project or default artwork.

### B. Project overview

Provide one coherent page with:

1. An appropriately sized project header with title, compact authored purpose where available, optional owner-selected image and restrained management action.
2. One visually primary **Continue** action grounded in the exact eligible target and a short truthful explanation of what it will reopen; when there is no saved work, **Start first step** or **Choose a step**, not "resume progress".
3. An ordered, readable **Steps** sequence. Each step shows title and the minimum useful intent/context; visibly nest its explicitly related question(s) immediately beneath it. Optional steps stay optional; no artificial check marks, percentages or "completed" states.
4. Clearly labelled **Project-level questions** for links to the whole Project that have no valid step relationship. Never silently attach them to the nearest matching title. Independent questions live outside any Project.
5. Two restrained secondary actions: **Resources** and **Project map**. These open deliberate overlays and must not load full resource lists or visual graphs by default.
6. Enough detail to choose the next thing without navigating away repeatedly; do not reproduce whole readings on the overview. Longer authored introductions remain accessible via an unobtrusive, clearly labelled separate reading route/surface rather than a tower of disclosures.

Use an actual project with 20+ steps and multiple links when testing. It must still read like a simple outline, not a long database listing.

### C. Steps and questions

- Both have the same general task frame: guide/reading, relevant Questions or supporting Library where appropriate, **My work**, **Continue with GPT** and saved checkpoint as warranted.
- A Question opened from a Project inherits a *navigation context*, not a new parent identity or duplicate checkpoint. Breadcrumbs and a clear "Back to Step" / "Back to Project" route preserve the exact source stage and scroll context.
- With multiple eligible parent Projects, display genuine "Also linked to" relationships without inventing a primary parent. Entry context governs the immediate return; direct links without entry context use an honest standalone location.
- Provide one obvious place to create and reopen Notes. Do not duplicate task bars, modes, toolbar actions or large guidance labels.
- Stage switching must remain predictable; next/previous actions use ordered stable IDs. Do not interpret visiting a step as completing it.

### D. Correct, legible continuation

- Decide destination from explicit saved checkpoints, eligible linked Notes with genuine later intentions, supported authored next steps and deliberately remembered reading position. Show the basis plainly (e.g. "Latest checkpoint", "Recent Note", "Last opened on this device"). Never conflate these.
- Prefer an exact recent meaningful work target rather than the most recently edited Project record. Do not let a new Library edition, project cover change, linked resource edit or bot publication imply progress.
- Handle missing/withdrawn/corrected checkpoints, unavailable/revoked sources, removed stages, renamed Steps, parent changes and empty Projects deterministically. Present an alternative rather than silent retargeting.
- One meaningful **Continue** button, not separate competing "resume", "revisit", "open last", "restart", "continue project" CTAs. Secondary choices may appear discreetly where genuinely useful.
- GPT's **Continue with GPT** handoff and natural-language resume must target the same exact current Step or Question as the UI, while preserving the difference between discussing and saving.

### E. Project Library access (no nested text dropdowns)

The Project needs useful linked reference material, but **do not render an encyclopaedic resource list or large collapsible text disclosures on the main page**.

Use a compact **Resources** affordance (possibly a count if verified) opening a polished, focused, accessible side sheet/dialog: project-specific curated Library connections with card titles, short *source-grounded* descriptors and direct links to the proper Article/section/rendition. A relevant-to-current-Step filter is appropriate. No arbitrary AI summaries and no eight-level accordion. Opening a resource must preserve the way back to the exact Project/Step.

Resources should include intentional whole-Project and Step-level Library links and eligible reading linked through questions, with clear origin/scope and no invented relationships. Keep the ordinary global Library unchanged and discoverable.

### F. Optional visual Project map

Provide **Project map**, *closed by default*. On click, open a refined modal (on mobile a full-height sheet is acceptable) showing the ordered Step path with explicit Question and Library links as clickable nodes. Include a clear return to Project and direct navigation to the exact canonical reading.

Use existing React Flow / bounded relationship primitives where suitable, with honest edge categories, lazy loading and real responsive geometry. No Learning Atlas revival, no graph shown on the ordinary overview, no layout-squashed connectors, no illegible node labels. Keyboard, screen-reader and reduced-motion users must have a complete parallel navigation path **inside the same modal**, not an empty or inaccessible canvas. Graphs are browsing aids, never progress or mastery maps.

### G. Optional personalised Project image

A user can set/change/remove a **Project image** at initial creation or any later time. Desktop file selection/drop and mobile photo/file picker should be pleasant; optional paste and aspect positioning if it remains simple. Image is an optional hero/cover, *not a mandatory block in the reading manuscript*.

A learner may explicitly ask GPT to **create an image for this Project** when the Project is created or at any later point. Support a user-understandable handoff to ChatGPT image generation, with the result genuinely attached to the Project through an approved transport; never show a false "created and saved" notification. If the platform cannot securely transport generated image bytes from GPT to the Minamo MCP, provide a polished, tested **generate in GPT → select/download or share the image → set as Project image** path. No secret external image-generation purchase, automatic images, generic stock art or fake placeholder images.

Private R2 image eligibility, history, recovery, revocation, tenant separation and optimistic concurrency must be preserved or explicitly extended for Project covers. A cover swap must not overwrite content reading, Notes or checkpoint meaning.

### H. GPT and onboarding as first-class paths

- Update **Create project with GPT** guidance, manuscript role labels, handoff copy, owner MCP natural-language resume and beta WebMCP/Markdown exchange UI so they tell a consistent story: Project → Steps → Questions, with Library as optional linked background.
- **Do not** mechanically require GPT to spawn Investigations for every Step. Create questions only when pedagogically or practically useful; prefer one good Project route with meaningful Steps over many overlapping records.
- Both owner-connected MCP and invited-user first-party WebMCP/clipboard exchange must still work. Keep wire contract identities stable. An image-generation request is **not** a checkpoint or permission to modify canonical content.
- The existing beta onboarding Journey and guide must remain accessible, and user-facing labels/explanations must be aligned with the new Projects mental model; don't duplicate the starter into a new journey automatically.

## 4. Design discipline: no AI-slop

Remove stale boilerplate and repetitive explanatory chrome **within the affected surfaces** rather than adding fresh boxes to explain it. User-facing copy must be precise and ordinary: "Projects", "Step 2 of 7", "Continue", "Latest saved checkpoint", "Resources", "Project map", "Add image", "No saved work yet". Do not ship phrases such as "Embark on your learning journey", "Unlock your potential", "Your next adventure awaits", "Explore the magic", or semantically equivalent generic encouragement.

Prohibited patterns: fabricated progress/achievements, invented Project summaries, abstract filler descriptions, random inspirational headings, excessive emojis, needless emoji badges, all-caps eyebrow labels on every card, default explanatory paragraphs about how to use each button, faux-AI recommendations, unrequested AI-authored image defaults, extra quick-action strips, nested accordion forests, or empty UI placeholders pretending to be content.

Use source-authored text and short labels; do not use an LLM to generate prose at page render. Remove redundant language and duplicate descriptions during real walkthroughs. A restrained charcoal / muted-cyan aesthetic should fit the established Minamo design, with purposeful whitespace and sensible typography.

## 5. Boundaries and implementation approach

### Required source audit first (brief, actionable)

Inspect current: `app/workspace.tsx`, `app/learning-home.tsx`, `app/journey-route.tsx`, `app/investigation-workspace.tsx`, `app/learning-activity.tsx`, `app/learning-links.tsx`, `lib/contracts.ts`, `lib/learning-work.ts`, `lib/learning-activity.ts`, `lib/layout-workspace.ts`, `lib/journey-goal-request.ts`, `lib/layout-gpt-intents.ts`, `lib/relationship-command.ts`, `lib/assets.ts`, `lib/asset-client.ts`, `lib/domain.ts`, `lib/beta-site-tools.ts`, current image/diagram clients and associated tests. Reconcile changed filenames if main has moved.

### Implementation sequence

1. Implement central presentation labels, route/URL backward compatibility and a reusable explicit Project→Step→Question relationship projection. Do not begin with naive string replacements.
2. Replace parallel navigation with Projects and an intelligible standalone-question home. Build compact Project overview, breadcrumb and return-context behavior.
3. Make real saved-work continuation consistent in Home, Project, Step, Question, GPT handoff and workspace. Handle the inaccessible/missing target cases.
4. Build neat Resources overlay and optional graph/map modal with lazy loading, precise links and accessibility.
5. Build project image metadata/attachment/editing/read path and GPT-generation handoff. Finish security, data/history and recovery tests.
6. Align authoring, onboarding, help, search, beta Site Tools and user-visible copy, without breaking stable MCP schemas or old deep links.
7. Perform actual read-only walkthroughs on real Project content, correct what is awkward or cluttered, run tests and conditional private release. Iterate until the experience is genuinely coherent.

Work can parallelise well-isolated code modules **after** choosing shared target and route contracts, but must integrate the user journey and test it as one experience. No partially renamed navigation left in production.

## 6. Release and non-goals

**Not authorised:** bulk migration/rewrite of existing personal content; creating fake learning progress; merging separate inquiries into one checkpoint; clearing Trash; destroying image originals or historical renditions; sharing the Site publicly; exposing owner MCP/private data to invited users; requiring paid models; a new Atlas product; model-controlled page copy; full-featured project management (deadlines, Kanban, milestones, completion percentages).

Read `ACCEPTANCE.md`. Typecheck, build, relevant unit/integration/tenant tests, actual private browser inspection, safe synthetic write/readback, no owner regressions and source-sync evidence are release gates. If a capability is genuinely platform-blocked, make the limitation explicit and preserve a complete honest user route; do not manufacture an equivalent success claim. If the core experience or safety fails, leave the owner-private app unchanged and report the exact blocker.
