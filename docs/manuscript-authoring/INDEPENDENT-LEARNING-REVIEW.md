# Independent review of synthetic learning records

Scope: read only `/tmp/minamo18-benchmark-records.json` (nine canonical projected records). No compiler/app implementation, private corpus, deployment, or application changes. Executed extracted Python only in disposable `/tmp` directories, without network. Priority labels below describe editorial defects, not a numeric quality score.

## Source-specific findings

- **P2 — “Build and inspect a duplicate report”, s3/p6:** “Change one byte in two.txt … then rerun the fixture” is not executable as written. The fixture removes its temporary directory on exit and recreates `two.txt` with the original bytes on each run. Tell learners to change the `write_bytes` literal in `try_duplicates.py`, keeping its length, and rerun. I made precisely that edit (`same\n` → `samo\n`); the text duplicate group disappeared and the empty-file group remained.
- **P2 — “Compare a query before and after indexing”, s2/p3:** the fixture has no timestamp ties *within a device*: IDs for device 7 differ by 100, while timestamps are `i // 3`. Consequently the row-equality check does not exercise the explicit tie-breaker taught in “What a composite index might change”, s1/p5. Add multiple rows for one device with the same timestamp and assert the expected descending ID order.
- **P2 — “Open Investigation: should the event log gain an index?”, s2/p2 and s3/p5:** “reduces rows examined” is an untested hypothesis. The supplied probe records plan text and elapsed time, not a row-visit counter. The evidence checklist should distinguish access-path selection from measured work; otherwise learners may turn a SEARCH plan into an unsupported quantitative claim.
- **P2 — “Compare a query before and after indexing”, s4/p5:** asking for reversed order is sound but leaves a beginner to design the control. Supply a small next-step recipe: independently populate two equivalent databases, index one, alternate measurement order, verify identical results, and retain sample distributions. This matters because the supplied probe prints a median only and cannot by itself support the Investigation’s representative latency-distribution requirement.
- **P2 — “Build and inspect a duplicate report”, s3/p7:** the permission-error checkpoint has no reproducible fixture or observed error. Add an injected read failure and assert stderr/incomplete results; chmod-only demonstrations are unreliable under elevated accounts. The main program's quiet-folder/race/hard-link caveats are explicit, so these are not undisclosed security guarantees.

No P1 technical defect established in these nine records. Do not inflate the listed teaching gaps into claims that the algorithms are incorrect.

## Actual local execution

Extracted the exact Python blocks into temporary `duplicates.py`, `try_duplicates.py`, `cache_demo.py`, and `index_probe.py`. Commands used `/opt/codex/runtimes/codex-primary-runtime/dependencies/python/bin/python <script>` from that temporary directory. Every command exited 0.

| Command | Actual result |
|---|---|
| `python try_duplicates.py` | Exactly `empty-a` + `empty-b`, and `one.txt` + `two.txt`; excluded equal-sized `other.txt`. |
| `python cache_demo.py` | Lines: `1200`, `1200`, `1500`, `1700`. |
| `python index_probe.py` | SQLite 3.53.1; before: `SCAN events` plus `USE TEMP B-TREE FOR ORDER BY`; after: `SEARCH events USING INDEX event_device_time (device_id=?)`; 20 rows in both cases; equality guard passed. Medians: 0.0012504285 s before, 0.0000107110 s after. |
| `python cache_zero.py` (only `ttl=10` → `ttl=0`) | Lines: `1200`, `1500`, `1500`, `1700`. |
| `python try_duplicates_changed.py` (one same-length byte change in fixture source) | Only the empty-file group remained. |

These observations establish behavior for this local synthetic input. They do not settle the production index decision, demonstrate persistent storage/write costs, or prove freshness under concurrency. The SQL block is a parameterized query fragment; execute it through the complete Python probe rather than as an unbound standalone statement. All three complete demonstrations warrant local execution before promotion. Additional cheap checks worth adding: symlink/hard-link semantics and unchanged scanned bytes; cache failed-load/reload behavior; SQLite tied timestamps.

## Evidence honesty and independent Library value

The duplicate and cache records explicitly call their outputs predictions. The SQLite Journey supplies no invented execution result, and the Investigation explicitly says unanswered, unknown, and not collected. Preserve those statements: this independent review's disposable run is a separate observation, not evidence that the original record had previously been executed. A measured synthetic read improvement still does not justify closing the open workload/storage/write-cost question.

The Library articles teach reusable distinctions independently of the projects: content identity versus filenames/physical copies; authoritative source versus cached answer and freshness; access path versus workload value. The separate implementation articles add runnable material rather than merely rephrasing the models. Journeys add prediction, experiment, interpretation, and extension. The defects above chiefly affect whether those next actions are reproducible. Metadata such as `reusableBeyondProject: true` cannot establish independent value on its own.

## Required editorial challenge catches

The supplied nine-record file does not contain the separately described adversarial challenge fixtures, so the following are rejection criteria, not a claim that I inspected their payloads:

- **P1 — question-as-outcome:** reject an Investigation presented as concluded merely because an outcome field contains a question, plan, or prediction. Inspect the actual language and evidence: an unresolved question must remain open; a conclusion needs an answer, observations, provenance, scope, and remaining uncertainty. Valid shape/field presence cannot substitute for an answer. The legitimate open SQLite Investigation must remain distinguishable from this failure.
- **P2 — seven near-identical articles:** reject editorial breadth inferred from article count, titles, or IDs. Compare the substance: distinct concept, explanatory model/example, reader task, and reusable takeaway. If seven articles teach the same claim with superficial substitutions, merge them into one article or meaningful sections; links among copies do not create a learning path. Flag duplication as P1 only if publishing all seven defeats an explicit substantive-diversity requirement or systematically misrepresents coverage.

## Re-review after corrections (2026-10-22)

Re-read corrected canonical projections only. All five original P2 findings are addressed:

1. The duplicate Journey now tells learners to edit the fixture source literal, and explains temporary directory replacement. Executed the exact corrected fixture (exit 0: both expected groups), then changed only `two.txt`'s source literal from `same` to `sane`; exit 0, only the empty-file group remained.
2. The added `try_failure.py` injects `PermissionError` through `unittest.mock` without changing permissions. Extracted and executed unchanged alongside the reporter: exit 0; stdout `[]`; stderr `Skipped: synthetic read failure`. The explanation correctly withholds digest evidence for the failed candidate.
3. The SQLite fixture now uses `i // 1000` and guards result equality, descending `(recorded_at, id)` order, and actual ties in returned rows. Executed unchanged: exit 0, all guards passed, 20 rows before/after. SQLite 3.53.1: baseline SCAN plus temporary ORDER BY B-tree; indexed SEARCH through `event_device_time`. This run's medians: 0.0013437245 s and 0.0000104810 s respectively.
4. Both the Journey and Investigation now explicitly distinguish selected access strategy from actual row visits; neither represents the plan as a row counter.
5. The next experiment now gives actionable fresh-database, alternating-order instructions, preserving all samples for distributions and separating setup/index-creation costs. It explicitly retains warm-memory and host-load limitations.

Commands were `python try_duplicates.py`, `python try_failure.py`, and `python index_probe.py` using the same runtime as the original review, in automatically removed `/tmp` directories. No network, app implementation, or application changes. These corrections remove the identified reproducibility/evidence gaps; no remaining P1/P2 editorial defect established in the corrected nine-record material. The open Investigation remains honestly unanswered. The synthetic measurement does not establish a production recommendation. Actual saved-page snapshot review remains a separate pending step.

## Actual saved-content review (2026-10-22)

Read the supplied saved-reader snapshot `/workspace/sites/minamo-v2/lib/manuscript-benchmark-saved.json` directly: nine unique saved records, comprising five Library articles, three Journeys, and one open Investigation, each with rev 1 and a saved rendition identifier. Re-read the saved prose and compared complete content fields (`family`, `title`, `body`, `links`, `synthetic`, `sections`, `learningShape`) by record ID against the corrected material reviewed above. **No content discrepancy in any of the nine records.** This includes every code block, inline link annotation, table, checkpoint, and all five editorial corrections. All structured internal record links resolve to a saved record of the stated family.

Verdict scoped to actual saved content: no P1/P2 learning-quality defect established. The saved Journeys contain the corrected source-edit exercise, runnable injected-failure exercise, tied-timestamp guards, precise plan/work distinction, and actionable alternating-order extension. The saved Library material remains independently useful beyond its project examples. Saved output predictions remain explicitly predictions, and the saved Investigation still says unanswered with uncollected workload evidence; it does not manufacture an outcome from the question. No unchanged examples were reexecuted in this pass: their exact saved code matches the already executed corrected blocks. This verifies the supplied actual saved-reader content, not browser layout, live route behavior, or the publication/authentication pipeline. Those require the root agent's separate checks.
