import { LanguageError } from './language';
export type LanguageVoice = { voiceURI: string; name: string; lang: string; localService: boolean };
export function languageVoices(voices: LanguageVoice[], language: string, allowNetwork = false) {
  const base = language.toLowerCase().split('-')[0];
  return voices.filter(v => (allowNetwork || v.localService) && v.lang.toLowerCase().split('-')[0] === base).slice(0, 64);
}
export type LanguageSpeechPort = { voices(): LanguageVoice[]; speak(input: { text: string; language: string; voiceURI: string; rate: number; onEnd(): void; onError(message: string): void }): void; cancel(): void; subscribeVoices(listener: () => void): () => void };
/** No activation at construction. A user gesture must call play; no microphone access. */
export function createLanguageSpeaker(port: LanguageSpeechPort, notify: (status: string) => void) {
  let disposed = false, ownUtterance = false, generation = 0;
  const unsubscribe = port.subscribeVoices(() => { if (!disposed) notify('Voice availability changed.'); });
  const stop = () => { generation++; if (ownUtterance) { ownUtterance = false; port.cancel(); } };
  return {
    voices(language: string, allowNetwork = false) { return disposed ? [] : languageVoices(port.voices(), language, allowNetwork); },
    play(text: string, language: string, voiceURI: string, rate = 0.85, allowNetwork = false) {
      if (disposed) throw new LanguageError('unavailable', 'The speech session is closed.');
      if (typeof text !== 'string' || !text.trim() || text.length > 1000 || !Number.isFinite(rate) || rate < 0.5 || rate > 1.5) throw new LanguageError('limit', 'Speak at most 1000 characters at a rate between 0.5 and 1.5.');
      if (!languageVoices(port.voices(), language, allowNetwork).some(v => v.voiceURI === voiceURI)) throw new LanguageError('unavailable', 'The selected voice is unavailable under the chosen local-only policy.');
      stop(); const current = generation; ownUtterance = true;
      notify('Synthesised speech; pronunciation and offline availability are not certified.');
      try { port.speak({ text, language, voiceURI, rate, onEnd: () => { if (!disposed && generation === current) { ownUtterance = false; notify('Speech ended.'); } }, onError: message => { if (!disposed && generation === current) { ownUtterance = false; notify('Speech unavailable: ' + message.slice(0, 180)); } } }); }
      catch (error) { ownUtterance = false; throw error; }
    },
    stop() { stop(); if (!disposed) notify('Speech stopped.'); },
    dispose() { if (disposed) return; stop(); disposed = true; unsubscribe(); }
  };
}
/** Browser voice implementations may use platform services. localService is reported, not proven. */
export function browserLanguageSpeechPort(): LanguageSpeechPort | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return null;
  const synth = window.speechSynthesis;
  return { voices: () => synth.getVoices().map(v => ({ voiceURI: v.voiceURI, name: v.name, lang: v.lang, localService: v.localService })),
    speak(input) { const voice = synth.getVoices().find(v => v.voiceURI === input.voiceURI); if (!voice) throw new LanguageError('unavailable', 'Voice disappeared.'); const utterance = new SpeechSynthesisUtterance(input.text); utterance.lang = input.language; utterance.voice = voice; utterance.rate = input.rate; utterance.onend = input.onEnd; utterance.onerror = e => input.onError(e.error); synth.speak(utterance); },
    cancel: () => synth.cancel(), subscribeVoices(listener) { synth.addEventListener('voiceschanged', listener); return () => synth.removeEventListener('voiceschanged', listener); }
  };
}
