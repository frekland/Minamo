# Sites V83: owner-only entry into the normal synthetic Project UI

Date: 2026-10-31 UTC  
Existing Site: <https://minamo.jscymru.chatgpt.site>  
Status: **deployed**; focused owner-gate rendering and read-only K comparison verified; browser visual acceptance remains open.

## Source identity

- Public `frekland/Minamo` `main`: `73352f7638bd8360a768cb77b2bc6fb36f7122af`, merged PR #40.
- Separate native Sites `main`: `1e9f5c615eba4df9b9dad3a382c5a11f4d455f8a`, fast-forward from V82 `2928fc59b5bf03ad99931d33cde90e7cce092c80`.
- Exactly seven reviewed paths were transferred. Their Git blob hashes were confirmed byte-identical between the public candidate and private native checkout:

  | Path | Git blob SHA |
  | --- | --- |
  | `app/page.tsx` | `2b60ae8733a03bb35bdfe48d0499450f27f96c3b` |
  | `app/projects-index.css` | `d012aeb7af233a1b2c8eda626e0db7431833f8f7` |
  | `app/projects-index.tsx` | `d1a814b304a53e6594fe6caf736c3858ad2b27ee` |
  | `app/workspace-presentation.css` | `ce8cce75279b8835f521a77aefafcc316ca7b931` |
  | `app/workspace.tsx` | `cef4db882c34e872d5856be0af9f6e42810db20b` |
  | `docs/SCENARIO-CONTROL.md` | `357bb276eb38c193f9bf939b687302e4c0aadc78` |
  | `tests/synthetic-visual-navigation.test.mjs` | `76940f2b3d45bd56387814cfe620858bf70e7180` |

No hosting manifest, storage binding, audience setting, source corpus, or user record was changed by this release.

## What V83 changes

The regular workspace already retrieved owner-scoped synthetic records. The gap was discoverability from Home, a missing `TEST ONLY` label on Project cards, and synthetic exclusion from *ordinary* Home/GPT continuation. V83 does not globally lift those production exclusions.

- A Home/Projects entry to the currently registered Mood-to-Music fixture appears only when the existing server-side scenario owner, authenticated identity, Site host and generation checks pass, the controller has an active non-pending phase, and the known epoch-scoped Project can be read canonically as synthetic.
- The link opens that exact Project through the **normal app route**, explicitly selecting the All learning space; its Notes, Questions, Flags and reading navigation remain their usual components. No bespoke test renderer or fixture mutation is introduced.
- Synthetic Project cards and exact opened synthetic records are clearly labeled `TEST ONLY`.
- A signed-out or non-owner request cannot receive the privileged owner entry. Ordinary users' Home/GPT continuation remains synthetic-excluding.

## Verification and release

- Public candidate TypeScript and production build passed; GitHub `Source checks` succeeded on final PR #40 head.
- Public full regression: **1,472 passed, 4 skipped, 0 failed**; focused final navigation/entry suite: **6 passed**.
- Native V83 TypeScript and production build passed; full native regression: **1,473 passed, 4 skipped, 0 failed**.
- Packaged `.openai/hosting.json`, `dist/server/index.js`, built client assets and public assets as a 528-file archive from the native source commit. Saved **Sites V83** and verified the production deployment succeeded.
- Access policy remained `custom`, revision `1`, with the same one invited external viewer. The URL and existing bindings were retained.
- Rollback reference: published **V82**, native commit `2928fc59b5bf03ad99931d33cde90e7cce092c80`.

### Read-only live K recheck

At the unchanged Mood-to-Music **K, epoch 3, revision 21** controller state, `compare-continuation` still returned:

| Admission | Continuation | Basis |
| --- | --- | --- |
| Ordinary production | “Define subjective suggestions” | `start` |
| Owner-only registered fixture | “Do personal labels survive refresh?” | `recent-note` |

Both reads were complete and `basisDiffers` was `true`. No load, advance, reset, transcript write or canonical data write was performed for this post-deployment check.

**Residual limitation:** a connected browser was not available to verify the new Home entry's actual hosted rendering, responsive layout, reading flows or accessibility. The rendered-component checks and production build are engineering evidence, **not** a screenshot or independently observed user interaction. Issue #18 should remain open until an owner-authenticated hosted visual walkthrough confirms those paths. Stage 2 server-observed MCP traces and stage 3 canonical state diffs remain separate follow-ups in #17.

This receipt contains no owner identifiers, private manifest fields, credentials or genuine learning records.
