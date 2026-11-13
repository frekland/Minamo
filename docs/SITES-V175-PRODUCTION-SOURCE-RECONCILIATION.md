# Minamo V175 production source reconciliation

This is a read-only source comparison for PR #9. It did not publish a Site version, change production settings, run a database operation, or access learner records.

## Source authority

- Current production Site: https://minamo.jscymru.chatgpt.site/ (the former Visual Lab is now this main production application; there is no separate Lab target for this task).
- Deployed Sites version: **V175**, saved version `appgprj_6aeba0aa528c81918be19dd51427b2cb~appgver_e270e25a14b08191bfc98a33436493d4`, deployment `appgdep_6af6140e432881919ef880b615d595a4`.
- Exact native source revision/tree: `daf07483cbbc737de4283317271af5dca3776bb0` / `d2a62bd9ef077fea3775521a28ff703fa98f7bc8`.
- PR #9 base: V175 PR #7 commit `1fdfb8bd5f5a66b820921009def67a0cf6e519f9`.
- The native source was fetched from the Site's configured source repository through Sites, and its HEAD matched the deployed V175 source revision. This comparison did not infer source from the rendered Site or an archive.

## Comparison and adaptation

The PR #7 baseline is already the correct V175 application baseline. Comparing every native tracked path with that commit found:

| Finding | Count | Treatment |
| --- | ---: | --- |
| Native tracked files | 1,719 | Enumerated with path, SHA-256, size and Git mode in the manifest. |
| Shared files exactly identical to V175 | 1,625 | Preserved as the application/source baseline. This includes every shared app, server, MCP, database, migration, configuration, dependency, test and runtime asset. |
| Post-deployment GitHub documentation additions | 2 | Retained as later release receipts; they do not change application behavior. |
| V175-only files | 92 | All are documentation/evidence images, logs or test archives; omitted from the public baseline as non-runtime evidence artifacts. No application-source file is omitted. |
| GitHub-only files already at PR #7 | 7 | Historical Library/review documents and the prior V174 reconciliation verifier/manifest; kept intact. |

The two changed shared files are `docs/PROJECT-PRESENTATION-GLOBAL-EDIT.md` and `docs/PROJECT-READING-AND-ORGANISATION.md`; both differences are post-deployment release receipts. There are no shared non-documentation differences between native V175 and the PR #7 base. Consequently, PR #9 was adapted on the already-correct V175 base rather than replacing its files with an older public snapshot. The Project reader, relationship model, exact/targeted MCP authoring, Note ownership boundary, and tests in PR #9 are additive changes on this baseline.

The complete file-level record is [SITES-V175-PRODUCTION-SOURCE-MANIFEST.json](SITES-V175-PRODUCTION-SOURCE-MANIFEST.json). Run `node scripts/verify-sites-v175-source-reconciliation.mjs` in this Git checkout to verify the recorded native hashes and modes against the public PR #7 baseline commit. The verifier also rejects undeclared/missing source paths, non-documentation exclusions, and unlisted historical files.

## Preserved production contracts

Because the application-source paths match V175 exactly at the PR base, the reconciliation retains V175 authentication/owner scoping, MCP contract and permissions, collaboration settings, D1/R2 binding names, persistence and revision handling, existing learner content routes, canonical Project content, historic editions, and existing interactive layouts. No production data was read or changed. This establishes source compatibility, not live runtime acceptance of the PR #9 candidate.

## Verification boundary

Typecheck, production build, focused tests and the broader historical suite are recorded in `PROJECT-CONTEXT-V1-IMPLEMENTATION-STATUS.md` and the PR description. Tests exercise synthetic records only. No live MCP call, browser acceptance, production deployment, or live-data mutation was performed in Work.
