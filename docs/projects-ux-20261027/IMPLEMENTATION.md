# Unified Projects implementation — 27 October 2026

Implements commission PR #92 in a separate engineering PR. The commission remains draft and unmerged. Existing `journey`, `investigation` and `journey-stage` identities, exact reading coordinates, canonical manuscripts, owner/beta principals and storage bindings remain unchanged.

## Delivered experience

- Projects is the primary learning-plan destination. Ordered Steps contain explicitly related Questions, including Questions with no saved activity. Independent questions have a deliberate entry within Projects. Old query-string routes continue to work.
- `/api/project-context` supplies authenticated, generation-fenced, paginated outline, Resources, independent-Question and Question-parent projections. The page, map and Resources use the same exact relationships and source eligibility. No title similarity or learning inference creates an edge.
- Project, Home and GPT overview reads use one continuation resolver. Formal checkpoints remain distinct from newer user-authored Notes, local reading position and authored starts. Ambiguous or incompletely scanned targets are not guessed. Existing corrected/withdrawn history remains independently readable.
- Resources opens a focused sheet; the optional map loads React Flow only on demand and provides a complete parallel Outline, Library toggle and recoverable graph-load failure. Whole introductions open deliberately with original selectable reading bytes.
- Optional `projectCover` metadata uses the existing owned staged-original pipeline. A guarded Project command attaches an original atomically; replace/remove preserve eligible historical originals. Cover edits do not change canonical teaching rendition hashes. Recovery/export/import, rights redaction and tenant eligibility include covers. No database migration or new dependency is required.
- GPT requests and beta Site tools use Project/Step/Question labels while retaining wire enums and confirmation-based Markdown publication. A new Project request does not require one Question per Step. Original onboarding reading is not rewritten.
- Shared app controls now use 44px hit targets, centered 20px glyphs, quiet hover/active fills, theme-aware translucent overlay surfaces and layered elevation. Native dialog scrims and short anchored entry motion share one policy; reduced-motion rules avoid touching graph positioning. Notes formatting toolbars wrap at narrow widths. Settings, Help, Search, GPT and Notes transient menus have appropriate outside/Escape/action dismissal while editors, IME composition and retained drafts keep their ownership.
- Reader selection controls follow the focus end of multiline selections and disappear when selection clears. Placement is coalesced per frame; unavailable geometry hides the toolbar. Refined Flag underlines and Annotation tints preserve exact reading glyphs and ranges. Confirmation pulses require the matching committed server receipt.
- Structural skeletons reserve reading and Project-card space while exact reads resolve. Fluid titles and tabular data improve small-screen hierarchy without changing canonical text. Saved continuation discovery excludes editorial Notes before candidate limits, so publication cannot crowd out learner writing or checkpoints.
- Settings groups the existing reading and workspace preferences, with visual choices and a live reading sample. Preferences save locally on change with truthful feedback. Help searches supported operations and documents actual keyboard shortcuts; the existing GPT exchange and feedback path remains deliberate and privacy scoped.

## Project images with GPT

Choose **Create image with GPT** during Project creation or in **Add image / Change image**. Paste the prepared request into ChatGPT, review the generated image and save it to your device. In the Project, choose the saved PNG, JPEG or WebP, inspect its local preview and choose **Save image**. Minamo stages and attaches it privately, then checks the actual saved Project. Saving a Project first opens its overview, where Add image is immediately available.

Direct generated-image binary transfer through the installed Minamo MCP/WebMCP is not supported or represented as supported. A text prompt is never an image attachment or a learning checkpoint. There is no external paid image API, automatic artwork or stock cover.

## Review corrections

Independent HTTP challenges exposed and corrected: an accessible independent Question hidden by a source-restricted reverse parent; resource duplicates and lost provenance; false empty states on partial pages; native new-tab Question→Library links losing Project context; cover recovery field-whitelist gaps; and a compact Reader hiding the full Project introduction body. The long-introduction regression checks exact selectable original Unicode bytes. Initial SSR now receives exact Step and return coordinates instead of briefly rendering a whole-Project fallback.

Overview GPT continuation shares the same chosen destination as Continue. An older retained edition or exact passage keeps its reading intent rather than silently defaulting to the current task. Current Step and Question handoffs retain exact task identities and Project return context.

Hosted acceptance then exposed a first-cover compatibility issue on a manuscript-published synthetic Project: rehashing an unchanged persisted manuscript produced a different rendition. Cover-only updates now preserve the existing authoritative rendition, including legacy identities; combined canonical edits still hash normally. A real manuscript publication regression failed before this correction and passed afterward. The unfamiliar learner review also prompted explicit Project/Question context in the Note action label. The implementation PR receipts record the corrective release and its actual hosted retest.

Genuine Home acceptance found a production-only module graph failure: the bundled dynamic Project-continuation import resolved to the Worker entry module without the named export. Static function imports now preserve the resolver in both Home and whole-Project reads; the compiled Worker regression exercises actual saved Project continuation and a newer user Note. Query/coverage windows were not reduced to conceal the failure. Live inspection also restored native modal centering, kept preference-save feedback inside Settings, and made the first Escape dismiss Help/Search even when a native search field contains text, while preserving IME ownership.

## Validation and publication record

See [VERIFICATION.md](VERIFICATION.md) for independently executed HTTP/D1 and focused regression evidence. Final typecheck, stable build, complete serial test totals, native/GitHub source identities, private version, hosted walkthrough, synthetic cleanup and protected-data readback are recorded in the implementation PR's actual release receipts. The initial exploratory suite ran while source/builds were changing and is not the final release result.

The live owner browser was authenticated and functioning before implementation. Managed preview initially failed on a not-yet-written module, then required the supported execution-profile configuration; its browser error page could not be observed under browser URL policy. Hosted acceptance uses the functioning production tab. No browser security, authentication or network restriction is bypassed.

Actual separate-account admission, physical Android file-picker/touch behavior and assistive-device testing require those accounts/devices and must not be described as passed from synthetic D1 tests. Browser viewport-control availability is recorded with the final walkthrough. Rollback uses the prior private Site version; no destructive migration, purge or original-image deletion accompanies this release.
