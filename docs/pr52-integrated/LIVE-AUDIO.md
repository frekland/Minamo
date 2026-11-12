# Live audio acceptance — V32 defect and V33 continuation

26 October 2026. This receipt separates the initial service-access probe, the actual V32 browser upload defect, its source correction and subsequent V33 installed-MCP publication. Browser playback and UI Attempt evidence are recorded only when actually supplied by the release owner.

## Actual access result

- Native `get_site` confirmed Minamo **V32**, the existing owner role, exact origin `https://minamo.jscymru.chatgpt.site` and availability of a service-access credential. No credential is included here.
- The current Sites **Identity and Secrets** guidance says service access uses `OAI-Sites-Authorization: Bearer <token>`, and explicitly states that dispatch supplies neither visitor identity nor connected-app consent.
- One harmless GET to `/api/workspace?limit=1`, using precisely that supported service header and the current generation header, returned **HTTP 401**, code **`sign_in_required`**, message **“Sign in with ChatGPT is required.”** No generation or record collection was returned. No visitor identity header was supplied, and no identity/auth policy was weakened.
- Actual installed `get_minamo_activity_capabilities` returned catalogue **`integrated-practice-2026-10-26.4`**, generation **`legacy@0`**, Activity enabled and block kind **`listening`**. The connected Minamo tool inventory has typed Activity publication/Attempt/readback but no audio-byte staging/upload tool. Metadata or an inline PCM Foundry object cannot substitute for an attached private recording asset.

Therefore the service credential alone cannot run the existing private web-API acceptance script against these owner-scoped record endpoints. The parent was informed immediately to use its already authenticated browser. There were **zero production writes and zero new synthetic records/assets** in this access probe; its cleanup ledger is empty.

## Exact files for authenticated upload

Both files already exist in the released repository checkout under:

`/workspace/scratch/c425c5aafd59/.sites-checkout/tests/fixtures/practice-audio/`

| File | Source text / language | Bytes | Duration | SHA-256 |
| --- | --- | --- | --- | --- |
| `japanese-konnichiwa.wav` | こんにちは / `ja` | 29030 | 0.90475 s | `322757bd773146d8d899960df527a5a45ba66c5dd50057ffb7ce6aaaf53eba81` |
| `mandarin-nihao.wav` | 你好 / `zh-Hans` | 33888 | 1.0565625 s | `506380acaef046ffb3b92fa82c847cab39eba62607cdb4e9b2fd31281e56a1e8` |

These are actual human-recorded short greetings, converted to mono 16-bit PCM WAV at 16000 Hz. Attribution, primary file descriptions, CC-BY-SA-3.0 license and conversion details are in the neighboring `README.md` and `manifest.json`. Retain the author/source/license/change notice in the synthetic source record. No word-level alignment, pronunciation grading, native-speaker review or learner microphone performance is asserted.

## Browser/MCP continuation requirements

1. Use a unique stable task prefix such as `pr52-audio-v32-20261026` and mark every created source, Activity and Attempt **TEST ONLY / synthetic**. Do not modify a genuine record.
2. In the authenticated Note editor, expand **Private attachments → Add / drop document, audio or video**. Alternatively edit an original synthetic Article section and expand **Add private document, audio or video**. Both use the ordinary `MediaAttachment` control. Select the WAV, supply its licensed description, explicitly review permission, choose **Upload original privately**, then **Add media to draft**, and complete the existing parent save/autosave. Upload without the final parent save leaves an ineligible staged asset.
3. Keep the exact greeting text in a separate canonical paragraph part. Read back the saved source through installed MCP after the audio attachment is committed. Record its family, ID, revision, rendition, section and transcript-part ID plus the attached asset ID. The browser's supported metadata check supplies audio revision, digest, duration and attached state. Do not invent asset identity from the filename.
4. Through installed MCP, publish a synthetic original language Activity with one `listening` block: `version:1`, language, `media:{assetId,revision,digest,durationSeconds}`, `transcript:{ref:{family,id,rendition,sectionId,partId},text}`, one segment `{id:"greeting",start:0,end:<exact duration>,textStart:0,textEnd:5}` for Japanese or `textEnd:2` for Mandarin, translation `Hello.`, and provenance `authored-reference`. The full phrase spans the whole file; the transcript must exactly equal the selected canonical part.
5. Open the returned Activity link in the authenticated browser. Check initial concealment/no autoplay, **Play selected segment**, Stop, loop, speed, typed dictation, explicit transcript/translation reveal and comparison. Use the native Play fallback if this browser requires another gesture after async loading. Browser player state is evidence of player behavior, not of human comprehension or audio quality.
6. Deliberately choose **Save listening Attempt**. Read the exact persisted run through installed MCP. Its `attempt.practice.interactions` must pin the listening block and retained Activity edition and contain four submitted-state events: `segment:greeting`, original `dictation-input`, `transcript-revealed:true/false`, and `compared:true/false`. These are synthetic interaction facts, not a formal checkpoint or spoken achievement. Repeat/check the same operation after uncertainty rather than creating a new operation.
7. Add exact source/Activity/Attempt IDs, revisions, links, asset IDs/hashes, observed browser results and cleanup disposition to this receipt. Recoverably trash only this task's synthetic Attempts, Activities and source records after acceptance. Preserve retained asset bytes with their trashed parents for recovery; do not purge assets or revoke genuine sources.

The optional recorder lives in the same attachment form under **Record an optional speaking comparison**. A microphone-denied/no-device observation can qualify fallback behavior separately; actual hardware capture remains unperformed unless the browser really produces it.

## Existing helper qualification

`scripts/practice-audio-live-acceptance.mjs` was prepared and syntax-checked before release but was **not executed** for production publication. It assumes authenticated owner endpoints are reachable with its supplied service credential. The harmless probe above disproves that assumption for service access alone. Its current header value also expects the complete authorization value rather than adding `Bearer ` itself. Do not supply forged visitor headers, browser cookies or extracted session credentials to make it work. Use the authenticated ordinary UI and installed MCP route above.

Runtime source, permanent exemplars and access settings were untouched during this follow-up. Prior isolated D1/R2 licensed-speech upload/Attempt/checkpoint/restore tests remain separately documented; they are not relabelled as live acceptance.

## Material V32 browser defect and scoped correction

The release owner then used the actual authenticated Article editor and uploaded a speech fixture. Immediately after **Add media to draft**, before the parent Article save, the page entered its React error boundary with **“A bounded authenticated workspace scope is required.”** The task-owned source is `ms-3de9ac14ed123e2a709f3a0ef041ace248e23942`; the defect screenshot was retained outside Git at `/workspace/scratch/pr52-audio-attachment-defect.jpg`. The uploaded asset was staged, not acknowledged as attached. No duplicate upload or cleanup was attempted.

The source cause was reproduced with the real `RichSectionsEditor` render: its closed local preview still mounted `RichReadingPart` for the new media, but `RichSectionsEditor → LocalReadingPreview → ProposedReading` omitted the real owner scope. `ReadingMedia` constructed its private byte URL at render time using the default empty scope and threw. Four new actual-component render regressions failed on the pre-correction source, with the first showing the same workspace-generation/media stack.

The scoped correction forwards the actual owner scope through both local and package previews. New/staged media without server-projected display metadata, and unsaved image previews, show authored metadata only; they construct no private-byte URL and start no playback or upload. A previously projected attached media block can use the real supplied scope and existing eligibility check, in a new optional read-only `ReadingMedia` mode that excludes stop-display/revoke controls. Ordinary canonical media management remains unchanged because that option defaults to false. No dummy owner scope, forged identity, auth fallback or server permission relaxation was introduced.

`node --test tests/authoring-media-preview.test.mjs tests/authoring-preview.test.mjs tests/media-reader.test.mjs` then passed **10/10**, zero failures/skips. Coverage includes the real post-attachment rich-editor render, a restored-generation attached preview, staged/scope-free metadata-only behavior, unavailable metadata withholding and unchanged canonical management. The integration owner performs final source tests/build and authenticated retest on the corrected release. The staged asset, source record and existing browser draft state were left untouched by the correction; successful draft recovery/attachment still requires the owner's actual retest.

## V33 Japanese source recovery and installed-MCP publication

After V33, the release owner reopened the earlier browser draft. It did not contain the unsaved media part from the failed render. The release owner recovered **the same previously staged asset**, using an explicitly attested supported MCP `insertBlock` on the task-owned synthetic source; no duplicate upload occurred. Exact installed-MCP readback showed source revision 2 with the attachment, then revision 3 after an attribution-link correction. The initial source had linked a different Japanese greeting file; this was corrected to the actual fixture's original `File:Wikibooksqsjapanese1-snd005.ogg` before publishing the listening Activity. The greeting paragraph and audio bytes were unchanged by that correction. The source recovery command's operation receipt belongs to the parent release ledger; the states below were independently read back.

Native Sites database overview followed by read-only `v2_media` metadata confirmed the Japanese original as **attached**, revision 1, `audio/wav`, 29030 bytes, 16000 Hz mono PCM, duration 0.90475 seconds and SHA-256 `322757bd773146d8d899960df527a5a45ba66c5dd50057ffb7ce6aaaf53eba81`. At that first verification, the bounded media table page was complete with this one row. No visitor header, browser credential extraction or service-token identity substitution was used.

The specialist then called the actual installed `publish_minamo_activity_package` and received a committed receipt; exact `read_minamo_activity` for the returned rendition reproduced the source/media/segment binding. No Attempt or Development was created by these calls.

| Entity | Exact live identity / state |
| --- | --- |
| Synthetic source Article | `ms-3de9ac14ed123e2a709f3a0ef041ace248e23942`, rev 3 |
| Source rendition | `r-317a07e17c580e6697e2cfd0ebe4e4548fb1c72cfe4e093e4eb32720a91eacb1` |
| Transcript part | `s2` / `p2`, exactly こんにちは |
| Attached media part | `s2` / `licensed-ja-audio` |
| Private asset | `media-fab3c15f97343f0f33532768648132b2cf953b21e43ab254a8c7041ee53caf68`, rev 1 |
| Synthetic Activity | experiment `pr52-audio-v33-ja-listening-20261026`, rev 1 |
| Activity rendition | `r-db8c1a3add59449b7f2ee573a85daf37d2bb57e095b0358ba3e12f1c2f6cf4ac` |
| Committed operation | `pr52-audio-v33-ja-listening-publish-20261026` |
| Listening block / segment | `listening` / `greeting`; 0–0.90475 seconds and UTF-16 0–5 |

The Activity includes the actual author, original file URL, CC-BY-SA-3.0 license URL and conversion notice, plus explicit synthetic/no-achievement provenance. Browser entry: [Japanese greeting listening](https://minamo.jscymru.chatgpt.site/?view=tools&family=experiment&id=pr52-audio-v33-ja-listening-20261026&rendition=r-db8c1a3add59449b7f2ee573a85daf37d2bb57e095b0358ba3e12f1c2f6cf4ac).

The release owner is responsible for the actual browser playback/dictation/save interaction, including the **fresh Mandarin upload through the corrected Add media to draft UI**, which is needed to qualify the repaired ordinary path separately from the Japanese staged-asset recovery. The specialist deliberately did not manufacture an Attempt ahead of that interaction. Recoverable cleanup must include the exact synthetic source, Activity and any later UI-created Attempt; keep the listed asset recoverable with its trashed source. No cleanup has been performed in this subsection.

## V33 fresh Mandarin upload and publication

The release owner completed a **fresh** authenticated Mandarin file selection/upload → **Add media to draft** → metadata-only preview → parent save. This time the corrected ordinary flow completed without the V32 React boundary and returned source revision 3. This is the owner's actual browser observation; the specialist separately read the committed source through installed MCP and confirmed its `actor:user`, exact transcript/media parts and projected audio details. No service-access identity workaround was used.

Native Sites read-only metadata then confirmed the second audio file as attached revision 1, 33888 bytes, mono 16000-Hz PCM WAV, duration 1.0565625 seconds and SHA-256 `506380acaef046ffb3b92fa82c847cab39eba62607cdb4e9b2fd31281e56a1e8`. Its source attribution URL had already been corrected to the fixture's actual `File:Zh_n%C7%90_h%C7%8Eo.ogg`. The complete media page now held precisely the two task-owned greeting assets listed in the adjacent ledger.

Actual installed-MCP publication and exact-edition readback succeeded for the following second Activity. Its recording attribution, direct CC-BY-SA-3.0 license, conversion notice, exact attached asset and independently exact transcript were retained. The model did not create an Attempt or checkpoint ahead of the parent browser interaction.

| Entity | Exact live identity / state |
| --- | --- |
| Synthetic Mandarin source | Article `ms-f6a11b5e395dfd6a7ae2a9265837149e4b51f56c`, rev 3 |
| Source rendition | `r-0ebf3430acc98cf83c8fcf50eb4abcc9bef344f06daf9eeae837ae70ede746d1` |
| Transcript | `s2` / `p2`, exactly 你好 |
| Media part | `s2` / `part-34b34d09-4053-4c5b-b130-31f6f31a36d8` |
| Attached asset | `media-32f8b65569385fd86319b071e27578c52d05b0cfe0d64f178ca47a4cc4812187`, rev 1 |
| Synthetic Activity | experiment `pr52-audio-v33-zh-listening-20261026`, rev 1 |
| Activity rendition | `r-1cf6af79d413f758ee899013e3d867f5ff4a232199e7506dc30e50ed5ae5bf4c` |
| Committed operation | `pr52-audio-v33-zh-listening-publish-20261026` |
| Listening segment | `greeting`, 0–1.0565625 seconds, UTF-16 0–2 |

Browser entry: [Mandarin greeting listening](https://minamo.jscymru.chatgpt.site/?view=tools&family=experiment&id=pr52-audio-v33-zh-listening-20261026&rendition=r-1cf6af79d413f758ee899013e3d867f5ff4a232199e7506dc30e50ed5ae5bf4c). Machine-readable exact source/Activity/asset cleanup identities are in `LIVE-AUDIO-LEDGER.json`; UI-created Attempts should be appended once actually saved. Playback/dictation/Attempt results remain separate parent browser acceptance evidence. No cleanup was performed by this publication step.

## Actual Japanese browser playback, dictation and saved Attempt

The release owner exercised the authenticated Japanese Activity in the available cloud browser. Its actual native audio state during looping at 0.75× showed `paused:false`, `currentTime:0.251972`, `duration:0.90475`, `playbackRate:0.75`, `readyState:4`, and `error:null`. Explicit Stop changed playback to paused. Typed こんにちは compared as an exact transcript match; individual transcript/translation disclosure worked. The optional local voice path reported **No eligible local voice**, exercising its honest fallback rather than claiming synthesized speech occurred. These observations qualify the player and comparison controls, not human hearing, pronunciation, native-speaker review or learner proficiency.

The release owner deliberately chose **Save listening Attempt** in that UI. The specialist then independently read the exact persisted run through actual installed MCP:

- Run `attempt-030e8400-ab3e-4cd8-91ae-0ae81009b558`, revision 1, rendition `r-02e5a0883d18f22d46839748bb8754a2a0707da7678f9ab4e1898ddcb8f94aba`.
- `actor:user`, `synthetic:true`, evidence `illustrative`, state `submitted`; original dictation input exactly こんにちは.
- Activity and interaction edition both pin `pr52-audio-v33-ja-listening-20261026` / `r-db8c1a3add59449b7f2ee573a85daf37d2bb57e095b0358ba3e12f1c2f6cf4ac`.
- One `listening` interaction targets block `listening`, segment `greeting`, with `dictation-input:こんにちは`, `transcript-revealed:true`, and `compared:true`.
- Responses/feedback/corrections/review events are empty; no microphone recording, auto-achievement or formal checkpoint was fabricated. The saved next intention asks to compare this exact dictation and clarify uncertain hearing with GPT.

This is a complete production web-save → installed-MCP-readback example with actual typed input and source/edition identity. The exact run has been added to `LIVE-AUDIO-LEDGER.json` for later recoverable cleanup. No cleanup was performed in this step.

## Actual Mandarin browser playback and V34 Attempt readback

The release owner exercised the authenticated Mandarin Activity with loop enabled at **0.5×**. Its native audio state showed `paused:false`, `currentTime:0.550766`, `duration:1.056563` (browser display rounding), `playbackRate:0.5`, `readyState:4`, and `error:null`. Explicit Stop produced `paused:true`. Typed 你好 compared as an exact transcript match. The owner then deliberately saved the listening Attempt through the ordinary UI.

After production V34 (native commit `466b6956bc039f202b66cc9be39ac23dfdc7b997`, owner-private, environment revision 5 as recorded by the release owner), actual installed-MCP exact-rendition readback verified:

- Run `attempt-2fa94079-d88c-4daf-b9cc-c755a30542b9`, revision 1, rendition `r-0e77f4b3e7ef462d6e0570922b3b0c5562e9c869c639f3bb3d888228621cfe7f`.
- `actor:user`, `synthetic:true`, evidence `illustrative`, state `submitted`; source study scope inherited Mandarin / `zh-Hans`.
- Exact target Activity `pr52-audio-v33-zh-listening-20261026`, rendition `r-1cf6af79d413f758ee899013e3d867f5ff4a232199e7506dc30e50ed5ae5bf4c`; the interaction pins that same edition and block `listening`.
- Four persisted events: segment `greeting`, original dictation input 你好, transcript-revealed `true`, compared `true`. Responses, feedback, corrections and review events are empty; no microphone evidence, learner achievement or formal checkpoint is fabricated.

A separate exact Activity read after V34 still resolves its source to retained source revision-3 rendition `r-0ebf3430acc98cf83c8fcf50eb4abcc9bef344f06daf9eeae837ae70ede746d1`, `s2/p2` exactly 你好, and the same attached audio revision 1/hash/duration. A subsequent parent edit of the current source does not implicitly repin this Activity or the saved Attempt. Current-source and retained-source preservation are checked separately in the release receipt.

Both actual UI-created listening Attempts are now included in `LIVE-AUDIO-LEDGER.json` alongside the two source Articles, two Activities and two private assets. No additional production mutation remains from this specialist. The release owner can proceed with protected post-write checkpoint verification and exact recoverable cleanup after completing the remaining task-owned Flag/Annotation acceptance. This section records web/MCP evidence, not physical microphone capture, native-speaker qualification, human comprehension or a production restore rehearsal.
