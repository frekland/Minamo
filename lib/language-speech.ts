/** Only voices actually exercised in the separate Minamo TTS Lab are offered. */
export type LocalVoice = {
  engine: 'piper' | 'piper-plus';
  id: string;
  label: string;
  language: string;
  sourceUrl: string;
};

const voices: Readonly<Record<string, LocalVoice>> = {
  ja: {engine: 'piper-plus', id: 'css10', label: 'Japanese · CSS10', language: 'ja', sourceUrl:'https://huggingface.co/ayousanz/piper-plus-css10-ja-6lang'},
  en: {engine: 'piper', id: 'en_GB-alan-medium', label: 'English · UK Alan', language: 'en-GB', sourceUrl:'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/alan/medium'},
  de: {engine: 'piper', id: 'de_DE-thorsten-medium', label: 'German · Thorsten', language: 'de-DE', sourceUrl:'https://huggingface.co/rhasspy/piper-voices/blob/main/de/de_DE/thorsten/medium/MODEL_CARD'},
  fr: {engine: 'piper', id: 'fr_FR-siwis-medium', label: 'French · Siwis', language: 'fr-FR', sourceUrl:'https://huggingface.co/rhasspy/piper-voices/blob/main/fr/fr_FR/siwis/medium/MODEL_CARD'},
  es: {engine: 'piper', id: 'es_ES-sharvard-medium', label: 'Spanish · Spain Sharvard', language: 'es-ES', sourceUrl:'https://huggingface.co/rhasspy/piper-voices/blob/main/es/es_ES/sharvard/medium/MODEL_CARD'},
  ar: {engine: 'piper', id: 'ar_JO-kareem-medium', label: 'Arabic · Jordan Kareem', language: 'ar-JO', sourceUrl:'https://huggingface.co/rhasspy/piper-voices/blob/main/ar/ar_JO/kareem/medium/MODEL_CARD'},
  zh: {engine: 'piper', id: 'zh_CN-huayan-medium', label: 'Mandarin · Huayan', language: 'zh-CN', sourceUrl:'https://huggingface.co/rhasspy/piper-voices/blob/main/zh/zh_CN/huayan/medium/MODEL_CARD'},
  el: {engine: 'piper', id: 'el_GR-rapunzelina-low', label: 'Greek · Rapunzelina', language: 'el-GR', sourceUrl:'https://huggingface.co/rhasspy/piper-voices/blob/main/el/el_GR/rapunzelina/low/MODEL_CARD'},
  sv: {engine: 'piper', id: 'sv_SE-nst-medium', label: 'Swedish · NST', language: 'sv-SE', sourceUrl:'https://huggingface.co/rhasspy/piper-voices/blob/main/sv/sv_SE/nst/medium/MODEL_CARD'},
};

/** Unknown tags remain valid learning languages; they simply have no verified voice. */
export function localVoiceFor(language: string | undefined): LocalVoice | null {
  if (!language || !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(language)) return null;
  return voices[language.split('-')[0].toLowerCase()] ?? null;
}

export type SpeechPace = 'normal' | 'slow';
/** A flashcard's optional language tag identifies its authored front, not its translation. */
export function isTargetFlashcardFace(clozeMode: boolean, answerVisible: boolean, reversed: boolean) {
  return clozeMode ? answerVisible : answerVisible === reversed;
}
/** Slower synthesis was tested specifically for the Japanese CSS10 voice. */
export function localSynthesisOptions(voice: LocalVoice, pace: SpeechPace) {
  return voice.engine === 'piper-plus'
    ? {lengthScale: pace === 'slow' ? 2.4 : 1.6, noiseW: 0.2}
    : null;
}
