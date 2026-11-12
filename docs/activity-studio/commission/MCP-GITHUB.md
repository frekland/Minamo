# Activity cartridge, typed MCP, GitHub and local round-trip

**Research specification. All new MCP commands and schema names here are PROPOSED, not exposed by the installed Minamo catalogue.** Start from the current domain contracts, explicit Notes and Developments, immutable owner/generation/recovery permissions, plus draft PR39 Foundry source adapters.

## 1. Activity package (proposed versioned contract)

Activity is a reuseable learning design, **not an injected JSX/HTML programme or giant Note**. Initial shape proposal:

~~~json
{
  "contract":"minamo.activity.v1",
  "localKey":"tcp-chunks",
  "title":"Can a single recv return the whole message?",
  "kind":"debugging",
  "intent":"Investigate application framing over a TCP stream",
  "level":{"basis":"owner-request","notMasteryScore":true},
  "context":{"journey":null,"investigation":null,"library":[]},
  "blocks":[
    {"id":"prompt","kind":"prediction","text":"What if the message arrives in pieces?"},
    {"id":"starter","kind":"source-browser","bundleRef":"starter-v1"},
    {"id":"tests","kind":"test-report","suiteRef":"stdlib-unittest","execution":"not-yet-run"},
    {"id":"hints","kind":"hint-ladder","hintIds":["h1","h2","h3"]},
    {"id":"reflection","kind":"reflection","text":"What did recv guarantee?"}
  ],
  "starter":{"bundleRef":"starter-v1","runtime":"external-python","command":"python -m unittest -v"},
  "hints":[
    {"id":"h1","tier":"concept","text":"Byte streams do not preserve message boundaries."},
    {"id":"h2","tier":"strategy","text":"Check the return value and what could remain unread."},
    {"id":"h3","tier":"mechanic","text":"Consider a loop with an end condition."}
  ],
  "spoilerPolicy":"hide-until-deliberate-reveal",
  "provenance":{"classification":"authored-exercise","execution":"not-executed"}
}
~~~

All source files have immutable SHA-256 hashes, bounded relative paths, roles (editable-starter / visible-test / teaching-only), sizes and optional licence. Compute actual digests, do not accept placeholder hashes. A publication command admits strict bounded typed blocks and normalizes safe input server-side. GPT can author the data, but does not create arbitrary new component classes or execute supplied scripts within the owner-private web origin.

### Composable block palette

Instruction, code source+syntax/diff, file tree, fixed test fixture, terminal/trace, code-line prediction, reveal/hint ladder, graph/timeline, safe state simulation, mathematical equation, Japanese ruby, bilingual/glossed passage, finite 2D/3D scene, table/chart, deliberately loaded audio, controlled drag/match/ordering, rubric, reflection, GitHub/local handoff, and cited Library reading. Reuse PR39 adapters and their exact provenance/source rights; preserve accessible plain text fallbacks.

## 2. Activity vs attempt vs learner knowledge

Reusable **Activity Edition** and owner **Attempt** should be distinct durable, versioned records. A library challenge may be reused in multiple Journeys without copying its content. An Attempt captures optional explicit predictions, code refs, runs, outcomes, hints revealed, reflection and submitted repo commit. Existing short Notes remain the learner's reasoning; an Attempt should not become an enormous mandatory journal.

Potential activity state progression: drafted → validated → published. Potential attempt sequence: prepared → editing → submitted → reviewed → revisited. These are **interface/workflow states, not mastery labels**. Navigation, viewing, copying, revealing hints and importing a file do not generate formal learning checkpoints or imply success. Consider XState only where retryable transitions and concurrency justify it.

Evidence taxonomy:
- authored-exercise and illustrative (may contain intentionally wrong code);
- learner-prediction and learner-reported execution;
- supplied external terminal text/file;
- fetched immutable GitHub commit/diff or CI run, with exact provider receipt;
- actually observed isolated Minamo Run, with real engine execution receipt;
- GPT interpretation or suggested correction;
- deliberate formal Development, only by its existing authorised API.

Unresolved contradictions, provisional hypotheses and later corrections must remain visible, not flattened into green progress.

## 3. Efficient GPT/MCP protocol (candidate actions)

Avoid forcing GPT through dozens of tiny mechanical requests. Benchmark an economical surface of:
- **get_minamo_activity_capabilities:** actually available templates, registered Foundry formats, runtimes, validator versions, examples, limits and host constraints. Must say when installed catalogue is stale.
- **preview_minamo_activity_package:** no-write semantic validation of a complete package; safe Markdown/manuscript transformations, source-permission checks, hashes, hint visibility, slot/link resolution; actionable field-specific repair errors, no fake benchmark.
- **publish_minamo_activity_package:** atomic explicit guarded publication/update, related Journey/Investigation/Library links, exact receipts, revision/operation IDs, idempotent retry and browser destination. Batch multiple related cartridges where useful.
- **get_minamo_activity_context:** project-name resume with compact current activity, newest attempt/intent, exact short Notes, related Library, source commits and evidence type. Solutions excluded from ordinary context.
- **record_minamo_activity_attempt:** explicit owner-authorised submission from source commits and other labelled evidence, preserving original immutable target edition, CAS and revision history.
- **review_minamo_activity_attempt:** optional deliberate analysis with exact source/CI refs and provisional judgement; ideally reuse Notes rather than automatically write every critique.
- **get_minamo_learning_graph:** scoped bounded graph projection with explicit relation types and cited destinations; may be part of existing context read rather than a new standalone tool.

Schema shapes and individual tool names are proposals. Validate them through cold-start GPT authoring tests and avoid schema bloat; server can adapt safe convenience syntax to exact domain types. Preview must not write. Publish never creates learner achievements or implicit external GitHub pushes.

## 4. Real repo interchange: GPT ↔ GitHub ↔ learner PC/Kali ↔ Minamo

**Author/generate:** GPT resolves Journey/Investigation naturally and proposes a scoped challenge. A template-builder creates literal source files + manifest, deterministic visible tests, nonspoiler hints, setup commands for Kali Bash/Windows PowerShell, and an actual declared baseline (expected red tests). Before publishing, independently run the tests against the intentionally buggy source and against a repaired reference maintained outside the learner bundle. Baseline failure should be the actual intended bug, not missing dependencies.

**Distribute options:**
A. GPT uses its connected GitHub connector under explicit owner authorisation to create a branch/repo/files and receives an actual commit SHA. A separate guarded Minamo command records repo URL, full SHA, file hashes, submission state and permitted links. ChatGPT's GitHub token is NOT implicitly available to the Minamo backend.
B. The site exports a deterministic, bounded, checksummed ZIP with path validation; learner deliberately downloads and uses local tools.
C. Optional future companion CLI for Kali/Windows reads package and generates a **reviewable signed digest/import report**; it does not grant remote shell access or silently sync personal directories.
D. A native GitHub OAuth/App integration may be researched separately; don't create background tokens/services without explicit owner approval.

**Work locally:** learner clones, inspects, runs tests, edits, commits and pushes. Minamo itself cannot run Kali processes. Make local/test commands copyable, versioned and OS-specific.

**Return:** user/GPT selects a concrete immutable commit to review. GPT reads the provider response and source diff relative to the exact starter SHA; any local terminal paste is labelled learner-supplied. GitHub Actions pass requires verified workflow run, conclusion and matching SHA; no CI run is assumed from commit existence. The readback includes changed paths, test evidence, learner question and next action; relevant Note capture and formal checkpoint remain separate user choices.

**Resumption:** another fresh GPT chat can retrieve original starter, current submitted commit, latest Note intent, which hypotheses failed, unanswered questions and relevant Library sections without requesting a handover or inventing progress.

## 5. Security and instructional correctness

- **Never put secret solutions in learner-facing repository, browser DOM, CSS-hidden text, source maps, package assets or default MCP context.** Private hidden-test oracle requires a genuinely private authoritative store and safe runner; client-side concealment is not access control.
- Source package sanitization rejects path traversal, absolute paths, symlinks, .git tricks, oversized/binary polyglots, embedded credentials, malicious lifecycle scripts and unsupported external dependencies. Explicitly scope what file types may be bundled, downloaded, previewed or run.
- Existing no-arbitrary-JS finite Web engine is authority. Sandpack bundler may depend on online services; WebContainers require cross-origin isolation and have mobile limits. Preview untrusted app code only in a separately proven non-privileged host, never by simply allowing scripts in an owner-authenticated iframe.
- Imported project code is untrusted data; no automatic package installation, execution, web fetch, prompt instructions, CI dispatch or privileged GitHub action.
- Immutable repo URL, exact owner/repo full path, commit SHA, file/tree hashes and provider attestations. Detect force-push/mismatched base/changed starter, partial creation, auth expiration and API failure; never invent a successful push.
- Preview/Publish CAS/operation identity, exact Note/Activity readback, current rights, generation/Trash/recovery and source revocation. External link alone never grants permission to copy private GitHub source into Minamo or an external search service.
- Hints form an incremental concept → strategy → mechanic → solution ladder with progressive deliberate reveal. No auto solution or fake evaluation. Editable challenge variants need independent executable oracle and actual red/green test checks.
- Optional scores/proficiency estimates cannot be inferred from opened content or test pass alone; a learner can ask for a provisional assessment with evidence basis. Formal learning Development remains explicit.
- Tests on synthetic local principal never count as hosted owner acceptance; browser emulator isn't physical Android.
- Critically: support auth/revocation changes *after* a file is imported or an attempt is linked. No screenshot/graph thumbnail may disclose revoked current source.

## 6. Serious acceptance path

Demonstrate with real code:
1. Fresh tutor retrieves user goal and scoped Library, composes correct supported package and publishes via actual typed MCP/domain to synthetic D1.
2. At least five activity types render in Classic, Focus and Task, on desktop and 390px, preserving rich Note draft and exact source selection/anchors through navigation.
3. Deliberately buggy fixture genuinely fails expected tests, then a corrected submission passes; separate nonspoiler baseline files validated by hash. Show full stderr, exit statuses and source SHA.
4. Real GitHub test repo/branch push/read-back/diff via the authorised connector in a disposable environment, or report external-auth blocker and test the full interchange manifest with a local Git repository without claiming provider acceptance.
5. Attempt/import evidence round-trip and fresh GPT resume with no IDs. Idempotent retries, source rights, old versions, different principal denial, Trash, checkpoint separation, encrypted recovery and explicit cleanup.
6. Independent adversarial tests: malicious path/source, untrusted prompt text, hidden answer leakage, unverifiable CI result, stale/force-pushed SHA, browser infinite loop, mixed UTF-16, oversized body, physical/touch limitations.
7. Empirical efficiency: number of GPT tool calls, input bytes, allowed authoring package size, cold-start context, whether a lighter model can publish the same template using the catalogue.

