# Independent security and recovery acceptance

25 October 2026. Separate specialist source inspection and actual local execution for PR44. Baseline is the PR43 report tree `4098acd92f38e901bdc56e727297793c5e6bb58f` (local commit `9971481eda2444014a53055ac1fade2ebd1370bc`). This report describes the correction in `lib/recovery.ts` and the synthetic regression in `tests/activity-recovery-adversarial.test.mjs`; the release owner pins the final combined commit/tree separately.

## Verified defect and correction

**SEC-R01 — recovery admission bypass, release blocking until corrected.** The encrypted import validated ordinary Activity/Attempt schema but did not run deep project/Foundry admission or verify the Attempt's exact retained Activity and hint identities. Encryption authenticates a file to its passphrase, not to Minamo's domain authority.

The independently constructed fixture exported a real synthetic Activity and supplied Attempt from local D1/R2, decrypted/re-encrypted the backup using the supported format, and changed (a) Python starter bytes while retaining their declared SHA-256 and (b) an Attempt's Activity rendition to a nonexistent edition. Both hostile imports returned HTTP 200 with `staged.state=ready` before the correction. This was actually reproduced, not inferred from source. No production corpus or credentials were used.

Staging and activation now validate current and historical Activity records with the same strict schema and deep project/Foundry admission used by ordinary publishing. Attempts must retain an exact archived Activity edition and valid hint identities; observed-execution evidence cannot be imported onto a supplied Attempt. Activation repeats these checks before pointer mutation, protecting an already staged generation against later corruption. Rights checks and existing unavailable-source recovery semantics remain separate and unchanged.

The corrected fixture rejects stale source hashes, nonexistent edition provenance and unknown revealed hints. It also alters an already-ready staged Attempt: activation rejects `archive_integrity`, publishes no generation pointer, and leaves the later saved Note intact.

## Executed evidence

All fixtures below use actual bundled application adapters and isolated Miniflare D1/R2 with synthetic authenticated principals. They do not prove Sites dispatch, hosted private policy or physical-device behavior.

| Run | Actual result | Important coverage |
| --- | --- | --- |
| `node --test tests/activity-recovery-adversarial.test.mjs tests/activity-security-lifecycle.test.mjs tests/activity-independent-integration.test.mjs tests/domain-recovery-bundle.test.mjs tests/recovery-learning-catalogue.test.mjs` | 16 tests passed, zero failures (before the additional activation assertion, which passed in the next run) | Hostile encrypted import, full protected file staging, immutable Activity/Attempt, current source revocation, owner isolation, CAS/replay, source grants and later Notes |
| `node --test tests/activity-recovery-adversarial.test.mjs tests/recovery-integration.test.mjs tests/recovery-cutover-evidence.test.mjs tests/recovery-authority-watermark.test.mjs tests/recovery-cumulative.test.mjs tests/recovery-paged-assets.test.mjs` | 19 tests passed, zero failures | Activation tamper rejection, safe feature-off projections, generation fencing, snapshot watermark, permission floors, assets, historical Note evidence and encrypted recovery beyond first pages |
| `node --test tests/security-boundaries.test.mjs tests/security-generic-reading.test.mjs tests/security-rich-content.test.mjs tests/security-pagination.test.mjs` | 41 tests passed, zero failures | Synthetic foreign owner denies, scoped receipts/cursors, exact generic families and retained editions, rich content and executable-URL rejection, Unicode selection and Trash |
| `node --test tests/activity-exchange.test.mjs tests/activity-security-boundaries.test.mjs tests/security-portable-archive.test.mjs tests/challenge-interface-unicode.test.mjs` | 17 tests passed, zero failures | Deterministic project exchange/admission, semantic source safety, protected portable archive authority and exact Unicode source mapping |
| `node /opt/codex/tools/pnpm/bin/pnpm.cjs run typecheck` | Passed | TypeScript compatibility of recovery correction and concurrent candidate work at execution time |

The cumulative recovery run processed 1,500 topics, 256 saved Note revisions, a 19,202,640-byte checkpoint across 44 pages and 19,160,951 encrypted bytes. It completed a genuine isolated synthetic recovery and automatic backup. This is measured local evidence, not a production size benchmark.

## Safe rollback disposition

**Use the hardened candidate binary with both Activity Studio and Learning Atlas feature flags disabled. Do not deploy pre-Activity V27 after any new Activity/Attempt writes.** The old binary does not understand nested hint metadata and has no accepted compatibility guard.

Actual feature-off generic reads of saved Activity, Attempt and later Note editions omit Activity/Attempt metadata, contain no private hint canary, and preserve the later Note text. The deliberately invoked hint endpoint returns 404 when disabled. Re-enabling the same corrected binary retains the original stored cartridge, redacts hints on ordinary reads and returns the exact hint only after a deliberate reveal. Existing independent integration tests also perform old-client plain edits with Activity disabled and prove the cartridge/immutable Attempt target survives storage unchanged. No checkpoint is generated by these actions.

Protected file import/staging does not activate over later work. A real owner recovery activation remains an explicit separate reviewed action, with generation fencing and automatic preactivation backup; rollback is not an instruction to restore an older snapshot over genuine Notes.

## Security recommendation and limits

The inspected security/recovery lane is acceptable **with SEC-R01 included**, a hardened feature-off rollback and the optional untrusted/heavy runtime lanes kept disabled. Source browser code remains inert text; current rights, owner/generation projections, exact Attempt editions and explicit evidence classifications remain authoritative. Separate release ownership must evaluate the final combined source and remaining browser, native packaging, remote CI, private Site and installed-MCP gates; this report alone is not an overall GO or production receipt.

No production mutation, Site permission change, secret read, paid service or genuine learner-record operation was performed by this specialist. No successful human learning or physical Android/TalkBack result is claimed.

## Bounded optional-controller packaging re-review

A later independent source review examined the optional science-controller relocation and build-input cleanup. The authored controller now resides in `vendor/foundry-python-isolate.js`; the generated `public/foundry-python-isolate.js` path is ignored and is populated only by deliberate science staging. Default asset preparation removes that generated public controller before framework public copying, and the final distribution policy removes the optional science runtime/controller. Opt-in preparation requires an explicit science manifest and byte identity between the staged controller and vendor source. Expensive optional package staging remains locally cached.

The vendor file is byte-identical to the previously tracked controller: SHA-256 `d0a8a88fcf5ffc16f86d584460a06c939b0347bd4d9eb31f0ce60a854c8dd500`. Source validation and security/execution tests now read that authored location; runtime fetching retains the same generated `/foundry-python-isolate.js` URL when the optional lane is explicitly packaged.

Executed independently: `node --test tests/foundry-packaging.test.mjs` passed both tests. These exercise default distribution exclusion, stale public-controller removal before a modeled complete public copy, exact-byte opt-in staging, rejection of modified staged bytes, cache preservation and vendor-source preservation. `node --check` passed for `scripts/foundry-package-policy.mjs`, `scripts/foundry-python-assets.mjs` and `scripts/prepare-tool-assets.mjs`.

This bounded structural review supports the correction. It does **not** establish why the controller reappeared during earlier build/compiled-test runs, identify an actor, or substitute for the separate exclusively owned final production build and compiled acceptance. This specialist did not build, alter `dist`, stage assets in the real candidate or run compiled-worker tests during that exclusive window. The optional science lane remains disabled for the core release unless separately qualified.

## Fresh predeployment checkpoint acceptance

The release controller initially observed generic HTTP 503 `recovery_unavailable` from checkpoint operation `release-pr45-predeploy-backup-20261025`. The exact operation row existed as pending. Read-only investigation established current generation `legacy@0`, namespace watermark 3015, unchanged recovery table columns, and a successful verification of an older archive including its three image assets. These observations narrowed the failure to checkpoint execution but did not identify its cause. The V27 handler intentionally maps unclassified underlying exceptions to generic 503 without logging their details; empty Worker error logs therefore did not prove no failure occurred.

The controller retried **the exact original request and operation identity once**. It completed in 29.7 seconds, publishing archive `archive-b46453ab08647c52b728d910d5e4510032e29621038bc1db` at namespace version 3015, 7,717,747 bytes, state ready. Actual subsequent verification returned valid true, three verified images and zero media; the original operation status returned committed. Its complete inventory includes 190 records, 537 revisions, 562 operations, 537 activity rows, 16 bookmarks, three images and attachments, 26 manuscript editions, 55 Developments, 116 Development revisions, three perspectives, 46 catalogue heads and 81 catalogue revisions. The 52 active-record baseline is a separate projection, not the backup's full retained inventory.

Based on the controller's actual successful receipts and the independently inspected immutable-operation recovery code, the fresh checkpoint condition is satisfied. No generation was activated and no unrelated duplicate checkpoint operation was introduced. The initial 503 is an **unexplained recovered failure**, not an established query-limit diagnosis, code fix or proof of damaged data. Optional follow-up should improve safe failure-stage diagnostics; it must not disclose learner content, secrets or raw storage keys. No speculative runtime-limit change is justified by this event alone. This specialist performed source/doc inspection only and no production mutation or retry.
