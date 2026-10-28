# Public-release checklist

This checklist records the public-source preparation and the remaining maintainer work. The repository was made public on 28 October 2026. PR #2 is still open and draft; it has not been merged.

- [x] Start a fresh repository without private source history.
- [x] Copy application source, relevant synthetic fixtures and development tooling.
- [x] Exclude historical commission/evidence archives and private learner records.
- [x] Replace hard-coded private Site origins/project ID in tracked code and configuration.
- [x] Replace externally sourced Noun Project UI icons with original simple vectors.
- [x] Preserve available third-party code, character-data and audio attribution.
- [x] Add README, architecture, development history, onboarding, security and contribution guidance.
- [x] Select MIT for Minamo-original code/docs; preserve third-party licences and separate the branded identity artwork.
- [x] Have the maintainer confirm rights to redistribute the brand images (28 October 2026).
- [x] Complete the source and personal-data audit; no live credentials, production database identifiers or live learner records were identified in the audited source. The maintainer accepts the personal email present in the original three-commit metadata.
- [x] Run clean install, typecheck, build and tests from the exact release branch archive.
- [x] Run the local development preview from a clean checkout; HTTP 200.
- [x] Receive the maintainer's approval to make the repository public; visibility is now public.

## Next maintainer steps

- [ ] Review and decide GitHub community settings, branch protection and whether private vulnerability reporting is enabled.
- [ ] Review and merge PR #2 when ready. Its MIT licence, notices and corrected README are on the PR branch; they are **not yet on `main`**. The current `main` README still says the licence is to be selected, and `main` has no `LICENSE` file. Until PR #2 is merged, do not describe the default branch as MIT-licensed.
- [ ] Independently assess security assumptions before claiming general-purpose self-hosting.

## Verification record (28 October 2026)

- Node.js 24 and pnpm 11.25.0.
- `pnpm install --frozen-lockfile`, `pnpm run typecheck` and `pnpm run build`: pass.
- `pnpm test`: 1,442 passed, 0 failed, 4 skipped.
- Local development preview: HTTP 200.
- Production Wrangler localhost startup was blocked by the execution environment's `uv_interface_addresses` error. This is an environmental limitation, not a demonstrated application failure.
- GitHub Actions run 40722443418 failed before executing steps; its cause was not confirmed. The PR branch has no successful status checks recorded. This is not evidence of an application test failure.

The live private Site is not affected by this checklist. Source publication does not make this build ready for independent hosting: authentication and MCP publication currently depend on ChatGPT Sites identity and hosting capabilities. A provider-neutral authentication layer is separate future work.
