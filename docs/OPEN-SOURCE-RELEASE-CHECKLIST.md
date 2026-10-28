# Public-release checklist

This checklist tracks the **private preparation**, not permission to publish.

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
- [ ] Independently assess security assumptions before claiming general-purpose hosting.
- [ ] Verify GitHub community settings, branch protection and availability of private vulnerability reporting.
- [ ] Obtain the maintainer's **explicit approval** before switching visibility to public.

## Verification record (28 October 2026)

- Node.js 24 and pnpm 11.25.0.
- `pnpm install --frozen-lockfile`, `pnpm run typecheck` and `pnpm run build`: pass.
- `pnpm test`: 1,442 passed, 0 failed, 4 skipped.
- Local development preview: HTTP 200.
- Production Wrangler localhost startup was blocked by the execution environment's `uv_interface_addresses` error. This is an environmental limitation, not a demonstrated application failure.
- GitHub Actions run 40722443418 failed before executing steps; its cause was not confirmed. Do not treat it as an application test failure.

The live private Site is not affected by completing this checklist. Source publication does not make this build ready for independent hosting: authentication and MCP publication currently depend on ChatGPT Sites identity and hosting capabilities. A provider-neutral authentication layer is separate future work.
