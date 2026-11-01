# Third-party notices and content provenance

Minamo depends on many upstream open-source packages, listed with versions in `package.json` and `pnpm-lock.yaml`. Their individual licences continue to apply. The project does not grant a blanket licence to third-party artwork, audio or text merely by containing a file.

## Main project licence and brand scope

Unless a file carries separate terms, original Minamo code and project documentation are licensed under [GNU Affero General Public License v3.0 only](../LICENSE). This does not relicense third-party source, character data, media or other artwork.

The owner has confirmed that the Minamo logos may be published with this repository. The **Minamo name and branded identity artwork are excluded from the general AGPL software grant**; see the [brand notice](../NOTICE.md). The clean repository's Computing and Languages learning-space icons are original simple vectors and are included in the AGPL-3.0-only grant.

## Included source and assets

- `scripts/vite/sites-vite-plugin.ts`: vendored integration derived from the OpenAI Sites Vite plugin; see its adjacent MIT licence file.
- `vendor/shadcn-tailwind-4.13.0.css`: vendored styling with its adjacent MIT licence file.
- `lib/practice-character-data.ts`: pinned stroke subsets from KanjiVG (CC BY-SA 3.0, attribution included per character) and Hanzi Writer / Make Me a Hanzi (Arphic Public License, source and attribution included). See `public/character-licenses/ARPHICPL.txt`.
- `tests/fixtures/practice-audio/`: two attributed, converted Wikimedia Commons speech samples under CC BY-SA 3.0; the folder README describes authors, original sources and changes.
- `public/identity/learning-spaces/`: the previously supplied Noun Project icons were **not imported**; the clean source uses basic original line drawings instead.

## Before adding material

Check authorship, redistribution terms, attribution, modification restrictions and whether a licence applies to code, data or a standalone asset. External reference links are not permissions to reproduce the referenced text. Use synthetic data for tests; never import private Notes, transcripts or learner records as fixtures.

The maintainer confirmed on 28 October 2026 that the branded Minamo images may be included in this public-source preparation. Other supplied assets still require a rights review before inclusion.
