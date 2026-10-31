# Sites V87 — local three-by-three Project replay corpus

**Released 31 October 2026** to the existing [Minamo Site](https://minamo.jscymru.chatgpt.site). This is a bounded **source/test-only** promotion of the fictional Project replay corpus, not activation of a hosted nine-persona controller, an owner-run GPT evaluation, or a physical prototype.

## Public source and native publication

| Boundary | Verified receipt |
| --- | --- |
| Public source | [Mood-to-Music privacy #60](https://github.com/frekland/Minamo/pull/60) at `edc5dd26d3010e0ee2e2817d173f1f8329323c6a`; [retired HTB Cap #61](https://github.com/frekland/Minamo/pull/61) at `5bc8b124ff18e06b1c6df5d806ea002dcc52c5fc`; [Plant-Screamer and corpus matrix #62](https://github.com/frekland/Minamo/pull/62) at `d352339453b46f17f4a30d2aa82036389de929fd` |
| Exact approved public `main` tree | `4efbc4205f4896381ec651484a7dce9d92fe32cf`; matched the selected public candidate tree after #62 squash |
| Previous Site | V86 native source `f5c604062f7a6829f3121424d6223a8424615523` |
| New Site | V87, native source `5249a2e55f2eafcea1ac72052a1311e919ab141e`, pushed fast-forward to the existing native Sites Git `main` |
| Production | Saved V87 and standard deployment **succeeded** at the existing Site URL; MCP enabled; runtime environment set revision **9** |
| Audience | Existing **custom** access unchanged, policy revision **1**, two allowed entries including one external visitor |
| Local compressed archive SHA-256 | `0477fb4fc13e2c91d2d9dbedd86ca430ac7841588b276afd9b7f052c57263607` |
| Provider stored-archive digest | `sha256:1bbcbe6a5eeaf77c3cc87719a069c1766673d6b84252001363f82dfc54d8f7ad`; 506 files, 27,873,280 bytes |
| Rollback target | Saved V86 and its native source SHA above remain the preceding published version |

The local compressed-file digest and provider stored-archive digest refer to different reported representations; they are **not** asserted byte-identical or a cryptographic attestation of executing Worker bytes.

## Exact 37-file source-transfer manifest

The following files were individually selected and checked byte-for-byte against the approved public tree before transfer. These were the **only** staged native source changes. Native-only `.openai/hosting.json`, origins, access policy, storage/MCP bindings, branding and unrelated app source were untouched.

| Ported path | SHA-256 |
| --- | --- |
| `scripts/ci-focused-tests.mjs` | `679d27210d1f4e863b44aa9706ce77b5a52f3d6b32c5f5797ff43d14c28b5938` |
| `tests/ci-focused-tests.test.mjs` | `e04e7d663794ea01319ff33bfdadaae71058a89f26e7d3dbe783ad255b1fb4d9` |
| `tests/project-scenarios/mood-to-music/seed.mjs` | `bbf0ec873c555419f0c246590d120b106a305340fd416d88f9b558ffcfba0c5b` |
| `tests/project-scenarios/mood-to-music/README.md` | `401b483e612529c6fc7625e79f830e1c27b6d76683229047aaa65cf17b65fc75` |
| `tests/project-scenarios/mood-to-music/variants/replay-overlay.mjs` | `a51bf89f6660fcab307ac1f79a32e022b496bba7f1040a75ff4f3132c2f8f21f` |
| `tests/project-scenarios/mood-to-music/variants/weekend-prototyper.mjs` | `fa1cb866a4fe58a2ec8d2b6aaa5a36d221aefb5be7fb695bf2fce0f9f9d9402d` |
| `tests/project-scenarios/mood-to-music/variants/documentation-sceptic.mjs` | `b05c27d0cdd532500e8cf4c4669383a4c6baf324a195d7cace64342dcca79642` |
| `tests/project-scenarios/mood-to-music/variants/privacy-reviser.mjs` | `59b6ba181a4328c0a5d80368f0e479df45892496bb9eaf7e8bf902cff7bc4de4` |
| `tests/mood-to-music-weekend-variant.test.mjs` | `46f068308f20d61cc1369c3d7eea373d45eaecfb2e7ada153ae1113cc5939b1d` |
| `tests/mood-to-music-docs-variant.test.mjs` | `c7c3fb294f93c47b5dde9b4c133837ec3c58ffaa2d9dca495ebe690dd3a37c12` |
| `tests/mood-to-music-privacy-variant.test.mjs` | `6799783849136ff6e50028d2659cb46b1c43c917a6aeb9bfb1cf7ed2553c79bf` |
| `tests/project-scenarios/shared/subject-replay.mjs` | `baa2c65676f065133bb5922153e8dfc50361114bdcaf401bf1213efc313075b6` |
| `tests/shared-subject-replay.test.mjs` | `7b1ed74506be3b307946fcdcc2294fd11c80d11bd8b4862802d4266947dd2b94` |
| `tests/project-scenarios/retired-htb-cap/subject.mjs` | `3ad961fe355b981515f7f3737d2e8985144404cf49d4b83c459070cc13781ca8` |
| `tests/project-scenarios/retired-htb-cap/README.md` | `84f2a96d755dac276cc4de03d2763a18189d5de54840de596282277f0fe5d9c6` |
| `tests/project-scenarios/retired-htb-cap/variants/command-log.mjs` | `37059c10ae8ecae2fdb90f91e07ecc32eb3d5a790f2fd6994dd71650e2007bac` |
| `tests/project-scenarios/retired-htb-cap/variants/packet-model.mjs` | `bcd06b0a0320d0a28808d2123fb35007969ecdb78b16f3e653576b5448ab6b2b` |
| `tests/project-scenarios/retired-htb-cap/variants/sparse-return.mjs` | `4036b7f05ee5628d4e6a49f1527adc2cb21e56fb6b8c1b57076752021f7eae63` |
| `tests/retired-htb-cap-scenario.test.mjs` | `3b7520200fb82366d84ea631e7c806444da3d8d3d9d7e38f4d9731c8f6bb6ccf` |
| `tests/retired-htb-cap-command-log-variant.test.mjs` | `e2cb092347ed56f0f4f5bf162958d01030a08f143cdd39ad9e6f814bd938936d` |
| `tests/retired-htb-cap-packet-model-variant.test.mjs` | `6b5b2f337de67e488ec80669cac8150dd52d209b7144387c24c57783e56c4191` |
| `tests/retired-htb-cap-sparse-return-variant.test.mjs` | `f909edfe10338f185ed9738488e123af8da611b91a2887f38c1cb19056083e54` |
| `tests/project-scenarios/automatic-plant-screamer/subject.mjs` | `fa155fbf34dbcda1c35568b16eefbbea0dad9788c724620c790dd8403c153096` |
| `tests/project-scenarios/automatic-plant-screamer/README.md` | `07761803901c83e6cc377ebcd1000881998b616a7ad8a4b65d30c56304c967e3` |
| `tests/project-scenarios/automatic-plant-screamer/sensor-model.mjs` | `ad74b949d785edcdf12af1716990a4b1ddb44b889f80a2f6b9c3164119b145f9` |
| `tests/project-scenarios/automatic-plant-screamer/variants/breadboard.mjs` | `c15f88632aa730fa64857a0dd5aeed1eef6b7253422fb86aa9e85caf9e75f8f3` |
| `tests/project-scenarios/automatic-plant-screamer/variants/calibrator.mjs` | `eb1d65dd2f4ed206d733ad31bb5c4d3cf79996e0ea583f388e68bce4b0f76ce0` |
| `tests/project-scenarios/automatic-plant-screamer/variants/shared-space.mjs` | `4777f05eac7d5e2218b15e400dc718107acf14f904a4529c07a96223955a5541` |
| `tests/automatic-plant-screamer-scenario.test.mjs` | `f329554fef212f63e7cbf63c0adcaad1e23e06341cda9dce2050a43071ee9677` |
| `tests/automatic-plant-screamer-breadboard-variant.test.mjs` | `528faad0696effa96e0a3da67d12d27eaf377291de9e7f9a19c6eed711d790fd` |
| `tests/automatic-plant-screamer-calibrator-variant.test.mjs` | `2635d9163fbd50fe6188b02c144e9ba79fe0a64eccd0e0935aeec12854b6158b` |
| `tests/automatic-plant-screamer-shared-space-variant.test.mjs` | `c4b2e83432bd6f47509014e6d75c5d1ae1548709008434ef046b4ffb01538e0f` |
| `tests/project-scenarios/corpus-registry.mjs` | `1c74a9c2daee9ddb53c8154d641df1a793263f4885363e60c9aeb35086f691a5` |
| `tests/corpus-matrix.test.mjs` | `b996284dbb333bf89a1a8c04ddf8d7294d68041b3115aeac7f1288d729ad69c2` |
| `docs/TESTING.md` | `d3b7ef2b1b741ee2d99bbdb763bbff41d5b19a6a33fa34d55fd9c29a40f5f112` |
| `docs/PROJECT-WORKBENCH-IMPLEMENTATION-HANDOFF.md` | `2617b1a8270146cd5c0580ca90b7c27bcf298e69d45b33d90df81f0d38427f30` |
| `docs/acceptance/2026-10-31-three-by-three-local-corpus.md` | `a61f78cecf4dac1c60e552baa4cc84992ba22d721a4a17283f8223247f8ac035` |

## Automated acceptance and local test evidence

- [#60 ready PR](https://github.com/frekland/Minamo/actions/runs/41239964608), [#61 ready PR](https://github.com/frekland/Minamo/actions/runs/41239481222), [#62 ready PR](https://github.com/frekland/Minamo/actions/runs/41241009203) and [#62 post-merge `main`](https://github.com/frekland/Minamo/actions/runs/41242041885): **successful** GitHub Actions review/main gates. They include source typecheck, full production build, complete regression and applicable Mood-to-Music browser acceptance.
- Exact native candidate: `pnpm run typecheck`, `pnpm run build` and Sites Worker archive preflight **passed**. The full native regression under `TZ=UTC` reported **1,516 passed, 4 skipped, 0 failed** (1,520 total).
- The first native full run inherited an `America/New_York` executor timezone and failed a pre-existing calendar-date assertion on a midnight UTC timestamp. Its isolated test then passed **5/5** with `TZ=UTC`, followed by the clean full UTC rerun. No product-code or test-expectation edit was used to suppress the discrepancy.
- Nine locally opt-in personas span three fictional subjects: Mood-to-Music, retired HTB Cap and automatic Plant-Screamer. Tests exercise strict subject/variant selection, source-linked revision history, immutable retained editions, isolated F/H/K replay, same-owner and cross-owner separation, stale revision rejection, and deterministic Plant ADC simulation. All use disposable local Miniflare D1/R2.
- The native source push and published version were verified by SHA; Sites readback reported V87, MCP enabled and environment revision 9. Subsequent Site readback confirmed the **entire custom access policy** unchanged.
- No hosted fixture reset/advance, Site migration, owner learner-data write, or live third-party/laboratory/device execution was performed for this release.

## Honest remaining acceptance gates

The shipped corpus is **not** an installed nine-variant GPT/MCP scenario selector or a hosted 3×3 test run. [Issue #12](https://github.com/frekland/Minamo/issues/12) Gate 1 still needs explicit host scenario/variant selection and manifest-aware cleanup, canonical operation/transcript/observer reconciliation across subjects, and the source-linked F/H/K retrieval-efficiency diagnosis tracked in [#14](https://github.com/frekland/Minamo/issues/14). Human learner outcome assessment, independent complete host audit, and a physical Plant sensor/audio trial are separate unverified gates. Do not infer their success from a local D1 replay or from Sites publication.
