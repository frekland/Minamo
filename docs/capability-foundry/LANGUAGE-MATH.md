# Japanese language learning and mathematical literacy — design and acceptance research

**Research only — no lesson content or learner records are created in production.** These are horizontal publishing/reading capabilities for Articles, Journeys, Investigations, Notes and GPT rather than two one-off apps.

## 1. Japanese with authentic furigana

### Minimal real example

Base/canonical sentence: **今日は日本語を勉強します。**

Human-authored reading segments:
- 今日 -> きょう, canonical UTF-16 range [0,2).
- 日本語 -> にほんご, range [3,6).
- 勉強 -> べんきょう, range [7,9).
- The remaining は, を, します。 are unchanged native base characters.
- Translation of the complete illustrative sentence: “I study Japanese today.” (The topic and temporal nuances depend on context; this sentence is *not* the basis of proficiency assessment.)

Candidate payload attached to a paragraph's exact base text, not stored as extra rendering HTML:

~~~json
{
  "kind": "paragraph",
  "text": "今日は日本語を勉強します。",
  "language": "ja",
  "ruby": [
    {"start": 0, "end": 2, "base": "今日", "reading": "きょう", "origin": "author-verified"},
    {"start": 3, "end": 6, "base": "日本語", "reading": "にほんご", "origin": "author-verified"},
    {"start": 7, "end": 9, "base": "勉強", "reading": "べんきょう", "origin": "author-verified"}
  ]
}
~~~

This exact shape is a candidate and needs a validation/round-trip prototype; it is not an existing Minamo PassagePart or public MCP command. Carefully check offsets against code units and code points for all real fixtures. It is better to store base text once and verify spans than persist a second HTML string that can disagree.

### UX acceptance

- Rubies displayed above word or compound bases using native ruby/rt/rp. Full reading visibility, hidden, and “reveal as needed” presentation modes; the mode is a **preference**, not a learning milestone. Tap/keyboard reveal must not destroy copied/base quotation text or scroll position.
- Authentic Japanese typography on 390px; text wraps without clipped ruby or offscreen horizontal scroll; 200% browser zoom/large font; contrast and optional vertical layout tested in browser.
- Selection across ruby, kana and punctuation yields the exact base sentence with the same canonical UTF-16 coordinates. Flags, Annotations, sharing/clipboard, passage-return links, retained history and search all cite original characters; reading annotations never silently join quotes.
- One word can open a **learner glossary card**: original form, authored reading, gloss/meaning, sense/context explanation, optional grammar link, provenance and corrections. Dictionary suggestions may be imperfect; uncertain readings are presented as suggestions and require deliberate acceptance.
- Japanese audio: deliberate play, stop, slower replay and native voice availability check. SpeechSynthesisUtterance with lang=ja-JP is a **best-effort browser voice**, not guaranteed human pronunciation, pitch accent or offline availability. No synthesis on page load; never infer speech proficiency from clicking.
- Source-attested external audio with licensing and timestamped human-authored segment map is a separate later capability; audio bytes remain private under current media rights.
- Test language metadata per span/section so correct Japanese fonts, line breaking and assistive speech voice can be used.
- No forced romaji or English gloss: learner preference, not a permanent alteration to source content. English glosses and romanisation are independent authored annotations.
- Japanese has multiple possible readings for identical kanji; context (names, compounds, conjugations) makes unsupervised reading assignment unsuitable as authoritative teaching material.

### Authoring and editorial workflow

- First-class explicit **Insert reading annotation** in selected rich text, with base selection shown immutable while editing reading. Authors choose hiragana, katakana or validated explanatory annotation. No raw HTML accepted from GPT to avoid escaping/security conflicts.
- For manuscript bulk authoring, investigate a typed mini-JSON stanza or well-defined inline syntax only when faithful round-trip to structured ranges is proven. Existing markdown-v1 Notes and code fences must remain exactly editable.
- Allow a protected imported text passage with authored reading *on permitted source text only*: current source permission and revocation must gate retained/excerpt display. Creating a new reading overlay is not an implicit right to reproduce third-party text.
- Include official reference, author/correction identity and uncertainty in generated suggestions. For shared/reused Library material, avoid duplicate vocab entries by exact scoped references; no global “learned word” state without user intent.
- Later: JLPT-associated vocabulary references should not be falsely represented as official JLPT rankings without a verified licenced source.

### Auto-assist exploration: separate trust layer

Potential offline candidate: Kuroshiro with Kuromoji tokenizer/dictionary; both have browser-oriented APIs. Research package/plugin versions, dictionary redistribution and size before use, test compounds, proper names and unknown words; do not fetch a remote inference service automatically. Kuroshiro's own documentation warns that straightforward kana->romaji conversion cannot capture all pronunciation distinctions. Alternative curated-annotation-only mode is valid if performance/rights are poor.

**Test tricky Japanese cases** with teacher-checked expectations: 今日 / 明日 / 一日, 生, 行く / 行った, は as particle, long vowels, small っ, names, mixed katakana/Latin, emoji, combining dakuten, punctuation and compound-level ruby. Do not hard-code an automatic reading oracle from guessed regexes.

### Generalisation beyond Japanese

The same base-text + annotation model can represent Mandarin pinyin or zhuyin ruby, Korean lexical notes and phonetic IPA, with per-script word/range policies. RTL Arabic vowelisation, bidi isolation and vertical CJK deserve dedicated fixtures rather than assuming ruby solves every linguistic script. Keep accessibility/selection valid even if language-specific layout degrades to a text fallback.

## 2. Mathematical notation as a first-class literacy capability

### Distinguish four layers

1. **Canonical expression**: immutable LaTeX/MathML source and metadata, attributable, revisioned and searchable/copyable.
2. **Typesetting**: non-executing safe viewer (KaTeX, MathJax or native MathML) with accessible fallback.
3. **Input**: deliberate equation editor (MathLive considered) and a plain-source alternative.
4. **Computation**: verified separately labelled SymPy/other runtime; typesetting an equation is not evaluating it and a rendered equality is not a proof.

### Comparison experiment, no premature winner

| Candidate | Research strengths | Critical open questions |
| --- | --- | --- |
| KaTeX | Fast local rendering, htmlAndMathml output, strict/trust/maxExpand/maxSize controls | Real screenreader navigation fidelity, unsupported TeX, font/bundle/licence footprint |
| MathJax 4 | Broad notation, speech, Braille and expression explorer support | Runtime weight, 390px response, focus/toolbar conflicts, CSP/site integration |
| MathLive | Authorable mathfield with mobile virtual keyboard and React integration guidance | ProseMirror integration, touch focus/accessibility, source round-trip, bundle/asset loading |
| Native MathML | Native browser semantics, no renderer runtime for basic expressions | Coverage for complex expressions, editing, speech differences, canonical serialization |
| JSXGraph | Interactive coordinate geometry and plotted functions, useful for learning | Separate sandbox/capability from typesetting, mobile controls and event budget |

Measure actual performance and a11y before selecting a production stack. One could use KaTeX for static content plus an optional advanced accessibility mode, but **do not** assert that such combination works until real code and screenreader evidence exists.

### Authoring syntax and canonical rights

- Start with an explicit typed math part with bounded TeX source, displayMode and optional semantic alt. For prose inline maths, adapt the existing ReadingInline or a carefully validated sibling: inline math must not alter canonical textual positions or permit nested arbitrary HTML.
- In Markdown/manuscript test at least \(...\), \[...\] and fenced minamo-math declarations. Consider $$...$$ only after proving currency, escaped delimiters, literal shell/code fences and multiline parsing are not corrupted. Never reinterpret historic plaintext silently.
- No unbounded macro expansion, external \includegraphics/\href load, injected user style/HTML, arbitrary SVG event handlers or filesystem/network access. Prefer KaTeX trust:false, bounded maxExpand/maxSize and strict rejection/fallback, confirmed by tests.
- Copy options: copy exact LaTeX; copy plain accessible speech text only when authored/verified; selection/capture of an entire formula pin its exact source rather than reverse-map decorative DOM to wrong UTF-16 offsets.
- Preserve maths inside Note Markdown and source editing, not only rendered Articles. Existing ProseMirror parser/serializer needs non-destructive compatibility fallback for syntax it cannot round-trip.
- Mathematical rendered output is **source interpretation**, not numerical validation. A simulated calculation must be separately marked illustrative, and symbolic steps from SymPy saved as Run evidence only after actual execution.

### Mathematical fixtures

- Inline: Euler's identity, integrals, probability conditional, matrices, Greek letters and subscripts embedded in English and Japanese text.
- Display: fractions, roots, multi-line aligned systems, vector calculus, limit/summation, piecewise, chemistry notation and scientific units.
- Security: malformed TeX, nested braces, huge matrices, exponential macro chains, \htmlClass, \includegraphics, untrusted links, pasted malformed Unicode.
- Interaction: 300 sequential formulas in a long Journey/Article, 390px, landscape, 200% zoom, reader overlay Flags, copy source, dark/light themes, reduced motion.
- Accessibility: keyboard navigation, focus order, Chrome + TalkBack/Firefox + NVDA or supported equivalents, MathJax explorer where proposed, speech output labelled as synthesized rather than guaranteed.
- Proof: a genuinely executed SymPy calculation e.g. integrate(x**2,(x,0,1)) = 1/3, with runtime receipt, engine version, captured code and asserted result, independently compared to the **display-only** literal equation.

## 3. End-to-end learning case studies

### Japanese beginner Journey (sample, synthetic only)

**Goal:** Read a short everyday Japanese passage and start noticing kanji readings without surrendering active recall.

Investigation A: What is furigana, when does it help, and can hidden readings support independent attempts?
Investigation B: What happens to meaning/pronunciation when the same kanji appears in different words?
Investigation C: How can I inspect authentic examples and preserve useful corrections without auto-logging success?

A real learner workflow should allow one context-linked Note containing prediction → selected reading → correction → next question, with no automatic Development. A separate deliberate formal checkpoint should still be possible later, not required after every vocabulary item.

### Maths + Python (sample, synthetic only)

**Goal:** Understand integration and verify an intuition experimentally.

Read a properly typeset integral. Write a prediction. Explore a draggable function/area board or real plotted Python graph. Run an independent SymPy calculation. Compare the screenshot/data/source as evidence, keep a short Note and revisit later. A visual curve and a computed symbolic result are distinct artefacts with distinct provenance.

## 4. Practical acceptance gate

For **both** language and math:
- Publish via a normal typed command/manuscript; read through ordinary API and MCP in new contexts; reopen after revision and test active/historic edition.
- Read existing legacy content unchanged; avoid forced migrations or invisible source rewrites.
- Create, revisit and remove a Flag/Annotation spanning displayed decorations; copy exact canonical UTF-16 base source.
- Visit Classic, Focus and Task; switch views while Note autosave/uncertain mutation is pending; preserve context and cursor.
- Long article, full-height mobile Note sheet, text selection, keyboard and touch; no accidental app-level autoexec or resource loading.
- Revoke a source/media asset and verify no new renderer leaks it; recovery export/import preserves rights and source edition.
- One fresh tutor with only natural language project title can retrieve a *relevant* Note/expression or reading without requiring IDs, but is not told it learned something merely because content displayed.
- Record actual browser/runtime/assistive evidence and explicitly name absent physical-device testing.

## Sources to consult in work

- W3C ruby introduction: https://www.w3.org/International/questions/qa-ruby.en.html
- W3C layout: https://www.w3.org/TR/jlreq/
- WHATWG ruby semantics: https://html.spec.whatwg.org/dev/text-level-semantics.html
- MDN ruby: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ruby
- Kuroshiro: https://github.com/hexenq/kuroshiro ; Kuromoji: https://github.com/takuyaa/kuromoji.js
- KaTeX options/security: https://katex.org/docs/options ; https://katex.org/docs/security
- MathJax v4 accessibility: https://docs.mathjax.org/en/v4.1/basic/accessibility.html
- MathLive React integration: https://mathlive.io/mathfield/guides/react/
- Browser SpeechSynthesisUtterance locale: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/lang
- Unicode segmentation: https://www.unicode.org/reports/tr29/
