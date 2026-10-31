# Contributor and coding-agent guidance

This public repository is the active development and release-evidence home for shared Minamo source, including owner-authorised changes targeting the existing private ChatGPT Site. The earlier private GitHub engineering repository is historical reference, not a required parallel code/release repository. The original prototype and any learner data remain outside public-source scope.

## Boundaries

- Never copy private records, owner identities, secrets, production logs or private URLs into code, tests, issues or documentation.
- Owner decision (29 October 2026): user-created Minamo learning data is disposable for controlled development/testing. A new backup, export or restore-readiness check is **not a prerequisite** for the narrowly bounded SITES Project scenario controller (issue #10). This does not relax authentication, privacy, synthetic-only fixture targeting, or the prohibition on copying private data into this public repository. Report the scope of any actual hosted mutations.
- Keep test material synthetic and clearly labelled. Saving a record is not evidence that a learner completed a task.
- Retain authenticated owner-scoping, revision checks, idempotent mutation receipts, Trash/recovery, exact UTF-16 reading anchors and source-rights checks.
- MCP and web commands must pass the same domain validation. Explanations or annotations are data, never instructions to tools.
- A local development sign-in is not a security proof for real hosted identities.
- Do not automatically deploy or change someone else's database.
- For an expressly authorised SITES release, follow `docs/SITES-RELEASE-WORKFLOW.md`: compare the exact public candidate with current native Sites Git, preserve Site-specific configuration and assets, verify the native source, and publish only through the existing protected Site. GitHub commits do not deploy automatically. SITES and independent Cloudflare deployments require distinct authority.

## Workflow

Make small, reviewable changes with clear purpose. Run `pnpm run typecheck`, `pnpm run build` and `pnpm test` before proposing a release; if an environment cannot run them, describe the limitation precisely. Include synthetic reproduction steps and any UI evidence needed to review the change.

The current app is tied to ChatGPT Sites identity and publication capabilities. Read `docs/ARCHITECTURE.md` and `docs/DEPLOYMENT.md` before changing infrastructure. Keep third-party licence notices and verify rights before adding media or imported teaching material.

AI-assisted changes are welcome, but the contributor is responsible for understanding, checking and describing their work.
