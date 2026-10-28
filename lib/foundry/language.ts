/** Source-exact authored language metadata. Canonical text is never normalized. */
export type LanguageSpan = { start: number; end: number; base: string; reading: string; origin: 'author-verified' | 'machine-proposed'; gloss?: string; grammar?: string; source?: string; lemma?: string; senseId?: string };
export type LanguageTranslation = { text: string; language: string; direction: 'ltr' | 'rtl'; provenance: 'authored-translation' | 'supplied-translation'; source?: string };
export type LanguagePhrase = { start: number; end: number; base: string; explanation: string; targetStart?: number; targetEnd?: number; source?: string };
export type LanguageText = { version: 1; text: string; language: string; direction: 'ltr' | 'rtl'; spans: LanguageSpan[]; sourceScript?: string; pronunciation?: string; grammar?: string; translation?: LanguageTranslation; phrases?: LanguagePhrase[] };
export type LanguageErrorCode = 'shape' | 'limit' | 'range' | 'overlap' | 'base-mismatch' | 'stale-source' | 'unavailable';
export class LanguageError extends Error { constructor(public code: LanguageErrorCode, message: string) { super(message); this.name = 'LanguageError'; } }
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const keys = (value: Record<string, unknown>, allowed: string[]) => Object.keys(value).every(key => allowed.includes(key));
const bounded = (value: unknown, max: number): value is string => typeof value === 'string' && value.length > 0 && value.length <= max && wellFormed(value);
export function languageBoundary(text: string, offset: number) {
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > text.length) return false;
  if (offset === 0 || offset === text.length) return true;
  // A reading or quote must not detach combining accents, variation selectors,
  // emoji modifiers or joined characters from their exact source grapheme.
  return !(/[\uD800-\uDBFF]/.test(text[offset - 1]) && /[\uDC00-\uDFFF]/.test(text[offset])) && !/^[\p{M}\u200d\u{1f3fb}-\u{1f3ff}]/u.test(text.slice(offset)) && text[offset - 1] !== '\u200d';
}
const validLanguageTag = (tag: unknown): tag is string => {
  if (typeof tag !== 'string' || tag.length > 40 || !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(tag)) return false;
  try { return Intl.getCanonicalLocales(tag).length === 1; } catch { return false; }
};
function wellFormed(text: string) { for (let i=0;i<text.length;i++) { const c=text.charCodeAt(i); if(c>=0xd800&&c<=0xdbff) { const next=text.charCodeAt(++i);if(!(next>=0xdc00&&next<=0xdfff))return false; } else if(c>=0xdc00&&c<=0xdfff)return false; } return true; }
export function admitLanguageTranslation(value: unknown): LanguageTranslation {
  if (!record(value) || !keys(value, ['text','language','direction','provenance','source']) || !bounded(value.text,24000) || !wellFormed(value.text) || !validLanguageTag(value.language) || typeof value.direction !== 'string' || !['ltr','rtl'].includes(value.direction) || typeof value.provenance !== 'string' || !['authored-translation','supplied-translation'].includes(value.provenance) || value.source !== undefined && !bounded(value.source,600)) throw new LanguageError('shape','Use an exact translation with a valid language tag, direction and authored/supplied provenance.');
  return {text:value.text,language:value.language,direction:value.direction as LanguageTranslation['direction'],provenance:value.provenance as LanguageTranslation['provenance'],...(value.source!==undefined?{source:value.source as string}:{})};
}
/** The annotation is deliberately plain text; angle brackets are displayed literally. */
export function admitLanguageText(value: unknown): LanguageText {
  if (!record(value) || !keys(value, ['version', 'text', 'language', 'direction', 'spans', 'sourceScript', 'pronunciation', 'grammar', 'translation', 'phrases']) || value.version !== 1 || typeof value.text !== 'string' || value.text.length > 24000 || !wellFormed(value.text) || !validLanguageTag(value.language) || typeof value.direction !== 'string' || !['ltr', 'rtl'].includes(value.direction) || !Array.isArray(value.spans)) throw new LanguageError('shape', 'Use language version 1, exact text, language tag, direction and spans.');
  if (value.sourceScript !== undefined && (typeof value.sourceScript !== 'string' || !/^[A-Z][a-z]{3}$/.test(value.sourceScript))) throw new LanguageError('shape','sourceScript is an ISO 15924 script tag, separate from the source language.');
  if (['pronunciation','grammar'].some(key=>value[key]!==undefined && (!bounded(value[key],1200)||!wellFormed(value[key] as string)))) throw new LanguageError('shape','Use bounded plain-text pronunciation and grammar guidance.');
  const translation = value.translation === undefined ? undefined : admitLanguageTranslation(value.translation);
  if (value.spans.length > 256) throw new LanguageError('limit', 'Use at most 256 annotations per passage.');
  let previousEnd = 0;
  const text = value.text;
  const spans = value.spans.map((span): LanguageSpan => {
    if (!record(span) || !keys(span, ['start', 'end', 'base', 'reading', 'origin', 'gloss', 'grammar', 'source', 'lemma', 'senseId']) || typeof span.start !== 'number' || typeof span.end !== 'number' || !languageBoundary(text, span.start) || !languageBoundary(text, span.end) || span.end <= span.start) throw new LanguageError('range', 'Annotations need exact nonempty UTF-16 boundaries.');
    if (span.start < previousEnd) throw new LanguageError('overlap', 'Annotations must be ordered and must not overlap.');
    if (typeof span.base !== 'string' || span.base !== text.slice(span.start, span.end)) throw new LanguageError('base-mismatch', 'Annotation base must equal the exact original characters.');
    if (!bounded(span.reading, 240) || !wellFormed(span.reading) || typeof span.origin !== 'string' || !['author-verified', 'machine-proposed'].includes(span.origin) || ['gloss', 'grammar', 'source', 'lemma', 'senseId'].some(key => span[key] !== undefined && !bounded(span[key], 600))) throw new LanguageError('shape', 'Use bounded plain-text pronunciations, provenance and optional glossary fields.');
    if (span.origin === 'machine-proposed' && !bounded(span.source, 600)) throw new LanguageError('shape', 'Machine proposals need a named proposal source.');
    previousEnd = span.end;
    return { start: span.start, end: span.end, base: span.base, reading: span.reading, origin: span.origin as LanguageSpan['origin'], ...(span.gloss !== undefined ? { gloss: span.gloss as string } : {}), ...(span.grammar !== undefined ? { grammar: span.grammar as string } : {}), ...(span.source !== undefined ? { source: span.source as string } : {}), ...(span.lemma !== undefined ? { lemma: span.lemma as string } : {}), ...(span.senseId !== undefined ? { senseId: span.senseId as string } : {}) };
  });
  const phrases = value.phrases === undefined ? undefined : admitLanguagePhrases(value.phrases, text, translation);
  return { version: 1, text, language: value.language, direction: value.direction as 'ltr' | 'rtl', spans, ...(value.sourceScript!==undefined?{sourceScript:value.sourceScript as string}:{}), ...(value.pronunciation!==undefined?{pronunciation:value.pronunciation as string}:{}), ...(value.grammar!==undefined?{grammar:value.grammar as string}:{}), ...(translation?{translation}:{}), ...(phrases?{phrases}:{}) };
}
/** Independent phrase layer may overlap ruby words and other phrases without changing source coordinates. */
export function admitLanguagePhrases(value: unknown, text: string, translation?: LanguageTranslation): LanguagePhrase[] {
 if (!Array.isArray(value) || value.length > 128) throw new LanguageError('limit','Use at most 128 source-exact phrase explanations.');
 return value.map((phrase): LanguagePhrase => {
  if (!record(phrase) || !keys(phrase,['start','end','base','explanation','targetStart','targetEnd','source']) || typeof phrase.start !== 'number' || typeof phrase.end !== 'number' || !languageBoundary(text,phrase.start) || !languageBoundary(text,phrase.end) || phrase.end <= phrase.start || phrase.base !== text.slice(phrase.start,phrase.end) || !bounded(phrase.explanation,1200) || phrase.source !== undefined && !bounded(phrase.source,600)) throw new LanguageError('range','Each phrase needs exact source boundaries/base and a bounded explanation.');
  const aligned=phrase.targetStart !== undefined || phrase.targetEnd !== undefined;
  if (aligned && (!translation || typeof phrase.targetStart !== 'number' || typeof phrase.targetEnd !== 'number' || !languageBoundary(translation.text,phrase.targetStart) || !languageBoundary(translation.text,phrase.targetEnd) || phrase.targetEnd <= phrase.targetStart)) throw new LanguageError('range','Phrase translation alignment needs both valid independent target ranges and a translation.');
  return {start:phrase.start,end:phrase.end,base:phrase.base as string,explanation:phrase.explanation,...(aligned?{targetStart:phrase.targetStart as number,targetEnd:phrase.targetEnd as number}:{}),...(phrase.source?{source:phrase.source as string}:{})};
 });
}
/** Exact written form, reading, source language/script and declared sense remain distinct. */
export function languageLexicalIdentity(content: LanguageText, span: LanguageSpan) {
 return JSON.stringify([content.language,content.sourceScript??'',span.base,span.reading,span.lemma??'',span.senseId??span.gloss??'']);
}
export function languageSegments(value: LanguageText) {
  const admitted = admitLanguageText(value), result: { start: number; end: number; text: string; annotation?: LanguageSpan }[] = [];
  let cursor = 0;
  for (const span of admitted.spans) { if (span.start > cursor) result.push({ start: cursor, end: span.start, text: admitted.text.slice(cursor, span.start) }); result.push({ start: span.start, end: span.end, text: span.base, annotation: span }); cursor = span.end; }
  if (cursor < admitted.text.length) result.push({ start: cursor, end: admitted.text.length, text: admitted.text.slice(cursor) });
  return result;
}
export function languageQuote(value: LanguageText, start: number, end: number) {
  const source = admitLanguageText(value);
  if (!languageBoundary(source.text, start) || !languageBoundary(source.text, end) || end <= start) throw new LanguageError('range', 'Select a nonempty exact base-text range.');
  return { start, end, quote: source.text.slice(start, end) };
}
/** Explicit correction returns a new value; callers still need existing CAS/revision authority. */
export function correctLanguageReading(value: LanguageText, start: number, expectedReading: string, reading: string, source: string) {
  const admitted = admitLanguageText(value), at = admitted.spans.findIndex(span => span.start === start);
  if (at < 0 || admitted.spans[at].reading !== expectedReading) throw new LanguageError('stale-source', 'The selected pronunciation changed; inspect the current revision.');
  admitted.spans[at] = { ...admitted.spans[at], reading, source, origin: 'author-verified' };
  return admitLanguageText(admitted);
}
export type LanguageBinding = { family: 'article' | 'journey' | 'investigation' | 'area' | 'note'; id: string; rendition: string; sectionId: string; partId: string; canonicalText: string; eligible: boolean };
export function bindLanguageText(value: LanguageText, target: LanguageBinding) {
  if (!target.eligible) throw new LanguageError('unavailable', 'The source is currently unavailable.');
  if (!['article', 'journey', 'investigation', 'area', 'note'].includes(target.family) || [target.id, target.rendition, target.sectionId, target.partId].some(s => typeof s !== 'string' || !s || s.length > 240 || /[\u0000-\u001f\u007f]/.test(s))) throw new LanguageError('shape', 'Bind to one exact eligible retained part.');
  const admitted = admitLanguageText(value);
  if (admitted.text !== target.canonicalText) throw new LanguageError('stale-source', 'Language decoration must match the retained part byte-for-character.');
  return { content: admitted, target: { family: target.family, id: target.id, rendition: target.rendition, sectionId: target.sectionId, partId: target.partId } };
}
/** Static fallback retains only original source; glosses are separately labelled metadata. */
export function languageFallback(value: LanguageText) { return admitLanguageText(value).text; }
export function languageSource(value: LanguageText) { return JSON.stringify(admitLanguageText(value), null, 2); }
/** Explicit codec only. It never scans or reinterprets an existing Markdown body. */
export function languageManuscriptBlock(value: LanguageText) { return '```minamo-language\n' + languageSource(value) + '\n```'; }
export function parseLanguageManuscriptBlock(source: string) {
  if (source.length > 160000) throw new LanguageError('limit', 'Language declaration is too large.');
  const match = /^```minamo-language\r?\n([\s\S]*)\r?\n```$/.exec(source);
  if (!match) throw new LanguageError('shape', 'Use one complete explicit minamo-language declaration.');
  try { return admitLanguageText(JSON.parse(match[1])); } catch (error) { if (error instanceof LanguageError) throw error; throw new LanguageError('shape', 'Language declaration must contain valid JSON.'); }
}
export type ParallelPassage = { version: 1; source: LanguageText; translation: LanguageTranslation; alignments: { sourceStart: number; sourceEnd: number; targetStart: number; targetEnd: number }[] };
export function admitParallelPassage(value: unknown): ParallelPassage {
  if (!record(value) || !keys(value, ['version', 'source', 'translation', 'alignments']) || value.version !== 1 || !record(value.translation) || !keys(value.translation, ['text', 'language', 'direction', 'provenance', 'source']) || !bounded(value.translation.text, 24000) || !bounded(value.translation.language, 40) || !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(value.translation.language) || typeof value.translation.direction !== 'string' || !['ltr', 'rtl'].includes(value.translation.direction) || typeof value.translation.provenance !== 'string' || !['authored-translation', 'supplied-translation'].includes(value.translation.provenance) || !Array.isArray(value.alignments) || value.alignments.length > 256) throw new LanguageError('shape', 'Use an explicit source, labelled translation and bounded alignments.');
  const source = admitLanguageText(value.source), translation = admitLanguageTranslation(value.translation);
  const alignments = value.alignments.map(a => {
    if (!record(a) || !keys(a, ['sourceStart', 'sourceEnd', 'targetStart', 'targetEnd']) || ['sourceStart', 'sourceEnd', 'targetStart', 'targetEnd'].some(k => typeof a[k] !== 'number') || !languageBoundary(source.text, a.sourceStart as number) || !languageBoundary(source.text, a.sourceEnd as number) || !languageBoundary(translation.text, a.targetStart as number) || !languageBoundary(translation.text, a.targetEnd as number) || (a.sourceEnd as number) <= (a.sourceStart as number) || (a.targetEnd as number) <= (a.targetStart as number)) throw new LanguageError('range', 'Translation alignments must refer to exact independent source ranges.');
    return a as ParallelPassage['alignments'][number];
  });
  return { version: 1, source, translation: { ...translation }, alignments };
}
/** Session-only recall state: no timers, scores, mastery, checkpoints or persistence. */
export type RecallState = { phase: 'idle' | 'prompt' | 'revealed'; index: number };
export function advanceRecall(state: RecallState, event: 'begin' | 'reveal' | 'next' | 'stop', count: number): RecallState {
  if (!Number.isSafeInteger(count) || count < 0 || count > 256 || !Number.isSafeInteger(state.index) || state.index < 0 || (count && state.index >= count) || !['idle', 'prompt', 'revealed'].includes(state.phase)) throw new LanguageError('shape', 'Use a valid bounded recall session.');
  if (event === 'stop' || !count) return { phase: 'idle', index: 0 };
  if (event === 'begin') return { phase: 'prompt', index: 0 };
  if (event === 'reveal' && state.phase === 'prompt') return { ...state, phase: 'revealed' };
  if (event === 'next' && state.phase === 'revealed') return state.index + 1 < count ? { phase: 'prompt', index: state.index + 1 } : { phase: 'idle', index: 0 };
  return { ...state };
}
/** Export only deliberate authored metadata, TSV-safe against spreadsheet formula injection. */
export function languagePracticeTsv(value: LanguageText) {
  const field = (s: string) => { const safe = /^[\s]*[=+\-@]/.test(s) ? "'" + s : s; return '"' + safe.replaceAll('"', '""') + '"'; };
  return ['Base\tPronunciation\tGloss\tProvenance', ...admitLanguageText(value).spans.map(span => [span.base, span.reading, span.gloss ?? '', span.origin].map(field).join('\t'))].join('\r\n');
}
/** Deliberate authoring command candidate. No persistence or automatic token inference. */
export function insertLanguageReading(value: LanguageText, input: { start: number; end: number; expectedBase: string; reading: string; gloss?: string }) {
  const admitted = admitLanguageText(value), range = languageQuote(admitted, input.start, input.end);
  if (input.expectedBase !== range.quote) throw new LanguageError('stale-source', 'The selected original characters changed.');
  if (admitted.spans.some(s => input.start < s.end && input.end > s.start)) throw new LanguageError('overlap', 'Edit or remove the existing pronunciation before inserting an overlapping pronunciation.');
  const span: LanguageSpan = { start: input.start, end: input.end, base: range.quote, reading: input.reading, origin: 'author-verified', ...(input.gloss !== undefined ? { gloss: input.gloss } : {}) };
  return admitLanguageText({ ...admitted, spans: [...admitted.spans, span].sort((a, b) => a.start - b.start) });
}
/** Reading/gloss matches are labelled metadata; their quote is always original source. */
export function searchLanguageText(value: LanguageText, term: string) {
  const admitted = admitLanguageText(value);
  if (typeof term !== 'string' || !term.trim() || term.length > 120) return [];
  const hits: { match: 'base-text' | 'reading-metadata' | 'gloss-metadata'; start: number; end: number; quote: string; metadata?: string }[] = [];
  let from = 0, at: number;
  while (hits.length < 64 && (at = admitted.text.indexOf(term, from)) >= 0) { const end = at + term.length; if (languageBoundary(admitted.text, at) && languageBoundary(admitted.text, end)) hits.push({ match: 'base-text', start: at, end, quote: admitted.text.slice(at, end) }); from = at + Math.max(1, term.length); }
  for (const s of admitted.spans) { if (hits.length >= 64) break; if (s.reading.includes(term)) hits.push({ match: 'reading-metadata', start: s.start, end: s.end, quote: s.base, metadata: s.reading }); if (hits.length < 64 && s.gloss?.includes(term)) hits.push({ match: 'gloss-metadata', start: s.start, end: s.end, quote: s.base, metadata: s.gloss }); }
  return hits;
}
