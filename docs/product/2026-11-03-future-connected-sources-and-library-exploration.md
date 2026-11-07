# Future exploration — connected sources, external learning workbenches and focused Library media

**Status:** discussion record and feasibility brief only (3 November 2026). **Not an implementation commission, release plan or approval to modify a Site.** This proposal deliberately lives in a separate draft PR.

**Product baseline:** deployed Minamo V100 is the stable everyday experience; [PR #80](https://github.com/frekland/Minamo/pull/80) is merged. [Draft PR #83](https://github.com/frekland/Minamo/pull/83) separately proposes flexible native Project composition, four interactive artefact renderers, packaged pygame-ce admission and owner-directed TEST runs. Do not merge this proposal into #83 or hold #83 for integration research. The correction to stale V91/PR80 guidance is already proposed on #83's AGENTS.md branch; when implementing future work, verify the then-current live source and repository instructions.

## 1. Owner intent and non-goals

Minamo should be able, in time, to **work with genuine external source material in context**, not merely display copied files or recreate other applications. GPT remains the conversational partner; Minamo's Projects are durable, readable, composable spaces for sources, explanations, learner work, Notes and bounded interactive artefacts.

The desired feel is an **optional capability**, not a new compulsory hierarchy or cluttered dashboard. Ordinary Projects and the Library should stay as clean as V100 when no external material is connected. Existing six layouts remain visual recipes, not constraints on learning domains.

This document records future possibilities and the order in which to investigate them. It **does not authorize** native connected-app implementation, external writes, new OAuth infrastructure, account-plan changes, deployment, new persistent schema, direct GitHub pushes, production tests or altering PR #83.

## 2. Two integration directions must not be confused

| Direction | Already established / proposed | Concrete experience |
| --- | --- | --- |
| **Minamo → ChatGPT** via its hosted MCP tools | Existing and effective; preserve natural-language continuation | Owner asks GPT to create/update a Project, attach an explanation or place a suitable artefact. |
| **ChatGPT connected app → GPT → Minamo MCP** | Available in principle where the assistant has the relevant connected app permissions; already useful even without native Sites connector support | GPT retrieves selected GitHub/Drive material in chat and saves a rights-appropriate source-linked summary, excerpt, attachment or activity to Minamo. This is not automatically a live remote view. |
| **Visitor's connected app → Minamo Site** through Sites app integrations | **Eligibility unverified** for this owner-private personal Plus Site; do not assume availability | A signed-in visitor opens a connected GitHub file or a Sheets dataset directly inside Minamo, refreshes it and, where separately authorized and supported, performs bounded write actions. |

**Important eligibility uncertainty:** [Sites data and connections](https://learn.chatgpt.com/docs/sites/data-and-connections) currently describes connected-app use as workspace-enabled, with Sites private to that workspace and visitors using their own permissions. [Sites help](https://help.openai.com/en/articles/20001339-creating-and-using-chatgpt-sites) likewise describes workspace approval and visitor consent. The owner uses personal Plus and an owner-private/custom-access Minamo Site. An “Add plugin” control and a GPT-side GitHub/Drive connector do **not** prove that visitor-side hosted integrations are eligible.

A supported Sites integration is not a prebuilt GitHub or Google editor: it supplies authorized read/write operations; Minamo must still provide appropriate UI, validation, error handling and data contracts. If eligibility is denied or unavailable, stop the native-plugin route rather than inventing IDs, copying credentials or bypassing policy. Continue to explore the already-working GPT/MCP route, or separately evaluate normal provider API integration only with deliberate authentication and maintenance scope.

## 3. Near-term low-risk experiment: prove capability before design

The owner intends to run a tailored Work prompt from Sites → Plugins → Add. The experiment is **not** part of this PR and must not change Minamo.

1. Inspect the actual Minamo Site identity, access and current deployment. Call native Sites plugin-eligibility/discovery for that Site; report eligible canonical plugins/connectors/actions and permission model. Check GitHub first, then Google Drive if genuinely available. Do not infer eligibility from tool names or marketplace listings.
2. If GitHub is eligible, use a **separate disposable owner-private test Site** or another genuinely isolated preview route. Read a harmless file from `frekland/Minamo` via the actual Site-side connected-app path, show filename, contents and source commit/edition when exposed, and provide a working Refresh action.
3. Verify the **hosted, signed-in visitor's** read and Refresh. A build-time GPT-fetched snapshot, anonymous public GitHub API call or developer preview alone is **not proof** that visitor-specific Sites integration works.
4. No GitHub/Drive writes, provider token handling, test-data modification, new persistent records in Minamo, changes to custom audience or production deployment of Minamo. If blocked, stop and report the exact blocker.
5. Produce a short evidence record separating: discovered eligibility; preview reads; hosted visitor consent/read/refresh; error handling; unsupported operations; and estimated effort for one reusable connected-source component.

The experiment can be removed independently when finished. No unrelated cleanup or automatic removal of valued TEST Projects.

**Go/no-go:** if hosted plugin-backed refresh works safely, consider a small future connector slice. If not, retain the same user-facing vision but build source linking/import through GPT+MCP first; do not promise live two-way synchronization.

## 4. GitHub learning workbench: more than a code viewer

An optional GitHub source attached to a Computing Project could provide, progressively:

- **Browse and orient:** repository/directory tree, file search, syntax-highlighted source, branch/commit identity, links back to GitHub, bounded loading and helpful unavailable-source states.
- **See change over time:** commit history and per-file diffs, compare a Bash script's earlier and later implementation, show PRs/issues and relevant test/CI summaries where supported.
- **Work beside the code:** existing Project Notes and explanations alongside selected files; source-accurate pinned references to repository, commit SHA, path and line range (not merely mutable URLs); optional source-version refresh notices.
- **GPT in context:** user selects a function, change or PR for conversational explanation, code review, challenge or Project update; GPT persists authored learning content through current guarded Minamo MCP rather than silently rewriting the external source.
- **Eventual bounded actions:** propose a reviewed patch, draft issue or PR and confirm explicitly before external write. Prefer reviewable changes over direct main-branch edits. This needs actual connector write eligibility, owner permission and reliable ambiguity/retry handling; **not** part of a first slice.

Do **not** recreate VS Code, GitHub's whole UI, or a parallel Git client. Start with useful read-and-reference workflows and retain the original repository as source of truth.

Example: a networking Project displays the owner's actual Bash script, its latest diff and the learner's Notes. GPT can generate an explanation, point out a changed `nc` invocation and ask for a prediction without requiring any source-file mutation.

## 5. Google Drive: display genuine documents and perform useful operations, not clone the suite

| Source | Rich read/view potential | Possible **later** explicit bounded writes (only if provider/permission support is proven) |
| --- | --- | --- |
| Google Docs | Document headings, paragraphs, links, selected passages and original-file navigation beside Project context | Append an experiment summary, add a comment or update a clearly selected passage. |
| Google Sheets | Real table/range, charts, filtering, a dataset underlying a parameter explorer or experimental visualisation | Add a measurement or update a selected cell/range; refresh and verify source state. |
| Google Slides | Slide previews/thumbnails, notes, individual-slide discussion and source references | Add or update defined slide content; use the original Slides editor for complex authoring. |
| Drive files/PDFs | Discover, preview or reference authorised originals with provenance and relevant file metadata | Organise or generate an output only where explicitly requested and supported. |

Illustrative learning workflow: a physics Project displays pendulum measurements from a connected Sheet, lets the learner compare observed and predicted results, and may eventually save **one explicitly submitted observation** back to that Sheet. The Project's explanation and Notes remain inside Minamo; the spreadsheet remains the canonical data source.

A Google connection alone does not embed the full Google editor or guarantee rights to every file. Avoid broad WYSIWYG recreation and avoid synchronizing entire Drive accounts into Minamo.

## 6. Optional Connected Source presentation model

Explore **one reusable, on-demand Project component** that can link an external resource and select an appropriate existing/native renderer: code, Markdown/text, image, table/chart, slide preview or document excerpt. Do not design a second Projects directory, new top-level nav or a compulsory “integrations workspace.”

A minimal conceptual reference has: provider/type, stable resource identity and original URL; optional pinned commit/version/range; visible provenance and last-read time; permission/read failure and stale-state presentation. This is **not** approval for a new schema or sync engine. Reuse V100/PR83's Project composition, existing Notes, source-rights model and canonical revisions wherever viable.

Important distinctions:

- **Live link:** explicitly refreshes an authorized original; never call stale cached data “current.”
- **Pinned source edition:** stable original commit/document edition for repeatable teaching and accurate references.
- **Imported/summarized copy:** GPT-created or owner-authorized saved Minamo content; not automatically synchronized to the original.
- **Learner's observation:** belongs to an existing suitable owned record/Note unless a future use proves a separate construct necessary.

Default UI remains content-first. Connected sources appear only when added, may be placed/pinned/hidden using #83's composition affordances, and should lazy-load without disturbing Notes/autosave, exact article anchors, auth, cross-owner isolation or exports. All external writes need a visible target, explicit action, confirmation and provider-side verification; avoid automatic retry on uncertain writes.

## 7. Japanese Library: stroke order, not a handwriting product

The owner **does not want kanji/hanzi handwriting recognition or a competing drawing-practice application**. A useful later Library enhancement is a compact, read-only Japanese **kanji stroke-order viewer**:

- Play, pause, replay and step through strokes with stroke number/count where available.
- Place alongside the existing kanji entry, meanings/readings and vocabulary with proper furigana (no romaji).
- Preserve a readable static image/fallback and mobile/accessibility behaviour.
- Evaluate structured sources such as [KanjiVG](https://kanjivg.tagaini.net/) and comply with dataset attribution, licensing, modification and redistribution conditions before bundling assets.

Keep this separate from PR #83's tldraw board and from external connected-app work. No kanji drawing tool. A separate Japanese Library improvement can be much smaller than an app-wide integration.

## 8. Other domain-specific inspiration, deliberately deferred

- **Custom tldraw tools/shapes** might eventually provide a useful drag-and-connect marble-machine/construction-design board for a child, or a component diagram for computing. This would require trusted bespoke React/TypeScript domain logic. Standard tldraw in PR #83 remains the baseline; no custom tools or separate drawing backend are commissioned here.
- Public ChatGPT Sites show a promising approach to compact exploration: an interactive [transformer architecture comparison](https://transformer-architecture.petergostev.chatgpt.site), [Anatomy Lab](https://external-anatomy-lab-maxwell.maxtoms21.chatgpt.site), and [BrushRove 3D painting](https://model-paint-cartch.cartch.chatgpt.site). The independent [40 Sites gallery](https://stacktr.ee/blog/chatgpt-sites-examples) also describes POKE-8 (assembly/fantasy console with AI interaction) and Inflation Lab (change input weights, see the outcome). **These are public standalone Sites examples, not verified case studies of visitor-specific Sites connected-app plugins.**
- The transferable lesson is to build **reusable trusted interactive renderers** and meaningful learner manipulation, not a proliferation of named Project layouts or specialist assessment machinery. This supports #83's direction but does not expand its scope.
- Sites scheduled tasks are not a current priority. Their unattended capability and visitor-granted connector limitations make them a poorer fit than interactive owner-directed learning right now.

## 9. Practical scope and sequencing after PR #83

| Candidate | Value | Main uncertainty | Suggested decision |
| --- | --- | --- | --- |
| Plugin eligibility + isolated GitHub read | High information value, tiny implementation | Personal Plus/workspace/visitor connection policy | **Try first**, without touching Minamo. |
| GitHub source-linked Project component | High for computing/Bash/learning code history | Live retrieval, precise version references, rights | First future product slice *only if connection path is workable*; otherwise GPT/MCP import/link variant. |
| Sheets dataset/chart view | High across science, maths and personal experiments | Connector operations, data limits, freshness | Consider after GitHub proof; initially read/display. |
| Bounded external edits | Potentially very useful | Consent, conflict, idempotency, real provider writes | Only after reliable read path; specific actions, not a general editor. |
| Docs/Slides previews | Useful supporting material | Correct source rendering vs duplication | Follow proven Connected Source component. |
| Japanese stroke-order Library viewer | Clear, small, independently useful | Dataset licence and coverage | Separate focused Library change when convenient. |
| Custom tldraw shapes / special simulations | Interesting, especially child-friendly learning | Domain implementation and maintenance | Wait for actual use of standard PR #83 drawing tools. |
| Scheduled Sites tasks | Low immediate relevance | Unattended authority | Defer. |

**No estimate of coding effort should be presented as established until the isolated connector experiment checks actual eligible operations and an authenticated hosted read.** If that test works, prepare a separate modest implementation blueprint with exact in/out scope, security checks, and an opt-in Project source card. If not, do not build a provider-specific backend merely to satisfy this discussion.

## 10. Evidence and future decision questions

1. Can the owner's current Sites account/project actually use GitHub or Google connected-app operations inside a hosted, privately accessed Site?
2. What does the eligible tool expose: files, branches, diffs, commits, issues, Docs, Sheets ranges, slides—and are operations read-only or writable?
3. Can a Project reliably open an external original, display version/staleness, refresh and preserve user Notes without a special navigation system?
4. How do GPT-mediated import and native visitor-side access differ in continuity, permissions, latency and source provenance?
5. Is there a measurable use case for provider-side editing, or is a link to the original editor preferable?
6. Does usage of PR #83's six layouts and four artefacts reveal any learning domain that genuinely needs more than composition plus specialist blocks?

**Decision at this stage:** retain these as investigated future possibilities. Owner will run the separate plugin compatibility prompt. Do not implement, merge, deploy or reset data under this PR without an explicit later commission.
