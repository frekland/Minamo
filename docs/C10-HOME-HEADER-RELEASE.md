# C10 — Header navigation and Home

Owner-directed native Sites UI release, 9 November 2026.

## Native changes

- Retire the desktop/mobile left navigation rail and drawer. Keep Home, Projects, Library, and Your Work in the persistent top navigation; use an accessible compact menu when width is limited. Show the Minamo name beside its small wave mark in the desktop header.
- Give Home a dedicated landing composition with the large original Minamo identity asset, actual Projects, recent Library articles, real Notes, and existing Favourites. Avoid achievement/checkpoint language, invented recommendations, or marketing taglines.
- Record only the IDs and timestamps of Projects/articles actually opened in this browser and owner scope. Sort those first on Home without treating background GPT edits as learner visits; fall back to current records where there is no device history.
- Prefer ordinary Projects over old TEST-labelled feature fixtures on the Home shortlist. The fixtures remain visible and accessible in Projects.
- Align the Projects page heading with its 1100px-wide catalogue instead of the left viewport edge.
- Align Project breadcrumbs to the Project reader's 1120px measure.
- Reuse the existing scoped query, Note read, favourite-removal/recovery and SPA routing paths. No new server schema, MCP protocol, protected records, or audience changes.
- Respect reduced motion and narrower layouts. Keep a manual Home refresh.

## Focused validation

- `pnpm exec tsc --noEmit`
- `node --test tests/home-visits.test.mjs tests/fast-home-favourites.test.mjs tests/projects-home-continuation.test.mjs tests/learning-spaces-navigation.test.mjs`
- `pnpm build`
- Authenticated desktop and narrow-screen smoke after publishing.

Full regression suite not requested and not run.
