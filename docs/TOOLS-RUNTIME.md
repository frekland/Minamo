# Practical tools: ownership, fidelity and limits

The React Tools surface owns editor presentation and deliberate Run/Save controls. `lib/tool-runtime.ts` owns execution outside React route lifetimes. The shell keeps the component mounted while navigating; changing a route does not execute code or restart a runtime. A user action captures an immutable input snapshot. The runtime does not write Minamo records. Save Run uses the shared guarded command service only after an observation exists.

## Actual engines

| Engine | Implementation | Boundaries |
|---|---|---|
| Python | Bundled Pyodide 0.28.3 / CPython in a dedicated Worker inside an opaque-origin iframe | Full Python + bundled standard library, virtual filesystem per run; no external package downloads, owner API, host OS or Kali. Local trusted runtime assets are supplied as ArrayBuffers. The parent fetches only the trusted controller source and runtime assets. A nonce-authorised `srcdoc` controller runs in the sandboxed opaque frame; user code is delivered separately by a source-checked message, never interpolated into controller HTML. Frame CSP denies network; Worker fetch admits bundled runtime filenames only. Preparation can be cancelled; execution has a 20-second watchdog. |
| SQL | Bundled sql.js 1.13.0 / SQLite WebAssembly in a terminable Worker | Fresh in-memory SQLite per run, unrelated to app D1. 10-second watchdog. Retained output bounded to 200 rows / 50 KiB inside engine, then 39,000 characters in application output. Partial result rows and actual SQL errors remain visible. Later statements may not run after truncation. |
| Regex | Actual JavaScript RegExp in a dedicated Worker | No server/PCRE dialect claim. 300-character pattern, 12,000-character text, 100 matches, 10-second watchdog. Empty matches advance safely over astral code points in Unicode modes. Positions are UTF-16 offsets. |
| Unicode | Browser TextEncoder, codePointAt and normalize | Reports UTF-16 code units, code points, UTF-8 bytes, NFC/NFD and first 256 code-point rows; not grapheme-cluster count. 12,000 code-unit input bound. |
| Web | Real opaque-origin HTML/CSS DOM and a fixed finite Add one event handler | Supported grammar admits text/layout/button/input elements and quoted safe attributes. No scripts, event-handler attributes, external URLs, CSS imports, frames or owner-network bridge. Arbitrary JavaScript is deliberately not an admitted mode: an opaque iframe does not by itself isolate renderer CPU availability. 16-KiB input bound retains complete input within the record model. |

Browser QA found that the initial external `.html` controller path did not acknowledge readiness. Startup now uses a standard Base64 random nonce and trusted `srcdoc`, removing that routing/CSP-self ambiguity while retaining opaque-origin isolation. The same trusted-controller startup is used for bounded Web; validated user HTML/CSS is delivered only after its ready handshake.

Python isolation is selectively adapted from original Minamo `python-isolate.js` at local source commit `f8b11de4ff7e8a695edb08e12ae959a10729e97d`. The original source and its data were not modified. The finite Web grammar follows the proven original `web-mode.mjs` design. SQL and regex use a small V2 Worker adapter rather than original app storage or identity modules.

## Editing and retained evidence

CodeMirror 6 is dynamically loaded for actual editing, with Python and SQL language support. A labelled plain-text editor remains available if editor loading fails; no runtime success is fabricated. Runtime packages are locked dependencies. `scripts/prepare-tool-assets.mjs` copies their required files into generated ignored `public/runtime/` before building, so published execution does not depend on a CDN. Notice files identify runtime packages and licences.

Drafts and unresolved Run-save payloads use separate owner-scoped localStorage keys. Without a server-derived `draftScope`, local persistence is disabled. Scope changes close the Web preview, cancel active execution and reset presentation state. Local draft retention is not a second durable mutation queue: no render, navigation, reload or effect automatically sends a write.

An unacknowledged Run save retains the exact captured payload, record ID and operation ID independently of later Web observations or new runs. An explicit retry uses that operation to obtain the same receipt. A new Run cannot be saved until the retained operation is reconciled. A late acknowledgement cannot label a newer observation as saved. Saved Runs retain code, inputs, runtime/fidelity/status, output, timestamp and actual linked context. Opening a saved Run loads evidence and an editable draft without executing it. Synthetic test inputs are explicitly marked by default; the user can deliberately uncheck the synthetic marker for their own observation. No Run implies learner achievement or external-machine work.

## Loading saved Experiments deliberately

When the current context is an Experiment with saved supported engine/code, **Load this Experiment** selects that engine and prepares its editor without executing anything or closing an existing runtime. The loaded Experiment title/revision remains visible, and a subsequent Run links to that actual retained Experiment while it remains available. Python/SQL/Unicode code is copied exactly. Regex loads the saved pattern plus clearly labelled visible built-in sample/flag defaults; Python standard input uses an explicitly empty default because the Experiment schema has no auxiliary-input fields. Bounded Web accepts an explicit JSON `{html,css}` code payload that passes the same finite-mode validator; arbitrary JavaScript is never reinterpreted as safe HTML.

Replacing an editor with an Experiment, example or saved Run retains one complete previous target-engine draft, loaded-context metadata and synthetic marker in an owner-scoped local checkpoint. **Restore previous editor draft** swaps current and checkpoint inputs, preserving the replaced text rather than discarding it. A new replacement updates the single checkpoint; this is presentation recovery, not a server history or automatic mutation queue. Unacknowledged Run-save payloads/identities remain separate and untouched. Captured results continue to describe their original immutable input snapshots, regardless of current editor contents.

## Verification

`tests/tool-drafts.test.mjs` checks deliberate engine/code preparation, complete replacement/restore snapshots, explicit Web payload validation and malformed recovery rejection without executing loaded code.

`tests/tool-runtime.test.mjs` exercises Unicode offset/encoding distinctions and Web rejection rules, executes the actual Worker regex and SQLite handlers (with Node worker-thread environment adapters and the same bundled WASM), checks partial SQL failures, and runs real Python/Unicode via the locked Pyodide package. These are local runtime tests. Browser-specific iframe isolation, user interaction, navigation persistence and hosted saving are separate acceptance checks; package tests do not prove those flows.
