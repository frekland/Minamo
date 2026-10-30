# TEST ONLY — Mood-to-Music longitudinal Project

First SITES engineering fixture for issue #112. Every Project record, dialogue, Note, annotation, Flag and checkpoint is **fictional scripted test data**. The owner's actual private Mood-to-Music Project was inventoried in the issue but **never exported or seeded**. The app uses invented tracks; no Spotify credentials or live API interaction.

This extends the real V2 command/Project/checkpoint contracts using `tests/private-storage-fixture.mjs`, following `tests/journey-resume-fixture.mjs` and the PR30 mood/race foundation. It does not introduce new production tables, Project families or migrations.

## Recreate / advance / reset

From the repository root after a locked pnpm install:

```sh
node tests/project-scenarios/mood-to-music/replay.mjs A
node tests/project-scenarios/mood-to-music/replay.mjs D
node tests/project-scenarios/mood-to-music/replay.mjs E
node tests/project-scenarios/mood-to-music/replay.mjs reset
node --test tests/mood-to-music-scenario.test.mjs
node --test examples/mood-to-music/tests/revisions.test.mjs
node --test examples/mood-to-music/tests/browser.test.mjs
pnpm exec vite build --config examples/mood-to-music/vite.config.mjs
pnpm exec vite --config examples/mood-to-music/vite.config.mjs
```

The browser serves a synthetic runnable example (by default v5); use `?revision=v1` through `?revision=v5`. The five independently pinned source modules are analogous to source states, **not assertions of five historical owner Git commits**. Version v3 intentionally contains an async race, v4 guards it, and v5 changes product direction. The controller test drives adversarial completion/rejection order without delays or Spotify.

The runner **creates a new disposable Miniflare D1/R2 instance** for each reproduction, runs ordinary HTTP commands as a synthetic principal, and disposes it. `advance` applies one chronological state. `reset` disposes the old instance and reconstructs state A (or another selected state). The `reset` CLI rebuilds E twice and compares normalised readbacks. The inspectable manifest and seed operation source are the versioned logical export/import/replay recipe; this is *not* an owner D1 backup, a binary D1 export or a substitute for protected recovery. No destructive production reset or migration is involved.

## Causal paths and test boundaries

| State | Important retained relationship | Typical agent question |
| --- | --- | --- |
| A | Project Steps, linked Questions, authored Library reference | What is a hypothesis versus a verified source? |
| B | API feasibility Question rev 2, research Note rev 1, checkpoint | Why was live integration postponed? |
| C | v1/v2 source-linked Notes and explicit checkpoint | What changed in controls, and where is the code? |
| D | v3 faulty and v4 corrected code Notes, annotation/Flag on exact Article passage, race Question rev 2 | What failed, what is the evidence and which version corrected it? |
| E | Project body and stage structure revised (new personal-label stage with original stage identities retained), v5 pivot Note, earlier source pinned, research Note rev 2 while checkpoint preserves rev 1, unverified capability Note and unrelated garden record | Which direction is current, what was abandoned, what remains uncertain? |

Each state is a distinct replay of the **same Project identity**. Scenario dates are authored fictional timeline labels, not falsified persistence timestamps. Minamo's real runtime assigns record timestamps. Scripted GPT/learner dialogue is labelled as such and cannot be construed as the owner's transcript. Test-run results belong only in the PR evidence.

Each source revision file and its shared dependencies have pinned SHA-256 values in `manifest.json`; the test suite rejects an accidental rewrite without a deliberate manifest update. Actual future Git commits and build receipts should be added to the PR, never fabricated as older owner commits.

## Known next validation gaps

- A genuinely independent agent/MCP reading and visual browser walkthrough must be separately executed and recorded; local HTTP tests do not demonstrate fresh-chat GPT orchestration or user comprehension.
- The private Site has **not** been seeded, changed, reset or deployed. Owner backup/recovery preflight is still required before any later risky live structural experiment.
- The corpus is deliberately one Project subject. Other model subjects remain **OPEN for owner choice**.

**Public development extension (29 Oct 2026):** E now performs a genuine revisioned Project shape update; A–D deliberately retain the original four stages. `inspect` returns manifest-authored scenario dates separately from actual D1 record timestamps. Notes include version-specific source path and SHA-256 receipts (navigable source integration remains a later UI concern). Full public CI results are tracked in the public draft PR.
