import { LanguageError, languageBoundary, languageQuote, type LanguageText } from './language';
const element = (node: Node) => node.nodeType === 1 ? node as Element : node.parentElement;
export function languageBaseText(node: Node) { const clone = node.cloneNode(true); if ('querySelectorAll' in clone) (clone as Element).querySelectorAll('rt,rp,[data-language-decoration]').forEach(el => el.remove()); return clone.textContent ?? ''; }
/** Restore a canonical endpoint through nested marks while excluding ruby/control text. */
export function languageDomPoint(root: HTMLElement, canonicalOffset: number): { node: Node; offset: number } {
  const text = languageBaseText(root);
  if (!languageBoundary(text, canonicalOffset)) throw new LanguageError('range', 'Use an exact base-text boundary.');
  const walker = root.ownerDocument.createTreeWalker(root, 4);
  let consumed = 0, node: Node | null, last: Node | null = null;
  while ((node = walker.nextNode())) {
    if (element(node)?.closest('rt,rp,[data-language-decoration]')) continue;
    const length = node.textContent?.length ?? 0;
    if (canonicalOffset <= consumed + length) return { node, offset: canonicalOffset - consumed };
    consumed += length; last = node;
  }
  if (canonicalOffset === consumed) return last ? { node: last, offset: last.textContent?.length ?? 0 } : { node: root, offset: 0 };
  throw new LanguageError('range', 'The canonical endpoint is unavailable.');
}
export function languageDomRange(root: HTMLElement, source: LanguageText, start: number, end: number) {
  const expected = languageQuote(source, start, end);
  if (languageBaseText(root) !== source.text) throw new LanguageError('stale-source', 'The displayed base characters differ from the retained edition.');
  const a = languageDomPoint(root, start), b = languageDomPoint(root, end), range = root.ownerDocument.createRange();
  range.setStart(a.node, a.offset); range.setEnd(b.node, b.offset);
  const actual = languageDomSelection(root, source, range);
  if (actual.quote !== expected.quote || actual.start !== start || actual.end !== end) throw new LanguageError('stale-source', 'Cannot restore this exact original quotation.');
  return range;
}
/** Trusted renderer DOM only. Every call verifies exact base text against canonical source. */
export function languageDomSelection(root: HTMLElement, source: LanguageText, range: Range) {
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) throw new LanguageError('range', 'Select inside one original-language passage.');
  for (const node of [range.startContainer, range.endContainer]) if (element(node)?.closest('rt,rp,[data-language-decoration]')) throw new LanguageError('range', 'Pronunciation decorations cannot be captured as original text.');
  if (languageBaseText(root) !== source.text) throw new LanguageError('stale-source', 'Displayed base characters no longer match the retained source.');
  const start = range.cloneRange(); start.selectNodeContents(root); start.setEnd(range.startContainer, range.startOffset);
  const end = range.cloneRange(); end.selectNodeContents(root); end.setEnd(range.endContainer, range.endOffset);
  const capture = languageQuote(source, languageBaseText(start.cloneContents()).length, languageBaseText(end.cloneContents()).length);
  return capture;
}
