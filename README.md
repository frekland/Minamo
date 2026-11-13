# Minamo V2

An owner-private React learning workspace, independent of original Minamo. Active implementation commission: [issue #1](https://github.com/frekland/minamo-v2/issues/1).

## Run and verify

Node24 and pnpm11.25.0: `pnpm install --frozen-lockfile`, `pnpm run typecheck`, `pnpm run build`, `pnpm test`. Build prepares local Pyodide/SQLite runtime assets from locked packages, then compiles the actual Vinext Worker. Generated runtime files are ignored; source and lockfile reproduce them. Tests use actual domain handlers, local D1/R2 and the exact compiled Worker; synthetic identity fixtures do not prove hosted sign-in. No paid external service is needed.

Run `pnpm dev` for development. Sites publication uses the supported source-helper/artifact workflow. The production-only owner-private boundary belongs to Sites sign-in plus server-side per-owner validation. A development-only `/preview-test` route renders synthetic UI fixtures for browser QA; its API requests still have no identity and writes are rejected. The compiled production route returns404. It is not a sign-in emulator.

## Working experience

Journeys and multi-parent Investigations connect to curated Library reading, exact passage Flags/annotations, contextual Notes, an organiser and recoverable Trash. Notes remain mounted across navigation, retain drafts, support dock/focus/collapse, and save only through acknowledged revision-guarded commands. Reading preserves immutable authored renditions and exact UTF-16 anchors. Python, SQLite, regex, Unicode and bounded Web experiments use real browser execution with honest isolation/fidelity limits; saving a Run is a separate action. The typed private MCP surface shares the web domain/records.

An empty workspace stays empty until deliberate authoring or an explicit synthetic-example command. Opening pages never creates learner evidence. Synthetic examples, GPT/editorial changes and genuine user work remain distinct. Flags and annotations do not instruct GPT automatically. Original Minamo data is neither imported nor modified.

See [STATUS](STATUS.md), [implemented architecture](docs/IMPLEMENTED-ARCHITECTURE.md), [source synchronisation](docs/SOURCE-SYNCHRONISATION.md), [security boundaries](docs/SECURITY-BOUNDARIES.md) and [tool runtimes](docs/TOOLS-RUNTIME.md). Release evidence records the actual verified scope and remaining work; do not infer complete original-product parity from this README.

## License

Minamo's original application code is licensed under the [GNU Affero General Public License, version 3 only](LICENSE) (`AGPL-3.0-only`).

Third-party dependencies, bundled assets, fonts, dictionaries, model files and vendored components remain subject to their respective licences and notices; this repository licence does not relicense them. In particular, preserve notices included with vendored files and check dependency licences for redistribution. If operating an AGPL-covered modified version over a network, review the source-availability obligations in [section 13](LICENSE).
