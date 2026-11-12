# PR #85 browser-local speech checkpoint — 5 November 2026

This change integrates the already owner-tested Minamo TTS Lab approach into the **existing Minamo Project interactions**. It does not enable a hosted speech API, transcription, native Web Speech, Kokoro, or automatic learner-data writes.

## Learner experience

- Small, optional **Listen / Replay / Stop** controls are attached to authored language-reveal text, exact sentence-pattern results, each revealed dialogue turn, and explicitly language-tagged flashcards.
- The target utterance stays in the browser. On first use, the visitor downloads public voice models from Hugging Face and the relevant WASM runtime into their browser, and inference occurs locally. The models are reused by later plays. No audio data is stored in Minamo D1/R2 or shared with GPT/MCP.
- **Japanese:** Piper Plus CSS10, with tested normal (`lengthScale=1.6`, `noiseW=0.2`) and slow (`2.4`, `0.2`) synthesis presets. These generate new audio; they do not distort `audio.playbackRate`.
- **English (UK), German, French, Spanish, Arabic (Jordan), Mandarin (Mainland), Greek and Swedish:** corresponding individual original Piper voices from the TTS Lab, at voice-native speed. The selected `@mintplex-labs/piper-tts-web@1.0.5` wrapper **does not honour a `lengthScale` argument on `predict`**. Do not claim a slow mode exists for those voices until a separately verified synthesis-time implementation is available.
- Unsupported BCP 47 languages (e.g. Tetum) remain fully valid learning content. They simply have no synthetic voice button. No unexpected fallback voice or language substitution.
- Voice loading/generation failures leave the authored text and all existing Project controls operational. First-download and offline/reload/mobile outcomes need device acceptance below.

## Runtime and dependency boundaries

- Exact package versions: `@mintplex-labs/piper-tts-web@1.0.5`, `piper-plus@0.8.2`, `onnxruntime-web@1.30.0`; dynamic browser imports only on a deliberate Listen action.
- Six runtime assets were copied unchanged from the separately deployed TTS Lab into Minamo's `public/piper-runtime/` and `public/piper-plus-runtime/`; a seventh small generated Piper Plus JS glue asset is copied directly from the pinned installed package. Each is smaller than the Sites single-static-asset limit. These are executable/runtime assets, **not bundled voice ONNX weights**.
- Japanese G2P uses Piper Plus's `wasmLoader` injection with an unchanged, same-origin copy of the package's small generated JS glue at `/piper-plus-runtime/g2p/piper_plus_wasm.js`. This avoids the upstream adapter's unresolvable `import(wasmG2pUrl)` and avoids bundling the 58 MB binary (the initial V115 build was rejected by Sites' 25 MB per-file ceiling). The binary is fetched on demand from pinned `https://unpkg.com/piper-plus@0.8.2/dist/rust-wasm/piper_plus_wasm_bg.wasm`. The CSS10 model is selected by Piper Plus's `css10` registry alias, currently resolved through Hugging Face's `main` branch; therefore a model revision is not cryptographically pinned yet.
- Original Piper wrapper resolves model and voice config files from the published `diffusionstudio/piper-voices` Hugging Face mirror (`resolve/main`) and stores the files with its browser OPFS mechanism. Inference stays on-device, but remote voice availability and CORS are dependencies.
- Full browser runtime asset SHA-256 values:

  | Asset | SHA-256 |
  | --- | --- |
  | `piper-runtime/ort/ort-wasm-simd-threaded.mjs` | `30ed0b5cd1182ede931fea448afb567d4dc705ec957af09f108a2be5f770dac3` |
  | `piper-runtime/ort/ort-wasm-simd-threaded.wasm` | `4b884c203b0fa48d057be3332c65513ff85aa3c5bddd6946acc0fab7ecda001d` |
  | `piper-runtime/phonemize/piper_phonemize.data` | `29f1025eb23a5b5c192cd14a6efbce4509402ff265405072ee6f7d1a09b78f8c` |
  | `piper-runtime/phonemize/piper_phonemize.wasm` | `b777cd107a91d2bcc6a1ea46f2c26a662a7407394fe84589198aeaa83dd7a9d6` |
  | `piper-plus-runtime/ort/ort-wasm-simd-threaded.mjs` | `e13f7f94fc51b4ca72b12faeb1ee95f4ace6dfbc8939bc718aabdc0a27c4299b` |
  | `piper-plus-runtime/ort/ort-wasm-simd-threaded.wasm` | `3398c10d07d229bd91b364548e130e0e51a8e5704b88c7c083ebbeb78842dee2` |
  | `piper-plus-runtime/g2p/piper_plus_wasm.js` (package 0.8.2, generated glue) | `94f1457dd226167e3673bcc959824c4cdb46c00ded56a094b8c98fd97b631aa1` |

## Source and licence provenance

Package manifests identify the two JS engines and ONNX Runtime as MIT. **That does not automatically cover model weights, phonemizer data, or the datasets behind individual voices.** Relevant upstream model cards:

| Voice | Upstream training-data declaration |
| --- | --- |
| Piper Plus CSS10 Japanese | [CSS10 model](https://huggingface.co/ayousanz/piper-plus-css10-ja-6lang) labelled CSS10 public domain; derived from a separate multilingual base. |
| English Alan | [Alan model](https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/alan/medium); inspect its MODEL_CARD. |
| German Thorsten | [Thorsten card](https://huggingface.co/rhasspy/piper-voices/blob/main/de/de_DE/thorsten/medium/MODEL_CARD): CC0. |
| French Siwis | [Siwis card](https://huggingface.co/rhasspy/piper-voices/blob/main/fr/fr_FR/siwis/medium/MODEL_CARD): CC-BY 4.0. |
| Spanish Sharvard | [Sharvard card](https://huggingface.co/rhasspy/piper-voices/blob/main/es/es_ES/sharvard/medium/MODEL_CARD): CC-BY 3.0. |
| Arabic Kareem | [Kareem card](https://huggingface.co/rhasspy/piper-voices/blob/main/ar/ar_JO/kareem/medium/MODEL_CARD): points to external dataset source, not a declared licence. |
| Mandarin Huayan | [Huayan card](https://huggingface.co/rhasspy/piper-voices/blob/main/zh/zh_CN/huayan/medium/MODEL_CARD): dataset licence explicitly *unknown*. |
| Greek Rapunzelina | [Rapunzelina card](https://huggingface.co/rhasspy/piper-voices/blob/main/el/el_GR/rapunzelina/low/MODEL_CARD): CC0. |
| Swedish NST | [NST card](https://huggingface.co/rhasspy/piper-voices/blob/main/sv/sv_SE/nst/medium/MODEL_CARD): CC0. |

No model ONNX weights are copied to the Git repository or hosted by Minamo. Licence review remains an explicit publication/redistribution diligence item, especially for Arabic and Mandarin, and attribution must be retained for CC-BY datasets. A licensed alternative may be preferable to a voice whose provenance remains unclear.

## Verification and limits

The TypeScript check and production build pass. The focused PR #85 tests cover voice selection/presets and text-only fallback in addition to V113 language validation and interactive definitions. The full regression suite is run separately.

Initial live V114 Cloud Browser acceptance with owner-authorised French/German/Japanese TEST Projects confirmed French Siwis and German Thorsten both entered real playback (`Replay`/`Stop` controls); their reveal, sentence-variant and dialogue interactions worked. Japanese initially failed with `Cannot find module as expression is too dynamic` during G2P loading; that was the reason for the static-loader correction above. Flashcards also incorrectly offered target-language speech for English translations and underscore-filled prompts; the scoped fix now restricts synthetic speech to fully visible target-language text. A V115 live retry is required to certify the Japanese correction.

Physical Pixel 8a audio quality/speed, model cache/reload/offline behaviour, Piper↔Piper Plus switching on one device, TalkBack, narrow-viewport ergonomics, the full voice-licence attribution path and host-visible MCP continuity are still separate checks. Do not infer successful real-world learning from card flips or playback.
