# C8 — Notes and Project interaction polish (9 November 2026)

This small follow-up to C7 corrects visible UX problems without changing the saved-work, Project, Library, or MCP contracts.

## Changes

- Replaced technical, record-identity-oriented waiting copy with neutral loading skeleton announcements, including retained reading and passage states.
- Gave the Notes window title/save state and its controls separate header rows at narrow dock widths; tightened pinned-page controls, selected-tab visibility, and tab scrolling. A selected Note now gets a short in-place transition that keeps the editor mounted and preserves its draft, scroll state, and rich editor history.
- Unified typography in the desktop Notes bar and its recent-Notes launcher; removed the intrusive tab-strip scrollbar while retaining horizontal keyboard/pointer scrolling and active-tab visibility.
- Consolidated Project-level favourite and Project-details actions beside the Project heading. The section editor remains a single pencil beside its section; nested Reader favourite controls no longer float underneath the section introduction.

## Verification

- `pnpm install --frozen-lockfile` (restores the already-locked C7 Motion dependency in a fresh checkout).
- `node --test tests/notes-writing.test.mjs tests/project-reading-topics.test.mjs tests/multi-layout-notes.test.mjs` — 19 passing.
- `pnpm exec tsc --noEmit` — passed.
- `pnpm build` — passed; pre-existing Vite/Piper bundle warnings, no errors.

## Follow-up

Cloud-browser acceptance should inspect a narrow Notes dock with multiple tabs and a Project section, and check reduced-motion settings. No Note/Project content migration or persisted-data deletion is part of C8.
