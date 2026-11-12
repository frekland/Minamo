# C7 — Selective interface motion

Owner-approved follow-on to C6's Notes, Library, Settings and navigation polish.

## Scope

- Adds **Motion for React** for retained, explicitly authored interactive content. Flashcards turn between front and back with a short 3D flip; advancing cards fades/slides the replacement, with a horizontal swipe gesture where motion is enabled. Existing click, toolbar and keyboard paths remain available.
- Revealing another Japanese dialogue turn uses a subtle entrance transition, and translations, glosses and explanations expand/collapse gently. The authored text, TTS controls, global furigana settings and existing following-scroll behaviour are unchanged.
- The existing Notes dock gets a short opening transition **without unmounting the editor or changing draft/save transactions**. Its dimensions, pinning and close/reopen behaviour are untouched.
- Suspended Your Work and interactive-material loading now use the existing shimmer skeleton component, with an accessible status label instead of diagnostic loading prose.
- Motion automatically disables when the device requests reduced motion or the Minamo motion preference is set to Reduce. It is not a prerequisite for navigation, revealing content or flipping cards.

## Explicit non-changes

No learning-space navigation, six Project layouts, section content, MCP contracts, Library records, server-side data, permissions, publishing audience, Notes persistence, or preference storage was changed. C6 already handled the other agreed Notes/Library/nav/Settings adjustments; C7 does not reimplement them.

## Verification

- `pnpm exec tsc --noEmit` — pass.
- `pnpm build` — pass. Pre-existing Vite warnings for Piper browser shims and large chunks remain.
- Focused checks `tests/notes-writing.test.mjs` and `tests/pr85-language.test.mjs` — pass.
- Broader selected tests also surfaced three **existing expectations against the revised C5/C6 interface** (`tests/learning-spaces-workspace.test.mjs` and `tests/project-ui.test.mjs`): they still expect the old labelled learning-space control and a `Checking saved work` placeholder. These are not checks of C7's changed interaction components. The full historic suite was deliberately not run.

## Follow-up

Live signed-in acceptance should inspect a populated flashcard set, a dialogue, Notes, the user motion preference and desktop/mobile constraints. Leave new polish distinct from feature or data migrations; revert C7 independently if the effects feel excessive.
