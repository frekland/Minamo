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

Deployment and live acceptance revisions are recorded below after publication.

## Deferred next slice

- Compare a coherent default Project reader with a small number of genuinely
  functional page-level modes (for example evidence comparison or runnable
  workbench), rather than styling six nominal whole-Project patterns.
- Review legacy Projects that already contain duplicate canonical block
  placements before considering any automated repair; this slice performs no
  data migration.
- Broader presentation refinements that do not arise from the new projection
  contract remain out of scope.
