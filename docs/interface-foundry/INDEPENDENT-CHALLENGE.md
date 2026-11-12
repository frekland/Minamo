# Independent interface challenge

This review starts from the frozen PR41 runtime (`50182d80108f90979150fc96573f399c7d97d6f2`, common runtime tree `35f83453d76e71e3e7b78c2d7ecf207b35abfd5c`) copied into the separate Interface Foundry staging checkout. The review role did not implement its initial Activity/Atlas UI. Source inspection and isolated Node/D1 tests are distinguished from browser evidence collected by the owning task. No human study, physical Android, TalkBack or screen-reader certification is claimed.

## Initial challenge findings

| Finding | Evidence and practical consequence | Required disposition |
| --- | --- | --- |
| IF-C01: one selected path across all source blocks | `ActivityDraft.selectedPath` was passed to every source-browser block. Choosing the same-named file in a second package can change the first package's visible selection; different paths reset to the first file. | Scope file choice by immutable Activity edition **and source block**. Preserve source text and exact canonical file links. |
| IF-C02: mobile Atlas detail is disconnected from activation | A card button sets `selected`, while the detail `<aside>` follows the whole list. There was no `aria-controls`, detail focus or discoverable same-card preview. With a long phone list the activation can appear to do nothing. | Provide controlled, discoverable detail and verify keyboard/phone focus in a real browser. Do not infer browser success from CSS. |
| IF-C03: filtered-out selection remains in inspector | `active` was selected from all graph nodes rather than the filtered `visible` nodes. Search can show zero references while an unrelated selected record remains in detail. | Clear selection or explicitly present it as outside the filtered results. |
| IF-C04: draft recovery can split Unicode | `readActivityDraft` bounded strings with UTF-16 `.slice()`. An oversize draft ending at half an emoji can contain a lone surrogate, which the Activity admission schema correctly rejects. | Truncate without splitting surrogate pairs; retain exact admitted terminal text within its supported bound. |
| IF-C05: hint response announcement requires browser verification | The revealed hint button becomes disabled and newly inserted prose has no dedicated live-region semantics in the initial source. | Keep response discoverable to keyboard/AT, preserve deliberate disclosure, and test focus rather than asserting accessibility from markup. |
| IF-C06: adaptive panes must stop resources | A reusable host that merely hides an active artefact with CSS would retain audio/worker/GPU resources. Existing `ActivityArtefact` has disposal on unmount. | Unmount or explicitly dispose an inactive media pane while preserving separate writing/file state. Test delayed activation and navigation. |
| IF-C07: map keyboard instruction did not match behavior | In real Chromium, an initial map node labelled “Open preview with Enter” retained the empty inspector after Enter; Space selected it. | Explicit Enter/Space/Escape handling was added; independent Enter retest populated the correct node detail. |
| IF-C08: periodic graph refresh interrupted reading | A real browser screenshot caught the whole graph removed by `setGraph(null)` during same-query timer refresh; the selected detail was also reset. | Same-query rights-valid refresh now retains the graph and selected identity; query/scope changes and access failure still clear it. Independent explicit refresh retained the chosen detail. |
| IF-C09: Atlas links replaced the Workspace owner | Selecting a galaxy Activity and clicking “Open exact source” performed full-document navigation. In the isolated preview the development identity was lost and the sign-in landing appeared. This confirms a remount, rather than canonical in-app navigation. | Wire exact source/node/edge destinations through the existing Workspace navigator, preserving ordinary anchor semantics for modified/open-new-tab use. Retest required. |
| IF-C10: retained Activity and current Studio diverged | Workspace rendered Reader from `displayedReading` but passed `current` to ActivityStudio and its Note capture. A retained Activity link could therefore show current Studio content/actions beside older canonical source. | Use the exact resolved retained record for Studio and Note context, and withhold Studio while retained read is pending/unavailable. Targeted regression required. |
| IF-C11: layout observer matched its own variant | The first Workbench implementation used `data-layout` both for its variant and the outer workspace mode; `closest('[data-layout]')` matched the workbench itself. | Use a distinct variant attribute and observe actual outer mode changes. This was reported during implementation before final freeze. |

These are engineering findings and testable interaction risks. They do not establish a new source-rights bypass. The initial source revalidates the exact saved Activity before display/export, withholds hint text on generic reads, renders project code as inert text, pins Attempts to an immutable edition, and keeps the domain owner/generation/CAS/receipt authority.

## External knowledge used

SOFA connected read-only as `jscymru-bot` with identity/read scopes. Installed guidance `1.1.0` returned `update_available` for `1.1.2`; server-returned action is to update the SOFA plugin through the public directory and start a new chat. Read workflows remained available. No knowledge contribution or public write was made.

The inspected [async-view lifetime note](https://agents.stackoverflow.com/tils/c680a573-a1e2-49e6-934d-2a4fbc8da59d), including its correcting reply, supports checking both request order and view lifetime after asynchronous boundaries, including error/finally paths. It is supplementary community evidence. The actual implementation and tests determine whether a defect exists; a positive trust score is not a verdict on Minamo.

## Browser challenge protocol supplied to owning task

1. Open an Activity, reveal one hint by keyboard, and inspect focus/announcement. Hidden hints must not exist in the DOM or client payload before deliberate reveal.
2. Open two source-browser packages, select different files, switch Classic/Focus/Task and return. Compare exact file/rendition/part IDs and pending Notes.
3. At phone width, activate the last Atlas card and find its detail without scrolling through an unrelated full list. Filter the selected record away; inspect visible/detail coherence.
4. Begin a renderer activation, navigate away before its dynamic import resolves, then return. Confirm no detached audio/worker/GPU resources, duplicate mounts or stale status updates.
5. Revoke source/access while an Activity/Atlas/renderer is open, then focus the window. Current-rights reread must clear protected content; independent learner writing stays retained.
6. Follow an exact source link and return with a pending Note; ordinary anchor navigation must not attach an old save to a new Activity or silently substitute the current edition.

## Verification record

The independent focused baseline suite passed **20/20** across Activity security boundaries/lifecycle/UI and Atlas projection/UI. Command: `node --test tests/activity-security-boundaries.test.mjs tests/activity-security-lifecycle.test.mjs tests/activity-ui.test.mjs tests/atlas-projection.test.mjs tests/atlas-ui.test.mjs`. The separately authored Unicode adversarial regression initially failed on the split emoji; after the scalar-safe recovery correction it passed **2/2**, including exact CRLF/tab/CJK/combining-mark retention.

An expanded independent rerun subsequently passed **35/35**, adding `tests/interface-workbench.test.mjs`, `tests/interface-foundry-contract.test.mjs` and `tests/challenge-interface-unicode.test.mjs` to those five suites. It verifies current SDK identity/denial/inert-data/fallback behavior and hidden-pane unmounting in server-rendered markup. That is not a substitute for the browser resource-lifecycle and pending-Notes tests.

## Actual independent Chromium session

The owning task repaired the supported managed Sites preview. This reviewer created a separate cloud Chromium tab on `http://terminal.local:4173/preview-activity`; it published/reopened only the isolated synthetic fixture. Source priors were exposed to this reviewer, so this is an independent engineering challenge, **not a blinded novice-persona study**. The build evolved through HMR during this session; the final frozen build needs its own acceptance receipt.

Observed actual local D1 projections: Journey route **3** references; constellation **2** references; evidence river **3** references (including the owning task's supplied Attempt); galaxy **6** references. No source-projection count is a mastery claim.

Independently executed after corrections:

- Card Enter selected the synthetic Note, moved focus to its detail heading, and exposed the exact retained source link.
- Escape returned focus to the exact card trigger.
- Filtering the chosen Note out removed its detail and yielded an honest empty state.
- Map Enter selected the intended Note after IF-C07 correction.
- Explicit same-query refresh retained the chosen detail after IF-C08 correction.
- All four lenses loaded their distinct projections and meaningful questions.
- At a measured document width of **1363 CSS px**, Atlas occupied **1023.6 px**, with document scroll width equal to client width. This is desktop geometry only.
- Galaxy Activity exact-source navigation reproduced IF-C09. No genuine production route, identity or record was accessed.

Screenshot `atlas-independent-card-detail.jpg` in the owning task's scratch directory shows the real selected card, focus ring, source link and authored relationship explanation. An earlier `atlas-independent-keyboard.jpg` captured the disruptive loading state that prompted IF-C08. Browser shortcut attempts did not establish a changed viewport/zoom, so no 200% zoom or physical mobile acceptance is claimed here.

Source review confirms the IF-C09 callback is wired through the Workspace navigator, and IF-C10 now passes `displayedReading` (guarded by exact-reading readiness) to both Studio and its Note capture. Browser retest was interrupted by an in-progress registry import before its implementation file existed. This is an evolving-build limitation; it does not justify a final-source failure or success claim. Navigation/retained-edition retests and final frozen acceptance remain to be recorded by the owning task. This file is not a release approval.

## Second challenge pass during constrained integration trials

The fresh bytes trial identified two additional real-browser blockers, preserved in `TRIAL-BYTES.md`: a renderer remained validating instead of opening, and long rich Note typing produced a React maximum-update-depth error. Those observations belong to that independent trial, not this reviewer's browser session. The parent corrected renderer lifetime/state handling and requested a rich Notes investigation. They must not be erased from the final report merely because earlier native-DOM tests passed.

The resumed reviewer inspected the renderer correction: the host now uses stable kind/canonical-digest/owner-edition dependencies, a 15-second explicit load boundary and a current-host fence. The Foundry registry checks that fence during admission, before lazy mount, after mount and on explicit revalidation; rejected late work cannot restore a private fallback. Existing trusted bank mount implementations were inspected and return a disposal handle synchronously after their lazy imports. This is source evidence. Real browser activation, pane teardown and long rich Note readback still require reruns on the frozen candidate.

Another correction underway replaces global source-kind view substitution with an explicit admitted per-block `viewId`. The reviewer rejects describing a globally enabled replacement as a harmless registration: existing plain text/trace activities must keep their original renderer unless the Activity explicitly selects a compatible trusted view. Final admission and actual unchanged-default checks are pending this correction.

### Preregistered reviewer task runs

After source freeze, the same reviewer will perform separate visible-UI task runs for these goals. Source priors are already exposed; these are role-guided engineering tasks, **not independently blinded agents, human participants, measured learning gain or population preferences**. Record actual actions and failures rather than constructing favorable persona narratives.

1. Practical programming learner: locate the debugging task, inspect its exact starter/visible tests, find local commands and a deliberate concept hint, then retain a short next intention without a formal checkpoint.
2. Japanese beginner: read the original Japanese passage, locate the exact native Reader source, and distinguish authored ruby decoration from the learner's own Note. No audio activation or assessment is required.
3. Data/quant analyst: inspect the supplied trace/table, identify provenance and exact source, and navigate via Atlas while retaining a pre-existing Note. No browser rendering or supplied test result may be presented as observed computation.

Each run must state evaluated source identity, viewport, achieved goal, action count where captured, actual persistence receipt or missing evidence, and what the implementation reviewer already knew. Keyboard, mobile iframe geometry and physical-device/IME/AT acceptance remain distinct.

## Final independent browser correction loop

The resumed browser checks started on frozen checkpoint `47f65770344f5577eb3b18b5aeaa7df3643ba62c`. They found a further release-blocking defect: after activating Japanese ruby successfully, switching Explore → Reading raised `Failed to execute 'removeChild' on 'Node'` from React's `removeChildFromContainer`. [The actual error screenshot](evidence/reviewer-ruby-pane-teardown-error.jpg) is preserved. The parent corrected registry ownership by mounting each renderer in an inner wrapper and detaching that wrapper before cleanup. A deferred React unmount can then remove children from its detached root without racing the outer host. The parent also corrected a measured narrow byte-view overflow and the existing Notes-footer full-document navigation. Final browser evidence below includes those corrections; it must not be attributed to the earlier uncorrected checkpoint alone. [Runtime fingerprints](evidence/reviewer-source-fingerprint.txt) identify the inspected files; the owning release receipt provides the final combined commit.

### Actual lifecycle retests after wrapper correction

The reviewer deliberately activated and then changed away from panes containing these **eight distinct registered kinds** in real cloud Chromium:

| Kind | Actual active behavior observed | Teardown result |
| --- | --- | --- |
| `language/ruby-v1` | Original Japanese text and authored ruby toggle | Reading pane opened; no error; mount removed |
| `language/parallel-v1` | Japanese passage and deliberate translation disclosure | Reading pane opened; no error; mount removed |
| `data/table-v1` | Exact three-row table, point inspector and numeric summary | Attempt pane opened; no error |
| `data/chart-v1` | Supplied values and accessible chart/point controls | Attempt pane opened; no error |
| `trace/external-v1` | Supplied trace, explicit event slider and no-execution notice | Source pane opened; no error |
| `math/tex-v1` | Authored integral with accessible explanation; no computed-proof claim | Hints pane opened; no error |
| `math/native-v1` | Authored MathML fraction and exact source | Hints pane opened; no error |
| `audio/pcm-v1` | Synthetic waveform, declared sample metadata, explicit Play control | Hints pane opened; no error |

No PCM playback was requested in this reviewer run; no microphone permission was requested. The tests establish renderer activation and visible teardown, not an audio-device or heap-leak certification. The selected custom signal-ledger view was also activated and switched to Task; no error remained and the registry mount count was zero. Real GPU scene success was not tested by this reviewer.

### Exact older edition and per-block view selection

The supplied actual old target `synthetic-trace-signal-ledger-v1`, rendition `r-b5e20ebbc467801e078aaab8a7784d35200452b532cefafda83253d10a92c73b`, section `activity`, part `trace-source`, was opened directly through the development Workspace URL. The canonical Reader visibly reported **retained revision 1**, Studio visibly reported **edition 1**, and its links retained that exact rendition. Activating it displayed the original trace slider, proving an omitted view selection did not silently acquire the new registered view.

Selecting “Read the current edition” navigated inside the Workspace to edition **2**, rendition `r-bc57747c1ea79f1e48e0b2e2dd9f9944e92e7f62ec3810d63e65b3c31c5a77bf`. Explicit activation displayed the selected **Supplied signal ledger** with Previous/Next event controls and source-provenance language. The source JSON remained unchanged; the presentation choice was versioned independently within its Activity edition. [Retained Reader and Studio screenshot](evidence/reviewer-retained-studio-edition1.jpg).

### Notes, source navigation and actual saved readback

The reviewer entered a new original Unicode Note of **178 UTF-16 units / 177 Unicode characters** using the native indexed `typeText` path, exceeding the earlier short-input threshold. It remained exact in rich writing and original source, Bold updated to pressed, Undo restored the original text and unpressed state, and a mode change retained the writing. No maximum-depth overlay occurred. The Note was named **TEST ONLY independent task reflection** and visibly acknowledged at revision 4.

Atlas's galaxy → selected Activity → “Open exact source” then remained on `/preview-interface/workspace` and reopened the correct Activity. Reopening Notes retained the entire named text and saved revision. Separately, the real organiser retrieved the Note from local D1 under ID `fe7c6194-d94a-47be-82d6-778d719f9c90`; selecting its record showed the exact complete original body. A strict visible-text match returned one match. [Actual saved readback](evidence/reviewer-saved-note-readback.jpg).

The reviewer also reproduced the old footer “Manage Notes” full reload, which lost the development-only fixture scope. After the minimal canonical callback correction, the reviewer appended ` TEST ONLY pending footer check.` and followed the footer in the same action sequence. The URL stayed `/preview-interface/workspace?view=work&tab=notes`, the Notes filter had `aria-current="page"`, the full writing remained visible, and the Note acknowledged **revision 5**. DOM observation found exactly **one Notes workspace and one rich writer**. The save had acknowledged by the resulting observation; this is not a deliberately delayed/lost-response timing test. [Footer and writer continuity](evidence/reviewer-footer-notes-retained.jpg).

### Preregistered role-guided task outcomes

These were performed by the same source-exposed independent reviewer. Other agents used the same isolated owner/browser-local settings concurrently, so layout preferences could change through shared storage. No human timing or controlled preference score is claimed.

| Role-guided goal | Actual observed result | Friction or limit |
| --- | --- | --- |
| Practical programming learner | Four material-inspection actions reached exact visible tests, Kali/Windows commands, Hints and a deliberately revealed concept hint. A long contextual Note was then saved and read back. No Attempt or checkpoint was submitted by the reviewer. | Returning from another route reset revealed hint prose; only saved choices/attempts are durable evidence. Existing many test tabs were visible, so this was not a clean novice onboarding study. |
| Japanese beginner | Deliberate ruby activation showed the passage; Reading → exact Article opened native Japanese. Show/hide readings worked. Selecting the whole Japanese passage exposed native Flag and Annotate controls without creating a mark. | The first run exposed the real teardown crash; the corrected lifecycle passed. Activity initially emphasizes canonical JSON before the readable view, whereas native Reader gives the useful passage immediately. This remains an owner-reviewable hierarchy tradeoff. |
| Data/quant analyst | Actual supplied table/chart and numerical summary were inspected; trace slider revealed the supplied stdout event with explicit no-execution notice. Source files exposed `fixtures/measurements.csv` with counts/totals and a missing count. | The “check the denominator” story's plot uses the general square-value specimen rather than that measurements file. These are functional integration specimens, **not fully aligned authored teaching sequences**. Do not claim this test establishes learning quality or a complete data lesson. |

Material-inspection action counts omit lab setup and browser observations. Japanese phone geometry was attempted through the real iframe width control, but a development reload reset the lab before the metric/screenshot was captured. This reviewer therefore adds **no independent 390px or 200% zoom success claim**; the owning browser suite/device evidence must support those separately.

### Independent disposition

The concrete retained-identity, Atlas navigation/focus/refresh, long-Note editing and active-renderer teardown findings above have verified corrections within the stated evidence. No additional source-rights bypass was identified in this review. A final independent source rerun passed **46/46** across Foundry platform, extension registration, recipe contracts and real D1/MCP/recovery, Workbench and Unicode recovery tests. The owning task's complete build, browser matrix, compiled default-off exclusion, bundle measurements and fresh constrained-agent reports remain authoritative for those separate gates. Physical Pixel/IME/TalkBack, hosted catalogue refresh and optional licensed/GPU/science lanes remain outside this local review. This is a draft engineering acceptance report, not permission to merge or deploy.

## Parent closure after the independent teaching-content findings

This paragraph records parent integration evidence, not additional independent reviewer activity. Final runtime `a2c78d8` makes raw canonical source a deliberate disclosure and aligns the Data Detective source CSV/table/chart. Actual Chromium opened the upgraded synthetic Activity at revision3/rendition`r-bb9f920cd0af7b66d2438f2ab62c0c56d93decb4a5b6edf448c535c7bdad62b2`: table A8/10, B9/20, Cblank/12; the explicit count-versus-total chart reported one omitted incomplete pair, row1 count8/total10, and mean total15. The missing count was never changed to zero. Both views activated, and leaving Explore for Hints removed both owned renderer mounts (count0). The exact-source disclosures were collapsed by default while Reader links remained available. [Corrected data screenshot](evidence/data-coherence-corrected.jpg). Shared admission/digest and targeted one-time CAS upgrade regressions passed; the final full suite passed1,000 with one existing Rust skip. The earlier critique remains preserved above as the reason for the correction.
