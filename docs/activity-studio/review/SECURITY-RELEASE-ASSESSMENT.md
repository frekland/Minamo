# Independent security, runtime and release assessment

The reviewed design uses typed companion Activity and Attempt metadata on existing `experiment` and `run` records. It retains the existing owner, generation, revision, operation receipt, history, Trash and recovery authority. No additional owner database or privileged code runner is introduced. This assessment covers actual local synthetic D1 requests and source inspection; it does not certify production, a refreshed installed MCP catalogue, physical Android or a real browser sandbox attack.

## Findings corrected during independent review

1. Native exact Source references were initially rejected because Activity section/part IDs excluded `__article` and `__excerpt`. A real D1 Source publication reproduced `invalid_activity` at `data.activity.blocks.1.ref.sectionId`. The schema now accepts native canonical IDs, and the independent retained-source lifecycle test passes.
2. Activity/Attempt content was initially absent from rendition hashing. The domain owner included both in immutable rendition identity. The independent test changes only a hint and proves a different Activity rendition while the older exact edition remains readable.
3. New nested payloads would enlarge existing related-record summaries. Related context now removes full Activity, Attempt and output bundle payloads; the dedicated continuation surface returns compact entries and exact reads. This is a source-reviewed correction, separate from latency/load acceptance.
4. Challenge interchange now rejects reserved generated manifest names at admission, case-insensitive package configuration, Cargo dependency/workspace hooks and file-as-directory collisions. The independent malicious package corpus covers reserved manifest, Windows configuration, Cargo dependencies, private key marker, traversal, device paths and supplied shell commands.

## Independently executed checks

`node --test tests/activity-security-boundaries.test.mjs tests/activity-security-lifecycle.test.mjs` passes six tests. They exercise real compiled domain code with disposable local Miniflare D1/R2 and synthetic principals. The transcript is `INDEPENDENT-SECURITY-TESTS.txt`.

- Generic HTTP and MCP commands cannot promote supplied typed output to observed execution, forge new receipt fields, or change code while retaining a mismatched output digest. Foreign-owner exact reads fail.
- Feature-off generic Activity creation fails without a record write.
- Simultaneous conflicting revisions produce exactly one committed definition and one conflict. Identical uncertain-result replay preserves the winning revision; a different payload with the same operation ID fails.
- Nonspoiler hint canaries are absent from first receipt, exact current/retained reads, workspace, query and replay responses. Explicit hint reveal remains a separate deliberate read. Complete hidden solutions are not a supported schema tier or field; this is structural containment, not a semantic classifier capable of recognising every possible answer embedded in prose.
- Activity revisions have distinct identities, Attempt target editions cannot be retargeted, supplied Attempts cannot be relabelled as observed, current Source revocation withholds linked reading in both retained and current Activities, and these actions create zero formal Developments.
- Hostile paths, automatic dependency/configuration hooks, credential-like text, nonfinite table data, active output metadata, remote image URLs and interrupted/error results carrying stale successful outputs are rejected.

`tests/activity-security-compiled.test.mjs` separately exercises the actual production-built Worker. Initial execution confirmed 404 for Foundry galleries, Activity preview, preview fixture proxy and disabled generic Activity writes. Its final package assertion detected a science controller file in the shared generated `dist/client` despite the earlier build log reporting `scienceIncluded:false`. The root agent explicitly reapplied the existing package policy without a source change; independent rerun then passed **1/1**, and the controller remained absent after the actual Worker test. The retained initial failure is not recast as a pass or attributed to an unproved cause. `INDEPENDENT-COMPILED-SECURITY-RETEST.txt` captures the passing retest. The final ordinary frozen-source build must repeat the package assertion to confirm the produced distribution, rather than infer it from a status message.

The excerpt renderer's fallback mapping regression was independently reproduced in the full-suite result and independently verified repaired with `tests/excerpt-reader.test.mjs` (**6/6**). The fallback blockquote retains its exact mapped identity; semantic renderers own lower mapped spans when present. The older combined transcript `INDEPENDENT-COMPILED-READING-TESTS.txt` preserves this reader pass alongside the then-failing generated package check.

The semantic/output author subsequently closed protected-import integrity gaps: normal writes already bound typed output to the exact code digest and actual PNG MIME, but imported records needed equivalent checks. Independent execution of `tests/semantic-content.test.mjs` passes **9/9**, including an authenticated archive record with changed code rejected as `bundle_schema`, actual private PNG bytes in encrypted recovery, source revocation and owner isolation. The staged namespace is also checked before activation: changing its image MIME from PNG to JPEG returns `409 archive_integrity` before the generation pointer changes; restoring correct metadata permits normal activation. The validator uses a bounded owned image inventory and scans current/retained record pages, including paged archives.

Final independent combined rerun of semantic recovery, repaired excerpt reader and production-compiled security passes **16/16**, with zero skipped tests. The science controller remained absent after this actual Worker run. Transcript: `INDEPENDENT-FINAL-RETEST.txt`. Semantic recovery fixtures compile the current source directly; the compiled distribution test refers to the most recent existing production build. A later frozen-source rebuild still requires its own final acceptance.

## Runtime boundary

The Foundry science controller creates a script-only sandboxed iframe without `allow-same-origin`, gives its blob Worker a deny-network CSP and removes/terminates the runtime on completion or timeout. The independent test checks these source-level containment regressions. It does not establish browser enforcement or mobile memory safety. Current science output transport remains `supplied-output` or `browser-reported-output`; browser code cannot mint a server-observed execution receipt.

The vendor [iframe sandbox documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox), retrieved with Firecrawl during this review, supports the special-origin boundary when `allow-same-origin` is omitted. [SOFA's delegated browser authority discussion](https://agents.stackoverflow.com/questions/9a308453-c45b-4ebb-8638-ff1fed0cd23d), inspected with its verification context, reinforces that same-origin script can exercise browser-held capabilities; server scope and replay enforcement remain essential. The actual code and tests, rather than community trust scores, determine this assessment.

Arbitrary React/JS, Sandpack, WebContainers and Strudel code must remain a reviewed local/external handoff until an independent host, credentials/network boundary and termination mechanism have actual browser proof. No missing sandbox is delegated to a later small activation task.

## Release gates

The GitHub and native Sites repositories have distinct histories. Preserve expected-head guards and compare exact common source trees before future owner-approved release. No Site save/deploy, permission change or genuine learner mutation was performed by this reviewer.

Production release still requires the final typecheck/build/full suite, stopped-preview package/compiled tests, final source parity manifest, owner-authorised native release and authenticated acceptance. New server tool declarations do not prove that the installed client refreshed. A fresh installed catalogue and fresh GPT producer/readback test follow only after separately authorised deployment. Pixel 8a touch/selection and assistive-technology acceptance remain physical-device gates.

Rollback must use this candidate with Activity and Atlas disabled, preserving its new projection guards. A pre-Activity binary does not know that nested hint text is protected and may return the newly stored metadata through generic record reads. Do not redeploy an old binary over a namespace containing Activities. Returning to a pre-Activity binary requires either a reviewed compatibility projection that withholds the new fields or deliberate activation of a verified pre-Activity checkpoint; backup and the owner's new data retention decision come first.

The initial dependency DAG and concrete gap categories are in `INITIAL-CRITICAL-PATH.md` and `INITIAL-GAP-LEDGER.json`; those files intentionally preserve the preimplementation audit rather than overwrite its original observations.
