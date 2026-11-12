# Independent browser and portable-suite acceptance

25 October 2026. Separate browser/UX specialist. These are source-exposed synthetic developer workflows, not human participants, physical Android results or learning gains. Browser evidence uses the supported Sites preview at `http://terminal.local:4173/`, ordinary production components, isolated local D1/MCP and the synthetic principal `TEST-ONLY-interface-browser`.

## Mandatory portable suite — NO-GO

Pinned `@playwright/test` 1.58.2 resolves Chromium headless shell build1208 / Chrome145.0.7632.6. The official installer was attempted and repeated once to retain a raw log. Each five-attempt installer invocation received an invalid zero-MiB archive and failed with `End of central directory record signature not found`. A separate request to the exact official artifact URL returned HTTP200, `content-type: text/html`, 195 bytes: a `Site Unavailable / Unable to access this site` HTML document. No browser binary was installed or substituted. No network permissions were changed.

- [Raw installer failure](evidence/PLAYWRIGHT-INSTALL.log)
- [Official response headers](evidence/PLAYWRIGHT-DOWNLOAD-HEADERS.txt) and [195-byte response body](evidence/PLAYWRIGHT-DOWNLOAD-BODY.txt)
- [38 enumerated cases (37 original plus one new regression)](evidence/PLAYWRIGHT-CASES.log)
- [Explicit NOT RUN preflight](evidence/PLAYWRIGHT-PREFLIGHT.log)

Therefore **0/37 original portable cases executed**; the new first-save caret regression raises the prepared suite to38cases, also unexecuted. Screenshot/ARIA baseline comparison and axe checks remain unperformed. Actual cloud Chromium interactions below do not substitute for that gate. Do not deploy this candidate under the commission's mandatory browser gate.

## Actually executed cloud Chromium workflows

The initial setup failed because a dependency symlink pointed outside the preview container's `/site` mount. A local copy of the already-installed dependency tree and the supported ignored execution-profile helper repaired that checkout setup. No product behavior or network protection was changed to repair it.

1. Opened the integrated Python fragmented-message Activity; verified the explicit original-exercise label, source file tree, exact buggy starter and exact retained file/part links.
2. Opened Hints. DOM showed three unopened hint buttons `aria-expanded=false` and no visible hint prose. Explicitly revealed only hint1; the UI displayed the concept and stated it is included only on deliberate Attempt save.
3. Entered a synthetic prediction and supplied terminal evidence containing CRLF, ANSI escapes, tab, Japanese and emoji. The form correctly states that Minamo does not execute or verify supplied output. Clicked **Save explicit attempt**; observed a pending disabled form then a committed receipt: **Attempt saved with supplied evidence. This creates no learning checkpoint.** The saved local Attempt link identified `attempt-d55dfad0-f1e5-45c3-81cc-4331077d3aa7` and immutable rendition `r-438fbf34c0f2af6ef50253abf2af3ccd7321dbca9106237b759556c6db1d4e31`. [Actual screenshot](evidence/BROWSER-ATTEMPT.jpg).
4. Opened rich Notes and exercised ordinary sequential Unicode input, source fallback selection and unmount/reopen using the actual Note editor lifecycle fixture. A 24-character sequential input and subsequent26-character append preserved order. The fixture retained the exact rich text across fallback→rich and explicit unmount→reopen. Browser automation imposes an approximately5-second sequential-input deadline, even when a longer timeout is requested; interrupted long sequences are **not** counted as successful long-typing acceptance.
5. A transport interruption during the initial full parallel suite left a local Note operation unacknowledged. The UI retained exact writing and operation, showed **Needs attention**, then **Failed to fetch**. It did not report a false save. Subsequent check reported no receipt and offered retry. Complete recovery of that particular local draft is not claimed.
6. After the origin correction, opened **Reading & GPT actions → Discuss this reading with GPT**. The actual prepared request used `https://minamo.jscymru.chatgpt.site/` with the exact Activity ID/rendition; no old minamo-v2 hostname. It explicitly granted no writes or checkpoint. No request was sent to GPT.
7. Entered a new long Unicode paragraph through the rich editor and switched Classic→Focus; exact visible text survived. Task then exposed the verified whitespace defect below. After the correction, the exact saved Unicode paragraph (including its trailing space) reopened rich and remained byte-for-byte exact across Classic→Focus→Task. This was a paste/fill plus mode-change test; uninterrupted long per-key acceptance remains separately qualified.

The source-view document width measured1363px at a1363px viewport with no document horizontal overflow. The full nine-width/390×420/Atlas/renderers/persona matrix was not independently repeated here; PR43's earlier evidence remains separately scoped.

## Verified Note defect and correction

A new Note containing a plain paragraph ending in a typed space was saved at revision1. Its temporary→saved identity change then forced the rich editor into original-source fallback. Text remained intact, but ordinary writing lost its rich editor. Independent codec execution reproduced `richNoteCompatibility('hello ').supported === false` and `serializeRichNote(parseRichNote('hello ')) === 'hello'`.

`lib/note-rich-codec.ts` now restores paragraph edge spaces stripped by CommonMark, including simple aligned multiple paragraphs. This preserves actual typed text and rich compatibility rather than weakening the lossless compatibility check. Complex unsupported constructs still select source fallback. A new regression covers one/two trailing spaces, leading spaces, Unicode, bold and multiple paragraphs; all30 related rich-writing/terminal/image tests passed, including the identity-adoption regression below. [Raw result](evidence/NOTE-WHITESPACE.log).

### First-save caret continuation correction

The bounded GUI retest exposed a second independent defect: after a first save, the caret moved to the beginning; typing `NEXT` produced `NEXTTEST ONLY trailing space ` instead of appending. The identity-change path could select an older EditorState under the saved ID and reset selection despite unchanged source. `richNoteStateForIdentity` now prefers the exact live state for same-Note temporary→saved adoption, preserving selection, stored marks, undo history and scroll, while real external source replacements remain distinct. The host avoids a redundant state update for that alias.

A deterministic state regression verifies that the live end-caret wins over a deliberately stale saved-ID state and that subsequent typing appends; different Notes/external replacements still load correctly. Added a portable integrated-browser regression; it remains unexecuted with the blocked pinned suite.

**Actual corrected GUI retest passed:** created a new Note; typed `TEST ONLY caret proof `; observed **Saved · revision1** with rich editor and exact trailing space; typed `NEXT` without moving the caret; observed exact `TEST ONLY caret proof NEXT`, then **Saved · revision2**. [Final screenshot](evidence/NOTE-CARET-FIXED.jpg). The previously saved long Unicode paragraph reopened rich and remained exact across all three modes.

## Development initialization hardening

Preview stopped unexpectedly during concurrent full-suite work; after supported restart, HTML loaded but the local lab API hung during initialization. Resource contention/HMR/request cancellation was plausible but not established. The DEV handler shared a module-global pending initialization promise. It now caches only successful completion, so each still-pending caller owns its own initialization work. Idempotent operation IDs prevent duplicate specimens.

A real Miniflare regression starts concurrent requests, aborts an initiating request, then performs a later read; it verifies one12-Activity specimen set and zero Runs. The test passed both before and after hardening: it is **not** claimed to reproduce the observed preview stall or prove its cause. The actual lab later recovered and the renamed handoff was exercised; causation is qualified. Five lab/startup tests pass. [Raw result](evidence/INTERFACE-PREVIEW-STARTUP.log).

## Hosted/provider boundaries

Read-only navigation to the renamed production Minamo origin reached OpenAI's identity/passkey verification wall. No authenticated owner workspace or hosted writes were reached. No authentication handoff or secret entry was attempted. Production data and Minamo Legacy were untouched by this agent.

Read-only GitHub Actions run40228116303 UI returned GitHub404 with visible Sign in because this browser lacked the private-repository session. No provider failure notice was available; no billing/runner explanation is inferred. The connected GitHub API investigation is separately reported by the release owner.

No production synthetic records were created here. Local fixtures/drafts are disposable and confined to the synthetic preview origin/principal. The exact interrupted local Note cleanup is not claimed while receipt recovery remains incomplete. Nothing from the genuine learner corpus was copied into Git.

## Smallest external follow-through

1. Run the pinned portable suite in a supported runner that actually obtains the official Chromium binary; review screenshot/ARIA baselines and execute all37 original cases plus the new first-save caret case (38total).
2. After a gated deployment, perform fresh installed MCP and authenticated owner-private publication/readback/cleanup acceptance.
3. On the physical Pixel8a, verify touch selection, IME/reduced-height Notes, TalkBack and real zoom. These cannot be inferred from desktop browser emulation.

## Final local receipt

The supported preview was stopped after the final affected GUI retest; `sites-preview status` confirmed **Sites preview stopped**. No production publication, settings mutation, authentication entry or genuine-data write occurred.
