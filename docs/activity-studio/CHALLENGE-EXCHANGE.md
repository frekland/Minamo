# Challenge Exchange engineering bank

Implemented source: `lib/challenge-exchange/{package,generators,evidence}.ts`. Reproduce with `node --test tests/activity-exchange.test.mjs` and `node scripts/activity-exchange-proof.mjs docs/activity-studio/EXCHANGE-RUNTIME-RESULTS.json`.

## Implemented contract

`generateChallenge(id)` produces a validated `minamo.project.v1` multifile starter package. `challengeCartridgeBlocks(template,project)` composes instruction, prediction, source-browser, progressive concept/strategy/mechanic hints and reflection blocks for the Activity domain. `projectPackageSchema` is an actual strict exported schema; `admitProjectPackage` checks inert JSON before recursion and validates exact UTF-8 hashes. `buildProjectPackage` computes hashes instead of asking an author to invent them. `projectDigest` hashes the admitted stable file order.

The distribution lane is dependency-free text: 32 files, 64 KiB per file and 192 KiB total. Paths reject traversal, absolute/drive/hidden paths, symlinks through strict shape, Windows devices, case collisions, file/directory collisions, unsupported binary/HTML files and reserved manifest paths. Credentials, dependency installation, lifecycle scripts, automatic Rust build hooks and dependency/workspace sections are excluded. Commands come from a runtime allowlist. These checks make distribution predictable; they are not a sandbox for external program execution. The learner deliberately reviews and executes source on a local computer. Minamo does not install or run package source in its authenticated origin.

`deterministicProjectZip` produces a real store-only UTF-8 ZIP, constant 1980 timestamps, ordinary non-executable file modes and a generated checksummed manifest. Independent Python `zipfile` tests verify CRC, decoded byte hashes, sizes and file modes. The exporter never uses caller-provided paths on a host filesystem.

## Executed teaching portfolio

| Template | Runtime | Deliberate error |
|---|---|---|
| tcp-chunks | Python stdlib | One receive mistaken for a whole EOF-terminated message |
| unicode-slice | Node | UTF-16 code units confused with Unicode code points |
| async-order | Node | Array of unresolved Promises returned as values |
| trapezoid | Python | Right rectangles mistaken for trapezoids |
| sample-mean | Python | Incorrect sample denominator |
| maze-wrap | Node | Negative remainder leaves a toroidal board |
| beat-clock | Python | BPM inverted in event-time calculation |
| csv-detective | Python csv | Literal split ignores quoted delimiters |
| utf8-fragments | Python | Decoding incomplete UTF-8 chunks separately |
| sql-missing-parent | Python SQLite | WHERE filter discards LEFT JOIN parents |
| bash-space-log | Bash | Shell word splitting corrupts literal log lines |
| counterexample-max | Python | Zero accumulator assumes a positive observation |

Every starter was actually executed and failed the intended assertion; each independent reference repair passed the same visible tests. Runtime results retain full stdout/stderr, exact command, exit code, file/package/ZIP digests and platform versions. The original two PR40 fixture files preserve exact Git blob identities `2888d53697c17b53bfd33c6e722cb40f2220d223` and `36271900cb2a3ac775a5de504b1b9cc0903ca6fa`; they independently fail three of five tests and their temporary repair passes all five.

Six templates additionally expose `generateChallengeVariant(id,seed)`: Unicode slicing, mean, maze wrapping, beat clock, maximum counterexample and trapezoids. The generator accepts an integer seed in 0–65535 and appends a trusted visible test with changed inputs and an independent expected value. Eighteen generated variants (seeds 0, 7 and 65535 for each template) were actually executed red and repaired green. This is sampled boundary/interior execution plus deterministic construction, not a claim that all 393,216 variants were separately executed.

Reference repairs are engineering-only data in `scripts/activity-exchange-proof.mjs`, never imported by application/runtime modules, starter packages or default MCP reads. Temporary repaired source directories and synthetic local Git repositories are removed after proof. Runtime reports contain hashes, paths and test failures, not the repaired source or diff. Visible tests are intentionally visible oracles; no complete hidden solution is distributed.

## Immutable return evidence

`fetchGitHubSubmission(request,trustedProvider,expectedProject?)` accepts no user assertion of execution. It calls the connector boundary for exact starter/submission commits and their complete non-diverged comparison. Repository/commit URLs, full SHAs, tree SHAs, workflow IDs/conclusions and exact workflow head are checked. A commit alone yields an empty workflow list. The receipt always says `execution: not-executed-by-minamo`. Local terminal admission remains `learner-supplied / reported-externally`.

Package matching is separately honest: without an expected admitted package and trusted immutable `readTextFile` callback, `starterPackageMatch` is `not-verified`. With them, every original file is fetched at the exact starter SHA and hashed before `verified-file-hashes` is returned. This prevents an unrelated starter commit from inheriting a matching-package claim merely because an author supplied the desired digest.

The test suite executes an actual disposable local Git starter → repaired commit → exact diff round trip. It also exercises the provider contract with a local adapter. That adapter is explicitly a simulation of a GitHub connector; its synthetic URLs are not hosted-provider evidence. `githubProviderAcceptance` remains false in this report. A real connected GitHub create/read/compare receipt must be recorded separately before claiming external-provider acceptance. Tokens are never passed to or stored by Minamo.

## Source and runtime research

The networking exercise follows [Python socket.recv documentation](https://docs.python.org/3/library/socket.html#socket.socket.recv), retrieved through Firecrawl on 25 October 2026: receive operations return a bounded byte result and EOF is represented separately. This fixture deliberately uses finite EOF framing; it does not teach waiting forever for EOF on persistent HTTP/application connections. The tests use deterministic supplied chunk boundaries, not a fabricated live network trace.

PowerShell commands are generated explicitly (`py -3 -m unittest -v`, `node --test`, or WSL Bash). They were not executed on a Windows device. Rust's offline command is supported by the manifest, but no Rust specimen or successful Rust runtime is claimed because `cargo` is unavailable in the current environment. Browser, D1/MCP publication, hosted-owner and physical Android acceptance belong to the integrated reports, not this local test receipt.
