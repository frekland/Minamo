import { LanguageError, admitLanguageText, type LanguageText, type LanguageSpan } from './language';
export type TokenizerObservation = { surface_form: string; reading?: string; pos?: string; word_type: 'KNOWN' | 'UNKNOWN' };
/** Receives already-run, bounded tokenizer observations. No package fetching or execution here. */
export function proposeTokenizerReadings(text: string, observations: TokenizerObservation[], producer: { name: string; version: string; dictionaryDigest: string }): LanguageText {
  if (typeof text !== 'string' || text.length > 24000 || !Array.isArray(observations) || observations.length > 4096 || [producer.name, producer.version, producer.dictionaryDigest].some(s => typeof s !== 'string' || !s || s.length > 160)) throw new LanguageError('limit', 'Use bounded tokenizer evidence with exact producer and dictionary identity.');
  let cursor = 0;
  const spans: LanguageSpan[] = [];
  for (const token of observations) {
    if (!token || Object.keys(token).some(key => !['surface_form', 'reading', 'pos', 'word_type'].includes(key)) || typeof token.surface_form !== 'string' || !token.surface_form || token.surface_form.length > 240 || !['KNOWN', 'UNKNOWN'].includes(token.word_type) || (token.reading !== undefined && (typeof token.reading !== 'string' || token.reading.length > 240)) || (token.pos !== undefined && (typeof token.pos !== 'string' || token.pos.length > 240))) throw new LanguageError('shape', 'Tokenizer observations must use bounded plain text and known fields.');
    const end = cursor + token.surface_form.length;
    if (text.slice(cursor, end) !== token.surface_form) throw new LanguageError('base-mismatch', 'Tokenizer surfaces must concatenate to the original source without normalization or guessed gaps.');
    if (token.word_type === 'KNOWN' && token.reading && token.reading !== '*' && /[\u3400-\u9fff\uf900-\ufaff\u{20000}-\u{323af}]/u.test(token.surface_form)) {
      if (spans.length === 256) throw new LanguageError('limit', 'The passage has too many pronunciation proposals; use a smaller passage.');
      spans.push({ start: cursor, end, base: token.surface_form, reading: token.reading, origin: 'machine-proposed', source: `${producer.name} ${producer.version}; dictionary ${producer.dictionaryDigest}`, ...(token.pos ? { grammar: `Proposed part of speech: ${token.pos}` } : {}) });
    }
    cursor = end;
  }
  if (cursor !== text.length) throw new LanguageError('base-mismatch', 'Tokenizer observations omitted some original characters.');
  return admitLanguageText({ version: 1, text, language: 'ja', direction: 'ltr', spans });
}
