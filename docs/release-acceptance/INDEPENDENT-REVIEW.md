# Independent final correction challenge

25 October 2026. A separate reviewer, who did not implement the origin, recovery, continuity or GitHub-integrity corrections, inspected their actual source and executed the application-backed tests below. This is a synthetic local engineering review; it is not hosted or physical-device acceptance. Parent release ownership supplies the eventual exact GitHub/native candidate tree and integrated build receipt.

## Disposition: NO-GO for production; bank the corrected candidate

The reviewed local domain/security corrections are appropriate, and the additional ambiguity defect identified here has been corrected and retested. They do not waive the mandatory browser gate. The independently invoked pinned-browser preflight exits **2**, explicitly **NOT RUN** before application assertions. It cannot establish any of the 37 required Playwright/ARIA/axe/screenshot cases.

Remote CI's reported zero-step failure and unavailable logs are not a green result or a confirmed provider diagnosis. The release owner must retain the actual connected GitHub receipts and its separate CI disposition. Hosted owner authentication, deployed Activity/Atlas publication/readback, new installed MCP catalogue and production synthetic cleanup are not demonstrated by this reviewer. No overall GO should be inferred from passing local tests.

## Independent source assessment

- **Recovery:** both import staging and activation invoke `validateStagedOutputBindings`. Its new checks apply strict Activity/Attempt schema and deep project/Foundry admission to current and historical rows. Attempt targets resolve by the staged owner namespace, exact Activity ID and retained rendition, then validate hint membership. A caught invalid nested project or immutable target rejects before activation. This closes the demonstrated encrypted-file admission bypass without turning encryption into a content-authority claim.
- **Rollback:** the accepted rollback strategy is the hardened new binary with feature gates off. It retains raw Activity/Attempt metadata while generic projections withhold it and unrevealed hints. The old pre-Activity V27 binary is not an accepted rollback once Activity data exists. Do not restore an earlier archive over later genuine Notes to simulate rollback.
- **Continuity:** the bounded exact link traversal uses eligible owned projections and separately resolves Activity companions omitted from generic summaries. Note/Attempt queries retain context and owner scope; namespace-version and generation checks reject mixed snapshots. Related and search omissions are explicit, and terminal transcripts have exact read pointers rather than truncated raw markers. A result remains a bounded window, not proof that no other saved evidence exists.
- **GitHub:** starter byte verification and visible-test integrity are now separate. Modified/deleted/renamed original visible tests produce an explicit warning. The receipt still says `not-executed-by-minamo`; neither a commit nor an unchanged visible test proves execution or an independent oracle. Trusted provider reads remain a prerequisite; arbitrary caller JSON is not a provider.
- **Origin:** absolute handoff links default to the control-plane-verified renamed Minamo host. The origin allowlist rejects the retired host, Legacy, credentials, paths, query injection, alternate ports and arbitrary HTTPS hosts. Request Host/forwarded headers grant no origin authority. Internal record/rendition links remain relative and family-qualified.

## Additional defect found and corrected by this review

**REV-R01 — cross-family exact-name ambiguity.** A Journey and an Investigation with the same exact natural name (and even the same ID in their separate families) both appeared in `targets`, but `ambiguousTargets` was `false` because the previous check only counted collisions within one family. A fresh tutor has no family information in that natural name and must choose an exact target before attribution/publication.

An independent real Worker/D1/MCP fixture reproduced the failure (`false !== true`). `getActivityContext` now considers every multiple exact match ambiguous. The new regression verifies both family-qualified matches, the required selection message and zero learning checkpoints. The two-line runtime correction requires parent review and a rebuilt/final integrated source validation; this reviewer does not pretend to be independent of that final narrow change it authored.

## Actually executed checks

| Check | Result | Evidence |
| --- | --- | --- |
| Recovery, continuity, exchange and origin scoped tests before the new fixture | 33 passed, 0 failed | `evidence/independent-challenge-initial.log` |
| New cross-family collision fixture before correction | 1 failure, correctly reproduced | `evidence/independent-ambiguity-before.log` |
| `node --test tests/activity-recovery-adversarial.test.mjs tests/activity-resume-adversarial.test.mjs tests/activity-exchange.test.mjs tests/gpt-context.test.mjs tests/layout-gpt-intents.test.mjs` after correction | **34 passed, 0 failed**, 7.295 s | `evidence/independent-challenge-final.log` |
| `node node_modules/typescript/bin/tsc --noEmit` | Passed, exit 0 | `evidence/independent-typecheck.log` |
| `node scripts/interface-browser.mjs --url http://terminal.local:4173/` | **Exit 2; no assertions executed** | `evidence/independent-browser-preflight.json` |

These test runs overlap specialist runs; their counts must not be summed into a unique aggregate. The final integrated suite/build must follow the ambiguity correction and any later runtime changes.

The source inspected after the narrow correction had these SHA-256 digests:

| File | SHA-256 |
| --- | --- |
| `lib/recovery.ts` | `171f16f6c8eb9d678e2b4408a1274cf29d8e607be2cf02f51d1f58f27430f25c` |
| `lib/activity/domain.ts` | `0d2b759143c20a40fbb2da273f6e56b9243285355d6b18a3beb59ce3cf34f60f` |
| `lib/challenge-exchange/evidence.ts` | `77bceccfae4f72f4a530475985adc6beb4a7a0cc157e992b5336d05d92be735b` |
| `lib/reading-links.ts` | `d3e062d183843fd8c7f01b0389723d69527f041cf147974ca05bcc9b35321fc6` |

## Conditions for the next release decision

1. Freeze the final corrected tree and complete integrated typecheck, production build and full suite; preserve any absent-tool skips and prior setup failures honestly.
2. Execute the 37 pinned Playwright cases in a supported runner with the correct browser artifact; review real screenshot/ARIA/axe results and fix actual failures. CUA evidence is separate.
3. Obtain actual remote CI or a clearly justified independently reproducible provider-blocked alternative disposition. Do not infer a billing or application cause from zero exposed steps.
4. Recheck the stable Minamo identity/access/native source and hardened feature-off rollback, then perform the authorised staged private release and actual hosted synthetic round-trip only if the independent release gates pass.
5. Reconnect/reinstall MCP at the point the new server is actually deployed and the client catalogue/host is stale; perform a genuinely fresh conversation test. Keep unverified optional canvas/science/GPU/audio/untrusted runtimes off.
6. Keep physical Pixel 8a touch/IME/TalkBack and real hardware-specific checks explicitly outstanding until performed. Retain complete production baseline/cleanup receipts before calling post-release acceptance complete.

No production records, access settings, secrets, Site source or deployment were changed by this reviewer.

## Final narrow source addendum

After the initial review, parent release ownership reviewed and accepted REV-R01. This independent reviewer then inspected the final saved-link compatibility and DEV-lab startup changes and executed `node --test tests/interface-preview-startup.test.mjs tests/manuscript-reader.test.mjs tests/gpt-context.test.mjs tests/layout-gpt-intents.test.mjs`: **29 passed, zero failures**, 3.390 s (`evidence/independent-final-narrow.log`).

The retired V2 origin is admitted only by strict saved canonical reading-link parsing. Rendered hrefs target the current verified Minamo origin; retained stored manuscript URL bytes are unchanged. Legacy and arbitrary hosts remain rejected for internal navigation, and `absoluteReadingLink` still rejects the retired origin for new GPT handoffs. This is a safe compatibility projection, not authority to fetch a retired host or rewrite saved records.

The DEV-only synthetic laboratory now caches only completed initialization, rather than sharing an in-flight D1 promise between requests. Initialization remains replay-safe through fixed operation IDs and `IF NOT EXISTS` migration statements. The concurrent/cancelled-first-request test passes, but also passed the previous implementation: this change is defensive lifecycle hardening, **not a proven fix for the separately observed preview stall**. It does not alter the production gate or confer real owner identity on lab fixtures.

Final additionally inspected SHA-256: `app/reader.tsx` = `2755f067f57233c25520fd160ef9d112966e852bb35338e8271b3c09f220f7c9`; `lib/interface-lab-preview.ts` = `829c1746951b5379ecd9c271d3e25ab49e0c3bba20242dff60aae80b1852a37f`. The reading-links and Activity domain digests above remain current at this addendum.

The reviewer also inspected the browser specialist's persisted `PLAYWRIGHT-INSTALL.log` and `PLAYWRIGHT-DOWNLOAD-{HEADERS,BODY}.txt`: the official pinned-download response is a 195-byte HTML document rather than a valid ZIP. This corroborates the independently reproduced preflight blocker; no substitution or assertion success is claimed. **NO-GO remains unchanged.**

## Note first-save correction addendum

The browser specialist subsequently reproduced an actual first-save problem: a typed ordinary paragraph ending in a space was saved exactly, but the rich parser dropped that space and declared the saved identity incompatible, switching to source fallback. The independent reviewer inspected the final `lib/note-rich-codec.ts` correction. It restores paragraph edge spaces outside terminal-only Notes, aligns simple multi-paragraph chunks with parsed nodes, and leaves code/terminal/image nodes and the full document/visible-text compatibility guard in place. Complex constructs still use the original-source fallback when an exact supported edit cannot be established; saved source is not rewritten on read.

The actual browser first-save and typing retest belongs to `BROWSER.md`; this reviewer makes no separate CUA claim. Independent execution of `node --test tests/note-rich-writing.test.mjs tests/note-terminal.test.mjs tests/notes-writing.test.mjs tests/domain-images.test.mjs` passed **48 tests, zero failures**, 2.602 s (`evidence/independent-note-final.log`). Source reviewed: `lib/note-rich-codec.ts` SHA-256 `ec0431ce39342f631f85f33adb8809d720b14d8cc62598364698aaa585c50f96`. This final runtime correction must precede parent integrated build/full-suite validation. The mandatory browser/CI/hosted **NO-GO remains unchanged**.

## Final first-save caret adoption addendum

The separate browser test subsequently isolated the sibling first-save caret reset: after the temporary Note acquired its saved ID, continued typing inserted at the beginning. The reviewed correction retains the live ProseMirror EditorState when `restoreIdentity` explicitly identifies the same Note and its latest serialized source matches the new identity's source. It prefers that live caret, stored marks and undo history over a stale saved-ID entry, avoids a redundant `updateState`, and retains the prior scroll offset. A different Note or changed external source still selects the matching retained state or creates a fresh state; scope changes still clear saved editor state and attachment state. No persistence authority or saved record is changed by identity adoption.

The independent reviewer inspected `app/note-writing-editor.tsx` and `lib/note-rich-editor.ts`, then reran the same four-file Note/terminal/writing/image batch with the new adoption regression: **49 passed, zero failures**, 2.564 s. Evidence: `evidence/independent-caret-final.log`. The actual GUI proof remains the browser specialist's evidence, and the new portable caret case is **prepared but unexecuted** alongside the original 37 mandatory cases. The required portable browser total is now **38**, not 37 passed.

Source SHA-256: `app/note-writing-editor.tsx` = `f6388c68a67aafd25db6a95b911dd0f7cea487de0f183e27e2518bb0a00755de`; `lib/note-rich-editor.ts` = `7e4827bfe45cc2245491de587ab6e493fad8cf40abf86f24516a2c8a54d8f802`. Parent final production build/full suite must include these final runtime changes. Overall **NO-GO remains unchanged** pending the external gates.
