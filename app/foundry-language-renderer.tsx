'use client';
import { useId, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LanguageReadingDetails } from './language-reading-details';
import { FoundryAnnotatedText } from './foundry-language-demo';
import { languageDomSelection } from '../lib/foundry/language-dom';
import { type LanguageText, type ParallelPassage } from '../lib/foundry/language';
function LanguageView({ content }: { content: LanguageText }) {
  const [visible, setVisible] = useState(true), ref = useRef<HTMLParagraphElement>(null), id = useId();
  return <section>{!!content.spans.length&&<button type="button" aria-controls={id} aria-pressed={visible} onClick={() => setVisible(v => !v)}>{visible ? 'Hide' : 'Reveal'} pronunciation annotations</button>}<p id={id} ref={ref} lang={content.language} dir={content.direction} style={{ fontSize: '1.4rem', lineHeight: content.spans.length ? 2.6 : 1.8, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', unicodeBidi: 'isolate' }} onCopy={event => { try { const selection = window.getSelection(); if (!ref.current || !selection || selection.rangeCount !== 1) return; const exact = languageDomSelection(ref.current, content, selection.getRangeAt(0)); event.clipboardData.setData('text/plain', exact.quote); event.preventDefault(); } catch { event.preventDefault(); } }}><FoundryAnnotatedText content={content} visible={visible} /></p><LanguageReadingDetails content={content}/><small>Pronunciation annotations are authored or proposed metadata. Viewing or revealing them records no learning progress.</small></section>;
}
function ParallelView({ content }: { content: ParallelPassage }) {
  const [visible, setVisible] = useState(false), id = useId();
  return <section><LanguageView content={content.source} /><button type="button" aria-controls={id} aria-expanded={visible} onClick={() => setVisible(v => !v)}>{visible ? 'Hide' : 'Show'} translation</button><div id={id} hidden={!visible}><p lang={content.translation.language} dir={content.translation.direction} style={{ unicodeBidi: 'isolate', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{content.translation.text}</p><small>{content.translation.provenance}. Original and translated passages have independent source coordinates.</small></div></section>;
}
export function mountFoundryLanguageText(host: HTMLElement, content: LanguageText) { const root = createRoot(host); root.render(<LanguageView content={content} />); let disposed = false; return () => { if (disposed) return; disposed = true; root.unmount(); }; }
export function mountFoundryParallelLanguage(host: HTMLElement, content: ParallelPassage) { const root = createRoot(host); root.render(<ParallelView content={content} />); let disposed = false; return () => { if (disposed) return; disposed = true; root.unmount(); }; }
