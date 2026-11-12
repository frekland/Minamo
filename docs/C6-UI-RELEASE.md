# C6 — Notes, Library, Settings and navigation

Owner-approved presentation iteration following the C5 production browser review.

## Native-only adaptations

- Notes use the visible tab and pencil as their sole title/rename surface. An empty draft can still be discarded via Note options, while the editor preserves its independent save and recovery logic. Narrow Notes docks use container-based formatting controls.
- The four primary navigation destinations remain Home, Projects, Library and Your Work. The legacy Tools route stays available to existing deep links, without a sidebar entry. Trash is in Your Work, including the existing deliberate Empty Trash control and its confirmation/receipt safeguards.
- Library subject cards, compact rows and article entries receive presentation changes only. Existing subject memberships, exact reading links, authored ordering and source permissions are unchanged. Card/list preference remains reversible.
- Settings now separates Appearance, Reading, Languages, Workspace and Data. Theme/density join the existing device-scoped presentation preferences; furigana uses the existing global toggle preference. No server-side preference schema, ownership or recovery changes are made in C6.

## Verification scope

Run a native production build, typecheck and focused Settings, Notes, Library and navigation tests, followed by a signed-in desktop/mobile browser smoke check. The historical full suite is not part of a routine UI release. Local Library paging tests can need their worker fixture and should not be mistaken for proof of a presentation regression.

### Post-deploy browser polish

The live signed-in C6 pass confirmed Library card/list navigation, the retained Trash restore/empty affordances under Your Work, the Notes dock on desktop, and the full-screen Notes editor at phone width. Follow-up styling makes Settings an opaque semantic-token surface in both themes, fits all five Settings categories on narrow phones without a native horizontal scrollbar, and gives Library headings a more specific compact heading rule than the older reader stylesheet. Light theme also rebinds the legacy `--v2-*` aliases inside its scope (root-computed aliases otherwise remained white on white) while the brand/navigation chrome stays charcoal, including the top bar. No content or server transaction was changed in this follow-up.

## Deferred refinement

- Optional account-synchronised display preferences require a separate bounded server API and ownership tests.
- Further light-theme contrast across specialist editors and browser-specific Notes toolbar ergonomics can be revisited against feedback, with charcoal remaining the unchanged default.
- Library presentation is safe to revise independently of authored material.
