/** Browser-only, lazy-loaded speech inference. Never imports into a Worker request. */
import {localSynthesisOptions, type LocalVoice, type SpeechPace} from './language-speech';

type Progress = (message: string) => void;
let piperSession: Awaited<ReturnType<typeof import('@mintplex-labs/piper-tts-web')['TtsSession']['create']>> | null = null;
let piperVoice = '';
let plusSession: Awaited<ReturnType<typeof import('piper-plus')['PiperPlus']['initialize']>> | null = null;
let serial: Promise<unknown> = Promise.resolve();

async function synthesize(voice: LocalVoice, text: string, pace: SpeechPace, progress: Progress): Promise<Blob> {
  if (typeof window === 'undefined' || typeof WebAssembly === 'undefined') throw Error('This browser cannot run local neural speech.');
  if (voice.engine === 'piper') {
    const piper = await import('@mintplex-labs/piper-tts-web');
    if (!piperSession || piperVoice !== voice.id) {
      progress('Downloading or opening voice…');
      // The pinned wrapper has one process-wide session. Switching voices must reset it.
      piper.TtsSession._instance = null;
      piperSession = null;
      piperSession = await piper.TtsSession.create({
        voiceId: voice.id as Parameters<typeof piper.TtsSession.create>[0]['voiceId'],
        wasmPaths: {
          onnxWasm: '/piper-runtime/ort/',
          piperWasm: '/piper-runtime/phonemize/piper_phonemize.wasm',
          piperData: '/piper-runtime/phonemize/piper_phonemize.data',
        },
      });
      piperVoice = voice.id;
    }
    progress('Generating speech on your device…');
    // Piper 1.0.5 does not expose synthesis pacing. Do not distort by playbackRate.
    return piperSession.predict(text);
  }

  if (!plusSession) {
    progress('Downloading or opening Japanese voice…');
    const [{PiperPlus}, ort] = await Promise.all([import('piper-plus'), import('onnxruntime-web/wasm')]);
    ort.env.wasm.wasmPaths = '/piper-plus-runtime/ort/';
    plusSession = await PiperPlus.initialize({
      model: 'css10',
      ort,
      // The upstream adapter calls import(wasmG2pUrl), which the production
      // bundler cannot resolve from an arbitrary URL. Use a same-origin copy
      // of the package's small generated JS glue (no 58 MB binary in Sites).
      wasmLoader: async () => {
        const glueUrl = '/piper-plus-runtime/g2p/piper_plus_wasm.js';
        const wasm = await import(/* @vite-ignore */ glueUrl);
        await wasm.default('https://unpkg.com/piper-plus@0.8.2/dist/rust-wasm/piper_plus_wasm_bg.wasm');
        return wasm;
      },
      onProgress: info => {if (info.stage === 'model') progress('Loading Japanese voice model…');},
    });
  }
  progress('Generating Japanese speech on your device…');
  return (await plusSession.synthesize(text, {language: 'ja', ...localSynthesisOptions(voice, pace)})).toBlob();
}

/** Serialise to avoid changing the shared Piper singleton during another synthesis. */
export function synthesizeLocalSpeech(voice: LocalVoice, text: string, pace: SpeechPace, progress: Progress): Promise<Blob> {
  const job = serial.then(() => synthesize(voice, text, pace, progress));
  serial = job.then(() => undefined, () => undefined);
  return job;
}
