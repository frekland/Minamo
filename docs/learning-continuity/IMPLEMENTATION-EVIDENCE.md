# PR19 integrated implementation and acceptance evidence

This implements the owner's full execution commission against current `main` source tree `300b292fb08302384992eccbef9a53daa3519cb7` and the eight specification documents at planning PR head `874d5b1d023e8a3e295eea7a9e246d5f82d4a62c`. Planning PR #19 is not the implementation PR. Exact source/release identities are recorded in the implementation PR receipt, avoiding a self-referential source commit.

## Integrated decisions

- Preserve canonical reading JSON, retained editions, Source floors and exact UTF-16 coordinates. Current Article catalogue metadata has independent authoritative heads/history and derived exact BINARY/ASCII-folded search terms. Historical catalogue selection is explicit; mismatched readings reject instead of pretending an empty filtered edition is exact.
- One owner/generation-scoped Development authority serves exact Journey stages and Investigations. Checkpoints are explicit, bounded and evidence-labelled; multi-target requests commit atomically. Perspectives depend on exact revisions/current eligibility. Read/discuss/author/bookmark operations do not manufacture learning sessions or progress.
- Notes share one controller, per-Note immutable operations, exact committed versus current revision handling, immediate local retention and bounded remote coalescing. New image-bearing Notes have ordered canonical text/image parts; old Notes retain their original reading identities. Native CodeMirror history owns text, formatting and image intent undo/redo.
- Accepted relationships remain RecordLinks. Explicit broad Article/Area unlink reconciles legacy reverse direction in one guarded transaction, preserving unrelated contextual references. No second relationship authority, model service or database was added.
- Recovery uses bounded keyset D1 reads and immutable page-backed checkpoints. Large encrypted transfers stream authenticated frames. Complete supported cumulative history and automatic preactivation backup were tested by restoring an older checkpoint and returning through its full backup.
- Manuscript publication remains one call with full original source. Sixteen near-envelope documents were measured at 217,277 original request bytes, 45 D1 statements and at most 9 bound parameters in the isolated runtime. This is a measured local envelope, not a claim about every deployed Cloudflare plan.

## Executed evidence and independent correction

See [Library](LIBRARY-IMPLEMENTATION-EVIDENCE.md), [Notes](NOTES-IMPLEMENTATION-EVIDENCE.md), [Recovery](RECOVERY-IMPLEMENTATION-EVIDENCE.md) and [independent review](INDEPENDENT-IMPLEMENTATION-REVIEW.md). Their overlapping test counts are not added together. The release receipt records the final non-overlapping aggregate.

The cumulative fixture used 1,500 substantive topics, 256 retained large Note revisions and full receipt payloads. A 19,202,640-byte complete checkpoint was represented by 44 bounded pages. Encrypted export/import, old-checkpoint activation, automatic full backup and restoration to Note revision 256 succeeded. Rights/cutover regressions were then reproduced and corrected in both small and paged encrypted paths. Private PNG/document bytes plus expired upload identities were tested separately.

Independent review corrected successful-edit and failure paths: operation rev2 versus current rev3, stage heading rename, stale perspective dependencies, exact historical Note evidence redaction, raw legacy catalogue validation, reverse memberships, pending image undo, atomic multi-target checkpoints and runtime read budgets. No genuine learner records were used as fixtures.

## Evidence boundaries

Local Worker/D1/R2/MCP tests are real executions of the shared implementation in disposable namespaces. They do not imply hosted client cache refresh, physical Android, authenticated production browser saves/uploads, successful third-party playback, or real-network Note acknowledgement median/p95. The cloud browser supports this project's internal preview, not an authenticated deployed Site; no connected local-browser tool was exposed. Local desktop and actual 390/320 CSS iframe checks verified the writing-first sheet, one launcher, menu, minimise/restore and rejected-save/reload draft retention. These are not phone emulation or Android keyboard/Back/TalkBack acceptance.

Pending image bytes remain in memory until staged/attached; reload or final-tab closure requires explicit reselection with text retained. This fallback is displayed, not described as durable Blob recovery. Scheduler coalescing is configured at 250 ms with a 750 ms dispatch ceiling while typing, not a measured network latency SLA. Provider iframes are opt-in and tested for safe pre-activation markup; live provider playback must be assessed separately. No extra paid inference service, new Site or original Minamo mutation is included.

Context7 official D1 documentation supported batch rollback decisions; actual forced final-statement failures verified them. Firecrawl official documentation retrieval supported provider constraints. SOFA connection status returned an internal server error, so no new SOFA claim is treated as verified implementation evidence.

## Traceability register: 211 requirements

This register links every approved requirement to shared evidence. A row is **not** a declaration that all local/hosted/device variants passed. Final release evidence and the boundaries above govern that claim. The 13 consolidated scenarios reuse these artifacts rather than requiring 211 manual exercises.

| ID | Scenario | Shared evidence / verification scope |
| --- | --- | --- |
| INV01 | New isolated curl Investigation with zero Journeys | learning-work.test.mjs; educational-reading-ui.test.mjs |
| INV02 | Owner reports using Kali and describes a response with **no transcript** | learning-work.test.mjs; educational-reading-ui.test.mjs |
| INV03 | GPT describes a hypothetical teaching example during ordinary 'Use minamo' chat | learning-work.test.mjs; educational-reading-ui.test.mjs |
| INV04 | Owner checkpoints prediction, trial, error, correction and next question | learning-work.test.mjs; educational-reading-ui.test.mjs |
| INV05 | A later observation contradicts an earlier interpretation | learning-work.test.mjs; educational-reading-ui.test.mjs |
| INV06 | A development is revised, trashed/restored, or its source becomes unavailable | learning-work.test.mjs; educational-reading-ui.test.mjs |
| INV07 | Tab disconnects after server commit but before response | learning-work.test.mjs; educational-reading-ui.test.mjs |
| INV08 | Two independent concurrent updates | learning-work.test.mjs; educational-reading-ui.test.mjs |
| INV09 | A Note is linked to Investigation but no explicit checkpoint recorded | learning-work.test.mjs; educational-reading-ui.test.mjs |
| INV10 | Read only current Investigation context through GPT | learning-work.test.mjs; educational-reading-ui.test.mjs |
| REL01 | Investigation later added to Journey A stage 2 | learning-work.test.mjs; relationship-unlink.test.mjs |
| REL02 | Same Investigation linked generally to Journey A and B | learning-work.test.mjs; relationship-unlink.test.mjs |
| REL03 | An accepted broad Investigation↔Journey link is removed | learning-work.test.mjs; relationship-unlink.test.mjs |
| REL04 | Legacy stage/section link or rendition is edited | learning-work.test.mjs; relationship-unlink.test.mjs |
| REL05 | Candidate semantic overlap found in Library | learning-work.test.mjs; relationship-unlink.test.mjs |
| REL06 | Sparse or empty workspace | learning-work.test.mjs; relationship-unlink.test.mjs |
| REL07 | Source revocation, archived Note or deleted related record | learning-work.test.mjs; relationship-unlink.test.mjs |
| VIEW01 | Investigation receives explicit checkpoint | learning-work.test.mjs; gpt-context.test.mjs |
| VIEW02 | Journey has direct stage checkpoints and multiple linked Investigations | learning-work.test.mjs; gpt-context.test.mjs |
| VIEW03 | Three explicit checkpoints close in time on the same target | learning-work.test.mjs; gpt-context.test.mjs |
| VIEW04 | An Investigation hasn't received new checkpoints recently | learning-work.test.mjs; gpt-context.test.mjs |
| VIEW05 | Recent-work cursor/page and direct deep link | learning-work.test.mjs; gpt-context.test.mjs |
| STAGE01 | Following a Journey's HTTP stage without any Investigation | learning-work.test.mjs; manuscript-stage-rename.test.mjs; gpt-context.test.mjs |
| STAGE02 | Stage checkpoint records prediction, observed output reported by user, misconception and correction | learning-work.test.mjs; manuscript-stage-rename.test.mjs; gpt-context.test.mjs |
| STAGE03 | One Investigation relates to three stages, no per-event stage association | learning-work.test.mjs; manuscript-stage-rename.test.mjs; gpt-context.test.mjs |
| STAGE04 | Explicitly assign one Investigation Development to just one stage | learning-work.test.mjs; manuscript-stage-rename.test.mjs; gpt-context.test.mjs |
| STAGE05 | Reorder Journey stages while stored Developments exist | learning-work.test.mjs; manuscript-stage-rename.test.mjs; gpt-context.test.mjs |
| STAGE06 | Remove or rename a Journey stage referenced by existing work | learning-work.test.mjs; manuscript-stage-rename.test.mjs; gpt-context.test.mjs |
| STAGE07 | User switches stages or resumes last locally opened one with no checkpoint | learning-work.test.mjs; manuscript-stage-rename.test.mjs; gpt-context.test.mjs |
| STAGE08 | Correct/withdraw a direct stage Development | learning-work.test.mjs; manuscript-stage-rename.test.mjs; gpt-context.test.mjs |
| STAGE09 | Two simultaneous checkpoints to same stage, one uncertain response | learning-work.test.mjs; manuscript-stage-rename.test.mjs; gpt-context.test.mjs |
| CKPT01 | New chat starts “Use minamo. What was I doing last?” | learning-work.test.mjs |
| CKPT02 | Twenty ordinary follow-ups on same Minamo topic | learning-work.test.mjs |
| CKPT03 | User says “Checkpoint this” after reported Kali work | learning-work.test.mjs |
| CKPT04 | User asks “save what we established” / “record progress on this stage” | learning-work.test.mjs |
| CKPT05 | User asks GPT for a challenge but not to save | learning-work.test.mjs |
| CKPT06 | User says “Add that challenge to my Journey” | learning-work.test.mjs |
| CKPT07 | GPT infers a significant insight but user didn't request persistence | learning-work.test.mjs |
| CKPT08 | Explicit checkpoint has two equally plausible primary targets | learning-work.test.mjs |
| CKPT09 | User checkpoints a correction to earlier checkpoint | learning-work.test.mjs |
| CKPT10 | User explicitly asks to checkpoint observations across two targets | learning-work.test.mjs |
| CKPT11 | New chat later asks what happened in the “last session” | learning-work.test.mjs |
| CKPT12 | User only asks to look up a Note, Library Article or favourites | learning-work.test.mjs |
| HOME01 | Several Journey-stage and Investigation checkpoints exist | learning-work.test.mjs; local desktop/narrow UI inspection |
| HOME02 | Only record was favourited, no checkpoint | learning-work.test.mjs; local desktop/narrow UI inspection |
| HOME03 | Three checkpoint events on one target close in chronology | learning-work.test.mjs; local desktop/narrow UI inspection |
| HOME04 | One old favourite and one newly checkpointed stage | learning-work.test.mjs; local desktop/narrow UI inspection |
| HOME05 | New Article/Area publication and several Note autosaves | learning-work.test.mjs; local desktop/narrow UI inspection |
| HOME06 | Revoked Source or withdrawn/corrected evidence | learning-work.test.mjs; local desktop/narrow UI inspection |
| HOME07 | Owner has no personal saved checkpoints and no favourites | learning-work.test.mjs; local desktop/narrow UI inspection |
| HOME08 | 1500 corpus items and 1000 checkpoints | learning-work.test.mjs; local desktop/narrow UI inspection |
| HOME09 | After acknowledged checkpoint in ChatGPT, open Home and exact stage | learning-work.test.mjs; local desktop/narrow UI inspection |
| HOME10 | Browser visits stage and Note while another device checkpoints | learning-work.test.mjs; local desktop/narrow UI inspection |
| HOME11 | Favourite and Continue point at same record | learning-work.test.mjs; local desktop/narrow UI inspection |
| FAV01 | Whole-record Bookmark of eligible Investigation, Journey and Article | learning-work.test.mjs; domain-bookmarks.test.mjs |
| FAV02 | Favourite click repeated after network loss | learning-work.test.mjs; domain-bookmarks.test.mjs |
| FAV03 | Unfavourite old article while its Development history remains | learning-work.test.mjs; domain-bookmarks.test.mjs |
| FAV04 | Existing whole-record Flag before UX update | learning-work.test.mjs; domain-bookmarks.test.mjs |
| FAV05 | Trashed/revoked source or record as favourite | learning-work.test.mjs; domain-bookmarks.test.mjs |
| FAV06 | Favourites available to GPT on a cold-start recall request | learning-work.test.mjs; domain-bookmarks.test.mjs |
| FAV07 | Favourite Library Article and go to its exact reading | learning-work.test.mjs; domain-bookmarks.test.mjs |
| FAV08 | Foreign owner requests favourites or mixed-generation bookmark read | learning-work.test.mjs; domain-bookmarks.test.mjs |
| FAV09 | Favourites list includes archived/legacy Flag inconsistencies | learning-work.test.mjs; domain-bookmarks.test.mjs |
| LEARNMCP01 | Inspect installed MCP after implementation | learning-work.test.mjs; gpt-context.test.mjs; installed-client release receipt; hosted/device or measured-network qualification applies |
| LEARNMCP02 | Model starts new Use minamo conversation with read-only request | learning-work.test.mjs; gpt-context.test.mjs; installed-client release receipt |
| LEARNMCP03 | Normal learning Q&A across 20 turns | learning-work.test.mjs; gpt-context.test.mjs; installed-client release receipt |
| LEARNMCP04 | Explicit checkpoint requested | learning-work.test.mjs; gpt-context.test.mjs; installed-client release receipt |
| LEARNMCP05 | Explicit publish/favourite request separate from checkpoint | learning-work.test.mjs; gpt-context.test.mjs; installed-client release receipt |
| LEARNMCP06 | Last-chat recall when learner never checkpointed | learning-work.test.mjs; gpt-context.test.mjs; installed-client release receipt |
| LEARNMCP07 | Journey stage Work target validation | learning-work.test.mjs; gpt-context.test.mjs; installed-client release receipt |
| LEARNMCP08 | Evidence and actor distinction | learning-work.test.mjs; gpt-context.test.mjs; installed-client release receipt |
| LEARNMCP09 | Legacy v1 investigation reading and v2 question-only published in same workspace | learning-work.test.mjs; gpt-context.test.mjs; installed-client release receipt |
| LEARNMCP10 | Refresh after correction/unfavourite/source revocation | learning-work.test.mjs; gpt-context.test.mjs; installed-client release receipt |
| LEARNMCP11 | GPT creates question-only v2 Investigation under editorial preflight | learning-work.test.mjs; gpt-context.test.mjs; installed-client release receipt |
| LEARNMCP12 | Owner uses “Discuss with GPT” on a non-first Journey stage without a selected passage | learning-work.test.mjs; gpt-context.test.mjs; installed-client release receipt; hosted/device or measured-network qualification applies |
| NOTE01 | New Note first meaningful character | note-continuity.test.mjs; notes-writing.test.mjs; domain-http.test.mjs |
| NOTE02 | Existing Note edits while prior save pending | note-continuity.test.mjs; notes-writing.test.mjs; domain-http.test.mjs |
| NOTE03 | Long uninterrupted typing (30+ seconds) | note-continuity.test.mjs; notes-writing.test.mjs; domain-http.test.mjs; hosted/device or measured-network qualification applies |
| NOTE04 | Refresh/close during active edit then restore | note-continuity.test.mjs; notes-writing.test.mjs; domain-http.test.mjs |
| NOTE05 | Offline, throttled network, 503 and conflict | note-continuity.test.mjs; notes-writing.test.mjs; domain-http.test.mjs |
| NOTE06 | Two tabs independently edit same Note | note-continuity.test.mjs; notes-writing.test.mjs; domain-http.test.mjs |
| NOTE07 | Notes dock left/right/top/bottom, max/min/collapse; Pixel-like 390/320 widths | note-continuity.test.mjs; notes-writing.test.mjs; domain-http.test.mjs |
| NOTE08 | GPT queries Note while user types | note-continuity.test.mjs; notes-writing.test.mjs; domain-http.test.mjs; hosted/device or measured-network qualification applies |
| NOTE09 | Note associated with Investigation and two Library items | note-continuity.test.mjs; notes-writing.test.mjs; domain-http.test.mjs |
| NOTE10 | Private Note content changed or Trashed after cited | note-continuity.test.mjs; notes-writing.test.mjs; domain-http.test.mjs |
| FMT01 | Toolbar toggles selected bold and italic on/off | notes-writing.test.mjs; note-continuity.test.mjs |
| FMT02 | Heading, list, block quote, code and link on active selection | notes-writing.test.mjs; note-continuity.test.mjs |
| FMT03 | Ctrl/⌘ shortcuts, composition/IME, editor focus, Android toolbar | notes-writing.test.mjs; note-continuity.test.mjs |
| FMT04 | Icon-only narrow toolbar | notes-writing.test.mjs; note-continuity.test.mjs |
| MOBILE01 | Open mobile Note at 320/390px with virtual keyboard | local 390/320 iframe inspection; note-continuity.test.mjs; hosted/device or measured-network qualification applies |
| MOBILE02 | Minimise Note and continue using Minamo | local 390/320 iframe inspection; note-continuity.test.mjs |
| MOBILE03 | New Note + switch among 4+ open tabs | local 390/320 iframe inspection; note-continuity.test.mjs |
| MOBILE04 | Active tab pencil rename | local 390/320 iframe inspection; note-continuity.test.mjs |
| MOBILE05 | Close tab vs minimise sheet vs Trash | local 390/320 iframe inspection; note-continuity.test.mjs |
| MOBILE06 | Android Back, rotation, keyboard and safe-area | local 390/320 iframe inspection; note-continuity.test.mjs; hosted/device or measured-network qualification applies |
| MOBILE07 | Desktop Notes across docks/focus | local 390/320 iframe inspection; note-continuity.test.mjs |
| IMG01 | Paste PNG into desktop Note between paragraphs | domain-images.test.mjs; note-continuity.test.mjs; domain-reading-families.test.mjs; hosted/device or measured-network qualification applies |
| IMG02 | Drop JPEG/WebP into desktop Note at pointer location | domain-images.test.mjs; note-continuity.test.mjs; domain-reading-families.test.mjs; hosted/device or measured-network qualification applies |
| IMG03 | Mobile screenshot picker | domain-images.test.mjs; note-continuity.test.mjs; domain-reading-families.test.mjs; hosted/device or measured-network qualification applies |
| IMG04 | Long writing alongside several images | domain-images.test.mjs; note-continuity.test.mjs; domain-reading-families.test.mjs |
| IMG05 | Image uploads during typing, tab switch and minimise | domain-images.test.mjs; note-continuity.test.mjs; domain-reading-families.test.mjs |
| IMG06 | Upload failure/restart/offline/quota/expired staging | domain-images.test.mjs; note-continuity.test.mjs; domain-reading-families.test.mjs |
| IMG07 | Image source/canonical identity and older Notes | domain-images.test.mjs; note-continuity.test.mjs; domain-reading-families.test.mjs |
| IMG08 | Image eligibility and recovery | domain-images.test.mjs; note-continuity.test.mjs; domain-reading-families.test.mjs |
| IMG09 | Clipboard safety and accessibility | domain-images.test.mjs; note-continuity.test.mjs; domain-reading-families.test.mjs |
| IMG10 | GPT reads Note with images | domain-images.test.mjs; note-continuity.test.mjs; domain-reading-families.test.mjs |
| FMT05 | Formatting + same-note autosave while pending | notes-writing.test.mjs; note-continuity.test.mjs |
| DIA01 | Explicit native `graph-v1` cyclic diagram | diagram-notation.test.mjs; domain-diagrams.test.mjs |
| DIA02 | Supported friendly flow/graph syntax authored in manuscript | diagram-notation.test.mjs; domain-diagrams.test.mjs |
| DIA03 | Unknown Mermaid/diagram | diagram-notation.test.mjs; domain-diagrams.test.mjs |
| DIA04 | Curl request/response diagram in both Investigation and reusable Library where educationally useful | diagram-notation.test.mjs; domain-diagrams.test.mjs |
| DIA05 | Highlight/Flag/Annotate near media/diagram with non-BMP Unicode | diagram-notation.test.mjs; domain-diagrams.test.mjs |
| MEDIA01 | Supported direct YouTube video ID referenced with explicit embed intent | external-video.test.mjs; diagram-notation.test.mjs; security-media.test.mjs |
| MEDIA02 | Supported Vimeo direct video ID | external-video.test.mjs; diagram-notation.test.mjs; security-media.test.mjs |
| MEDIA03 | Non-video listing URL such as `https://curl.se/docs/videos/` | external-video.test.mjs; diagram-notation.test.mjs; security-media.test.mjs; hosted/device or measured-network qualification applies |
| MEDIA04 | Unsafe host, invalid ID, provider denies embedding, offline | external-video.test.mjs; diagram-notation.test.mjs; security-media.test.mjs; hosted/device or measured-network qualification applies |
| MEDIA05 | Existing private owned MP4/WebM attachment and revocation | external-video.test.mjs; diagram-notation.test.mjs; security-media.test.mjs |
| MEDIA06 | External media caption/transcript and provenance | external-video.test.mjs; diagram-notation.test.mjs; security-media.test.mjs |
| INDEX01 | Authored curl command reference with aliases and flags | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| INDEX02 | `-i`/`--include`, `-I`/`--head` | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| INDEX03 | Ordinary code examples mention random tokens | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| INDEX04 | Article edited or indexed destination moved | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| INDEX05 | Library with >first page and several areas | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| NAV01 | Desktop bottom Notes bar with four open Notes, panel minimised | note-continuity.test.mjs; personal-work-organiser.test.mjs; local UI inspection |
| NAV02 | Bottom-bar Manage Notes and left-nav Your Work | note-continuity.test.mjs; personal-work-organiser.test.mjs; local UI inspection |
| NAV03 | Close final open Note tab (currently creates blank) | note-continuity.test.mjs; personal-work-organiser.test.mjs; local UI inspection |
| NAV04 | Reopen Notes with zero open tabs | note-continuity.test.mjs; personal-work-organiser.test.mjs; local UI inspection |
| NAV05 | Close tab, minimise, hide panel, Trash saved Note | note-continuity.test.mjs; personal-work-organiser.test.mjs; local UI inspection |
| NAV06 | Save or image upload pending during close/Trash/minimise | note-continuity.test.mjs; personal-work-organiser.test.mjs; local UI inspection |
| NAV07 | Press [+] desktop or mobile | note-continuity.test.mjs; personal-work-organiser.test.mjs; local UI inspection |
| NAV08 | Global header without New Investigation and Library without new/article/area buttons | note-continuity.test.mjs; personal-work-organiser.test.mjs; local UI inspection |
| WORK01 | Your Work landing | personal-work-organiser.test.mjs; domain-pagination.test.mjs |
| WORK02 | Search across later owner-only records | personal-work-organiser.test.mjs; domain-pagination.test.mjs |
| WORK03 | Open advanced organisation | personal-work-organiser.test.mjs; domain-pagination.test.mjs |
| WORK04 | Open Notes-only organiser via bottom CTA | personal-work-organiser.test.mjs; domain-pagination.test.mjs |
| WORK05 | General work card and specific annotation card | personal-work-organiser.test.mjs; domain-pagination.test.mjs |
| ANN01 | Click saved Annotation card in Your Work | reading-interactions.test.mjs; domain-reading-families.test.mjs |
| ANN02 | Source retained at older revision | reading-interactions.test.mjs; domain-reading-families.test.mjs |
| ANN03 | Source Trashed/revoked/unavailable | reading-interactions.test.mjs; domain-reading-families.test.mjs |
| ANN04 | Legacy direct annotation URL and Browser Back | reading-interactions.test.mjs; domain-reading-families.test.mjs |
| ANN05 | Existing mobile and desktop selection-to-Annotate | reading-interactions.test.mjs; domain-reading-families.test.mjs |
| ANN06 | Edit/Delete contextual annotation with concurrent change | reading-interactions.test.mjs; domain-reading-families.test.mjs |
| FLAG01 | Toggle outlined/solid Flag within annotation editor | reading-interactions.test.mjs; domain-bookmarks.test.mjs |
| FLAG02 | Existing dotted Flag decoration with small flag glyph | reading-interactions.test.mjs; domain-bookmarks.test.mjs |
| FLAG03 | Toggle same Flag from reading and annotation concurrently | reading-interactions.test.mjs; domain-bookmarks.test.mjs |
| FLAG04 | Trashed/revoked original passage but user-owned annotation intact | reading-interactions.test.mjs; domain-bookmarks.test.mjs |
| LIB01 | Library home, no search | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| LIB02 | 150 and 1,500 eligible Article fixtures across many areas | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| LIB03 | Query matching article after first loaded page | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| LIB04 | Search curl command alias and Python function | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| LIB05 | One cross-project graph-traversal Article related to two Journeys and two subject areas | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| LIB06 | Suggested semantic relationship to a new area | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| LIB07 | Existing kitten RPG project-themed area / legacy source | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| LIB08 | Uncategorised HTTP/curl article | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| LIB09 | Article with authored useful one-sentence summary | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| LIB10 | Legacy Article with no useful summary | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| LIB11 | Area detail with 200 children and 2 approved area memberships per Article | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| LIB12 | Source is rights-revoked or target moved while search index stale | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| LIB13 | Library UI content and creating resources | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| LIB14 | More reading/semantic recommendations | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| LIB15 | Topic click and browser history | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| LIB16 | Empty/sparse Library, missing area and name collision | catalogue-core.test.mjs; manuscript-catalogue.test.mjs |
| BRAND01 | Desktop/mobile header after brand change | copied V1 assets; local desktop/narrow UI inspection |
| BRAND02 | Remove visible V2/private/tagline/sidebar text | copied V1 assets; local desktop/narrow UI inspection |
| BRAND03 | Home/Investigations/Library after global New button removal | copied V1 assets; local desktop/narrow UI inspection |
| INT01 | Save Note, change annotation, Flag/favourite a record or passage, reorganise Library, visit a stage | manuscript-catalogue.test.mjs; learning-work.test.mjs |
| INT02 | End-to-end reported Kali learning when using Journey stage directly or a separate Investigation | manuscript-catalogue.test.mjs; learning-work.test.mjs |
| DATA01 | Add curl `-i`/`-I` reference, edit Article catalogue synopsis only | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| DATA02 | Update canonical explanation, diagram, authored caption or title | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| DATA03 | Legacy Article concepts and `learningShape.subject` before cutover | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| DATA04 | Query R via rendition-only URL after C1, C2 and C3 independent catalogue editions | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| DATA05 | Ordinary unambiguous targeted paragraph insertion/reorder plus separate ambiguous update | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| DATA06 | One Article accepted by two subject Areas and two Journeys | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| DATA07 | Wording-only targeted Article update with manually accepted Area membership, then deliberate unlink | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| DATA08 | Change only broad Library classification label | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| DATA09 | Authored short subject-specific catalogue summary vs genuine reading introduction | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| DATA10 | Reference entry points to removed/moved reading block | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| DATA11 | FTS5 searched for `-i` versus `-I` and `--include` versus `--head` | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| DATA12 | Library search after Source revoke/Trash and stale FTS index | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| DATA13 | Publication error injected after Article and catalogue head but before last exact index entry | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| DATA14 | D1 catalogue operation races with another accepted link or source revision | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| DATA15 | One Library article published from natural GPT Markdown with optional brief catalogue intent | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| DATA16 | Substantial 150/1,500-topic catalogue plus cumulative Note revisions, operation receipts and asset identities | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| DATA17 | Current Article with frozen legacy concepts is edited after sidecar cutover | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| DATA18 | Index-only metadata operation and a genuine reading-content operation interleave | catalogue-core.test.mjs; catalogue-command.test.mjs; relationship-unlink.test.mjs; recovery-cutover-evidence.test.mjs |
| MCP01 | Preview new manuscript with existing candidate areas, duplicate Article and reference aliases | manuscript-catalogue.test.mjs; learning-work.test.mjs; release receipt |
| MCP02 | Text-only targeted publication with independently accepted links and separate explicit removal | manuscript-catalogue.test.mjs; learning-work.test.mjs; release receipt |
| MCP03 | Existing Library content edited via old `upsertConcept` client after sidecar cutover | manuscript-catalogue.test.mjs; learning-work.test.mjs; release receipt |
| MCP04 | Get current versus retained Article context | manuscript-catalogue.test.mjs; learning-work.test.mjs; release receipt |
| MCP05 | Query all Library facets and exact aliases through site versus MCP | manuscript-catalogue.test.mjs; learning-work.test.mjs; release receipt |
| MCP06 | Confirm semantic area or Journey association | manuscript-catalogue.test.mjs; learning-work.test.mjs; release receipt |
| MCP07 | Uncertain publication response after server commit | manuscript-catalogue.test.mjs; learning-work.test.mjs; release receipt |
| MCP08 | GPT-assisted 'Use minamo' learning discussion, later explicit checkpoint | manuscript-catalogue.test.mjs; learning-work.test.mjs; release receipt |
| MCP09 | New catalogue-aware installed tool contract after runtime integration | manuscript-catalogue.test.mjs; learning-work.test.mjs; release receipt; hosted/device or measured-network qualification applies |
| TECH01 | CodeMirror widget insertion, deletion, IME, cursor mapping, undo/redo and drop | note-continuity.test.mjs; domain-images.test.mjs |
| TECH02 | Note A rev2 ACK lost; another tab changes title/context at rev3 while A queues new text | note-continuity.test.mjs; domain-images.test.mjs |
| TECH03 | R2 stage succeeded, acknowledgement fails or Note moved to Trash mid-upload | note-continuity.test.mjs; domain-images.test.mjs |
| TECH04 | Shared Notes state used by desktop bottom tabs, mobile sheet and floating launcher | note-continuity.test.mjs; domain-images.test.mjs |
| SEC01 | Anonymous / different-owner / cross-origin read/write | related integrated suite (see component evidence); recovery-cutover-evidence.test.mjs |
| SEC02 | Old generation or stale target revision | related integrated suite (see component evidence); recovery-cutover-evidence.test.mjs |
| SEC03 | Injection through untrusted markdown, media URL, image description or chat excerpt | related integrated suite (see component evidence); recovery-cutover-evidence.test.mjs |
| SEC04 | Identity/permission-floor changes | related integrated suite (see component evidence); recovery-cutover-evidence.test.mjs |
| REC01 | Complete encrypted checkpoint and older restore at realistic cumulative sustained Note/Library workload | recovery-cumulative.test.mjs; related integrated suite (see component evidence); recovery-cutover-evidence.test.mjs; recovery-paged-assets.test.mjs |
| REC02 | Import older valid archive missing new tables | recovery-cumulative.test.mjs; related integrated suite (see component evidence); recovery-cutover-evidence.test.mjs; recovery-paged-assets.test.mjs |
| REC03 | Corrupt/oversized archive or media outside declared supported workload | recovery-cumulative.test.mjs; related integrated suite (see component evidence); recovery-cutover-evidence.test.mjs; recovery-paged-assets.test.mjs |
| REC04 | Restore archival pre-sidecar Article and new sidecar records in new generation | recovery-cumulative.test.mjs; related integrated suite (see component evidence); recovery-cutover-evidence.test.mjs; recovery-paged-assets.test.mjs |
| CI01 | TypeScript/build/unit + real Worker/Miniflare/D1/MCP tests | final aggregate typecheck/build/tests and CI receipt |
| UI01 | Saved 1280/768/390/320 views and phone gestures | local preview desktop/narrow inspection; hosted release receipt; hosted/device or measured-network qualification applies |
| UI02 | Live owner-authenticated installed MCP contract and browser on deployed candidate | local preview desktop/narrow inspection; hosted release receipt; hosted/device or measured-network qualification applies |
| CLEAN01 | Synthetic fixture work cleanup | exact synthetic release fixture ledger and Trash readback |
| SHIP01 | Owner issues future explicit single full implementation-and-release commission | owner commission; implementation PR/release receipt |

## Final frozen-source local gate

`pnpm run typecheck` passed. `pnpm run build` passed. The final sequential aggregate `pnpm test` passed **580/580 tests**, zero failures/skips/cancellations, in 126.393 seconds. Builds and tests ran sequentially against the frozen implementation (not while `dist` was being replaced). Subsequent edits before packaging were evidence documentation only. Live deployment/installed verification is recorded separately in the implementation PR receipt.

Final viewport correction: the screenshot insertion action is visually first on narrow toolbars, so it remains visible at 320 CSS pixels without horizontal scrolling. The existing writing, compact tab and single-launcher layout was rechecked after the correction.

## Corrective release gate

Live V15 manuscript acceptance found an unauthored Introduction stage before H2 stages. The correction retains rich overview reading and all existing stage identities (see Library and independent-review evidence). After this correction, `npm run typecheck`, `npm run build`, and the sequential aggregate `npm test` passed **582/582**, zero failures/skips/cancellations, in 76.010 seconds. Independent focused correction review passed 14/14 tests with no actionable finding. Only evidence documentation changed after these gates.

The V15 installed publisher committed a three-document synthetic package in 2,659 ms; original brief/Markdown readback matched exactly and operation replay readback was committed. Native diagram readback succeeded. All 28 checked genuine reading records retained exact selected revision/rendition/title/body/sections/learning/source fields. The existing protected pre-release backup was verified before and after deployment; no genuine restore was activated. These are limited production observations, not 211 independent manual passes.

The installed client still advertises the old fifteen-tool catalogue despite returning the new `.19` contract. New learning-context/checkpoint and catalogue-query tools require a client catalogue refresh before live acceptance. Synthetic records remain explicitly labelled and excluded from Home activity pending exact-ID cleanup after those checks. Authenticated hosted-browser saving, physical Android/TalkBack, external-provider playback and network p50/p95 remain unmeasured; local preview and isolated D1 evidence do not substitute for them.

## Installed acceptance correction: exact Journey-stage return links

Installed MCP acceptance found that `get_minamo_context` validated and returned the exact Journey-stage learning target, but its `deepLinks.reading` and `deepLinks.returnTo` still navigated to the Journey overview. The correction shares `stageReadingLink` / `stageContextLinks` between the server response and the read-only GPT clipboard brief. Only canonical links whose family and ID match the exact validated Journey receive the stage parameter. Pinned rendition, UTF-16 selection coordinates, capture identity and matching Journey display-return links are preserved; the general record link remains the overview, and Source or other-record origins are unchanged. Historical removed-stage reads retain their original reading identity and unavailable-current-work diagnostic.

Executed isolated verification: `node --test tests/learning-work.test.mjs tests/gpt-context.test.mjs` passed **31/31**, including actual Miniflare D1 HTTP and MCP responses for a non-first stage without selection, exact selected-part coordinates, pinned removed-stage return navigation, and shared-helper tests for distinct Source/other-Journey origins. This is a source correction prompted by installed acceptance; the corrected deployed response must still be checked after publication. It is not evidence of physical Android or authenticated hosted-browser interaction.

### Refreshed installed-client acceptance and final stage-return gate

The owner refreshed the MCP catalogue; all 21 installed tools are now visible. Actual owner-authenticated synthetic calls saved and corrected a non-first Journey-stage checkpoint, retrieved its exact saved Article evidence, invalidated the old perspective, and replayed the original immutable revision-1 receipt after the Development reached revision2. A separate Investigation checkpoint projected into only its explicitly related stage; the other stage remained empty. Home contained no synthetic checkpoint IDs.

Installed catalogue-only edits kept Article revision/rendition unchanged; exact `curl -i` lookup found the fixture and `curl -I` did not. Stale catalogue revision was safely rejected. Reading current revisions and declaring exact coverage allowed ordinary targeted manuscript publication: Article revision3/catalogue4, changed wording, preserved independently accepted Area membership, original reading/catalogue1 intact, and exact new brief/Markdown readback. Manuscript and command rejection was followed by current-state inspection rather than guessed overwrite. Recoverable Trash restore/readback/retrash of a completed synthetic Journey also succeeded; original bundle source is withheld while a member is in Trash, as required by current eligibility.

The installed get_minamo_context response exposed a return-link defect despite correct stage data; the shared scoped link correction is independently reviewed (31 focused tests), and final sequential typecheck/build/aggregate **583/583** passed with zero failures/skips/cancellations in79.622seconds. No product source changed after this gate. The corrective PR release receipt records final source identity, deployed installed return-link readback and exact synthetic cleanup. No further schema change or plugin reinstall is required for this URL-only correction.
