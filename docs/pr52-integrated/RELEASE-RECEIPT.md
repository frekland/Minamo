# PR52 integrated learning release — 26 October 2026

Owner-requested full-app UX and search corrections follow this baseline in the [UX/search release receipt](../ux-search-20261026/RELEASE-RECEIPT.md). That follow-on preserves the complete commission and records its own source/deployment and hosted acceptance receipt.

The complete A–N implementation is running in the existing owner-private Minamo. Runtime acceptance concluded on **V34**, after correcting defects found in authenticated V32/V33 use. This is an implemented, merged and deployed release. The final documentation save carries the same qualified runtime; its exact native/GitHub identities, common tree and saved-version/deployment identifiers are appended to the [implementation release thread](https://github.com/frekland/minamo-v2/pull/55) after publication. That external completion receipt avoids putting a document's own future commit hash inside itself.

Production: <https://minamo.jscymru.chatgpt.site/>. Project `appgprj_6ad8a4e85eb48191accd6e78976b47e3`; owner-only access revision1, environment revision5, no external visitors. No access, paid-plan or service provisioning expansion occurred.

All43 acceptance scenarios are accounted for in [ACCEPTANCE-MATRIX.md](ACCEPTANCE-MATRIX.md). Evidence distinguishes actual installed MCP, authenticated browser, actual isolated Worker/D1/R2, local execution and unperformed physical-device tests. Optional gates below remain explicit; screenshots and schema admission are not claimed as screen-reader, native-speaker or microphone certification.

## Source and deployment chain

| Release | Native source | GitHub source / merge | Common tree |
| --- | --- | --- | --- |
| Starting V31 | `8beffe7182c5d98035b6c47536d0f811a8a759fb` | main `408e6c869a81915777d40e30104977168494f46b` | `a92ca2976469228d42836208c17fa039285c5d92` |
| Integrated V32, PR53 | `9af383d574e5c29f8b395f9b6e9fe598098fc018` | `b7b31a01c0aeee367f1d4a910fb1150a79259ffe` / `dc90679bad1a2fb400543a91e145754344bbda51` | `c44bd71893c56be46d5edc1e34800d675d24eed1` |
| Corrected V33, PR54 | `4841b3cf2231055db17d769d91c3849101511f52` | `2ddd4a883f0e98b920ecc0b9553d1829443fc911` / `9f2254f61b5c6b30b111d991ad62ffa525a85df9` | `1f0fe67a9b1388b4fe09592efc455bdb79c78940` |
| Qualified runtime V34, PR55 | `466b6956bc039f202b66cc9be39ac23dfdc7b997` | `b7f32f2937839066da7f9ea90f4dd31ddd8aa57c` / `b2689f97878be38a49e5b4808c64d3e973634da3` | `34d4c1b06f4b266b6c88cdc2ef3a5c485aae39b2` |

V34 saved version is `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_e5297b0041e081918540cf356e590ef5`; deployment `appgdep_6adf7add973c8191a69ab25a451ef608` succeeded with MCP and environment revision5. V32 deployment was `appgdep_6adf64114be08191ae5cc03d2e021d12`; V33 was `appgdep_6adf767cb7508191ab0d0c4234b7c8d5`. Deployments were continued to terminal state, never raced against competing saves.

Native and GitHub histories are distinct. Each transfer verified every blob SHA and the exact common tree, then used expected-head branch updates and ordinary guarded PR merges. [PR53](https://github.com/frekland/minamo-v2/pull/53), [PR54](https://github.com/frekland/minamo-v2/pull/54) and [PR55](https://github.com/frekland/minamo-v2/pull/55) implement this commission. PR52 remains open/draft at reviewed head `8f4335773f5ce2d7e82658b38a05cc5daa76fafe`; PR48/49 retain their research roles; PR51 remains open, staged and unmerged.

## Delivered product

| Workstreams | Delivered ordinary-product behavior |
| --- | --- |
| A/B — practice and languages | Exact-source choice, cloze, ordering, matching, transformation, open response and dictation; composition-aware original inputs, authored alternatives, separately revealed answers, deliberate saved Attempts and immutable answer revisions. Substantive compositions cover Japanese, Mandarin, French, Spanish, Modern Greek, German and Swedish. |
| C — Reader and corpus | Individual word/compound context, contextual readings, separate lexical lemma/sense/script identities, overlapping phrases, independently authored translation alignment, exact eligible corpus occurrences, reading recall and TSV exchange. Source text remains normally selectable and copyable. |
| D — listening and speaking | Private native audio with exact revision/digest/transcript/segment binding; deliberate segment play, loop, speed, transcript concealment, typed dictation, explicit reveal/comparison and saved interaction facts. Optional local recording preview/discard, bounded PCM conversion, download and deliberate attachment/save; optional local voice comparison with honest fallback. |
| E — continuity and review | Selected GPT review handoff and return, exact answer targeting, provisional feedback, editable/disputed/withdrawn corrections, descendant suspension/reconciliation, optional deterministic `minamo-spacing-v1` review, undo and retained chronology. No automatic proficiency estimate or Development. |
| F/G — characters and scenarios | Attributed bounded Japanese KanjiVG/kana and separate Mandarin numeric-path data; stroke replay, tracing, recall and keyboard/text alternatives. Reusable branching clarification dialogue and fixed-viewpoint spatial scenarios, exact-edition replay and deliberate saved traces. |
| H/I — Atlas and Computing | Focused Atlas, collapsed/grouped overviews, URL lens/kind/relation/expansion state, keyboard selection and equivalent source cards. Lazy scratch editing preserves starter files, shows changed visible tests, exports exact ZIPs and saves source-bound submissions. Three finite source-hash-bound shell/TCP/counterexample explanations and honest local/GitHub continuation. |
| J/K — authoring and exemplars | Shared finite schemas, useful installed discovery/examples, compact publish/read/revision/retry recipes, exact source/cue compiler and contextual diagnostics. Seven permanent original language source/practice pairs plus three original Computing Activities were published through installed MCP and read back exactly. |
| L/M/N — infrastructure, UI and quality | Existing owner/generation/CAS/idempotency/Trash/recovery authority; source/media commit guards; exact retained editions; compact shared header, ordinary prose, nonoverlapping TOC and useful rich-content width. Reusable role-aware GPT authoring standard and13 permanent canonical reference improvements. |

See [IMPLEMENTATION.md](IMPLEMENTATION.md), [published language ledger](PUBLISHED-EXEMPLARS.json), [Computing ledger](PUBLISHED-COMPUTING.json), [Reader evidence](READER-LANGUAGE-IMPLEMENTATION.md) and [audio evidence](LIVE-AUDIO.md). The17 permanent exemplars are separate from disposable trials. No PR51 content was used to populate production.

## Final verification

| Surface | Actual result |
| --- | --- |
| Exact final runtime suite | 191 test files; **1,133 tests,1,129 passed,0 failed,4 skipped**,274.4 seconds; terminal command exit0 and complete summary recorded. |
| Typecheck | `tsc --noEmit` passed on the final runtime source. |
| Production build | Complete five-stage production build passed; science excluded. Incomplete redirected logs were not accepted as proof; the terminal build's completion marker and exit status were verified. |
| Compiled/local integration | Actual compiled Worker, D1/R2, owner/generation/source/media races, immutable histories, malformed events, export rights, archive integrity and recovery tests are included. The final compiled-Worker challenge also passed17/17 on the corrected release. |
| Installed MCP continuity | **25/25** checks passed, including corrected live Bandit Phase I isolation, exact-stage retrieval, deferred answer identity, correction descendants, requested synthetic checkpoint and independent fresh feedback return. |
| Installed publication | All seven language compositions and three Computing exemplars read back exactly. Accepted alternatives and meaningful errors, answer withholding/reveals, character/scenario persistence and malformed interaction rejection were exercised. |
| Authenticated production | Reader/corpus, keyboard ordering, matching, German answer revisions, character replay/mouse trace/recall, dialogue/spatial branches, both human-recording dictations, native attachments, Notes/scope/layout/resize, reference preview/read/reload, Atlas filters/history/cards, exact ZIP export and finite trace boundaries passed. |
| Preservation/recovery | All296 baseline identities retained, all13 current permanent reference targets match the ledger,17 permanent new exemplars preserved,22 exact task-owned records recoverably Trashed and one synthetic Development withdrawn. Both final protected archives verified media bytes. |

The four explicit skips are the optional science controller PNG/table execution, deceptive-raster execution, isolated infinite-loop worker execution, and Rust starter compilation because Rust/Cargo is unavailable. They are not reported as passed. The optional science/untrusted lanes remain gated. GitHub Actions green status was not a release gate, no unexecuted job is described as green, and the suspected credit issue was not presented as a verified cause. No credits, API packages, subscriptions, licences or billed services were purchased.

## Matched desktop UI evidence

The owner-requested before/after screenshots use the same1363×936 CSS-pixel browser viewport, Computing scope, minimized bottom Notes, Classic/Focus modes and the same TCP Article's exact original reading. The final view explicitly shows its retained-edition notice below the title. Final geometry was measured after Top returned the reading pane to scrollTop0; an earlier intermediate Classic measurement before that reset is not used in this comparison.

| Measurement | V31 before | V34 after |
| --- | --- | --- |
| Main header plus separate Learning Space band | 90+110.03125px | 71px total; no separate band |
| Focus reading-header top | 454px | 315px |
| Classic reading-header top | 566.03125px | 364px |
| Focus code/rich-content width | 740px | 1,260px |
| Classic code/rich-content width | 740px | 1,056.3125px |
| Ordinary prose measure | 740px | 740px |
| Ordinary prose tab-selection tiles / persistent passage picker | Reported present | Zero ordinary prose tab stops; picker absent |

This reclaims129px of top chrome and gives rich material42.7% more Classic width and70.3% more Focus width without widening prose. The previous215px in-article TOC rail is replaced by coherent reserved navigation; the global Classic sidebar remains. Lower-section geometry was inside the unobstructed pane (y186.59–407.66, pane starts71); navigation computes to normal static flow. Real control focus remains visible. Native Mandarin selection copied exactly你好, and explicit Flag/Annotate saved the exact retained UTF-16 range0:2. Japanese decorated word help and exact corpus return were separately exercised.

Actual isolated narrow-document reflow at390×844 had scrollWidth390, reachable controls and no persistent passage picker. This is browser viewport emulation, not a physical phone. Notes text remained identical across layout/scope changes, keyboard resize430→450→430 and right/bottom docking; only the task-owned local tab was closed.

## Permanent reference improvement and future GPT quality

The full affected13-reference corpus was reviewed and substantially enriched in place: Git working tree/index/refs; streams/pipelines/failure evidence; TLS/certificates; Bash expansions/conditions/loops; cron/environment; search/filtering; SSH/trust; shell arguments/pathnames; privilege boundaries; TCP/socket evidence; Unicode/text; permissions/traversal; and formats/archives. Final revisions are2 except streams, privilege and permissions at3. [The exact ledger](LIBRARY-REVISION-LEDGER.json) records every identity, revision, rendition, catalogue head, retained-edition comparison, scope and membership check. Old learner anchors remain on their original editions.

The new ss entry lands on substantive socket-observation section s4; nc lands on implementation-specific stream/EOF section s5. An unrelated duplicate nc entry was removed from TLS. This is a general catalogue/destination mechanism, also exercised through normal jq search→Preview→exact s2 explanation→reload. The independent reference challenge corrected pipe/redirection construction wording and checked harmless command predictions against primary documentation and local observations. Genuine Bandit answers, credentials and level solutions were not added.

The reusable standard is installed in actual discovery/publishing descriptions, current editorial policy, publishing/revision recipes, contextual validation and exact readback. It asks for a usable mental model, explained original examples, interpretation, alternatives/failure cases, relevant primary further reading and substantial named destinations. It differentiates canonical references, route tasks and source-bound Activities while preserving concise personal Notes and exact supplied evidence. Diagnostics are advisory observations, not a length quota or automatic teaching certification. Retained reads now report catalogue assessment as unselected/null, or assess an explicitly selected exact catalogue separately without mutating the canonical reading.

Three separate producers received ordinary requests, no PR, prefilled identifiers, repository instructions, quality checklist or hidden repair script:

| Ordinary request | Actual outcome and independent assessment |
| --- | --- |
| Create a useful jq filters resource | Published an original value-stream/cardinality progression, explained report/update examples, failure distinctions and primary manual links; exact jq/select/map/update destinations. Five commands independently reproduced their predicted results. |
| Improve the existing referential-transparency/effects reference | Discovered the thin synthetic canonical resource and enriched that same identity to revision3. Substitution, output effects, changing hidden inputs and caveats became independently useful; three Python cases and primary further reading were checked. |
| Create German separable-verbs material and short practice | Explained the verb bracket and contrasted main/modal/weil clauses, with relevant primary readings and exact source-bound practice. Three intended answers accepted and three meaningful errors differed; the browser retained wrong and corrected answer revisions. |

[FRESH-AUTHORING-TRIALS.md](FRESH-AUTHORING-TRIALS.md) preserves prompts, methods, exact receipts and candid limitations. Lexical advisory false positives and strict finite matching remain transparent. Some useful further-reading extensions are identified. This demonstrates generalisation across the requested portfolio, not a guarantee about every future model response. The disposable outputs are recoverable in Trash; the installed infrastructure and17 permanent exemplars remain active.

## Conversation-first and end-to-end learning

A Japanese conversation began without an Activity. Its selected save retained水をください。, provisional alternativeお水をください。, the fact that the original may already be appropriate, contextual uncertainty and a café intention. A separate fresh context found that standalone Note by natural name and resumed honestly; native Notes displayed it without imposing a quiz/checkpoint. A separately requested synthetic checkpoint used the supported Development path, then was withdrawn during cleanup.

In the Requests-stage practice, answer1 was saved, selected for deferred review, and revised to answer2 before feedback returned. Returned feedback stayed on answer1. An independent fresh GPT later discovered the latest pending review by natural task name and saved provisional feedback on answer2/revision2, preserving the original arrays and withdrawn correction at Attempt revision11. No native-speaker verification or learner achievement was invented. Correction retain/dispute/revise/reconcile/review/undo/withdrawal left descendants honestly stale or suspended and retained history intact.

Japanese browser practice traversed word/phrase help and exact corpus return, meaningful ordering errors/acceptance, clarification dialogue and character replay/trace/recall. Mandarin exercised a separate script/character lane, matching and fixed-viewpoint object movement, then actual licensed human-reference audio and exact dictation. Both real native audio players loaded the exact attached bytes, looped at selected speed, stopped deliberately, concealed/revealed transcripts and saved synthetic interaction facts through the ordinary UI; independent installed-MCP reads confirmed the exact editions and inputs.

Computing preserved original starter files, isolated reversible scratch edits, compared exact files and exported a ZIP whose three source hashes were independently decoded and verified. The finite TCP trace stopped at its fifth authored event. Separate connector readback and real local red→green execution used immutable commits `ce1a297b14ab78e1ce1f8e76941dd22519fc432a` and `d51a4661fa99135b6cba805557138d90ca94b436`: the starter failed three of five discriminating Python tests and the submission passed five. Minamo correctly labels relayed evidence supplied-unverified and not-executed-by-Minamo.

## Defects found and corrected

The commission corrected valid learningScope metadata being rejected during archive verification; source/audio revocation races at Attempt commit; derived feedback leaking through a portable export after rights withdrawal; valid-looking rewrites of immutable histories; accidental pruning of whole-project child discovery; generic Phase I expansion into sibling phases; old visible ink surviving unassisted recall; inherited margins and Focus width rules defeating the compact layout; misleading zero-destination retained diagnostics; the staged-audio authoring-preview crash; and required-introduction friction during section-only edits. Every material correction received targeted verification and the final runtime suite. Earlier failures remain in receipts with their successful retests rather than being erased.

## Preservation, cleanup and recovery

Original protected archive `archive-48273ea01da1f2c43f9ab26d4e61b73e98e23b8c662bcc1b` now verifies valid after the whitelist correction. The before-cleanup checkpoint `archive-1fa41d46bc5dbb15fc4df912824c3b9c1753a794e26e4798` verified335 records,800 revisions,52 manuscript editions and both audio originals. Final post-cleanup archive **`archive-35421d9612b5d4d68d377e6f151bc2b43636ec9e22c744a4`** verified335 records,824 revisions,865 operation receipts,52 manuscript editions,57 Developments with121 history rows, three images and two media assets; encrypted archive size11,228,008bytes.

All296 baseline identities remain.285 metadata rows are unchanged; the other11 changes match the authorised Library ledger. TCP/SSH's first two authorised revisions were already present when that metadata inventory was captured and are separately accounted for; all13 final targets and retained originals match. The17 permanent new exemplars remain. Exactly22 task-owned records were recoverably Trashed, one synthetic Development withdrawn and the task-owned passage bookmark deactivated. A computing Attempt was Trashed, restored and re-Trashed with unchanged exact source/submission identity. All22 current normal reads are denied; authenticated byte and metadata routes for both trashed-source audio files return media_unavailable. Original bytes remain recoverable, not purged. No unrelated earlier synthetic study was cleaned.

Actual isolated post-write restore covered every enabled new nested durable shape, retained chronology, source/media rights and a representative5.76MB recording. Feature-disable/re-enable retained exact work. The oldest tested compatible rollback is this implementation with `MINAMO_ACTIVITY_STUDIO=0`; arbitrary older executables are not certified to understand new schemas. No protected snapshot was activated over production, and no genuine data was reset. [LIVE-CLEANUP.json](LIVE-CLEANUP.json), [LIVE-PRESERVATION.json](LIVE-PRESERVATION.json) and [COMPILER-AND-RECOVERY.md](COMPILER-AND-RECOVERY.md) provide exact receipts.

## Precise limits and gates

- Optional canvas stays gated: the supplied licence alone does not qualify private owned-shape persistence, privacy, recovery and teardown. The structured Atlas is delivered independently.
- Dependency-bearing imported code preview stays gated pending separate-origin authority/network/storage/message/runaway qualification. Source inspection, editing, exact ZIP/local/GitHub continuation work independently; imported code remains inert in Minamo.
- Independently authenticated Worker/provider GitHub transport is not attested by GPT-relayed metadata. Reports remain supplied-unverified; commits and passing tests do not imply understanding or an observed learning Run.
- The available browser has no microphone device and no eligible local synthesis voice. Both fallback paths worked. Real capture/voice, physical IME, stylus, assistive-technology and native-speaker assessment remain device/expert gates. Human greeting recordings qualify meaningful short-phrase listening mechanics, not long-speech or pronunciation certification.
- Character data is a small attributed extensible subset, not an exhaustive dictionary or etymology authority. Finite authored answer rules are not general grammar judgement. Optional review is `minamo-spacing-v1`, not FSRS.
- Performance evidence includes actual built/gzip assets, bounded10,000-record local Atlas work and a5,131ms warm-cache orchestration-inclusive document-to-character-controls observation. It is not cold-cache FCP, heap profiling or a physical-device latency promise. Optional packages remain lazy/deliberate and finite.

PR51's complete24-unit/325-cue pack was converted only in isolation at head `f8cb60dc1466e514df77cc2087e6c704a4a150e2`:291 cues resolved and34 repeated-expression requests returned actionable contextual candidates. N5-09/N4-11 and the full pack were not published, merged or advanced through waves. No linguistic/exam/audio certification is claimed from compilation.
