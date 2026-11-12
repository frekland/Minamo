# PR24 implementation and verification — 23 October 2026

PR24 only. PR23 remains an unchanged draft evidence ledger. Release identities and hosted verification are recorded in PR24's release receipt after publication.

## Shipped design

The reader uses CodeMirror 6 language parsers and Lezer `highlightTree`/`classHighlighter`, not an editable/virtualised EditorView. A bounded EditorState spike proves CRLF is normalised in its document model. Native React source spans preserve V2's existing exact rendition/section/part/UTF-16 capture mapping, overlapping marks, contextual Flag/Annotate, old-rendition warnings and recovery. There is one visible canonical source, no hidden duplicate or second annotation store. No editing API/commands are attached.

The syntax loader is asynchronous, identity-scoped and cancelled on unmount. Syntax updates wait while native source text is selected. Literal source survives import failure and unsupported languages. A one-time client source recreation corrects HTML parser CRLF normalisation even for unknown languages; capture still validates DOM equality before admitting any range. Ordered syntax ranges and source lines merge linearly. JavaScript/JSX/TypeScript/TSX/JSON, Python, SQL and a deliberately small shell stream mode are supported; unknown languages remain literal.

Copy uses the original source string. Line numbers are generated decoration, outside textContent; wrap changes only presentation. Saved tool code/output also use the viewer. Real browser clipboard content matched original CRLF, tab, emoji and combining characters exactly. Native multiline drag selection containing those characters reached the existing annotation editor unchanged.

Ordinary paragraphs have no tabindex/role/click action. Per-paragraph Capture controls and their empty gutters are removed. A single optional whole-passage selector is under Reading options; it excludes unavailable/blocked parts and never quotes Source excerpts in labels. Genuine controls and explicit deep-link targets retain focus. Saved marks use subtle fills and accessible icon triggers, with no count prose or whole-block underline. Preview close restores focus without reopening itself.

Record actions, reader provenance and optional connected context are collapsed. Journey Start/Resume precedes the authored overview. Existing stage navigation, Learn/checkpoint mechanism, version notices and owner editing remain. Section spacing and hierarchy are clearer without rewriting canonical content.

Mobile diagrams remain connected SVGs, fit to width initially, with explicit zoom, local pan/scroll, enlarged dialog, exact source and collapsed text alternative. Video cards retain explicit Load/Unload, provider link, sandbox and autoplay=0 without duplicate reference chrome.

Commands expose action-specific oneOf shapes. Update requires top-level family/id/expectedRev/data; create permits revision omitted/zero; trash/restore require exact rev; setFlag alone has target/active/expectedTargetRev; seed remains separate. Wrong mixed shapes produce action-specific diagnostics, and rejected previews/writes create neither record changes nor receipts.

## Automated checks

- `pnpm run typecheck`: passed.
- `pnpm test`: **589 passed, 0 failed** on the integrated source; targeted checks rerun after the final presentation correction.
- `pnpm run build`: passed, including production Worker/client build.
- Existing D1 tests retain CAS, operation replay/lost-ACK, source rights, historical editions, Notes, Trash and independent learning guarantees.
- Added `tests/reader-polish.test.mjs`; extended actual shared-D1 bookmark/MCP tests. Updated catalogue tests to inspect the discriminated update schema and existing diagram/media tests to assert the revised UI contract.

## Browser observations (synthetic DEV records only)

Cloud Chromium internal preview, desktop plus real 320/360/390/768/1280 CSS iframe viewports. These are rendered viewport tests, not physical Android emulation.

- All tested iframe documents had scrollWidth equal to clientWidth. Long code/zoomed diagrams scroll locally.
- Normal paragraph click at 320px left tabindex and role absent and outline `none`; it did not open capture controls.
- Native desktop multiline code selection opened adjacent Flag/Annotate. Emoji + combining mark + CRLF + tab selection reached annotation unchanged. Copy feedback and the actual clipboard retained the original string.
- Highlighted JavaScript/Python, unknown-language CRLF fallback, line numbers, wrapping, saved overlapping marks/annotation Edit/Delete and retained earlier-capture warning were inspected. Saved-mark close/focus-return was corrected during review.
- Connected 320px and 390px graphs, fit/zoom, enlargement and text/source disclosures were inspected. A full-size default that clipped most of the graph was rejected and corrected.
- Journey overview Start was prominent in the first phone viewport; entering Stage 1 retained location, selector, passive reading and previous/next navigation. Library multi-section code/diagram pages were inspected at desktop and phone widths.
- Before video activation there were no provider media/iframe/preconnect/preload elements. Explicit Load created youtube-nocookie iframe with autoplay=0. The synthetic video's provider returned a private-video notice; the outer original link/unload remained usable. No successful playback claim is made.

## Independent review and corrections

A separate read-only reviewer inspected current source/contracts and ran focused tests (15 passed). It identified and prompted fixes for revoked excerpt quotation in selector labels, unknown-language CRLF after HTML parsing, action-specific seed/create diagnostics and quadratic syntax scans. Final review found no further blocking code defects. Parent independently verified the CRLF issue and correction in the live browser.

## Limits and remaining acceptance

Physical Android native handles, TalkBack, forced-colour OS mode and actual 200% browser zoom were not independently exercised. Narrow-view reflow and accessibility semantics were checked; keyboard shortcuts did not change zoom in this cloud browser, so no zoom claim is made. Browser tooling did not expose a network trace; preactivation privacy evidence is DOM inspection plus the existing no-fetch implementation/automated consent tests, not a packet capture. Local fixtures cannot acknowledge durable writes; persistent effects are tested against disposable D1 and, after release, connected synthetic commands. Authenticated hosted browser gestures are unavailable through the cloud browser; hosted transport/MCP readback is recorded separately.

C-02 remains layout-only/partial by design. Broader authored learning quality and all out-of-scope PR23 findings remain open. Source-only tests do not establish refreshed installed MCP definitions; release receipt must distinguish deployed catalogue, actual connected runtime response and any client-cache refresh still needed.
