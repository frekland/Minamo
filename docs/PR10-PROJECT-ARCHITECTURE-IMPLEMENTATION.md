# PR #10 — Project architecture implementation

## Scope

This bounded first slice implements the shared reading-projection and routine
authoring priorities from the Project semantic-composition RFC and V177 audit.
The original RFC and audit remain unchanged as historical design evidence.

## Structural guarantees

- Reading topics are ordered by their visible destination section. Stable
  origin placement and page order break ties within a destination.
- Hiding an origin layout no longer suppresses a page deliberately routed to a
  visible destination. A hidden block or hidden destination still suppresses it.
- A canonical Project section may be placed through only one content block.
  Cross-section reading destinations and exact relationships reuse its identity
  without copying canonical prose.
- New reading-page references are admitted against an exact current eligible
  record, rendition, section and part. Their current record revisions are added
  to the existing transactional guards; unavailable or stale targets reject the
  write with an actionable error.

## Routine MCP authoring

`append_project_learning_material` now supports an ordinary intent form:

- exact `projectId` and revision/generation guards;
- an exact existing `topicId` or `contextId`, or a visible destination plus a
  new context;
- `educationalPurpose`, title, typed rich parts and caller-declared exact
  relationships/references.

Minamo deterministically generates omitted part, page, block and canonical
section IDs and selects a safe existing destination. It does not infer an
educational purpose or relationship. The previous explicit layout/slot/pages
form remains available for advanced composition. Both forms use the established
Project writer, CAS, permission, replay, direct-edit protection and Note denial.

## Compatibility and boundaries

No Project store, database migration, mandatory lesson structure, progress
model or presentation redesign was introduced. Existing canonical sections,
passage identities, retained editions, Work threads, code packages, rich parts,
learner contributions and annotations continue through the same record and
composition contracts. GPT Note creation, mutation and pinning remain denied.

## Local qualification

- Focused Project projection, MCP authoring, global editing and Note-ownership
  tests: 14/14 passed.
- TypeScript: `pnpm typecheck` passed.
- Production build: `pnpm build` passed.
- Full historical suite: intentionally not run under the bounded release policy.

## Deployment

- GitHub PR head: `5d3e7b4fb24fe953766a2524350f5b6ae94c87e9`.
- Native Sites source: `241bdabe7cd27745ff78e99cafa47aae8db52f14`.
- Both commits have the identical source tree
  `09ffa58e5989587baf6799de86bb31342662d608`.
- Site version: V178; saved version
  `appgprj_6aeba0aa528c81918be19dd51427b2cb~appgver_ece6deefe6c48191a62c2d276026f934`.
- Deployment: `appgdep_6af709eeea50819182edd6c3de4c0e7e`, succeeded
  with MCP enabled on environment revision 5.
- Release archive SHA-256:
  `d94eeb92b63a60e45c5eea182ab363ee13ebefd89b8fa690610f1c4e11e2c232`.

## Live acceptance

Three isolated synthetic Projects were created: Japanese conversation,
computing/Python and open research. No genuine learner Project or Note was
modified.

- A compact outline oriented the client to each Project; an exact context read
  returned four complete pages per Project without a full Project read.
- Cross-section destination order, context grouping, canonical section/part
  identities and declared exact relationships remained stable in all three.
- The existing advanced append route previewed, applied and replayed safely.
  A new operation using a stale revision was rejected with `revision_conflict`.
- An indirect GPT Note batch was rejected with
  `gpt_note_authoring_forbidden`.
- Browser acceptance at 1363 × 936 confirmed section/topic navigation,
  Japanese furigana, code, table, callout and research-comparison rendering.
  No duplicated canonical prose, progress UI or administrative learning text
  was introduced by the implementation.

The installed connector in this conversation retained the pre-deployment typed
schema for `append_project_learning_material`. Consequently the new routine
intent form could not be invoked through this cached client catalogue. It is
deployed and covered by focused server tests, but fresh-catalogue live invocation
remains unverified. Mobile-sized browser emulation was unavailable in the
connected browser, so responsive acceptance is also explicitly outstanding.
Live learner-edit protection was not manufactured through GPT authoring; the
existing focused ownership/protection regression remains the evidence for that
boundary in this slice.

## Deferred next slice

- Compare a coherent default Project reader with a small number of genuinely
  functional page-level modes (for example evidence comparison or runnable
  workbench), rather than styling six nominal whole-Project patterns.
- Review legacy Projects that already contain duplicate canonical block
  placements before considering any automated repair; this slice performs no
  data migration.
- Broader presentation refinements that do not arise from the new projection
  contract remain out of scope.
- Repeat the routine authoring and mobile checks from a fresh connector/browser
  catalogue; do not redeploy merely to clear client-side schema caching.
