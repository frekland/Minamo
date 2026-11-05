# PR #85 — Live language TEST Projects and V116 acceptance (5 November 2026)

## Status

- **Production:** existing Minamo Site [https://minamo.jscymru.chatgpt.site](https://minamo.jscymru.chatgpt.site), version **V116** successfully deployed.
- **Native source commit:** `fc93ce4bbcffa4298097b8c7fe50fae75555d072`.
- **Saved Site version:** `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_853db038c1c481918aa0e02617482dcf`.
- **Successful deployment:** `appgdep_6aec32e39ac8819196b0f818c5a6af1b` (status `succeeded`).
- Existing custom Sites access policy preserved; no migration, auth or audience change; PR #85 remains draft and unmerged.
- A preceding V115 archive was **saved but failed deployment** because the build emitted a `piper_plus_wasm_bg` asset of 60,068,571 bytes, exceeding the 26,214,400-byte single-file limit. V116 omits that bundled binary and contains a small, pinned same-origin JS glue asset instead; the large WASM is fetched on demand from upstream.

## Owner-authorised live TEST Projects

Created through `apply_project_update` with `expectedGeneration:"legacy@0"`, `expectedProjectRev:0`, unique retry-stable operation IDs and `synthetic:false` so the owner can see them in Projects. Each has canonical, authored content, six content sections and three native layout groups. The Project content is deliberately example material, not a claim of learner activity, progress or mastery.

| Language | Live record ID | Content focus | Voice |
| --- | --- | --- | --- |
| French | `test-language-french-pr85-20261105` | Polite café request; café/thé sentence variations; 3-turn service dialogue; reversible/cloze cards; conditional/future distinction; TV5MONDE source | Original Piper Siwis |
| German | `test-language-german-pr85-20261105` | Asking about a train; Berlin/Hamburg variants; station dialogue; reversible/cloze cards; dative `mit dem Zug`; Deutsche Welle source | Original Piper Thorsten |
| Japanese | `test-language-japanese-pr85-20261105` | Formerly fast `いろいろな国の人と自然に話して` in a full sentence; station/school variants; directions dialogue; reversible/cloze cards; は/が note; Japan Foundation Irodori audio source | Piper Plus CSS10 Normal/Slow |

Deep-link pattern, substituting an ID from above:
`https://minamo.jscymru.chatgpt.site/?view=journeys&family=journey&id=RECORD_ID`

These cover the six PR #85 learner-language additions: progressive reveal, finite sentence-pattern choices, staged dialogue, reversible/cloze cards, contextual correction, and separate authentic listening references. The optional TTS lives in the first four interactions. No GPT-generated speech scores or automatic achievement writes.

## Authenticated Cloud Browser findings

On the actual V114 site:
- All three new Projects were visible in the Projects directory with correct language scope and full content/layout.
- French: Siwis `Listen` reached `Replay` and `Stop speech`; translation/gloss/explanation toggled; café→thé selection changed exact source and translation; dialogue advanced.
- German: Thorsten `Listen` reached `Replay` and `Stop speech`; Berlin→Hamburg selection changed the exact sentence; dialogue advanced.
- Japanese: CSS10 button displayed Normal/Slow but initial G2P failed with `Cannot find module as expression is too dynamic`. The upstream package's runtime `import(url)` could not be resolved by the production bundler.
- Flashcards incorrectly offered source-language synthesis for English translations and incomplete underscore prompts.

The V116 correction (source code in `2026-11-05-pr85-v116-native-correction.patch`) uses `wasmLoader` with a same-origin, byte-exact copy of `piper-plus@0.8.2/dist/rust-wasm/piper_plus_wasm.js`; its SHA-256 is `94f1457dd226167e3673bcc959824c4cdb46c00ded56a094b8c98fd97b631aa1`. The 58 MB WASM still comes from `https://unpkg.com/piper-plus@0.8.2/dist/rust-wasm/piper_plus_wasm_bg.wasm`, never from Minamo's Site asset bundle. Flashcard voice only appears on complete target-language text; translated reverse faces and blank prompts remain readable but do not synthesize.

On live **V116** after reload:
- Japanese initial `Listen` progressed through `Downloading or opening Japanese voice…` and `Loading Japanese voice model…` into `Replay`; later sentence and dialogue speech reached `Replay`/`Stop speech`.
- The Normal/Slow selector changes and a subsequent play generated the `Replay` state. This is browser-state evidence, **not** a perceptual judgement of the audio or a measured duration.
- Japanese flashcard English answer had no Japanese speech control; a cloze prompt with underscores had no speech; revealing its complete Japanese answer restored the Listen control.
- Japanese station→school variation changed the full authored sentence and exact English translation. Dialogue revealed its second turn.

## Checks and honest limits

- `pnpm typecheck` passed.
- `pnpm build` passed for the final V116 source; audit of `dist` confirmed **zero files over 25 MB**.
- Focused `tests/pr85-speech.test.mjs`: 4/4 passed, including eight cases for flashcard target-language visibility.
- The long full legacy `pnpm test` run was started separately; do not claim the entire suite passed unless its actual terminal summary is captured. Prior V114 broad runs contained failures in older non-language UI expectations.
- Browser state proves on-device synthesis was reached; it does not prove acoustic clarity, perceptual difference between speeds or actual speaker output on the owner's Pixel 8a.
- Pending owner device checks: Japanese Normal `1.6/0.2` versus Slow `2.4/0.2`, especially the long clause; first/repeat downloads, switching between original Piper and Plus on one device, offline/reload, mobile 320/375px, TalkBack, and model-licence diligence.
- Human-recording source references are external links, not licensed audio byte uploads; their Minamo link cards say `Link only · unverified`. The authoring makes no claim they are already integrated media transcripts.

## Continuation

Keep the three TEST Projects visible for owner inspection. Do not silently edit or delete real learning Projects. If the owner finds quality/speed concerns on Pixel, fix the speech UI and model selection narrowly under PR #85; keep the broader charcoal UI redesign in its separate PR. Explicitly separate authored test content, browser playback states, and physical audio-quality judgement.
