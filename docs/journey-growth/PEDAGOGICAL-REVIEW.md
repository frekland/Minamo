# Independent teaching review

Reviewed on 25 October 2026 by a separate agent that did not author the evaluated material. Scope: the Rust and browser-game packages in `examples/journey-growth/learning-packages.mjs`, all six initial Rust Articles, all four game Articles, both complete starters, the shared prediction/observation Article, the later Unicode expansion, and the goal-first editorial guidance. No genuine learner records were read or changed.

## Assessment

The two collections provide useful starting learning environments with appropriate anticipatory breadth. Rust covers the actual dependencies of the CLI: toolchain, ownership, streaming, rejection policy, retained collections and two levels of testing. The Java comparison is used to explain a difference rather than imply equivalence with Rust borrowing. The novice collection explains state, grid rules, input events and inspection before optional inventory work. Neither set repeats Journey stages as Articles or makes the reference shelf a compulsory course.

The Journeys embed complete source from the starter files and name concrete files, commands or opening steps, predicted behavior, a controlled first modification and where to retain evidence. The learner does not need repository JSON to begin. Both distinguish predictions from execution and keep the IDE, shell or browser as the execution environment. Short Notes remain enough; progress recording is optional.

The Articles stand alone: examples state whether they are complete programs or fragments, and explain mechanisms and failure boundaries. Particularly useful distinctions include borrowed views versus owned retained keys, parsing versus input errors, stream processing versus total memory bounds, counts versus display order, collision versus reachability, and event/rule checks versus visible rendering. The later Unicode Article addresses a credible new need without replacing the earlier task: bytes, scalar values and graphemes are distinguished, its example remains uncompiled, and it reuses exact existing project/reading references.

## Challenge findings and disposition

| Finding | Why it mattered | Disposition |
|---|---|---|
| The complete Rust starter declares edition 2024 without an explicit minimum version in the original startup prose. | A learner can have working `rustc`/Cargo commands yet an older incompatible toolchain. | Author corrected both the toolchain Article and Journey to require Rust/Cargo 1.85 or later, with the official edition-guide reference. Verified in the revised source. |
| The error-policy Article originally discussed partial stdout after an input failure without distinguishing this starter's aggregate-output design. | This could imply the exact starter already emits counts during input processing. | Author clarified that aggregate stdout appears only after the input loop completes; earlier rejection diagnostics can exist. General streaming-output caution remains separately qualified. Verified in revised source. |
| The novice Journey said “Reset and try Up from 2,3” without explaining how to return to 2,3. | Reset actually returns to 1,3; literal Reset→Up succeeds, contradicting the intended wall experiment. | Author corrected the explicit sequence to Reset→Right→Up, with the predicted unchanged position 2,3. Verified in revised source. |

No additional material factual or sequencing defect was found in the reviewed text. This is a bounded content assessment, not proof that every future GPT-authored package will meet the same standard. The editorial contract correctly treats structural checks as repair signals rather than certification of teaching quality.

## Independent evidence and limits

- Checked the official [Rust 2024 guide](https://doc.rust-lang.org/edition-guide/rust-2024/index.html) live: edition 2024 first became available in Rust 1.85.0. Checked the official [BufRead reference](https://doc.rust-lang.org/std/io/trait.BufRead.html) for the documented newline/CRLF and error semantics. Context7 inspection of the Rust source supplied additional primary-source corroboration.
- Executed the exact game's module independently in a Node VM with synthetic DOM/event stubs. Initial position, Right→blocked Up, Reset, both taught routes to the star, and keyboard movement matched the examples. This establishes the checked rules/event paths under that harness; it is not browser rendering, physical touch or screen-reader validation.
- `rustc` and `cargo` are absent in this environment. The reviewed Rust source and expected fixture counts are inspectable, but Rust compilation/execution remain unverified. No substitute-language run is counted as Rust evidence.
- Independently ran `node --test tests/journey-growth-authoring.test.mjs`. Initial publication, exact reuse, complete code fidelity and later extension passed. The first run exposed a real targeted-replacement replay defect: old-revision compilation preceded recovery of the already committed immutable request. The author corrected recovery before compilation; the independent rerun passed all six applicable assertions/tests, with one explicit Rust-toolchain skip. This is compiled local MCP/D1 evidence, not refreshed installed-client or production evidence.
- Publication, exact linked navigation and browser persistence belong to the separate engineering acceptance evidence. This review does not claim observed human comprehension, measured learning gains or successful use on the owner's Android device.

The remaining choices are reasonable scope boundaries: the Rust CLI intentionally lacks strict mode, file arguments and production-volume handling; the novice game intentionally lacks inventory, artwork, persistence and generated levels. The prepared Articles still support the next questions without requiring these features immediately.
