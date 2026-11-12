# Native multilingual reading — implementation and acceptance

26 October 2026 · PR49 implementation workstream. This is source/test evidence, not a production deployment receipt.

The existing canonical Reader and exact `minamo.semantic.v1` / `ruby` metadata now carry authored translation, pronunciation and grammatical guidance as well as contextual ruby. The legacy kind name remains compatible: a European passage with no reading spans renders ordinary original text, without forced ruby or a redundant readings button. Translation and teaching metadata use separate disclosure controls outside canonical capture containers.

## Authored input

`minamo-language` manuscript fences and typed paragraph `semantic.language` accept the same `LanguageText` object. The original version-1 required fields remain unchanged. Optional additions are:

| Field | Meaning / limit |
| --- | --- |
| `sourceScript` | ISO 15924 script tag, such as Jpan, Hans, Hant, Latn or Grek; independent of subject space and UI locale |
| `pronunciation` | Up to 1,200 characters of authored pronunciation guidance |
| `grammar` | Up to 1,200 characters of authored grammar guidance |
| `translation` | Exact separate text (24,000 chars), BCP-47 language, direction, authored/supplied translation provenance and optional source label |

Example original Mandarin declaration:

```json
{
  "version": 1,
  "text": "妈妈在银行工作。",
  "language": "zh-Hans",
  "sourceScript": "Hans",
  "direction": "ltr",
  "spans": [
    {"start": 0, "end": 2, "base": "妈妈", "reading": "māma", "origin": "author-verified", "gloss": "mother", "grammar": "The second syllable is neutral tone."},
    {"start": 3, "end": 5, "base": "银行", "reading": "yínháng", "origin": "author-verified", "gloss": "bank", "grammar": "行 is háng in this word; other compounds can use xíng."}
  ],
  "grammar": "在 + location places the action.",
  "translation": {"text": "Mum works at a bank.", "language": "en", "direction": "ltr", "provenance": "authored-translation"}
}
```

`text` is never normalized or changed by decoration. Source-text edits and reading/translation corrections use existing guarded block patches or document replacement. Different metadata yields a new retained rendition, while base-text coordinates remain authoritative. The helper `correctLanguageReading` only prepares a new immutable value; it does not persist or bypass CAS.

## Rendering and integrity

Japanese compounds retain their authored kana readings. Mandarin uses phrase-aligned authored Pinyin and separately tagged Simplified/Traditional original characters. Pinyin `rt` receives `zh-Latn-pinyin`; no Japanese tokenizer is applied to Hanzi and no character-to-reading guesser was introduced. Machine-proposed readings show a visible provisional notice and named source in the provenance disclosure. The renderer does not certify authored content as linguistically correct.

Translation and gloss/grammar displays are outside exact original-text capture spans. Copy inside a native passage maps the actual DOM Range back to its retained original source and excludes `rt`, `rp` and other teaching decoration. Existing Flag/Annotation controls retain canonical part/UTF-16/rendition identities. Reading, revealing or copying does not save an Attempt, Note or checkpoint.

Admission rejects unpaired UTF-16 surrogates and offsets that split a surrogate pair, combining accent/kana voicing, variation selector, emoji modifier or ZWJ join. It validates language tags, non-overlapping base-equal spans, bounded text and supported provenance; source and translation tags remain independent. These checks do not automatically normalize French accents, Greek tonos or Swedish letters.

Eight original fixtures cover the seven required languages plus the distinct Traditional Mandarin variant in `lib/foundry/language-fixtures.ts`: Japanese, zh-Hans, zh-Hant, French, Spanish, Modern Greek, German and Swedish. The European specimens include practical source sentences, pronunciation guidance, grammar and separately authored English translations.

## Verified locally

- Seven new multilingual tests pass: all eight variants roundtrip and render; native typed schema agrees with input; contextual Mandarin neutral tone/polyphony/script distinctions survive; proposals are visibly provisional and escaped; Unicode split boundaries reject; multilingual manuscript compilation preserves original text.
- The new isolated D1/MCP test writes and exactly reads all eight typed passages; creates exact original-text Annotations; applies a guarded translation correction; verifies retained original translation, stale-CAS rejection, foreign-owner denial, recoverable Trash/restore and **zero learning checkpoints**.
- Existing language/semantic suites retain their D1/MCP/Notes/Flag/Annotation, source revocation, encrypted recovery, source hash and renderer-disposal checks.

These are author-run synthetic local checks. They are not learner practice, production acceptance, browser copy/gesture evidence or physical Pixel 8a IME/TalkBack verification. The integrated release receipt must independently record actual hosted results.

## Optional speech

The existing tested speech engine remains banked. No native-reader autoplay, microphone, acoustic grading, audio receipt or automatic pronunciation claim was added. Production speech activation remains separate because global browser speech cancellation and actual device voice availability need their own app-scoped lifecycle qualification.

## Reference checked

The implementation retains native `ruby` → base + `rp`/`rt` fallback semantics. Reference retrieved through Firecrawl on 26 October 2026: [MDN ruby element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ruby), page modified 24 April 2026. This documentation supports markup behavior, not linguistic accuracy or physical-device certification.
