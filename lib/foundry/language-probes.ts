import { languageBaseText, languageDomPoint, languageDomRange, languageDomSelection } from './language-dom';
import { japaneseLanguageFixture, unicodeLanguageFixture } from './language-fixtures';
import type { LanguageText } from './language';
/** Real browser-DOM probes; no private records, network or browser automation API. */
export function runLanguageDomProbes(document: Document) {
  const outcomes: { name: string; passed: boolean; detail: string }[] = [];
  const check = (name: string, fn: () => void) => { try { fn(); outcomes.push({ name, passed: true, detail: 'Actual DOM Range assertion passed.' }); } catch (e) { outcomes.push({ name, passed: false, detail: e instanceof Error ? e.message : String(e) }); } };
  const same = (actual: unknown, expected: unknown) => { if (actual !== expected) throw Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}.`); };
  const make = (source: LanguageText) => {
    const root = document.createElement('p'); let cursor = 0;
    for (const s of source.spans) { root.appendChild(document.createTextNode(source.text.slice(cursor, s.start))); const ruby = document.createElement('ruby'), strong = document.createElement('strong'), rt = document.createElement('rt'), rp = document.createElement('rp'); strong.textContent = s.base; rt.textContent = s.reading; rp.textContent = '('; ruby.appendChild(strong); ruby.appendChild(rp); ruby.appendChild(rt); const end = document.createElement('rp'); end.textContent = ')'; ruby.appendChild(end); root.appendChild(ruby); cursor = s.end; }
    root.appendChild(document.createTextNode(source.text.slice(cursor))); return root;
  };
  const ja = make(japaneseLanguageFixture), unicode = make(unicodeLanguageFixture);
  check('Native ruby textContent differs while base source remains exact', () => { if (ja.textContent === japaneseLanguageFixture.text) throw Error('Probe did not include real ruby annotation text.'); same(languageBaseText(ja), japaneseLanguageFixture.text); });
  check('Capture across nested marks, ruby and kana', () => { const range = languageDomRange(ja, japaneseLanguageFixture, 1, 11); const captured = languageDomSelection(ja, japaneseLanguageFixture, range); same(captured.start, 1); same(captured.end, 11); same(captured.quote, japaneseLanguageFixture.text.slice(1, 11)); });
  check('Element-boundary endpoints preserve original quotation', () => { const range = document.createRange(); range.selectNodeContents(ja); same(languageDomSelection(ja, japaneseLanguageFixture, range).quote, japaneseLanguageFixture.text); });
  check('Partial compound capture remains original characters', () => { same(languageDomSelection(ja, japaneseLanguageFixture, languageDomRange(ja, japaneseLanguageFixture, 4, 5)).quote, '本'); });
  check('Endpoints inside rt are rejected', () => { const range = document.createRange(), rt = ja.querySelector('rt')!; range.setStart(rt.firstChild!, 0); range.setEnd(rt.firstChild!, 1); let rejected = false; try { languageDomSelection(ja, japaneseLanguageFixture, range); } catch { rejected = true; } same(rejected, true); });
  check('Supplementary + combining text exact capture and restore', () => { same(languageDomSelection(unicode, unicodeLanguageFixture, languageDomRange(unicode, unicodeLanguageFixture, 0, 9)).quote, unicodeLanguageFixture.text.slice(0, 9)); });
  check('Surrogate split cannot be restored', () => { let rejected = false; try { languageDomPoint(unicode, 1); } catch { rejected = true; } same(rejected, true); });
  check('Decoration controls omitted from canonical range', () => { const control = document.createElement('span'); control.dataset.languageDecoration = 'true'; control.textContent = 'Reveal'; ja.appendChild(control); same(languageBaseText(ja), japaneseLanguageFixture.text); });
  check('Changed DOM source rejects instead of retargeting', () => { const altered = make(japaneseLanguageFixture); altered.appendChild(document.createTextNode('changed')); let rejected = false; try { languageDomRange(altered, japaneseLanguageFixture, 0, 2); } catch { rejected = true; } same(rejected, true); });
  return outcomes;
}
