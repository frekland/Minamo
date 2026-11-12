# Independent continuation gate review

25 October 2026. This reviewer did not author the clean CI-equivalent attestation and performed no build, test execution, distribution change, merge, production write or deployment during this continuation review. Browser execution is owned exclusively by the separate browser specialist.

## G03 — explicit alternative signoff

**ACCEPT the independently reproduced exact-tree alternative for G03's technical code-verification requirement. GitHub-hosted CI remains red.** This is a deliberate use of the alternative allowed by PR44, not a claim that failed remote checks passed or that their precise startup cause is known. Parent release ownership should record this choice and residual risk explicitly in the owner-authorised release decision. It does not supply an overall GO, override branch protection or waive browser/identity/security/hosted/MCP gates.

The evidence is now materially stronger than the original NO-GO's unexplained failure plus an earlier working checkout. A fresh isolated checkout with actual freshly installed dependencies independently executed every technical command stage in the remote workflow against the exact remote candidate tree. The provider's current job exposes no steps and reports zero runner execution; an unchanged workflow recipe also has a separately retrieved genuine earlier success. This is sufficient equivalent code proof for the commission's explicit alternative, while preserving uncertainty about GitHub's startup annotations and hosted runner/account state.

## What this reviewer independently checked

- Read `CI-ATTESTATION.md`, `CI-ATTESTATION.json`, `CI-PROVIDER-EVIDENCE.json`, the workflow recipe, the frozen input manifest and all four decompressed raw log summaries.
- Called connected GitHub to read commit `890152e41eb65a9c311bf202b3bbd37a57d20776`: it owns full tree `fb4bd3f64cfc5e34d879613c45380f6b3945f4e8`. Direct local Git inspection confirms the isolated checkout's different local commit `7fbb119faea56f35a58ccf68ffb9bce8e8b01af4` owns precisely that tree and remains clean. Commit identity is not falsely equated with tree identity.
- Enumerated every tracked non-document file in the isolated checkout: **628**. The manifest contains precisely those 628 paths, with no missing or unexpected input. Independently recalculated every file's byte length and SHA-256: **zero mismatches**. The manifest's declared aggregate input identifier is `b20a951c783d52df7743d9a0ff6d5bc17cf3948de5f52fdd7ee249479d8c25ae`; the per-file checks, complete tracked-path set and exact Git tree are the independent source proof.
- Verified the isolated `node_modules` directory is not a symlink. The supported fresh installation log reports an unchanged lockfile, successful setup, 623 reused packages and 218 downloaded packages. Platform-exclusion notices concern optional binaries for other operating systems/architectures; they are not failing application checks.
- Decompressed each retained install/typecheck/build/full-suite log and independently matched its exact uncompressed byte count and SHA-256 to `CI-ATTESTATION.json`. The build finishes normally with `scienceIncluded:false`. The full-suite summary is **1,020 tests; 1,016 passed; zero failed; zero cancelled; four explicit skips**, 230,834 ms. The three unstaged optional-science execution skips and absent-Cargo skip are not counted as successful execution. The test command's two-file concurrency bound is the tracked candidate command, not a changed test set or a separate reduced suite.
- Independently called connected GitHub for the current PR run `40233804127`: job `121290951206` is actually `failure`, with no exposed steps. Independently called the historical run `40219549276`: its actual successful job `121247917609` contains successful checkout, Node setup, pinned pnpm install, frozen dependency install, typecheck, build and tests.
- Retrieved `.github/workflows/check.yml` directly from both exact GitHub commits. Their content is identical to the local recipe; local Git computes blob `1216893981f6b8ddb7617e8a3cd46fc5f678c56c`, matching the provider-evidence receipt. Earlier success does not itself validate the new code; the clean exact-tree command run supplies that new-code verification.

The source-pinned clean run and provider observations overlap earlier evidence and must not be added into a fictional unique aggregate test count.

## Residual risk and boundaries

1. **Remote CI is failed, not green.** Its two annotation texts remain unread because the connector rejects their exact endpoint. Null check output, zero exposed steps and zero reported execution identify a pre-application verification failure, not a proved billing, permission, security or provider-fault diagnosis. No such cause is inferred here.
2. The alternative reproduces the workflow's application command stages, not the GitHub runner service, Actions token/checkout infrastructure, runner image or branch-protection service. The fresh local installation uses the supported cache-aware Sites installer with the frozen lockfile; package cache reuse is disclosed. It does not claim a wholly cold network download of all packages.
3. Failed required remote checks must not be forcibly bypassed. If repository policy independently requires those exact checks for merging, they remain a repository-policy block until properly resolved. This technical signoff is not authority to weaken repository settings, change billing, introduce paid services or override permission restrictions.
4. Optional unstaged scientific execution and Rust compilation remain unverified. Keep their corresponding optional/untrusted/heavy lanes off unless separately admitted. The ordinary production build's optional-asset absence and core source tests do not qualify those lanes.
5. The parent must rebind this signoff if any non-document input changes. Later documentation-only receipt commits may share the verified input manifest, but the exact final GitHub/native source tree still needs its own synchronization receipt.

## Other mandatory gates remain independent

**No overall production GO yet.** At the time of this initial continuation review, the specialist has acquired the exact pinned official browser artifact and is preparing the 38 portable cases. Acquisition and installation do not constitute test assertions. This reviewer has not accepted browser baselines, ARIA, axe, screenshots or the first-save caret case until actual raw results have been reviewed.

Owner-private Site authentication, stable source/data/access identity, hardened rollback, exact native source synchronization and post-release Activity/Atlas/Note/MCP readback and synthetic cleanup retain their separate gates. Physical Pixel/IME/TalkBack checks remain physical-device evidence, not browser emulation. A later browser-results addendum will state the actual remaining disposition without weakening any mandatory case.

## G04 source/harness challenge — comparison pending

The reviewer inspected `scripts/interface-browser-isolated.mjs`, the actual source/specification corrections and the first complete 38-case capture. The explicitly commissioned harness bundles the real `InterfaceLab`/Workspace/Reader/Notes and application CSS, and uses the real compiled DEV domain adapter with ephemeral Miniflare D1/R2 under the fixed synthetic owner. It binds an ephemeral loopback port, admits only local fixture/API/assets and does not substitute genuine owner identity. It is a legitimate component-plus-domain E2E fixture for these portable cases. It is **not** native Sites SSR/hydration, protected dispatch, deployed auth or an alternative publication. Those remain separate gates, including the normal production build/compiled-guard checks.

The hint assertion now addresses its actual explicit `Hide hint concept` button while retaining the expanded-state assertion. Japanese source comparison concatenates all four actual canonical spans rather than assuming one node; its exact full Japanese source expectation remains. Atlas chooses the Knowledge constellation lens before expecting an Article reference, then still checks keyboard focus, refresh, exact retained URL and the original Notes host. No assertion intent was removed. The missing-target check is stronger: no Activity plus a specific unavailable heading and hidden tools host.

The selected-range formatting change reads marks over the actual selection instead of only at its boundary, aligning the Bold/Italic/Link accessible pressed state with the actual formatted selection. Data/audio dynamic adapters now load a lazy application module whose static React imports have a stable cross-bundler shape; owned renderer teardown is idempotent and canonical data/provenance validation is retained. These changes require the final normal production build and full-suite rebind; a failure observed under the esbuild E2E bundler is not misreported as a previously demonstrated native-Vite production failure.

The reviewer independently checked all **216** captured application/test/harness input hashes against current source with zero mismatches (capture source digest `d64330e1ef1a4800d5c879b78214818727bea35c7efebc9963c29ed5203c52b2`). It personally viewed language, debug and data screenshots at both 390 and 1280 pixels and read their corresponding ARIA trees. The charcoal/cyan layout, source-aware controls and single-pane phone presentation remain coherent; phone content uses ordinary vertical scrolling. These screenshots do not themselves claim physical Android or an active audio/GPU outcome.

It independently compared all 16 captured PNGs to the newly generated baselines: nine are byte/pixel equivalent; seven differ by only **one or six pixels** out of 329,160 or 1,080,320 pixels. These tiny rendering differences are acceptable, not a visual redesign or layout regression. The browser specialist identified three generated ARIA heuristics that would generalize literal numbers; the accepted comparison must use the stronger reviewed raw exact ARIA, not silently broaden expected source content. Final baseline hashes and a separate fresh-fixture comparison pass remain required before G04 is signed off.

One bounded source-review concern remains assigned for reproduction: a non-Activity saved Experiment whose current head is eligible but whose specifically requested retained edition is missing. `toolsTargetReady` currently checks current eligibility rather than `exactReadingReady`. A potential mismatch is not called a verified defect until a real fixture reproduces it; the specialist must check that the unavailable exact reading cannot silently leave a fresh/current executable tools panel visible. No concurrent reviewer app edit, build or browser run was performed.

**G04 is pending the final fresh comparison and this bounded target check.** The earlier G03 signoff applies to its exact old input tree only; any runtime corrections made during these real browser trials must be included in the final source-pinned typecheck/build/full-suite attestation before an overall decision.

## G04 — final portable browser acceptance

**ACCEPT G04's portable Playwright/screenshot/ARIA/axe requirement for the corrected source below.** This supersedes the earlier pending disposition. It does not turn the isolated client fixture into native Sites SSR, protected owner authentication or physical-device evidence, and it is not an overall deployment GO.

The final pinned Chromium 145.0.7632.6 / Playwright 1.58.2 run actually completed **39/39 cases**, zero failures, in **39.7 seconds**, with no snapshot-update flag. It includes all original 37 cases, the first-save caret regression and the independently challenged retained plain-Experiment regression. The reviewer read the final raw comparison log and the targeted before/after failure logs, the final test specification and the final guarded source. It did not merely treat an installed browser or a generated baseline as passing assertions.

The bounded retained-context concern was **actually reproduced**, then corrected: a current plain Experiment could leave its tools visible while the specifically requested old edition was unavailable. `toolsTargetReady` now requires `exactReadingReady`, and ToolsPanel receives the exact displayed record rather than the current head. The added case first proves an invented retained edition hides the tools and its load control. It then creates edition 1 and a different current edition 2, opens the actual edition-1 URL, explicitly loads the saved experiment and checks the editor contains edition-1 code and excludes edition-2 code. Its visible status explicitly states no execution has started. This resolves the review concern with real failure/repair evidence rather than a speculative guard change.

The final source receipt binds **216 inputs** with digest `e45ca12828a47db42c4af3bdcf58e62a3dd09936a83638e01583f9dedb33f5cf`. This reviewer independently recalculated all those file hashes against the current corrected source: **zero mismatches**. The receipt correctly identifies a base commit plus hashed working-tree changes rather than falsely claiming its older base commit contains the new corrections. Parent release ownership must commit and synchronize precisely those corrections.

The reviewer independently checked all **32 approved baseline file hashes**: zero mismatches. All 16 expected ARIA files equal their reviewed raw literal capture bytes, including numeric source values and the sequence label; the generated generalized patterns were rejected. The unchanged comparison run checked all 16 images and 16 exact ARIA trees against those approved files. Six subjects at 390/1280 pixels provide 12 targeted axe runs; nine document widths, four variants, keyboard/source/hint behavior, Note editing/readback/first-save caret, retained source, Atlas and renderer teardown have actual assertions. Axe scope is serious/critical WCAG2A/AA/2.1AA within the Workbench, not universal accessibility certification.

The reviewer also inspected the final 28/28 affected unit-test summary and zero-error TypeScript log. These targeted checks and the portable comparison do **not** replace the ordinary source-pinned production typecheck/build/full suite, compiled production lab-404/SSR guards or owner-private acceptance. No reviewer app/test edits, concurrent browser session, build or distribution modification occurred during this final challenge.

### Remaining disposition after G04

G04's previous browser-installation/transport blocker is closed through the specifically commissioned actual-component/domain fixture and reviewed pinned comparison. **The corrected final tree still needs its new G03/code-validation attestation**, because runtime source changed after the earlier clean-tree attestation. Source synchronization, native production compatibility, owner-private authentication/access/data continuity and post-release hosted/MCP acceptance retain their independent conditions. A conditional engineering recommendation may proceed only after those applicable pre-release gates pass and the release controller explicitly records the authorised residual remote-CI decision. This review grants no authority to bypass required remote checks, private auth, user presence or physical-device verification.

## Final G03 rebind and pre-release disposition

**Engineering candidate: conditional GO. Immediate merge/deployment: HOLD for the owner conditions below.** G03's technical alternative and G04 now have adequate independently reviewed final-source evidence. This disposition does not claim all owner/private/deployed gates have completed.

The reviewer read `FINAL-CI-ATTESTATION.md/.json` and independently decompressed and verified the exact byte sizes and SHA-256 digests of all three final typecheck/build/full-suite logs. They bind the corrected browser/runtime code to:

| Identity/evidence | Final verified value |
| --- | --- |
| Remote GitHub source | `6252b6535c448888a1a16d517a0590b5456395b4` |
| Independent local source | `fba699b000c33af379413ee51772a952dd5b4a17` |
| Exact common full tree | `b6ac05c1cfde049dc74d645a737f5950b1fd6cc1` |
| Tracked non-document inputs | **663**, no missing/unexpected paths and zero hash mismatches |
| Input manifest identifier | `3c7f7c01e087b6608458dbb70a8a23a500fb0c15790f075ae24f92cbbe714feb` |
| Final ordinary validation | Typecheck/build exit 0; **1,021 tests / 1,017 passed / zero failed / four explicit skips**, 207.523 s |
| Portable browser validation | **39/39**; all 216 browser input hashes still match the final code and all 32 approved baseline hashes remain unchanged |

The exact remote tree was independently retrieved through connected GitHub. The isolated validation checkout remains clean at the same tree; this reviewer independently rechecked all 663 input byte lengths and hashes after the run. `package.json`, the lockfile and workflow recipe are unchanged from the prior genuinely fresh frozen dependency installation. Reusing that separately installed nonsymlink dependency directory is justified and explicitly disclosed; no second fresh installation is claimed. The four optional-science/Cargo skips remain unexecuted and the corresponding optional lanes remain unqualified.

**G03 technical alternative is accepted and rebound to this final source.** The actual final GitHub checks are still failures: this reviewer independently retrieved check runs `121299902363` and `121299895337` for runs `40236768170` and `40236765798`, each with two recorded annotations. The final specialist receipt records runner 0, zero steps and Ubuntu execution 0 ms. The current startup cause remains unestablished. The unchanged recipe's earlier genuine green provider execution corroborates the command methodology, while the final isolated run supplies proof of the new code. No remote-green, diagnosed billing/provider cause or branch-protection bypass is claimed.

### Native production compatibility evidence

This reviewer independently inspected the clean native rehearsal Git tree. Local native commit `267c41a51a95b265c0815577184fe5cfe6dc8671`, based on the existing native history, has the **same `b6ac05...` tree**. It is a local rehearsal, not a pushed or saved production version.

The actual native helper build log completes with `scienceIncluded:false`; the packaging log returns `/workspace/scratch/10fcadaf9a6c/minamo-conditional-release.tar.gz`. The reviewer inspected the independent built-Worker guard log: **17/17 passed**, zero skipped, 5.428 s. It exercises request-time SSR/RSC, a real Server Action and anonymous denial, exact reading routes/viewport fences, compiled Activity/MCP/Atlas round trips and production DEV-lab/feature-off rejection. This supplies the production-compiled framework evidence that the isolated browser fixture deliberately does not claim. It remains local synthetic dispatch, not an actual authenticated owner browser on the deployed private Site.

### Conditions before merge/publication

1. **Owner decision on CI alternative:** PR44 requires an explicit documented residual-risk decision, in addition to this independent technical signoff. The owner must accept the disclosed CI-equivalent route while GitHub-hosted checks remain red. This report is not that owner decision. Do not change branch-protection settings or forcibly bypass required checks.
2. **Owner-private browser verification:** the real owner browser is at a passkey/user-presence verification step. Complete the supported manual owner handoff, then verify the actual existing Minamo private Site/baseline; do not impersonate owner headers or treat the synthetic fixture as authenticated production acceptance. Preserve Minamo Legacy and current access policy. This review does not assert the handoff has happened.
3. **Exact publication provenance:** after any documentation-only receipt commits, record the actual final GitHub/native commit IDs, common tree and matching official package. Preserve expected-head guards and the original Site/D1/R2 identities. A prepared local archive is not a pushed, saved or deployed version.
4. **No late runtime change:** if a non-document input changes after this frozen validation, retest/rebind affected evidence before release. Optional freeform canvas, heavy/untrusted scientific execution, arbitrary JS and unverified device/audio/GPU lanes stay disabled.

Once those conditions are genuinely met, the owner-authorised release controller may proceed with the conditional existing-Site private release and immediately execute its deployed owner/MCP/Activity/Atlas/Notes/current-rights/persistence checks and exact synthetic cleanup. **Those post-deployment checks are still pending, not waived or pre-declared passed.** A fresh installed MCP catalogue/conversation and physical Pixel/IME/TalkBack acceptance retain their precise separate actions. If either owner condition remains unmet, preserve the tested correction PR and stop before merge/save/deployment rather than converting this conditional engineering GO into an unconditional release.

## Owner conditions closed; bounded premerge GO

The owner subsequently explicitly answered **Yes** to accepting the reviewed CI-equivalent route with failed zero-step GitHub-hosted checks and their unknown startup cause still disclosed. The release controller reports that the actual secure owner authentication/user-presence flow has now completed and the real private Minamo Home, Library subjects and Notes were read successfully without edits. This reviewer did not repeat that interactive authentication, receive any credential/code or claim a separate live-browser session. The controller must retain its safe authentication/baseline receipt outside Git; authentication secrets and genuine learner content must not enter the release reports.

**G03's documented owner-decision condition is now closed. Engineering GO for the existing-Site staged private release is supported**, subject to the immediate source leases and mandatory staged verification/stop rules. This supersedes the earlier hold for those two owner steps. It is not a pre-declared successful production release, fresh installed MCP result or cleanup receipt.

This reviewer performed fresh read-only connected checks before this addendum:

- PR45 head `f3fba2b1f8244f4783d118062fe0b41184cf2cc6`, base/main `c40ebcc9a27bd2538ecf5b117a3eeba7f1229d1c`, mergeable, draft and not merged at observation. Connected comparison from validated runtime `6252b6...` to that head is ahead by one commit and changes only 12 documentation/evidence files. All 663 current non-document input hashes still match the accepted manifest. A later lease must use the actual latest head after this report is committed; these observed values are not permission to overwrite a changed ref.
- Existing Minamo stable ID `appgprj_6ad8a4e85eb48191accd6e78976b47e3` remains V27 at `https://minamo.jscymru.chatgpt.site`, owner-private custom policy revision 1 with one owner and zero external visitors. Its MCP endpoint is the new host's `/mcp`.
- Separate Minamo Legacy stable ID `appgprj_6acfb08219e48191895dd6171f289ecb` remains V62 at the legacy host, policy revision 1, unchanged and excluded from writes. The local hosting manifest retains only the correct Minamo project with `DB` and `BUCKET` bindings.

### Accepted execution and cleanup boundaries

1. Refresh complete owner record/edition/Flag/Note and recovery inventories immediately before release. Compare exact identities/revisions/renditions, not just counts, and distinguish existing synthetic records from genuine records rather than assuming all baseline records belong to this trial. Verify the new permissions-aware protected recovery checkpoint without activating an old snapshot over real work.
2. Recheck latest GitHub/main/native leases, commit the final report-only state, synchronize matching full trees, and use the official exact pushed source/package path. Start the corrected hardened binary with Activity Studio and Atlas off; verify existing private owner behavior and corpus before deliberately enabling admitted core flags. Heavy/untrusted execution, freeform tldraw and unqualified optional device lanes remain off.
3. The safe fallback after new Activity/Attempt records is **the hardened new binary with feature gates off**. Do not deploy pre-Activity V27 onto new data and do not restore a stale backup over newer real Notes. Both generic hidden-hint protection and later-work retention are tested local contracts; a hosted failure requires stopping further writes and using those guarded paths.
4. Keep a precise task-owned manifest of every synthetic record, rendition, asset and operation created during hosted acceptance. Deliberately test browser/MCP publication, exact retained readback, hint revelation, supplied Attempt/terminal provenance, Atlas/source rights, reload and operation replay. No automatic learning checkpoint or fabricated execution is admitted.
5. Clean up **only manifest-owned test identities**, using current exact revisions/CAS and recoverable Trash/withdrawal. A title prefix, broad synthetic query or another task's TEST ONLY item is not sufficient deletion authority. Do not permanently purge genuine or pre-existing records, manipulate the owner corpus to manufacture equality or remove private assets referenced by baseline content. Finish with exact original-baseline comparison and Home/Recents/Notes checks.
6. Inspect the actual deployed server catalogue first. Reconnect/reinstall the existing plugin only at the point a genuinely deployed newer catalogue or renamed endpoint is absent from the installed client, then perform a genuinely fresh conversation test. Server deployment alone is not client refresh. Physical Android/IME/TalkBack and hardware-specific checks remain honestly labelled owner-device follow-ups.

No new material code, security or data-integrity blocker was found by this bounded review. Root release ownership remains responsible for each actual merge/push/save/deployment result, exact final source/version receipt, real hosted acceptance and cleanup. A material failure at any of those stages suspends this staged GO; it must not be hidden behind the earlier local passes or the owner's CI-risk acceptance.

## Fresh recovery checkpoint blocker — staged GO suspended

Before any merge, environment change or publication, the release controller's actual protected checkpoint operation `release-pr45-predeploy-backup-20261025` returned **503 `recovery_unavailable`**. The reported original-operation status is unknown, and the archive listing still contains four older checkpoints with no verified new checkpoint/stage. Error-only Worker logs for the queried window returned no diagnostic event. The fresh active-record inventory remains 52 records over two complete pages. These facts do not prove a newly usable backup, identify a root cause or establish that no intermediate R2 object persisted.

**HOLD merge/save/deployment pending a verified fresh permissions-aware recovery checkpoint or an independently accepted exact safe equivalent.** The owner CI decision, successful private authentication and accepted G03/G04 engineering evidence remain valid, but they do not waive this new pre-release recovery condition. Preserve the original operation identity and inspect its exact status/admission/storage failure before retrying; an uncertain receipt must not be converted into a fabricated success or an unrelated duplicate operation. The root is investigating the actual source and bounded live metadata. No production release, genuine-record mutation or reviewer corrective action is claimed in this addendum.

## Fresh checkpoint verified — recovery hold closed

The controller investigated the pending receipt/storage schema and retried **the same original checkpoint operation once**, retaining its exact identity and body. It succeeded; no application code, owner record or recovery-generation activation was changed to produce that success. The initial 503's precise cause remains **unestablished**. This is demonstrated safe operation recovery, not a claimed root-cause fix.

This independent reviewer then called the actual connected Minamo MCP twice, using read-only `verify` and `status` actions. Both succeeded:

| Independent hosted readback | Actual result |
| --- | --- |
| Exact archive | `archive-b46453ab08647c52b728d910d5e4510032e29621038bc1db` |
| Archive creation time | `2026-10-25T22:25:02.243Z` |
| Generation/version | `legacy@0`, version **3015** |
| Archive integrity | **`valid:true`, `state:ready`** |
| Payload size | **7,717,747 bytes** |
| Private assets verified | **3 images, 0 media** |
| Exact original operation | `release-pr45-predeploy-backup-20261025` — **`status:committed`**, returning that same archive |

The metadata-only raw receipts are retained in `evidence/INDEPENDENT-PREDEPLOY-RECOVERY-READBACK.json`; no private record text, raw archive bytes or credential is included. The archive contains current/history/Trash product state: its 190 record rows are not mislabelled as the 52 active records or as all genuine/all synthetic. Verification did not stage or activate a generation.

**The fresh-checkpoint blocker is now closed and the bounded predeployment engineering GO is restored.** Retain the initial 503 as an operational watchpoint with unknown cause, monitor hosted recovery/readback during acceptance, and continue to use original operation identities after uncertain results. All other staged release, source-lease, owner-private policy, hardened feature-off rollback, post-deployment MCP/readback and exact manifest-owned cleanup conditions above remain in force. There is still no claimed successful merge, deployment, fresh installed catalogue or production synthetic cleanup at this point.
