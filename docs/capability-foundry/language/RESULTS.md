# Language capability packet — measured implementation

Working source: `research/foundry-execution-20261025`, based on native checkpoint `cf3ea9f7ccca2267b6f95f11f8a86bf56e1ca19f` (GitHub baseline main `c40ebcc9a27bd2538ecf5b117a3eeba7f1229d1c`). The banked PR's final commit supplies the immutable implementation ref; file hashes in `SOURCE-MANIFEST.json` identify the tested packet. Nothing merged, deployed, installed into production MCP or written to genuine learner records.

## Completed capability matrix

| Capability | State | Actual evidence |
| --- | --- | --- |
| F01 curated compound ruby, strict Unicode offsets, correction, glossary, reading metadata search | INTEGRATED_DORMANT | Strict pure library, lazy shared-registry adapter, actual current Reader display hook in root packet; 16 unit tests; synthetic D1 integration |
| F22 pinyin, Arabic RTL/bidi isolation, parallel translation, vertical CJK | RUNNABLE_STANDALONE / INTEGRATED_DORMANT adapter | Original fixtures and interactive lab; strict parallel-range contract; registry canonical equality and fallback |
| F09 deliberate local-voice speech | RUNNABLE_STANDALONE | Injectable lifecycle controller tested; browser UI enumerates reported-local voices; actual usable voice/physical-device/offline speech remains unverified |
| F18 optional recall and TSV export | RUNNABLE_STANDALONE | Strict session transition tests; explicit reveal/next/stop UI; no scores, schedules, writes or mastery |
| F17 tokenizer proposal importer | RUNNABLE_STANDALONE | Bounded full-source exact-concatenation import; actual Kuromoji Node experiment on six synthetic cases; every result remains a machine proposal |
| Full semantic ruby fields in canonical PassagePart/manuscript/public MCP schema | RESEARCHED | Not silently added. Existing Note Markdown safely stores explicit declaration; no claim installed MCP has a native ruby field |

## Source and APIs

- `lib/foundry/language.ts`: `admitLanguageText`, `languageSegments`, `languageQuote`, `bindLanguageText`, explicit insertion/correction, source/fence codecs, labelled source/reading/gloss search, parallel admission, session recall, formula-safe TSV.
- `lib/foundry/language-dom.ts`: `languageBaseText`, `languageDomPoint`, `languageDomRange`, `languageDomSelection`; capture **and** restore omit `rt`, `rp`, decoration controls, verify canonical text and reject surrogate splits/decoration endpoints.
- `lib/foundry/language-platform.ts`: `languageTextAdapter`, `parallelLanguageAdapter`, `languageTextArtefact`, `parallelLanguageArtefact`; registry kinds `language/ruby-v1`, `language/parallel-v1`; strict canonical JSON equality; lazy React mounting and disposal.
- `app/foundry-language-demo.tsx`: `FoundryAnnotatedText` with `renderBase(start,end,text)` for existing Reader marked ranges, plus the complete `FoundryLanguageDemo`.
- `app/foundry-language-renderer.tsx`: lazy registry mounts; optional controls outside original passage; original-text copy; React unmount cleanup.
- `language-speech.ts`, `language-tokenizer.ts`, `language-fixtures.ts`, `language-probes.ts` complete the independent packet.

The registry's source-rights authority is independent of schema admission. `bindLanguageText(...eligible)` is a compatibility assertion supplied **after** the existing owner/generation/retained-source read. A client boolean is never a server permission grant. Revocation at admission, before/after lazy loading, and during active instance revalidation belongs to the shared registry. Authored original fixtures need no imported-source grant; dictionary or external text assets still require their own admission.

## Verification actually run

`node --test tests/foundry-language.test.mjs tests/foundry-language-domain.test.mjs tests/foundry-language-platform.test.mjs`

28 tests pass: 16 pure/unit, 7 reported tests from the six-subtest D1 integration parent, and 5 registry adapter tests. The D1 suite runs real Miniflare D1 migrations and current domain HTTP/MCP handlers with an explicitly synthetic test principal. It checks exact Article base text; Note source/ProseMirror roundtrip; Flag and Annotation original quotations; typed MCP readback; original retained edition after a current edit; real stale-revision rejection; another-owner isolation and Trash denial. In-memory D1/R2 dispose at test completion. This is not authenticated hosted acceptance.

Root browser QA executed the **nine actual DOM Range probes** and reported 9/9 passing in cloud Chromium. Probes check real native ruby differs from base source, nested marks, whole-element endpoints, partial compounds, rejection of endpoints in `rt`, supplementary/combining preservation, surrogate split rejection, excluded controls, and stale DOM rejection. Root's evidence supplies viewport and screenshots; physical Pixel, TalkBack, NVDA, Firefox, real clipboard paste and installed MCP release are not claimed.

Typecheck integration initially caught `ZodEffects<unknown,...>` versus `Adapter<T>` schema input invariance across all SDK adapters; root owns the shared typing correction. Language-only files passed once browser DOM `append` overload conflicts with Cloudflare types were changed to `appendChild`.

## Real tokenizer experiment and decision

Reproduce from repository root:

```sh
npm install --prefix /tmp/minamo-kuromoji-lab --ignore-scripts --no-save --package-lock=false kuromoji@0.1.2
node docs/capability-foundry/language/tokenizer-experiment.mjs /tmp/minamo-kuromoji-lab/node_modules
```

No package install occurs in the experiment script. It loads the disposable pinned package, hashes every compressed dictionary file, builds its real tokenizer and executes original synthetic strings. Frozen result: `kuromoji-evidence.json`. Version 0.1.2, package registry integrity `sha512-V0dUf+C2LpcPEXhoHLMAop/bOht16Dyr+mDiIE39yX3vqau7p80De/koFqpiTcL1zzdZlc3xuHZ8u5gjYRfFaQ==`; registry unpacked size **41,263,301 bytes**; 12 compressed dictionaries total **17,791,956 bytes**; dictionary manifest digest `e0165fd42619fddc2ab99c658db3a97578288ee209e97648254857bc38ac74d2`.

On Node **v24.22.1**, initialization took **402.6 ms**. Process RSS before/after initialization was **60,928,000 / 408,784,896 bytes**; observed heapUsed **9,580,904 / 89,861,968 bytes**. These are one Node-process before/after samples, **not** browser heap, peak memory, network transfer time or mobile latency. Token calls took approximately 0.18–1.66 ms in that run.

All six source strings imported without dropped/normalized characters. Actual examples expose the tradeoff: `生` proposed `ナマ` in one context; `小鳥遊` split into `小鳥` and an unknown `遊`; mixed emoji/combining data makes a blind `word_position` to UTF-16 conversion unsafe. The importer ignores those positional claims and derives offsets only when the complete emitted surface sequence equals the original text. No output is an expert linguistic oracle. Correction is explicit and immutable.

**Decision: curated ruby GO; shipping the tokenizer/dictionary in the default browser bundle DEFER.** The 17.8 MB compressed asset set, Node RSS increase, old dependency surface, attribution obligations and unknown Android behavior outweigh making every reading automatic. The exact proposal importer and measured experiment remain reusable if future demand justifies a separate cancellable worker and audited offline asset manifest. No Kuromoji code or dictionary is redistributed in this repository.

## Primary-source decisions and corpus licensing

Retrieved through Firecrawl on 25 October 2026; links are source evidence, not licences to reproduce arbitrary examples.

| Primary source | Finding and decision |
| --- | --- |
| [W3C ruby introduction](https://www.w3.org/International/questions/qa-ruby.en.html), [MDN ruby](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ruby) | Native compound ruby is suitable progressive typography; copy/capture requires explicit original-text mapping. Curated readings and metadata stay separate. |
| [Kuromoji package](https://raw.githubusercontent.com/takuyaa/kuromoji.js/master/package.json), [tokenizer source](https://raw.githubusercontent.com/takuyaa/kuromoji.js/master/src/Tokenizer.js), [NOTICE](https://raw.githubusercontent.com/takuyaa/kuromoji.js/master/NOTICE.md) | Package Apache-2.0; included MeCab IPADIC has separate NAIST/ICOT notices. Preserve required notices if ever redistributing. Exact package runtime executed, no asset copied into product. |
| [Speech utterance API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance) | Voice availability varies. No speech on load, no microphone, no recognition/scoring. Only voices reported `localService` offered by default; reported locality does not certify platform behavior. |
| [EDRDG dictionary licence](https://www.edrdg.org/edrdg/licence.html) | Japanese/English JMdict components have CC BY-SA 4.0 and specific source/acknowledgement requirements; other-language translations can have separate ownership. Do not collapse all components into a universal permissive corpus. No corpus downloaded. |
| [KanjiVG](https://kanjivg.tagaini.net/) | Stroke/component diagrams available under CC BY-SA 3.0. Future bounded typed path renderer should retain attribution and licence, never execute imported arbitrary SVG. No source artwork redistributed. |
| [Tatoeba terms](https://en.tatoeba.org/terms_of_use) | Sentence text default CC BY 2.0 FR with attribution; audio can have differing licences or redistribution restrictions. Translation/audio accuracy is not professionally guaranteed. Future imports need per-item source/author/licence and independent media rights. No corpus downloaded. |

No new production dependencies, fonts or redistributed external content. Existing React/ReactDOM/zod and browser standards are used. The original fixtures are deliberately small, illustrative and authored for this lab. No automatic dictionary correctness, pitch accent, official JLPT classifications or learner benefit is asserted.

## Remaining gates and rollback

All UI remains developer/lab-only and optional. Root Reader hook should map each original base span independently, leave ruby/rt/rp wrappers unmapped, and intercept copy; a mapped parent containing `rt` breaks existing textContent-based capture. Keep the hook absent by default. Native source/Note draft/revision rights stay existing authority. Remove optional registry registrations and the lab route/imports to disable; existing canonical records retain ordinary base text or explicit code declarations.

Native semantic domain schema, production source-revocation across imported article overlays, real assistive technology and physical Android acceptance remain owner-review gates. A Light task can activate a bounded **read-only explicit-source viewer** from this bank without inventing those larger changes. It must not silently turn the candidate fence into a public installed MCP format or infer auto-save from reveal/speech/recall.
