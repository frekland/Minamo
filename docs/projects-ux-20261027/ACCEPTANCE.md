# Acceptance matrix — Projects UX and engineering release

**This is an implementation test contract, not a test report.** Use the latest compatible `main` and execute the full implementation in a separate PR. A passed unit test is not proof of an attractive, comprehensible app; a screenshot is not proof of a correct checkpoint or secure image read. Both are needed.

## 0. Non-negotiable release gates

- [ ] Product is **Projects-first**, with Steps and contextual Questions in one coherent learner-facing navigation system. "Investigations" no longer competes as a primary route.
- [ ] Existing owner, beta identities, real Notes, checkpoints, image/media originals, source rights, exact retained reading and old URLs are intact.
- [ ] **Continue** is truthful and consistent in Home, Project and GPT. No invented step completion, no auto-checkpoints, no target guessing.
- [ ] Project outline includes explicitly linked Questions even with **zero** saved activity; incomplete relationship reads are never represented as a complete list.
- [ ] Resources and map are optional, *closed by default*, polished and functional. No giant inline Library dump, text dropdown forest or permanent Atlas.
- [ ] Project images are optional and privately attachable/removable with actual readback; GPT image workflow is honest and tested on at least one available supported flow.
- [ ] New-copy audit finds **no generic AI-slop**, gimmicky exhortations, fabricated recommendations, repeated headers, decorative counters or large unnecessary explanation blocks.
- [ ] Keyboard/mobile navigation, tenant separation, stale-write recovery, build and production-specific browser checks pass.
- [ ] Source sync/release evidence uses actual verified tree, source commit, Site deployment and check results; no fake PR/runtime parity.

## 1. Product UX acceptance scenarios

| ID | Test | Pass criteria |
| --- | --- | --- |
| UX01 | Unfamiliar first-time learner opens empty signed-in app | They can find Projects, create/open one and identify where to start without being taught Journey vs Investigation vocabulary; no fake seeded success. |
| UX02 | Existing Journey with several authored Steps | Appears as one Project, ordered and correctly titled; every Step opens same exact reading identity as before. |
| UX03 | Linked Question before anyone saves work to it | Is visibly discoverable in the correct Step/Project context; not hidden by recent-activity filtering. |
| UX04 | Question linked to whole Project, no Step context | Appears under "Project questions", not a guessed Step. |
| UX05 | Question linked to two Projects/Steps | Appears as one underlying record in both real contexts; direct and contextual return are correct; one checkpoint target. |
| UX06 | Truly unassigned Investigation | Discoverable as an independent question from Projects/Your work/search; exact old Investigation link remains valid. |
| UX07 | Project with no structured stages, legacy sections only | Shows a useful reading/start route and/or accurate inferred section navigation without inventing formal saved Step IDs. |
| UX08 | Project with >20 Steps, >20 links and long titles | Legible overview; no silently missing questions, horizontal overflow, list explosion or misleading "all" counts; bounded pagination handled. |
| UX09 | First visit without genuine checkpoint | Says "Start first step" or "Choose a step"; never "resume progress" merely from authoring date. |
| UX10 | Genuine prior checkpoint on Step 3; latest Project editorial update is newer | Continue returns to Step 3 and labels the actual checkpoint basis; does not treat editorial update as learner work. |
| UX11 | Newer saved Note intention after older checkpoint | Shows honest recent-Note vs formal-checkpoint distinction and correct exact target; no silent correction or merged decision. |
| UX12 | Corrected/withdrawn checkpoint, trashed Question or removed Step | Never resumes an invalid target or another Step by number; offers a meaningful safe alternative. |
| UX13 | Open Step → Question → linked Library → Note, then back/refresh/new tab | Exact Project/Step return context and reading location survive where supported; no inappropriate other-parent redirect. |
| UX14 | Computing vs Japanese/Mandarin learning space | Project scope, language content, scripts and source links remain separated, searchable and readable; no cross-space list bleed. |
| UX15 | Long Project introduction and limited vertical space | User sees title and action promptly; full original introduction remains one click away without a wall of collapsed text. |
| UX16 | Mobile 390×844, tablet ~768, desktop ≥1280 | Project CTAs, image framing, nesting, headers, notes and navigation are readable/tappable; no obscured controls or horizontal scroll. |
| UX17 | Repeated tasks within Projects | Exactly one useful primary Continue; no duplicate action bars or Task/Focus modes reintroduced. |

## 2. Library panel scenarios

| ID | Test | Pass criteria |
| --- | --- | --- |
| LIB01 | Project has links to Library Articles at project and stage levels | Resources control opens an accessible sheet/dialog; genuine structured cards, source-grounded descriptors, relevance and direct links; not inline text dropdowns. |
| LIB02 | Article linked through Question and direct Step link | Deduplicated while retaining honest origin; exact source/section/part/rendition on Open. |
| LIB03 | Article unavailable, revoked Source, wrong language scope or wrong tenant | Unavailable protected content and titles do not leak. No invented summary or fallback read of wrong edition. |
| LIB04 | Zero links and a lot of links | Useful empty state; bounded "More" or pagination; no silent truncation or giant nested accordion. |
| LIB05 | Navigate into Library, preview, close, return | Correct last Project/Step context, focus and reading position survive. |
| LIB06 | Ordinary overview load | Full Library resources do not download/render until deliberate Resources action; no substantial idle performance regression. |

## 3. Project map scenarios

| ID | Test | Pass criteria |
| --- | --- | --- |
| MAP01 | Initial Project overview | No graph canvas, map reads or graph JS load by default. |
| MAP02 | Open Project map | Steps appear in correct order, Question links attach to authorised true contexts; links clickable; no squashed lines/labels. |
| MAP03 | Show Library toggle | Eligible genuine Library nodes appear on demand, clicking opens exact reading; no guessed edges or title-similarity links. |
| MAP04 | Map with many nodes or one node | Responsive viewport, logical grouping, no unreadable miniature; explicit coverage/continuation for bounded data. |
| MAP05 | Mobile drag, zoom, scroll and modal close | Page doesn't get trapped; nodes have usable touch targets, Close always available. |
| MAP06 | Keyboard, screen reader, no-canvas/reduced motion | Same Project/Step/Question/Library destinations accessible through equivalent Outline within modal; Escape/focus return work. |
| MAP07 | Remove relation or revoke/Trash target while map open | Stale result cannot grant access; refresh/close handles conflict safely, no hidden data. |

## 4. Project image acceptance

| ID | Test | Pass criteria |
| --- | --- | --- |
| IMG01 | No cover, old Journey, new Project | Calm intentional header, no mandatory asset, generated placeholder or blank image box. |
| IMG02 | Owner uploads valid JPEG, PNG and WebP on a synthetic Project | Actual file validation, local preview, deliberate stage and atomic Project attach; refresh and authenticated image fetch return original. |
| IMG03 | Mobile image picker and desktop file picker/drag | A user can choose, preview, save and replace their own Project cover without editing canonical teaching text. |
| IMG04 | Change cover, remove cover, undo/cancel before committing | Current Project metadata updates correctly; old image remains eligible to actual retained references, no accidental content/Note/Checkpoint change. |
| IMG05 | Invalid/oversize/animated/SVG/malformed/missing asset | Validation rejects unsafe or unsupported input with concise recoverable feedback; no ghost cover. |
| IMG06 | Interrupted upload, expired stage, double submission, parallel CAS edits | Exact idempotent retry/recovery; no orphan active attachment, duplicate covers, wrong winner or lost file without notice. |
| IMG07 | Cross-tenant ID collision, stolen URL, stale account-generation response | Wrong learner cannot read, set, reuse, list or fetch image; cache/session switched image cannot leak across accounts. |
| IMG08 | Trash, retained revisions, image revocation, recovery export/verify/import | Existing retention, ownership, rights floors and recoverability work as intended; no automatic destructive deletion on replace. |
| IMG09 | Project with embedded canonical reading images and a cover | Both independently eligible; neither breaks reading display or image attachment limits. |
| IMG10 | Ask GPT to create an image during new Project or for an existing Project | Working owner-initiated prompt/generation handoff + real image selection, private attach and readback; state whether direct transport is actually supported. No false "saved" notification. |
| IMG11 | Unauthorized/unsolicited GPT image instructions | No cover write or image generation merely from reading text, flags, annotations, a linked external page or passive navigation. |

## 5. GPT, compatibility and source boundaries

| ID | Test | Pass criteria |
| --- | --- | --- |
| GPT01 | "Create a Python Project" authoring flow | Produces one coherent route of Steps, optional Questions only where justified, reusable Library coverage and correct internal `journey` IDs. |
| GPT02 | "Continue my Project" owner MCP | Finds exact eligible Step/Question or asks for clarification when ambiguous; no forced new Investigation, no automatic checkpoint. |
| GPT03 | "Continue with GPT" from a Step and linked Question | Handoff targets exact current underlying `journey-stage` or `investigation` identity and valid return URL. |
| GPT04 | Invited account first-party WebMCP/universal import | Calls and previews remain scoped and confirmation-based; Project-facing labels while wire schema stays compatible. |
| GPT05 | Existing beta onboarding and learning guide | Open and navigate as Projects/Steps in UI, no overwritten canonical reading or duplicate content seeded by UI changes. |
| GPT06 | Old URLs, bookmarks, retained rendition/passage/Note deep links, browser Back/Forward | Work without loss of exact IDs, stage/section/part/source selection or unexpected circular redirect. |
| GPT07 | Existing recorded evidence and corrections | Checkpoint events/target keys/revisions remain byte-identical unless explicitly user-edited; no inferred achievements or changed privacy. |
| GPT08 | No accessible image-generation or binary transport capability | Fallback works with honest language and real file upload; release notes name the blocked capability precisely. |

## 6. Security, robustness, performance

Execute focused automated tests and targeted host-browser challenges on:

- Current owner session, admitted second beta principal in synthetic D1, denied/revoked beta principal, and scope generation switching. A real invited-account test is valuable but **must not be claimed** without that user's genuine account action.
- Record relation edits racing with Project overview/map/Resources fetching, step removal and stale cursor/revision reads. Confirm read consistency and "coverage incomplete" handling.
- Record image admission/asset entitlement via Project metadata plus legacy inline reading images; permission floor, source revocation, R2 loss, tenant boundary and recovery.
- Browser saved drafts, private Notes, undo/confirmation UI, focus return, ARIA semantics, responsive layout, reduced motion and Android touch behaviour where device tools allow.
- Initial Project TTI/read count compared with baseline; no full graph/reference payload before action, no avoidable serial network waterfalls, no browser console errors. Record actual measurements or at least a reproducible before/after, not invented latency targets.
- UI copy screen audit: project list, overview, Step, Question, Home, header, search, Notes, Resources, Map, Create with GPT, image actions and empty states. Remove stale mixed terms and boilerplate without touching user-authored text.

## 7. No-AI-slop inspection

This is an acceptance gate, not a subjective optional polish pass.

1. List every newly introduced user-visible heading, helper sentence, empty state, card description and status notification from code. For each, verify it helps orientation, identifies an action, labels evidence, or describes a real constraint. **Remove** decorative/motivational lines.
2. Search for template phrases such as "learning journey", "unlock", "embark", "adventure", "magic", "let's explore", "boost your potential" and close variants **in generated interface chrome** (not in immutable user text). Presence is a review trigger; do not indiscriminately rewrite old canonical prose.
3. Inspect production UI/screenshots for excess headings, repeated descriptions, default resource dumps, empty boxes, distracting status chips, huge cover, cramped map edges, unhelpful modal stacks and AI-style summary filler. Correct each issue at the reusable component level.
4. Do not let a generative model construct Project card summaries, percentages or Library descriptions on page load. Project/map labels come from accepted owner data and actual relations. Where unknown, omit or say plainly "No saved checkpoint" as appropriate.
5. Independent first-time user test: hand only the app UI to an agent/tester unfamiliar with Minamo and ask them to find their latest meaningful work, locate a question's Project and open relevant Library reading. They should succeed without learning the old terminology or reading a tutorial.

## 8. Required evidence and signoff

### Source and automated evidence

- File-by-file change inventory only where needed to establish actual source behaviour; link normal implementation commits.
- `pnpm run typecheck`, `pnpm run build` and `pnpm test` with exact totals, failures/skips and dates. Run relevant image, relationship, source, recovery, beta and prior-UI regression suites. Avoid GitHub Actions costs.
- Explicit schema/migration/recovery and route compatibility tests; show new Project cover field and eligibility/atomic guard through code and real readback.
- Documentation of exact owner/private-beta security boundary and whether GPT image bytes can travel directly via supported installed tools.

### Hosted product evidence

- Actual authenticated Site walkthrough, desktop and mobile width, of **genuine existing reading without mutating personal notes**, plus synthetic test Project(s) with deliberately created and cleaned up data.
- For each bug found during walkthrough: underlying cause, code change, re-test. Avoid reporting a purely observational review as completion.
- Re-read a protected owner checkpoint or equivalent integrity snapshot **before and after**. Explicitly state if an eligible verification was not possible; do not manufacture a record count.
- Exact native/GitHub common tree and GitHub implementation PR, private Site deployment receipt and version, plus rollback/no-destructive-migration notes.
- Physical-device or true second-account gaps distinguished from synthetic/local/web-browser passes.

### Finish decision

**Pass:** consistent Projects UX, reliable exact continuation, clean optional panels/map, working private images and GPT handoff, no AI-slop or data/privacy regressions. Merge/safely release according to established owner V2 authority, then document exact result.

**Conditional limit:** direct GPT binary image transport or actual second-account/device acceptance is platform-gated. Deliver the supported user-file workflow, complete all independently testable security/copy/browser checks, report the exact limitation and do not claim the blocked path passed.

**Fail / do not release:** any silent retargeting of saved learning, lost or leaked user data, broken old links, improperly attached image, displayed unsupported "success", hidden critical questions, or unreadable/inaccessible normal navigation. Correct before release or leave the private live Site unchanged.
