# Private beta implementation and acceptance

Commission: draft PR #89 remains open, draft and unmerged. Engineering is on a separate implementation branch. This is an implementation receipt, not a replacement commission.

## Product delivered

The existing Site retains its URL, owner identity, MCP definitions, storage and generation. All HTML, SSR, API, MCP (including discovery), image/media, recovery, lab and historical paths pass a central admission gate before dispatch. Immutable asset bundles and platform-owned sign-in routes are the exceptions. Public workers.dev or alternate-host identity forwarding is rejected. No external OAuth endpoint is added.

The protected owner is explicitly pinned in a runtime secret, never elected from the first visitor or an email. A second user first needs Sites **Can view** access. After their own sign-in, they request admission. The server records the trusted Site-local identity as `invited`; the owner independently verifies the displayed admission code and changes it to `accepted`. Codes do not grant authority. Revocation is immediate on the next server request and cannot be undone by re-requesting. Email is never used as proof of identity. Membership is outside learning recovery generations, so restoring learning cannot restore a revoked invitation.

`X-Minamo-Workspace` fences browser requests against account changes; existing hashed draft keys and generation fences are preserved. Private responses are no-store and carry a principal fingerprint. The active page checks its session, rejects mismatched responses and unregisters its tools on teardown or loss of authorization. No learner corpus is copied or seeded on render.

Help opens **Use with GPT**, **Start here**, **Feedback** and owner-only **Beta settings**. Empty workspaces offer Start here or Skip. The learner chooses Computing or a language before previewing the original seven-stage Journey and substantial ten-section guide. Both are compiled and published together through the existing manuscript/domain path. Source editions, linked canonical readings, two guide diagrams, tables and source links are retained. Repeated imports return the original own receipt, including after choosing a different space; they do not create another copy. No progress is inferred.

The universal exchange lets a learner choose an active reading or section, or enter exactly the passage they want to share. A bounded prompt is visible before deliberate copying. Import accepts ordinary Markdown for Article, Journey or Investigation; observations belong in Notes. Preflight displays diagnostics and canonical/source previews. Confirmation creates new records, with no automatic overwrite. The exact operation survives a network retry. A separate read-only status action can recover a committed operation after a confirmation token has expired. Pasted drafts are retained in session storage under the existing identity/generation scope; no clipboard is automatically read.

Five top-level imperative WebMCP tools offer a bounded workspace overview, own Library search, an exact own reading, manuscript preview, and an explicit request for the learner to review and save. The last action opens the pending proposal and reports `awaiting_learner_confirmation`; it does not fabricate a save. Publication only follows the visible confirmation action. Proposal tokens use AES-GCM with the principal as authenticated associated data, an exact generation, immutable payload and a fifteen-minute expiry. Preview performs zero D1/R2 writes. Cross-owner, tampered and stale-generation proposals fail closed. Standard browsers keep the same ordinary UI.

Feedback submits only chosen text, type and optionally a page type without record identifiers. It never automatically attaches Notes, history, email, searches, screenshots or reading text. Owner triage can see only deliberately submitted feedback and admission codes; it grants no browsing access to another learner's private records. Attachments are deliberately absent from this minimal feedback form.

## Schema and environment

Migration `0012_private_beta.sql` adds only membership and intentional feedback tables and the admission-code unique index. Existing owner learning tables and ownership values are untouched. Drizzle generation used the prior available snapshot; already-applied catalogue/learning tables were excluded from this new SQL, and the new complete snapshot records the current schema. No schema is created during request handling. Sites applies hosted migrations before Worker upload. Local D1/R2 are separate and disposable.

Runtime keys: `MINAMO_OWNER_ID` (secret, existing stable Site identity), `MINAMO_BETA_KEY` (secret random proposal encryption key), `MINAMO_SITE_HOSTS` (exact existing production hostname), `MINAMO_BETA_ENABLED` (`1` admits only accepted members; `0` denies all nonowners). Existing environment values and bindings remain intact. No paid services, model API or GitHub Actions expenditure is introduced.

## Evidence and limits

The release PR carries the exact final commit/tree, deployment version, check totals and live readback receipt. Private owner checkpoint and integrity data are retained outside Git. The pre-release checkpoint verified all five image objects and both media originals; no restore was performed.

| Acceptance | Evidence / remaining limit |
| --- | --- |
| P01–P03 owner preservation | Protected verified checkpoint; unchanged root identity, namespace and source storage contracts. Owner-private release only. Live post-release checks recorded in PR. |
| P04 genuine Note edit | Deliberately not performed: no permission to alter genuine Note prose was inferred. Synthetic Note lifecycle is covered instead; owner may test their own writing. |
| P05 existing owner MCP | Tool declarations unchanged. Live owner read/preview/synthetic write/readback recorded in release receipt. |
| P06 owner/revocation | Synthetic actual D1 and compiled Worker checks; owner bypass is explicit, never dependent on roster rows. |
| P07 code-only rollback | Additive schema compatibility and retained data tests; no production restore or generation activation. A real hosted rollback is not claimed. |
| A01–A02, A10–A11, A17, A21–A22 | Production-artifact denial across SSR/API/MCP/assets/recovery; host checks, strict inputs, Origin and no-store responses. Genuine denied second ChatGPT account still requires the tester. |
| A03–A04, A23 | Synthetic stable-ID request/approval and empty workspace verified. Real independent ChatGPT sign-in/binding NOT TESTED until the invited person participates. No verified-email assumption. |
| A05–A09, A12–A13, A16, A18–A20 | Existing D1/domain/MCP/media/recovery suites plus new known-present two-tenant, colliding-ID, CAS, concurrent write, receipt, proposal and feedback tests. These prove application behavior, not hosted account dispatch. |
| A14–A15 | Principal request/response fences, retained draft separation, lifecycle cleanup and next-request revocation tested synthetically. Actual account switching and outstanding real-account browser requests remain part of independent acceptance. |
| O01–O06 | Actual compiler/D1 checks verify zero-write preview, seven stages, complete guide, two diagrams, exact links/source and per-tenant idempotent copies. Browser starter/import checks are recorded in the release PR. |
| O07–O10 | Existing navigation/Notes/capture suites retained. Genuine second-user Android, TalkBack and physical-device acceptance NOT TESTED. |
| O11–O12, A19 | Intentional-feedback submission/triage/delete and role denials tested; revocation retains learning. No automatic destructive purge or admin learning browser. |
| G01–G06 | Existing MCP preserved; five real Site Tools registrations and handlers have contract tests. Actual browser discovery/calls and any platform limit are recorded in the release receipt, never inferred from unit tests. Independent learner desktop eligibility remains NOT TESTED. |
| G07–G10 | Universal selected-context/paste/preflight/confirm/status workflow implemented and browser tested as recorded in PR. Saved material is editorial, not claimed observation. |
| G11 | External OAuth MCP deliberately absent. Personal-account Site-hosted plugin sharing is unavailable; do not share owner credentials or expose a public proxy. |

Physical staging infrastructure was not created or represented as isolated. Tests use actual local Miniflare D1/R2 and the compiled production Worker; the local browser gateway is dev-only and returns 404 in production. Synthetic identities are never presented as independent hosted accounts.

## First independent learner test

Post-release owner browser acceptance verified all five actual HTTPS Site Tools, including invalid input, zero-write preview, explicit pending confirmation, deliberate synthetic publication and exact readback. Existing owner MCP preview/write/readback also passed; its disposable Note was moved to recoverable Trash. A saved-link filter regression found during this walkthrough is corrected in the follow-up implementation PR: publish, status recovery and repeated starter receipts carry the actual saved record's learning space/language, preserving the pinned rendition. It does not alter learning records or ownership. The same walkthrough is not second-account acceptance.

1. Owner opens existing Minamo normally and confirms their familiar Journey and Note. In Site Share, add exactly the intended person's own ChatGPT account as **Can view**, preserving selected-viewer access; never choose public or editor.
2. Tester signs into their own account in a separate profile/device. On the admission screen choose **Request admission** and give the displayed code to the owner. Owner opens Help → Use with GPT, start here & feedback → Beta settings, refreshes, verifies the code and selects **Admit**. Tester reloads.
3. Before importing, verify the tester has an empty personal workspace. Choose Start here, select a space, preview and save the Journey/guide. Open each link; make a harmless Note and close/reopen it. Check search, a Flag, an annotation and feedback. Verify the owner's work has not changed.
4. Share only IDs of deliberately created synthetic records between accounts and attempt cross-account reads. Verify neither account can retrieve the other's synthetic record or operation/media/recovery state. Do not use a genuine private Note as a probe.
5. On supported ChatGPT desktop built-in browser, inspect Site tools, search/read an own resource, preview and confirm one harmless new resource. Otherwise use the universal copy/import path, which also works on mobile. Nothing is saved because GPT merely says it is.
6. Revoke the tester in Beta settings and verify their old tab can no longer read/write, while the owner continues normally. Re-admit deliberately if the pilot should continue. Record actual device/account results before calling independent acceptance complete.

## Rollback and privacy

For an incident, revoke the learner in Minamo and remove their Site viewer invitation first. Retain the protected owner. Then deploy a schema-compatible source rollback or patch. Restoring a Sites version restores code, not D1, R2, membership or new learner writes. Never activate an owner recovery generation as a routine deployment rollback. The additive beta tables may remain unused under old code; do not delete learner data casually. Proposal key rotation invalidates pending proposals, not learning records.

## Sources checked

- Sites identity/storage/WebMCP skill contracts and actual access policy: selected individual invitations available, owner only at inspection.
- https://learn.chatgpt.com/docs/webmcp — imperative registration, top-level page, desktop/model constraints.
- https://help.openai.com/en/articles/20001547-hosting-a-plugin-with-chatgpt-sites — sharing the Site does not share a personal hosted plugin.
- Context7 Cloudflare Workers/D1 worker API — use existing guarded prepared statements/batches, no invented application transaction/session API.
- SOFA read-only blueprint `1e63fdfa-47e6-4fb8-a91a-1c3fb163025d` — metadata-first tool discovery and distinguishing declared capability from successful hosted execution; independently checked against source and actual results.
