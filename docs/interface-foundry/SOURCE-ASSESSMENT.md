# Frozen source and integration ownership

The authoritative commission is draft PR42 at `4b142876bf33257f06f266541ecfe5dce61a5771`. PR41 was read through connected GitHub before implementation. Its remote head `db33d9dbf0bf20cf2b174edc11a20c261f5bed0a` was compared file-for-file with the available local checkpoint `cc68b60`: all 963 Git-tree entries matched; common tree `f2bcd06bdcc9885e6e26a299e10f1bd8e9b9c51d`. The runtime checkpoint remains PR41's `8e7dd6067c258c72741f66a31368c52ad6eb9458` / local `50182d80108f90979150fc96573f399c7d97d6f2`, common tree `35f83453d76e71e3e7b78c2d7ecf207b35abfd5c`.

Work began in a separate local clone and branch `staging/interface-foundry-20261025`. The PR41 branch and original checkout were never edited. GitHub main at task start was `c40ebcc9a27bd2538ecf5b117a3eeba7f1229d1c`. Sites returned existing V27 and access revision 1; no source publication, save, deployment or access mutation was performed.

## Existing implementation reused

| Authority | Existing source | Integration decision |
| --- | --- | --- |
| Navigation, exact source and history | `app/workspace.tsx`, `lib/workspace-presentation.ts` | Reuse; callbacks prevent Activity/Atlas source links remounting Workspace. Studio now receives exactly the eligible Reader rendition. |
| Classic/Focus/Task | `app/layout-workspace.tsx`, presentation preferences | Preserve all three; Activity layouts are contextual compositions, not global modes. |
| Notes and atomic writing | `app/notes-panel.tsx`, `app/note-writing-editor.tsx` | One existing coordinator/editor. Correct redundant formatting-state updates discovered by a real long-input trial. |
| Activities, Attempts, rights and receipts | `lib/activity/`, existing domain/MCP/recovery | Optional strict presentation recipe added to actual Activity schema. No new record store, checkpoint or write queue. |
| Source formats and runtime lifecycle | `lib/foundry/`, existing adapters | Preserve source/hash/schema/provenance admission; add host lifetime fence and trusted explicit per-block view selection. |
| Atlas projection and graph/list UI | `lib/atlas/`, `app/learning-atlas*` | Improve existing components; no second graph authority or production tldraw enablement. |
| Browser and domain lab | Existing DEV Worker/D1 fixture pattern | New full Workspace laboratory, same domain/MCP, synthetic owner only; compiled production routes return 404. |

## Browser gap diagnosis

A clean checkout initially had an external `node_modules` symlink and no local execution-profile selection. The managed preview mount could not resolve that dependency path (`/site/node_modules/vinext/dist/cli.js`). Dependencies were made available inside the checkout, and the Sites-supported profile helper selected managed Linux. The supported `sites-preview` daemon then returned `http://terminal.local:4173/`; Chromium successfully opened the ordinary Workspace and `/preview-activity`.

This establishes a working environment for this run. It does not prove that the earlier PR41 connection refusal had exactly the same cause. No network permissions, sandbox policy or production authentication were weakened. The browser exercised real local MCP publication, hint retrieval, explicit Attempt saving and exact source readback before Interface changes.

## Scoped file ownership

The SDK agent owned recipe admission/catalogue/scaffolds; the Workbench agent owned Activity presentation and ephemeral view state; the design agent owned shared tokens and existing Atlas; the lab agent owned DEV fixture hosts and regression tooling; the independent challenger authored separate tests and source/browser findings. Parent integration owned Workspace callbacks, exact edition selection, lifetime hardening, performance measurement and release/source receipts. Three fresh restricted-context agents executed independent producer/activation/module trials with separate reports. Work was reconciled on the separate staging branch; no active PR41 source was overwritten.

## Release relation

PR39's admitted renderer bank is already selectively incorporated in PR41. Interface Foundry extends that exact combined tree. A future release should review the combined Interface candidate as the authoritative runtime tree; do not merge a second parallel frontend or assume merging a draft deploys a Site. Native source synchronisation, owner-approved merge/private deployment, hosted identity/MCP catalogue and physical-device acceptance remain separate release actions.
