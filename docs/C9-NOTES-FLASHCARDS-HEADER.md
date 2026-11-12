# C9 — Notes, flashcard and header refinement

9 November 2026, following V146. This is a reversible visual/interaction pass on the existing production Site; no server contracts or stored learner records are changed.

## Notes

- The persistent bottom Notes bar is the desktop tab strip whether the writing dock is open or not. The dock no longer repeats the tabs, avoiding clipped titles and competing selection controls.
- At narrow mobile widths, where that bottom bar is absent, the dock uses one compact open-Note selector with rename, close and create affordances. Closing a tab retains its Note. Recent Notes remains the way to reopen a closed Note.
- The editor, pending writes, revision checks, and Note sources are unchanged.

## Flashcards

- Play and slow-speech controls sit in a reserved area within the flashcard rather than above it. They are separate buttons overlaying the card, so the card's own flip button is not nested around them.
- Flip remains quick (0.3 s), with a simpler `easeInOut` turn; changing cards now uses a short fade rather than horizontal entrance/exit with scale. No shifting card layout when Japanese playback is available on one face only.
- Swipe/drag navigation, reverse, cloze, shuffle, reset, keyboard and reduced-motion behaviours remain available.

## Navigation

- On wide screens the top header now offers Home, Projects, Library and Your work. Existing left navigation stays in place for comparison; the top links use the same navigation and learning-space state.
- The left sidebar receives a subtler canvas/surface blend to visually recede. Top links collapse at narrower widths; existing mobile navigation remains.

## Verification

- `pnpm exec tsc --noEmit`
- `pnpm build`
- Focused Notes and Project content tests, plus navigation tests.
- Desktop/mobile browser acceptance after deployment: top links, active state, dock versus bottom Note tabs, mobile selector, speech controls and flip stability.
