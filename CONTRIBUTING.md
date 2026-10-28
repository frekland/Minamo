# Contributing to Minamo

Thanks for taking an interest. Minamo grew from an individual learner's experiments, and the aim of opening it up is to meet people who enjoy thoughtful learning tools and improve it together.

You do not need to be an expert. Useful contributions include accessibility fixes, clear bug reports, tests, documentation, code review, design critique and small improvements discovered through actual use.

## Before you begin

1. Read the [README](README.md), [Architecture](docs/ARCHITECTURE.md) and [Getting started](docs/GETTING-STARTED.md).
2. Search existing issues and discussions before starting a substantial change.
3. For a sizeable feature or architectural change, open a discussion or issue first. The maintainer is a volunteer and may not have capacity to support every direction.
4. Keep each pull request focused. Explain **why** it improves real use, not only what it adds.

## What a useful pull request includes

- A concise description and, for UI work, before/after screenshots using synthetic fixtures.
- Relevant tests and results: `pnpm run typecheck`, `pnpm run build` and `pnpm test`.
- Any limitations, manual steps and affected data or security boundaries.
- Appropriate source and licence attribution for third-party material.
- A note if AI tools materially generated or changed the code, with your own review of its behaviour.

Please do not submit production data, personal learner records, private Site identifiers, secrets or third-party copyrighted teaching material without appropriate rights.

## Design approach

Minamo should stay comfortable for everyday learners. Prefer clear interfaces, meaningful relationships, genuine evidence and continuity over feature counts, automatic AI prose or complicated configuration. Real specialist tools should remain specialist tools; Minamo connects and examines the learning around them.

## Contribution licensing

Minamo's original code is [MIT-licensed](LICENSE), so contributions to the core application should be suitable for inclusion under MIT. By submitting a pull request, you confirm that you have the right to contribute the material under those terms and that you have disclosed any third-party material and its separate licence. You retain copyright to your own contributions; the project does not require copyright assignment.

The **Minamo name and logo artwork are not generally licensed for rebranding other projects**. See [Notices](NOTICE.md). For imported artwork, character datasets, audio or vendored code, preserve the upstream authors' terms and attribution in [Third-party notices](docs/THIRD-PARTY.md).

## Review expectations

This is a non-commercial, volunteer-maintained project. The maintainer will review when time permits and may decline features that create ongoing maintenance work or make Minamo harder to use. Courteous disagreement and evidence-based critique are welcome.

For vulnerabilities, **do not open a public issue**; see [Security](SECURITY.md).
