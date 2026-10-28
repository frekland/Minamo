# Third-party notices and content provenance

Minamo depends on many upstream open-source packages, listed with versions in `package.json` and `pnpm-lock.yaml`. Their individual licences continue to apply. The project does not grant a blanket licence to third-party artwork, audio or text merely by containing a file.

## Included source and assets

- `scripts/vite/sites-vite-plugin.ts`: vendored integration derived from the OpenAI Sites Vite plugin; see its adjacent MIT licence file.
- `vendor/shadcn-tailwind-4.13.0.css`: vendored styling with its adjacent MIT licence file.
- `lib/practice-character-data.ts`: pinned stroke subsets from KanjiVG (CC BY-SA 3.0, attribution included per character) and Hanzi Writer / Make Me a Hanzi (Arphic Public License, source and attribution included). See `public/character-licenses/ARPHICPL.txt`.
- `tests/fixtures/practice-audio/`: two attributed, converted Wikimedia Commons speech samples under CC BY-SA 3.0; the folder README describes authors, original sources and changes.
- `public/identity/learning-spaces/`: the previously supplied Noun Project icons were **not imported**; the clean source uses basic original line drawings instead.

## Before adding material

Check authorship, redistribution terms, attribution, modification restrictions and whether a licence applies to code, data or a standalone asset. External reference links are not permissions to reproduce the referenced text. Use synthetic data for tests; never import private Notes, transcripts or learner records as fixtures.

The maintainer should review the two branded Minamo logo images before publication and confirm that they may be redistributed under the intended project terms.
