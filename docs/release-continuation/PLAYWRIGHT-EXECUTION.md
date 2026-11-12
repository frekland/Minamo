# Pinned browser acceptance and corrections

**Final result: 39/39 actual Playwright cases passed**, including all37 original cases, the first-save caret regression and an added retained-Experiment safety regression. The final run compared all16 screenshots and16 exact ARIA baselines without an update flag. Twelve axe checks, all nine document widths and the functional cases also passed. [Final raw log](evidence/PLAYWRIGHT-FINAL-COMPARISON.log).

This is actual production React client components plus a compiled real domain adapter in isolated local D1/R2. It does not claim native Sites authentication, SSR/hydration, a physical Android device or a complete accessibility certification. Those remain separately evidenced release gates.

## Exact final source

[Final source receipt](evidence/PLAYWRIGHT-FINAL-SOURCE.json) records216 source/build/test inputs, the compiled backend hash and65 browser assets. Its source digest is `e45ca12828a47db42c4af3bdcf58e62a3dd09936a83638e01583f9dedb33f5cf`. The receipt's base Git commit is `7fbb119faea56f35a58ccf68ffb9bce8e8b01af4`; the hashed working-tree corrections must be included in the final release commit. A base commit is not falsely presented as containing those later corrections.

Affected source tests passed28/28 with no skips. TypeScript passed. [Unit log](evidence/PLAYWRIGHT-FINAL-AFFECTED-UNIT.log), [typecheck](evidence/PLAYWRIGHT-FINAL-TYPECHECK.log).

## Browser acquisition and original transport boundary

The security specialist acquired exact Chrome for Testing headless-shell145.0.7632.6 / Playwright build1208 from Google's official publisher artifact, verified publisher MD5 and SHA256, and installed it in Playwright1.58.2's default registry path. Its version was executed and linked libraries resolved. No browser pin, executable override, sandbox or network permission changed. [Artifact receipt](evidence/PLAYWRIGHT-BROWSER-ARTIFACT.json).

The original supported Sites preview returned `http://terminal.local:4173/`, but the standalone browser could not reach that managed surface. The actual first38-case attempt launched the correct browser, then37 navigations failed with `net::ERR_EMPTY_RESPONSE` and one API request with `ENETUNREACH`, before application assertions. [Initial log](evidence/PLAYWRIGHT-INITIAL-CAPTURE.log), [trace archive](evidence/PLAYWRIGHT-INITIAL-RESULTS.tar.gz).

A single separately approved smoke used Playwright1.58.2's [documented proxy option](https://github.com/microsoft/playwright/blob/v1.58.2/docs/src/network.md) from the already supplied managed environment, targeting the exact same URL. It timed out. No proxy URL/credential was printed, persisted or traced; no new proxy, bypass rule, host mapping or global setting was introduced. [Redacted result](evidence/PLAYWRIGHT-MANAGED-PROXY-SMOKE.json). This transport failure was not relabelled as an application failure or a pass.

## Commissioned isolated E2E fixture

The parent then explicitly authorised a separate local test fixture for PR44's requested real browser + isolated D1/R2/MCP acceptance. `scripts/interface-browser-isolated.mjs`:

- Bundles the actual `InterfaceLab`, `Workspace`, Reader, Notes, lazy renderers and root CSS, using production React and the established Tailwind PostCSS transform.
- Compiles the actual `interfaceLabPreviewHandler` and `domainHandler` into ephemeral Miniflare D1/R2. Its fixed principal is `TEST-ONLY-interface-browser`; no production identity or storage binding is supplied.
- Serves only the fixture HTML, generated browser assets and approved local identity assets. API forwarding uses the existing bounded same-origin preview adapter. Body size and static paths are bounded.
- Owns a sandbox-local127.0.0.1 HTTP listener with an OS-assigned port. It does not replace, expose or reconfigure native Sites preview infrastructure, alter proxy/network/hosts, or use CDP discovery.
- Passes its explicit localhost URL to the existing pinned test runner. Tests are not skipped or suppressed. Disposes the HTTP server, Miniflare and generated files on completion.

The fixture has client mounting rather than production SSR/hydration and synthetic rather than Sites-dispatch identity. Independent security review accepted it as legitimate component/domain browser evidence while retaining those separate qualifications. Production lab routes remain DEV-gated; the compiled production404 guard must pass in the release owner's final source verification.

## Failures found, corrected and retested

The first real isolated run passed32 cases and failed6. Its raw failures are retained rather than replaced by the successful result. [Initial isolated run](evidence/PLAYWRIGHT-ISOLATED-CAPTURE-01.log), [trace archive](evidence/PLAYWRIGHT-ISOLATED-CAPTURE-01-RESULTS.tar.gz).

| Finding | Correction and proof |
| --- | --- |
| Selected text was visibly bold while the toolbar reported `aria-pressed=false` at an unmarked selection boundary | `richNoteMarks` now checks the selected range for non-empty selections. A deterministic boundary/toggle regression and the unchanged integrated long-Note formatting case pass. |
| Data/audio lazy adapters assumed named exports from a dynamic CommonJS ReactDOM namespace | Lazy application renderer modules now use static ReactDOM imports, matching the established language renderer pattern. They preserve admission, explicit activation and idempotent disposal. Actual data/audio activation→departure cases pass. |
| A missing Activity/tool record silently displayed a fresh executable Python sample | Exact unavailable/loading states now take precedence; the owned tools host stays mounted but hidden until eligible context exists. The case requires an unavailable heading and hidden tools. |
| A current plain Experiment could expose executable context when an explicitly requested retained edition was unavailable | Independently challenged and actually reproduced. Tools now require exact reading readiness and receive the exact displayed record. The added39th case proves unavailable editions hide tools, then proves valid edition1 loads edition1 code while the head is edition2, with no execution. [Before failure](evidence/RETAINED-TOOL-BEFORE.log), [after pass](evidence/RETAINED-TOOL-AFTER.log). |

Three test-harness assumptions were repaired without reducing their acceptance intent: the actual revealed hint control is **Hide hint**, Japanese canonical identity is carried by four UTF-16 spans rather than one parent container, and an article belongs in the Knowledge constellation rather than the Journey-only lens. Exact source text, hint expansion, focus return and Notes-host preservation remain asserted.

The earlier first-save whitespace/caret corrections are also exercised by the final suite. Their prior live cloud-browser evidence remains in `docs/release-acceptance/BROWSER.md`.

## Baseline review and repeated comparison

No screenshot/ARIA baselines previously existed. Captured16 actual screenshots and16 raw ARIA trees; inspected every image individually and reviewed semantic controls, source destinations, selected tabs, provenance and unopened-hint behavior. The six subjects cover390px and1280px; four desktop variants are included. The mobile synthetic-only notice adds vertical space; it is not evidence of production banner behavior or physical-device testing.

The explicit approved-baseline run passed38/38. Comparing its actual images with the reviewed captures found nine byte-identical images and seven with only one or six antialias pixels at rounded corners (under0.001%). Those actual approved versions were also opened for review; an independent reviewer verified the same deltas. No pixel tolerance was changed.

Playwright's generated ARIA baselines replaced fixed numbers with regexes and one sequence label with an empty wildcard. Those automatic heuristics were rejected: all16 expected ARIA files were replaced with the reviewed exact literal captures. The actual comparison therefore remains stricter, including source values and the `2 of 4` label.

[Reviewed captures](evidence/PLAYWRIGHT-VISUAL-REVIEW.json), [all32 approved file hashes](evidence/PLAYWRIGHT-APPROVED-BASELINES.json), [approved-baseline run](evidence/PLAYWRIGHT-BASELINE-APPROVAL.log), [first fresh comparison38/38](evidence/PLAYWRIGHT-COMPARISON-01.log), [final39/39 comparison](evidence/PLAYWRIGHT-FINAL-COMPARISON.log).

All32 baselines remain unchanged after comparison. They are stored under `tests/interface-browser/baselines/chromium/workspace.spec.mjs/` for future regression runs.

## Final scope and cleanup

The final suite verifies original six-subject surfaces, nine widths, four variants, keyboard/hints/files, long Unicode Notes and exact saved readback, phone reduced-height/minimise/reopen, exact CJK source, unavailable context, Atlas keyboard/source navigation, retained editions, renderer teardown and Notes-host continuity. Axe checks target serious/critical WCAG2A/AA/2.1AA violations within the Workbench. Passing them is not a blanket WCAG or screen-reader certification.

All fixture records, operations and assets belonged to disposable local synthetic storage. Each runner invocation disposed that storage and its server. The native supported preview is stopped. No production publication, Minamo Legacy write, genuine learner mutation, secret read or authentication operation was performed by this specialist during the continuation.

G04 can now be considered against real source-bound browser evidence, subject to the independent release review. Final production build/SSR guards, owner-private authentication, hosted MCP round trip and physical Pixel8a acceptance remain distinct; this report alone does not grant an overall deployment GO.
