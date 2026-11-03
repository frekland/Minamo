# Sites Connected-App Feasibility Experiment

**Date:** 3 November 2026  
**Repository / report target:** `frekland/Minamo`, draft PR #84  
**Branch:** `docs/future-connected-sources-and-library-exploration-20261103`  
**Scope:** Read-only feasibility investigation. No Site, production data, or external provider content was changed; this report is the only repository change.

## Executive finding

**No-go for a hosted connected-app proof of concept in this session.** The Sites documentation requires a native per-Site eligibility discovery call, `sites_list_plugin_eligibility`, before selecting connector IDs or previewing connector data. That call is not present in this session's available Sites tools. Attempting to call it by its documented name returned “not a function.” The available plugin search and connected GitHub/Google Drive tools describe ChatGPT-side availability; they do not establish Sites eligibility.

This is an **unavailable discovery mechanism**, not evidence that the account or Site was denied eligibility. Consequently, the exact eligible connector IDs, eligible actions, visitor authorization path for this Site, and hosted behavior remain unknown. In accordance with the documented discovery requirement, no connector ID was guessed, no declarations were added, and no Site was created or published for the experiment.

## 1. Verified Site identity and environment

Read-only Sites calls confirmed:

| Property | Observed value |
|---|---|
| Site title / slug | Minamo / `minamo` |
| Site ID | `appgprj_6ad8a4e85eb48191accd6e78976b47e3` |
| Live URL | https://minamo.jscymru.chatgpt.site |
| Status | Active |
| Latest and live version | V100 |
| V100 source commit | `a10709c9cfb7b0de819dc392de01ce29e576e1d4` |
| V100 deployment ID | `appgdep_6ae9503af8e8819184c1c5d01cd2e4ca` |
| Access mode | Custom allowlist; owner plus one external visitor |
| Sign-in / BYOP metadata | Site reports `requires_byop: false` |
| Site MCP metadata | A Minamo MCP endpoint and provisioned Site plugin ID are present |

The access result verifies the Site's identity and current audience configuration. It does **not** show GitHub or Drive eligibility. The Site MCP endpoint/plugin is Minamo's own MCP surface; its presence does not mean the Site can independently call a visitor's connected apps.

The production Site was not edited, redeployed, reset, or used as an integration test target. V100 remains the verified baseline.

## 2. Eligibility and discovery evidence

### Verified observations

- Sites' installed app-integration guidance specifies `sites_list_plugin_eligibility` (native tool name `sites_list_plugin_eligibility`) as the mandatory discovery mechanism. It says to pass the registered `project_id`, follow pagination, and use only returned `allowed` plugins, canonical IDs, and connector membership intersected with available native tools.
- That Sites tool is absent from the tool inventory available in this conversation. A direct lookup by the documented tool name failed because no callable tool was exposed.
- ChatGPT's plugin directory/search returned GitHub and Google Drive as enabled and installed ChatGPT plugins. Plugin permission inspection reports app-specific “Allow all actions” for each. These are **ChatGPT-level app settings**, not Sites eligibility or visitor consent.
- GitHub and Google Drive native tools are available to GPT in this conversation. Their existence, connector names, permission settings, and ability to serve GPT are not proof of Site connector membership.
- The available Site record does not expose a result from the required eligibility call. Its `requires_byop: false` field does not establish that connected apps are either eligible or ineligible.
- The experiment did not inspect or read any private Google Drive files, and performed no external writes.

### Eligibility outcome

| Question | Result |
|---|---|
| Is this account eligible for Sites visitor-side GitHub/Drive integrations? | **Unknown.** The required native discovery call was unavailable. |
| Is this specific Minamo Site eligible? | **Unknown.** No per-Site eligibility response could be obtained. |
| Are GitHub and Google Drive eligible Site plugins? | **Unknown.** ChatGPT plugin availability is not sufficient evidence. |
| Exact canonical Site plugin IDs / connector IDs | **Unknown; intentionally not guessed.** |
| Exact visitor-side Site action names and schemas | **Unknown; no eligibility result to intersect with native tool schemas.** |
| Did a hosted Site authenticate as a visitor and retrieve data? | **No. Not tested; discovery blocker stopped the experiment.** |

The evidence does not distinguish an account-plan restriction, workspace/admin policy, disconnected provider account, rollout limitation, or missing tool exposure in this Work session. No basis was found to claim any one of those as the cause.

## 3. Keep the three integration paths distinct

1. **GPT uses a connected app in conversation.** This path is available here: GitHub and Google Drive app tools are exposed to GPT. The permission setting is ChatGPT's app-specific setting.
2. **Minamo exposes its own MCP tools to GPT.** Minamo has a provisioned Site MCP endpoint. Those tools let GPT operate Minamo; they are not GitHub/Drive credentials and do not prove that the hosted Site can call those providers.
3. **Hosted Minamo independently accesses a visitor's connected service.** This requires a Site-eligible plugin/connector declaration and runtime invocation using the visitor's connection and consent. It was **not established or tested** in this experiment.

These paths have separate authorization, tool discovery, and runtime behavior.

## 4. Exact experiment performed and result

1. Read the Sites app-integration instructions. They explicitly require eligibility discovery before choosing plugins, declaring connector IDs, or previewing data.
2. Enumerated available native tools. GitHub and Google Drive operations appeared; the required Sites eligibility tool did not.
3. Attempted the documented eligibility tool by its canonical name. The runtime reported that it was not callable in this session.
4. Read the Minamo Site record and recent version list to verify Site identity, V100, URL, source commit, deployment, and access configuration.
5. Inspected the GitHub/Google Drive ChatGPT plugin settings and plugin discovery results. These confirmed conversation-side availability only.
6. Stopped before creating a test Site, adding declarations, invoking data through a Site preview, or deploying anything.

**Development preview vs. hosted behavior:** Neither was exercised. Sites guidance says local preview uses the owning agent's native connection and is read-only; that can be useful for development, but cannot prove visitor-side hosted authorization or hosted Refresh. The guidance describes hosted connector calls as using each visitor's connection and consent. This remains documentation-level evidence here, not an observed successful flow.

**GitHub POC:** Not run. No Site retrieved a repository file, displayed a revision, or refreshed data. No experimental Site URL or Site ID exists.

**Refresh/authentication/consent/loading/errors:** No runtime test took place, so no observed consent screen, sign-in redirect, connect prompt, refresh request, provider error, or loading behavior can be reported.

## 5. ChatGPT connector capabilities visible in this session

These are GPT-connected tools, not an eligible Sites connector/action list.

### GitHub

Available tool families include `github_fetch` (approved GET resources), `github_fetch_file`, `github_fetch_blob`, `github_fetch_commit`, `github_compare_commits`, `github_search_commits`, `github_search_branches`, and PR/issue/review read tools. GitHub write tools are also present in the ChatGPT connector, including file create/update, branch/commit/tree operations, PR actions and merge. **No GitHub write was made for this experiment**; the report commit is the separately requested PR #84 documentation change.

The existence of read operations makes a later GitHub source panel technically plausible only if the Site eligibility call returns GitHub and the relevant connector/action membership. This experiment did not prove that.

### Google Drive

Available GPT tool families include:

- **Docs:** `google_drive_get_document`, `get_document_text`, `get_document_paragraph_range`, `get_document_tables`, `find_document_text_range`, `batch_update_document`, and `import_document`.
- **Sheets:** `get_spreadsheet_metadata`, `get_spreadsheet_cells`, `get_spreadsheet_range`, `search_spreadsheet_rows`, `batch_update_spreadsheet`, `duplicate_sheet_in_new_spreadsheet`, and `import_spreadsheet`.
- **Slides:** `get_presentation`, `get_presentation_outline`, `get_presentation_text`, `get_presentation_tables`, `get_slide`, `get_slide_thumbnail`, `batch_update_presentation`, and `import_presentation`.
- **Drive files:** search, fetch, metadata, revisions, export, folder listing, comments, copy, create, update, upload, delete, sharing, and file creation tools.

Those tool names indicate GPT-side operations. They do not establish the subset (if any) that Sites may invoke. No private file was opened, and no Drive operation was performed as part of this investigation.

## 6. Google Drive feasibility (conditional, not demonstrated)

If native Site discovery later confirms the relevant read connectors/actions:

- **Docs:** Fetching and rendering selected text/paragraphs or tables in a Minamo source panel appears plausible. A faithful, full Docs editor would be a separate and much larger product.
- **Sheets:** Reading a bounded range and rendering a Minamo table is plausible. Interactive charts require custom front-end rendering, column/type handling, range selection, labels, empty/error states, and performance limits. The connector itself does not automatically provide a Minamo chart UI.
- **Slides:** Text, outline, tables, slide data, or thumbnails may be usable depending on eligible action schemas and returned payloads. A polished slide viewer requires custom presentation and navigation behavior; “connected” does not mean native Slides embedding.
- **Refresh:** A real refresh would need to issue a new server-side connector call on user action. A GPT-fetched snapshot, saved build artifact, browser request to an unauthenticated public endpoint, or local preview read would not establish visitor-authenticated refresh.
- **Edits:** GPT connector write tools exist, but Sites write eligibility/consent was not verified. A future write design would need explicit user action, narrow validated inputs, authenticated visitor identity, duplicate-submission protection, write consent and provider confirmation. Do not infer that any particular write is eligible.

No implementation claim above is a verified Sites capability.

## 7. Minamo integration assessment

### Technical inference from the Sites guidance

Sites supports server-side connector invocation for dynamic server routes when connectors are eligible and declared. The documented model captures request-scoped connector bindings and invokes a fixed connector/action through a server helper. It requires validation and bounded reads, same-origin requests, private/no-store responses, and safe provider-content rendering. Static-only Sites cannot invoke connectors. Minamo's current Site exposes an MCP endpoint, but that alone does not establish which runtime integration pattern its V100 source uses or whether the Site is eligible.

A sensible smallest future experiment, **only after eligibility discovery works**, would be one optional, read-only GitHub source panel on a disposable owner-private Site: fetch a fixed harmless file through the Site connector at runtime, show filename/content plus provider-returned revision metadata, and make Refresh issue a new request. Verify the hosted visitor path and correlate Refresh with a genuine connector call. Keep GPT/MCP source selection and Minamo's own persistence separate.

### Approximate complexity (engineering estimate, not measured)

| Slice | Estimate | Main work / risks |
|---|---|---|
| One fixed-file read-only hosted GitHub experiment | Small | Eligibility, declaration, server route, bounded rendering, Refresh, visitor consent and hosted verification. The platform gate is currently unresolved. |
| Reusable optional Connected Source for GitHub files/revisions | Medium | Source identity, immutable revision metadata, repository/path validation, rate limits, stale-data states, error/re-auth UX, safe code rendering, caching per visitor, and contextual Note links. |
| GitHub browsing and diffs | Medium to large | Directory navigation, branch/commit selection, pagination, diff display, provider limits and provenance; avoid turning Minamo into a repository manager. |
| Google Docs/Slides previews | Medium | Format-specific payload/renderers, permissions, large-file handling, revision/staleness and links back to originals. |
| Google Sheets range explorer with charts | Medium to large | Range UX, table virtualization, data typing, charting, refresh, privacy boundaries and invalid/large ranges. |
| Narrow, confirmed external edits | Large / higher risk | Write eligibility, consent, identity, validation, idempotency, conflict/version handling and uncertain-result recovery. |

These are rough sizing judgments for custom React/server work after platform access is proven, not commitments.

### Design constraints worth preserving

- Keep Minamo content-first: a small optional source panel or source block, not another repository manager or Project hierarchy.
- Treat a live source and a saved snapshot as different states. A snapshot needs an explicit fetched-at time and provider revision/URL; failed Refresh leaves existing data visibly stale.
- Keep each request visitor-scoped; never put one visitor's private response in a shared cache or shared persisted Project record.
- Make provenance visible: provider, repository/file or Drive item, branch/revision or revision time where returned, and a direct open-original link.
- Link Notes to source identity and, where available, revision/range/line anchors. Do not imply a note refers to the latest source if its revision has changed.
- Preserve existing GPT/MCP continuity: GPT can choose or discuss a source, while the Site component owns authenticated retrieval and Minamo MCP remains for Minamo data.
- Keep provider content untrusted and render safely. Bound payload sizes, use no-store for private reads, respect retry timing, and expose per-source errors without clearing useful stale content.
- Cache only after audience and visitor isolation semantics are proven; do not share provider credentials or connector bindings across requests.

## 8. Blockers, errors, and unverified claims

**Observed blocker:** Native Sites eligibility discovery was absent from the active tool inventory, and the documented call was not callable.

**Not established:**

- Account-plan eligibility or any workspace/admin policy reason.
- Eligibility of this Site or either provider.
- Canonical Site plugin and connector IDs, action membership, or action schemas.
- Which provider reads/writes a Site could request.
- Whether any visitor consent or connection prompt appears for this account.
- Successful hosted authentication, read, Refresh, sign-in return, or provider error behavior.
- GitHub revision metadata available through an eligible Site connector.
- Google Drive payload suitability, interactive chart support, or narrow write behavior.
- Whether current Minamo V100 has any dormant Site connector declarations. No source declaration was changed or asserted from absence of a discovery response.

No request was made to bypass platform restrictions. No credentials, tokens, private document contents, or learning records are included in this report.

## 9. Recommendation and go/no-go

**Go** for retaining Connected Sources as a conditional future exploration in PR #84.  
**No-go** for implementing or deploying a Minamo Connected Source component based on this evidence.  
**No-go** for the requested GitHub hosted proof of concept in this session: visitor-side eligibility and authenticated runtime behavior were not verifiable.

Next useful step: when the native Sites eligibility/discovery tool is available, run it against a separate disposable owner-private Site (after confirming at least one required connector is returned). If it returns GitHub with a read action, proceed with only the fixed-file, read-only hosted Refresh test. If it denies the account/Site or returns no GitHub connector, record that response and stop. Investigate Drive only after its eligibility and read actions are actually returned.

**Conclusion:** GPT can use its GitHub and Drive connectors in this conversation, and Minamo exposes its own MCP surface. Neither observation proves that the hosted Minamo Site can use a visitor's connected apps. The required Sites eligibility evidence and hosted runtime test remain outstanding; the current result is a platform-discovery blocker, not an eligibility denial.

## 10. Fresh native-discovery recheck — 3 November 2026

This section records the fresh execution of the owner's full feasibility prompt after the Sites connect-plugin entry point was selected. It preserves the earlier report and distinguishes its earlier call attempt from the checks actually performed in this execution.

### Current verified observations

1. Read the runtime-supplied **Sites skill 1.1.3** and its `references/app-integrations.md` reference. The mandatory first step remains native `list_plugin_eligibility` / `sites_list_plugin_eligibility`, using the registered Site ID and only returned `allowed` plugin/connector membership.
2. Searched the current complete native-tool metadata inventory for eligibility tools: **zero tools with “eligib” in their names** were exposed. Checked the documented normalized function `tools.mcp__codex_apps__sites_list_plugin_eligibility`: its callable type was **`undefined`**. No provider invocation or fabricated eligibility request was dispatched. The earlier “not a function” attempt described above belongs to the earlier execution; this recheck independently confirms missing exposure.
3. Read `get_site` for `appgprj_6ad8a4e85eb48191accd6e78976b47e3`: active, current user role owner, latest version **100**, URL **https://minamo.jscymru.chatgpt.site**, custom access policy revision **1**, `requires_byop: false`, and existing Minamo MCP connection metadata.
4. Read the latest saved-version provenance: **V100**, native source **`a10709c9cfb7b0de819dc392de01ce29e576e1d4`**, saved version **`appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_04b6247e2d3c8191b06d7e403e787703`**.
5. Read that version's deployment **`appgdep_6ae9503af8e8819184c1c5d01cd2e4ca`**: **succeeded**, same Minamo URL, MCP present, runtime environment-set revision **9**, last update **2026-11-03T03:08:55.547139+00:00**. No newer saved version was returned.
6. Confirmed current GPT-side tool metadata still includes GitHub file/blob/commit/compare reads, Google Docs document/text/paragraph/table reads, Sheets metadata/cell/range reads, Slides presentation/text/outline/table/thumbnail reads, and separate provider write operations. This was **inventory inspection only**, not Site eligibility or a provider-data call. No Drive files were accessed.
7. Read current main `AGENTS.md`, draft PR #84 and its future-source brief. PR #84 was open/draft at head **`6336f6fb5fdb94187d415299d18197cadb58c492`** before this report-only update. The original report already existed on the requested branch. The user-specified V100 boundary and PR #84 brief take precedence over stale V91 statements in main's agent guidance.
8. Stopped at the discovery blocker. **No test Site was created; no preview, connector declaration, build, publication, provider write, production code change, data read/reset or access/authentication change occurred.** The sole authorized write is this report update on PR #84's existing branch. PR #83 is untouched; PR #84 is not merged.

### What the current Sites reference documents, but this execution did not demonstrate

- **Eligibility:** only the native eligibility response establishes allowed Site plugins, canonical IDs and connector membership. ChatGPT plugin search, an Add plugin entry point, personal-account assumptions and the Minamo MCP endpoint cannot substitute for it.
- **Declarations:** `plugins` and `connectors` belong in the hosting manifest only after discovery. Connector `action_selection_mode: "read_only"` is the default. `"all"` requests connector-wide read/write access; custom per-action lists are unsupported. A read-only first experiment should not request `"all"`. No canonical IDs are supplied in this report because none were returned.
- **Runtime:** dynamic server routes can use request-scoped trusted connector bindings and server-owned, schema-validated connector/action/target choices. Static-only Sites cannot invoke connectors. Never expose a browser-side arbitrary connector proxy or reuse bindings across visitors.
- **Authentication/consent:** hosted calls use each visitor's connection and consent. Local preview relays through the owning agent's connection and permits reads only. These are distinct authorization paths; a successful local Refresh would still not establish hosted visitor access.
- **Responses/errors:** the documented connector result must have `status: "success"`; HTTP 200 alone is insufficient. Preserve structured results, diagnostics and retry timing. Only the documented `reauthentication_required` condition should offer Connect through the server-generated sign-in return path; do not turn every provider failure into a sign-in loop. Failed Refresh must retain prior data as stale rather than report an empty success.
- **Future writes:** hosted writes require explicit visitor action, authenticated identity, provider/workspace permissions, enabled support, write consent and duplicate-submission protection. Do not automatically replay an uncertain write. None of these gates or flows was exercised here.

These are **documented contracts**, not observations of working GitHub or Drive integration for this account.

### Current decision and outstanding owner action

**No-go for building the requested hosted GitHub proof of concept in this execution. No-go for a production Minamo integration based on the present evidence.** Retaining an optional Connected Source as a future idea remains reasonable.

The necessary next action is to obtain a Sites session in which the documented native eligibility function is actually exposed, then run it with this exact Site ID. There is no verified basis here to prescribe an account upgrade, workspace change, plugin reinstall or provider reconnection as the fix. If a future response is denied, report its stated reason; if it is allowed, use only its returned IDs/actions for the separately published read-only fixed-file Refresh experiment. Account/Site/provider eligibility, hosted visitor consent, runtime retrieval, revision metadata and genuine Refresh all remain **unverified**.

A separate experimental Site URL is **not applicable: no Site was created**. Minamo V100 remains untouched. This report's conditional complexity judgments are not implementation approval.

## 11. Reattempt from the Site-linked prompt — 3 November 2026

The owner launched the full experiment again with an explicit Minamo Site reference after the connect-plugin question. This execution freshly read the Sites 1.1.3 integration guidance, current Site metadata and the existing PR #84 report before deciding whether a proof of concept could proceed.

**Result unchanged:** the native registry exposes no eligibility tool, and the documented `tools.mcp__codex_apps__sites_list_plugin_eligibility` function is `undefined`. Selecting the Sites plugin and supplying the exact Site reference did not expose that function in this execution. This observation narrows the session limitation; it still does not establish account-plan ineligibility, workspace denial or provider incompatibility.

The Site remains active with latest saved version V100, custom access policy revision 1 and `requires_byop: false`. The known V100 deployment `appgdep_6ae9503af8e8819184c1c5d01cd2e4ca` was re-read and reports `succeeded`. No production change was made. Draft PR #84 was still unmerged at `3b1e66fd3122fe34e1e68aad5df41087c48b3320` before this report-only recheck entry.

The existing complete feasibility assessment and conditional GitHub/Drive analysis above stand. Exact eligible connector IDs, Site action schemas, hosted visitor authentication/consent and runtime Refresh remain unknown. No test Site, local preview or provider-data call was attempted, and no external provider content was written. PR #83 was untouched and PR #84 was not merged.

**Stop condition reached again:** no-go for the hosted experiment until native eligibility discovery is actually available. Repeating this prompt or choosing a provider name alone has not resolved tool exposure; no upgrade, credential copying, declaration guessing or unsupported workaround is recommended.
