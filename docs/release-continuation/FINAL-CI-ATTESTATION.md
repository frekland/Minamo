# Final independent CI-equivalent rebind

The final corrected browser/runtime candidate was independently validated again after its last source changes. This supersedes the earlier 890152 runtime binding for the release decision; the earlier `CI-ATTESTATION.*` files remain unchanged historical evidence. This is **local CI-equivalent execution, not green GitHub-hosted CI**.

## Exact final source

| Identity | Verified value |
| --- | --- |
| GitHub commit | `6252b6535c448888a1a16d517a0590b5456395b4` |
| Local commit | `fba699b000c33af379413ee51772a952dd5b4a17` |
| Exact common full tree | `b6ac05c1cfde049dc74d645a737f5950b1fd6cc1` |
| Source/build/test inputs | **663**, zero mismatches before or after execution |
| Input digest | `3c7f7c01e087b6608458dbb70a8a23a500fb0c15790f075ae24f92cbbe714feb` |

GitHub's Git-data API was read directly for the final remote commit and returned the same full tree as the clean isolated checkout. After validation, the isolated checkout remained clean and its full tree remained unchanged. The authoritative current input manifest is `evidence/INPUT-MANIFEST.json`.

The existing independent dependency installation was reused. This rebind did **not** claim another fresh install: `package.json` and `pnpm-lock.yaml` were independently compared byte-for-byte with the previously fresh frozen installation and are unchanged. The checkout retains its own actual `node_modules` directory, not a symlink to the root candidate's dependencies. Toolchain: Node **v24.22.1**, pnpm **11.25.0**. Dependency hashes and the earlier actual fresh-install receipt/log are linked in the JSON.

## Actual final execution

The final typecheck → ordinary production build → full suite ran serially in one retained shell with `set -e` and exclusive build/test resource ownership. No application source was modified to obtain a pass.

| Phase | Result |
| --- | --- |
| `pnpm run typecheck` | Exit **0** |
| `pnpm run build` | Exit **0**; ordinary production build, science excluded |
| `pnpm test` | Exit **0**; **1,021 total / 1,017 passed / zero failed / four explicit skips**, 207,523 ms |
| Final optional assets | Public controller absent; distribution controller absent; science distribution absent |
| Final source | Clean; unchanged common tree; all 663 input hashes still match |

The full suite uses its existing two-file concurrency bound and includes the actual production-compiled Worker, Activity/MCP/Atlas and security guards. Four explicit skips remain: three optional unstaged-science execution cases and one absent Rust/Cargo compiler case. No skipped execution is counted as passed. Cgroup cumulative OOM counters remained unchanged throughout this final run (20 OOM events, three OOM kills before and after); no new OOM event is attributed to it.

Machine-readable results, exact skipped test names, raw-log sizes and SHA-256 digests are in `FINAL-CI-ATTESTATION.json`. Raw output is preserved as `evidence/final-ci-{typecheck,build,full-suite}.log.gz`. These counts overlap previous suites and must not be summed into a unique aggregate.

## Remote CI and scoped disposition

The actual final GitHub commit's PR run is `40236768170`, job `121299902363`. It failed with **runner ID zero, zero steps and Ubuntu execution 0 ms** (overall run duration 4,000 ms). No remote green claim is made. The earlier provider evidence remains applicable to methodology: the unchanged workflow has an actual historical green run, while current startup diagnostics are recorded as annotations that this connector cannot retrieve. The precise provider cause remains unestablished; no repeated rerun, account/billing/permission change or speculative diagnosis was made.

The commission-permitted independently reproduced alternative is now bound to the **final** corrected source. The independent release reviewer owns the explicit G03 alternative acceptance. The separately executed 39-case pinned browser acceptance is a separate root/reviewer-owned receipt; it was not rerun by this CI specialist or included in the Node full-suite count. Native source/build packaging, authenticated private hosting, fresh MCP, synthetic cleanup and any physical-device acceptance remain their own gates.

No genuine owner record, production source, Site version, credential, access setting or paid service was changed by this attestation.
