# Independent Tier 1 bytes activation trial

Status: final independent tests and actual browser rerun pass after explicit Pro SDK/host/Notes corrections described below. The first browser failures remain part of the evidence; this is not an unaided first-pass activation, hosted acceptance or physical-device claim.

Frozen starting source: `3d67bd7`. Restricted initial dossier: `LIGHT-ACTIVATION.md` trial B, `SDK-RECIPES.md`, `COMPONENT-CATALOGUE.md`, registry catalogue, template script and existing extension/domain test APIs. No design reasoning/history was read.

## Owned changes and original specimen

- `app/interface-view-registry.ts`: only `source.bytes-v1.enabled:false` → `true`.
- `tests/interface-trial-bytes.test.mjs`: independent enabled-registry/native-DOM and actual Worker/D1/typed-MCP tests.
- This report.
- Generated ignored local request: `.sites-runtime/trial-bytes.json`, from `node scripts/interface-foundry-template.mjs --id synthetic-bytes-trial --output .sites-runtime/trial-bytes.json`. The original text was deliberately replaced in canonical source and payload together, with its SHA-256 recomputed; math/template/recipe retained. The request then passed the documented `--validate` command. Test-specific generator requests use temporary directories removed in `finally`.

Exact text is `A😀e\u0301\r\nTEST ONLY bytes trial B.`: 31 UTF-16 units, 30 Unicode characters and 34 UTF-8 bytes. First ten bytes are `41 f0 9f 98 80 65 cc 81 0d 0a`; the test checks all 34 rendered table bytes against `Buffer.from(literal)`, not just that prefix. Math remains the generated authored `(x+1)^2=x^2+2x+1`.

No Workspace, Notes, CSS, schema, route or dependency edits were made by this trial. An existing unrelated modification to `app/interface-workbench.css` was present at entry and untouched.

## Executed checks

`node --test tests/interface-trial-bytes.test.mjs`: 2/2 pass (final run approximately 2.55 seconds).

The first test uses the actual default enabled registry, original `plainTextArtefact`, admission, explicit activation, semantic table, inherited `sourceRef` admission denial, active revocation, cleared host, removed button listeners, repeated dispose and forged payload denial. It uses the existing minimal native-DOM harness; it does not certify browser gestures or assistive technology.

The second test generates its own two-component request, discovers real MCP capabilities, previews and publishes via actual compiled `domainHandler` and isolated local D1/R2 using `privateStorageFixture`. It reads the exact Activity, recipe, text and formula back, proves foreign-owner read returns 404, trashes an owned synthetic linked reading and proves its source is replaced by an inert unavailable marker without its canary. Direct D1 checks prove zero `run` records and zero learning-development rows. Fixture disposal runs in `finally`.

Shared checkpoints and actual browser receipts remain to be appended by the parent after the integrated candidate is frozen.

## Errors, retries and manual choices

1. Initial rendered-text regex assumed ten consecutive hexadecimal values, but the view defaults to eight bytes per row. Replaced with exact semantic table cell extraction.
2. First cell extraction incorrectly counted the offset header as a `td`; the actual offset is a row `th`, so extraction was corrected to every other `td`. Final full byte-array assertion passes.
3. An initial shell request to `localhost:4173` failed with connection refused. A subsequent request to the authorized `terminal.local:4173` hung and was interrupted. No API mutation occurred. The parent clarified that terminal networking cannot reach the managed browser preview; no alternate endpoint was probed afterward.
4. Browser extension JS tool was absent from the available registry. The documented Browser skill fallback uses the available CUA cloud browser. Opened the exact managed preview successfully. The existing `TEST-ONLY-interface-read` Activity initially loads and then exposes a ruby source, so it is not a substitute for this trial's original bytes specimen.
5. The parent assigned a separate Pro harness update for explicit typed-MCP Preview/Publish/Readback UI controls. This is an SDK/test harness clarification and an unplanned dependency of the actual-browser publication receipt. The trial makes no harness edits.
6. Available CUA Tab API does not advertise viewport resizing. A 390px controlled Workspace container must be demonstrated by the existing/updated harness; clipping a screenshot would not prove a 390px layout.

No literal Light-model speed claim is made. This receipt records a constrained-context independent integration task and its real evidence only.

## Actual browser publication and blocking defects

Managed route `http://terminal.local:4173/preview-interface` now exposes the separate Pro harness controls. Filled the complete unchanged `.sites-runtime/trial-bytes.json` request through the real UI; Preview displayed `valid · not-executed · no publication requested`. Publish committed `synthetic-bytes-trial`, revision 1, edition `r-915a504863604c8874181e420324df8947f5cedf13ffb6ec460e47c0918318a0`. Read back retrieved that exact persisted edition with matching full canonical text, SHA-256 `05ffb370741ff2e74dfcf27abc334357ee57f96693a8492a32b57bda5cfd7c27`, formula, recipe and payload. The iframe opened the exact edition in the actual Workspace with Explore selected and both components inert, canonical sources available.

At desktop, deliberately clicked the text artefact's `Open interactive view`. It remained at `Validating the current Activity and exact source…` across subsequent observations (including a fresh full accessibility tree and screenshot). No byte table appeared. Changing the harness's actual iframe document width to 390px retained that stuck validation state. The 390px responsive Workspace itself was observed, but this is not a useful narrow byte-inspector acceptance receipt. This is a current browser activation blocker; native harness success does not overrule it.

Opened existing canonical Notes at 390px. The first `setValue` action did not actually retain rich-editor input, as confirmed on later reopening; this was an input-method retry, not a claimed draft preservation success. Switched real document width to 1280px and mode Classic→Task, then opened Notes and used `typeText` on its actual rich writing editor. The exact synthetic text became visible and the host announced `Retained on device`:

`TEST ONLY trial B draft — A😀é remains exact across Classic Focus Task.`

That real edit triggered a visible `Unhandled Script Error`: `Maximum update depth exceeded`. The rendered stack names `app/notes-panel.tsx:30:126` (`change`), `:45:86` (`patch`), `:106:5532` (`Object.onChange`), and `app/note-writing-editor.tsx:51:1399` (`EditorView.dispatchTransaction`). The trial stopped Notes work and reported this to the parent. No Notes or Workspace repair was attempted. Classic/Focus/Task draft preservation and actual browser activation/disposal remain **unproven**, blocked by these defects. No physical Android/IME or screen-reader claim is made.

## Final rerun after Pro corrections

The parent supplied a corrected frozen candidate (`47f6577` plus its mount-root lifecycle correction, followed by the observed narrow-layout correction; current shared checkout advanced to `e443da1` during the programme). Pro made the host's same-edition source identity/lifecycle repair, introduced explicit metadata `presentation.slots[].viewId` selection instead of replacing ordinary prose by source kind, repaired the existing Notes editor format-feedback loop, and constrained grid/owned mount widths. These are recorded Pro interventions discovered by the first browser trial, not hidden within the one-flag task.

The trial updated only its independent test and ignored request/report: use `interfaceActivityRegistry('source.bytes-v1')` and set `viewId:'source.bytes-v1'` on the `passage` explore slot. The same canonical text, hash, formula and payload were kept exactly. The revised original UI request used `operationId:'synthetic-bytes-trial-publish-v2'`, `expectedRev:1`; Preview passed and Publish committed revision 2, edition `r-c9b54cb5731d07367c3b4f66a1a20c12d8fa96b54ecd9b1952d2579874ea3acf`. Final real typed MCP Read back again returned the exact persisted revision/source/hash/formula/recipe and explicit view ID, with no checkpoint. A screenshot of this successful final readback was captured in the CUA tool record.

The final independent test run, now including omitted-view ordinary prose behavior, passed **2/2** in approximately **2.47 seconds**. The parent owns shared suite/TypeScript checkpoints.

Actual browser results:

- Deliberate text activation succeeds and shows the semantic `Exact source UTF-8 bytes` table. All 34 bytes were observed in the accessibility table, matching the literal source. Canonical source and accessible text equivalent both retain the same Unicode/CRLF text.
- At an actual 390px iframe document width, keyboard Down+Return changes rows from 8 to 16; ArrowUp restores 8. The row count correctly changes 5→3→5. Disabled previous/next controls accurately reflect this short source.
- The initial narrow inspector had clipping outside its intended local table region. After the parent Pro width correction, read-only DOM geometry measured viewport **390**, document scroll width **390**, inspector width **283.8125**, right edge **329.40625**; all controls end within the viewport (right edges **183**, **323.375**, **140.546875**). The **488.59375px** table alone exceeds its **283.8125px** local scroll region. Actual horizontal-region gesture and accessible text expansion worked. Screenshots captured both the earlier clipping and corrected 390px table/controls.
- Desktop width 1280 also renders the full byte table. Explore→Task removes the byte table (`table` count **0**); returning to Explore shows `Ready to inspect` and `Open interactive view`, proving it requires a new deliberate activation. Native lifecycle tests separately prove listener removal and repeated dispose behavior.
- Existing Notes receives a new synthetic **196 UTF-16-unit** long Unicode/multiline draft through real `typeText`. No script-error overlay occurs. Its exact text remains across Classic→Focus→Task, receives `Saved · revision 1`, survives minimise/reopen and a 390→1280 width round trip. The Notes source-context link explicitly identifies the same Activity revision-2 rendition. A screenshot captures the saved draft alongside the active byte view. The final draft is:

  `TEST ONLY trial B corrected draft — A😀é preserves exact Unicode and source identity.`

  `Classic, Focus and Task keep this same synthetic Note while byte inspection remains a deliberate view choice.`

- A separate browser tab opened retained revision 1 (the same original source without `viewId`). Deliberate activation renders ordinary text, with **0 tables**; no byte inspector is substituted. The independent native test also verifies this omitted-selection behavior.

One final locator retry occurred: Playwright role lookup for the outer `Publish original synthetic Activity` disclosure returned no match despite its accessibility button representation. A fresh AX snapshot and its current element index successfully opened the same disclosure; no publication was retried or duplicated.

Screenshots were observed/captured through the authorized CUA browser tool; this trial did not create standalone screenshot files or claim those records are physical-device captures. Parent-controlled local D1 cleanup remains the programme's responsibility after all trials finish. No Attempt or learning-development action was invoked in the browser; isolated D1 test counts remain zero for both categories.
