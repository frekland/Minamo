# Fresh ordinary authoring trials — independent evaluation

Evaluated 2026-10-26 via connected Minamo tools after publication. This is a separate evaluator pass, not the producer's structural self-assessment. The evaluator previously produced the jq article, so that portion is a deliberate second review rather than a blind independent-person review. No records, runtime or learner evidence were changed. All evaluated records are synthetic test material; the parent owns recoverable cleanup.

## Conclusion

All three resources provide useful independent learning material. They explain mechanisms, interpret original examples and distinguish plausible failures. The German Activity actually checks the three taught clause shapes and gives relevant explanations. No material factual error was found in the worked examples checked. There are concrete diagnostic defects and bounded teaching/feedback limitations below; counts are not pedagogical scores.

## Original ordinary requests

Preserved from the initiating prompt and immutable manuscript source, not reconstructed from titles:

1. **jq:** “Use Minamo. Create a useful Library resource about jq filters for transforming JSON.”

   Full trial boundary: “This is disposable TEST ONLY acceptance material: set synthetic:true on everything you create, don't modify genuine existing resources or record learner progress. Use the connected tools normally; don't read repositories or earlier engineering reports. Return saved browser links and exact publication/readback receipts. Do not clean up yet; the parent will recoverably clean your exact records.”

2. **Concept enrichment:** “Use Minamo. Improve my existing Library reference on referential transparency and effects.”

   Full trial boundary: “This is disposable TEST ONLY acceptance material: modify only the existing synthetic test resource you discover, set synthetic:true on any new records, don't change genuine resources or record learner progress. Use connected tools normally; don't read repositories or earlier engineering reports. Return exact saved links and publication/readback receipts. Do not clean up yet; the parent will recoverably clean your exact records.”

3. **German:** “Use Minamo. Create a useful German separable-verbs resource and a short practice for it.”

   Full trial boundary: “This is disposable TEST ONLY acceptance material: set synthetic:true on everything you create, don't modify genuine existing resources or record learner progress. Use connected tools normally; don't read repositories or earlier engineering reports. Return saved browser links and exact publication/readback receipts. Do not clean up yet; the parent will recoverably clean your exact records.”

The subsequent evaluation task explicitly allowed reading `lib/resource-quality.ts` and writing this evidence. Producers did not need repository instructions to author the resources.

## Exact current editions

Generation: `legacy@0`. All four records read back `synthetic:true`, active, and not trashed.

| Resource | Exact identity | Revision / catalogue | Rendition |
| --- | --- | --- | --- |
| jq filters | article `ms-464b2f82595621bff4040b7b01406b5f27ce0e1b` | 1 / 1 | `r-54a82a14a3f7ffa6bb0d254f8ff1fb107a5df649ba46c99f59ef5b0706d0511c` |
| Referential transparency | article `ms-175a124b9ca601575d9862c3ac29a2b8ba579c28` | 3 / 3 | `r-d02e6da1026ff839d5519272bc5f52526f7527cbc58e720756520b01062525a9` |
| German reference | article `ms-40ee3b85aa3d5fc140edb21eb36c0af8bb1c3a3b` | 1 / 1 | `r-99c4c54f3f347ae377cfb2baed6a11d5e15a655b89e2759e7e8e989d6542900a` |
| German practice | experiment `acceptance-fresh-german-separable-practice-20261026` | 1 / n/a | `r-b700c6185cde28f1f1ca38c5ae98a1cbb18c30b16a88642ee44b5e171decaf83` |

Saved browser destinations are the Minamo-relative `/?view=library&family=article&id=...` and `/?view=tools&family=experiment&id=...`, with exact rendition parameters above. Relative links are normal; the tool receipt does not expose an app origin for an independently shareable absolute URL.

## jq: useful, coherent reference

The value/stream/cardinality mental model comes before syntax. A single inventory fixture progresses from extraction to array collection, filtering, reporting and whole-document updates. It explains why the pad disappears, why report fields are omitted, and why updating retains unrelated fields. The stock-threshold variation exposes a real difference instead of merely changing a constant. The warning about redirecting into the input filename is useful and correct.

Independent local evaluator execution with `/usr/bin/jq` confirmed five commands: separate SKU strings; the collected SKU array; report rows pen=24 and clip=4; count=2; and updated stocks 13/1/5 with warehouse/prices/SKUs retained. This is evaluator-local execution, not Minamo execution or learner progress.

The `jq`, `select`, `map` and `|=` catalogue entries land on substantial explanations at s2–s5. A fresh reference search for exact shell command `jq` resolves `reference-1` to s2. All four primary manual links load; ordinary HTTP verified the exact HTML IDs `basic-filters`, `select`, `assignment` and `invoking-jq`.

Limitations: it assumes jq is already installed and JSON/object basics are familiar. Missing-field/default and argument typing coverage is concise rather than fully worked; it does not demonstrate a schema/type failure or give installation instructions. Those are useful extensions, not a reason to reject this scoped request.

## Referential transparency: substantial improvement with defensible caveats

The substitution test is operationally clear. It progresses from integer square, to output effects, to a changing hidden rate, then an explicit input boundary and rewrite checklist. Repeatable return values are correctly distinguished from preservation of observable behaviour. The object-identity, domain/failure and evaluation-order qualifications prevent misleading universal “pure equals deterministic” advice. The Haskell action-value discussion avoids equating reuse of an action with reuse of a previous input result.

Local evaluator Python execution confirmed square=18; announce produces result=6 and two lines; hidden-rate calls produce 6 and 12. The three catalogue destinations are substantial and relevant.

Primary links were opened and checked: the Haskell 2010 chapter actually explains action sequencing, and Python's lru_cache documentation expressly discusses side effects, changing results and distinct mutable objects. Both are relevant to their stated reading cues.

Limitations: the term's formal boundary remains deliberately language/model dependent. A runnable two-list aliasing example would improve the prose-only mutable-identity warning. The Haskell paragraph is useful optional depth but may be a jump for a Python beginner; it is not a substitute for introductory Haskell material. No false observation or mastery claim occurs.

## German reference and actual practice

The article explains the verb bracket rather than presenting a prefix list. It builds from anrufen to second constituent, question/modal/weil contrasts, a small vocabulary set, inseparable verstehen, and a qualified perfect-tense bridge. The examples and the warning that separability does not choose haben/sein are accurate. The “repair one thing” and time-phrase variation make it usable without another GPT conversation.

Primary links verified:

- DW episode 019 PDF: ordinary HTTP returned 200, application/pdf, 211418 bytes; all four pages were text-read. Pages 1–2 teach separable/inseparable verbs, main-clause versus infinitive examples, and stress. The search tool initially failed to open it; that was tool access friction, not a broken source.
- Goethe A1 chapter 15 PDF: five pages opened. Printed page 4 has regular/irregular separable participles, and printed page 5 has haben/sein, exactly as the resource says.

The linked further reading is relevant but does not directly substantiate the article's weil-clause pattern; an exact primary reading for subordinate-clause placement would improve that part of the reading trail. The current simple formal pattern is correct.

The Activity pins the reference's exact rendition, asks for three clause shapes, provides a two-step hint ladder, and asks for reflection on finite/infinitive placement. The read-only checker was exercised, not inferred from schema:

| Block | Synthetic evaluator input | Observed verdict |
| --- | --- | --- |
| main-clause | Ich rufe Lea heute an. | accepted |
| modal-clause | Ich möchte Lea heute anrufen. | accepted |
| weil-clause | Ich brauche mein Handy, weil ich Lea heute anrufe. | accepted |
| main-clause | Ich anrufe Lea heute. | different |
| modal-clause | Ich möchte Lea heute rufe an. | different |
| weil-clause | Ich brauche mein Handy, weil ich rufe Lea heute an. | different |
| main-clause | Ich rufe Lea heute an | different |
| main-clause | Ich rufe heute Lea an. | different |

Correct and differing answers receive specific explanations of the taught finite-verb/clause pattern. Hint and complete-answer reveals returned `saved:false`. No Attempt, Run or Development was created.

Limitation: this is an exact authored-answer checker, not grammatical judgement. The punctuation omission and alternate time/person order are rejected; the instructions explicitly require a full stop and supplied order, so those results do not violate the exercise contract. The generic “another construction may still be meaningful” hedge accompanies even clear grammar errors. A future wording improvement could distinguish “differs from this task's required form” from a language-level error, while retaining bounded deterministic feedback. The short practice samples the three intended contrasts; it does not establish transfer, pronunciation or learner achievement.

## Diagnostic defects traced to source, no runtime changes

Inspected only the authorised `lib/resource-quality.ts`.

1. **Retained-reading diagnostic context is ambiguous, not a broken current catalogue.** Lines 13–19 iterate and count only `record.concepts`. A four-way hosted comparison found: current read → concepts=4 and destinations=4; current plus catalogueRev=1 → 4/4; explicit retained rendition → concepts absent and destinations=0; explicit retained rendition plus catalogueRev=1 → envelope catalogue contains four references, but the raw retained record still has no concepts and destinations remains 0. Omitting mutable current metadata from an immutable retained record is correct. The problem is presenting zero and no target findings without saying the catalogue was not assessed in that diagnostic basis; even explicit catalogue selection does not currently change that basis. Minimal correction: label the basis and assessment status, or use null/not-assessed instead of zero. Where an exact catalogue edition is explicitly requested, diagnostics may separately assess that eligible edition without copying it into or rewriting the retained canonical record.
2. **Case-sensitive lexical false positives.** Line 17 uses exact `String.includes(entry.term)` against title/part text. “referential transparency” targets “Referential transparency: …”; “purity” targets “Purity and related distinctions”. Both are substantial named explanations but receive `reference_subject_not_named_at_target` advisories because of capitalization. German “separable verbs” targets explanatory singular “A separable verb”, causing a plural/singular lexical advisory despite relevant teaching.
3. **Raw representation counts are not worked-example quality.** Line 11 counts every code/table/diagram/semantic part, including result blocks. The jq “9 workedRepresentations” observation does not mean nine independently explained examples. Its current notice correctly disclaims scoring, and this evaluation did not use that count as a quality gate.
4. **Typed legacy reference blocks are not counted as external links.** Line 8 counts inline HTTPS links only. This is a source-level limitation for eligible typed reference blocks; it does not affect these three manuscripts, which use working inline links.

Suggested correction direction for the parent: distinguish raw retained-reading diagnostics from separately selected catalogue diagnostics, label observations literally, and treat case/morphology findings as weak lexical hints. No implementation change or extra corpus mutation was made during evaluation.

## Receipts and bounds

jq publication/read-operation status is committed; operation `test-fresh-jq-reference-20261026-c425c5-v1`, source digest `5f97164afcfa5a809d3d1f48894cb8690a6cac8f0f42709c5b6ad911e24fbcb5`.

Concept immutable source `acceptance-referential-effects-enrich-20261026-02`: digest `81f54778dcc425b1dbaf2ce909ec7edebbd2845af1e1e66a069d19f3a1b14d43`; source readback says rev 3 still current.

German immutable source `acceptance-fresh-german-separable-20261026-resource-v1`: digest `2dc98dca9212fcb0407c70a26e57d31df15a4f9bee10caaf261a21ed43222e7a`; source readback says rev 1 still current.

This pass verifies canonical content, primary link content, local illustrative code and read-only Activity checking. It does not claim a fresh browser rendering/accessibility pass, a native-speaker qualification, a learner trial, or hosted terminal execution.

