# Public-source release checklist

The repository is public. PR #2, “Prepare Minamo's MIT-licensed community release,” was merged to `main` on 28 October 2026.

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
- [x] Obtain the maintainer's approval to make the repository public; visibility is public.
- [x] Merge PR #2 with the MIT licence, notices, CI configuration and release documentation onto `main`.
- [x] Configure GitHub community settings (maintainer-confirmed, 28 October 2026).

## Remaining maintainer work

- [ ] Review branch protection and confirm the private vulnerability-reporting route.
- [ ] Independently assess security assumptions before claiming general-purpose self-hosting.

## Verification record (28 October 2026)

- Node.js 24 and pnpm 11.25.0.
- Exact release-branch archive: `pnpm install --frozen-lockfile`, `pnpm run typecheck` and `pnpm run build` passed; `pnpm test`: 1,442 passed, 0 failed, 4 skipped.
- GitHub Actions run 40722443418, attempt 2, passed typecheck and build and reported 1,443 tests passed, 0 failed, 3 skipped. Its merge checkout was `bf3c0ba`, testing release source commit `3758c6d` against `main` at `917929d`.
- The first Actions attempt failed before a runner started. The maintainer confirmed billing caused the block; after it was resolved, the rerun completed successfully.
- The Actions workflow has read-only repository contents permission.
- Local development preview: HTTP 200.
- Production Wrangler localhost startup was blocked by the execution environment's `uv_interface_addresses` error. This is an environmental limitation, not a demonstrated application failure.

The GitHub Actions success was for the release application source before later documentation-only checklist updates. Those later changes did not alter application code. The live private Site is not affected by the release. The source is not yet ready for independent hosting as a general-purpose service: authentication and MCP publication currently depend on ChatGPT Sites identity and hosting capabilities. A provider-neutral authentication layer is separate future work.
