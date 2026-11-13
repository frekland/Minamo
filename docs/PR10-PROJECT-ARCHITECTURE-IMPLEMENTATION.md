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

## Deployment — original V178 implementation

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

At the original V178 implementation deployment, the connector catalogue was cached
and the routine form could not yet be exercised. Four subsequent schema-adapter
corrections were deployed. The fresh-catalogue routine test has since PASSED,
as documented below. Mobile viewport emulation was unavailable in the earlier
browser session, but no frontend component or responsive CSS changed in this PR;
therefore mobile re-acceptance is not required for this server/MCP-only slice.
Live learner-edit protection was not manufactured through GPT authoring; the
existing focused ownership/protection regression remains the evidence for that
boundary.

## Latest schema-adapter deployment and fresh ChatGPT acceptance (2026-11-13)

After the original deployment, client-side connector conversion exposed three
successive problems: an opaque root union, opaque parts intersections and
content-variant conversion. The PR added a dedicated public routine schema
adapter with concrete part-kind alternatives, preserving canonical server
validation. The final schema-adapter implementation is GitHub commit
`01a47818b7ffc82a77ee61e592688351dbde4c48`, matching the reported
native Sites source `9c3d68cb1a2f62e174fd23a2df644c458689ea5e` by
application tree `94bc4553ddd5779b1819a2fcf47ed123a0d55327`.
Latest reported successful deployment:
`appgdep_6af732b0504c8191b5f1e97132eb5d3b`; saved version:
`appgprj_6aeba0aa528c81918be19dd51427b2cb~appgver_4b0fbe8fe6a481919bf147483ac48285`.
Focused MCP regression tests: 3/3 passed; typecheck and production build passed
for that correction. No later deployment is needed for documentation-only changes.

**Independent fresh-chat owner acceptance: PASS (12/12).** The owner supplied
a live connected ChatGPT transcript/result covering tool discovery, typed routine
schema exposure, synthetic Project orientation, paragraph preview/apply/exact
readback, structured-table preview/apply/exact readback, replay protection,
stale-revision rejection and original canonical content preservation.

- Synthetic fixture: `pr10-synth-computing-20261113`, context `parser`,
  Project revision **1 → 2 → 3**.
- Paragraph operation: `pr10-accept-computing-paragraph-20261113-1606`;
  purpose `explanation`; generated page
  `page-pr10-accept-computing-paragraph-20261113-1606` and part
  `material-pr10-accept-computing-paragraph-20261113-1606-1`.
- Table operation: `pr10-accept-computing-table-20261113-1609`;
  purpose `reference`; generated page
  `page-pr10-accept-computing-table-20261113-1609` and part
  `material-pr10-accept-computing-table-20261113-1609-1`.
- Structured table headers/rows and caption survived exact readback; the
  canonical tab-separated representation was generated by the server.
- Replay returned `{ "status": "committed", "replayed": true }` and did not
  duplicate content. A separate stale-revision request returned
  `revision_conflict`, recovery `inspect-before-retry`, without mutation.
- Both pages were placed in the existing `parser` context under its `overview`
  layout. This was deterministic and valid; whether educational purpose should
  influence *presentation mode* is deferred to the reader work.
- The test used the connected live Minamo plugin; no Notes or genuine learner
  Projects were modified. The owner reported all 12 requested checks passing.

**Acceptance disposition:** Close the routine authoring/schema exposure gap.
The client flattened the typed variants into accessible fields, which worked
for both paragraph and structured-table persistence. No further schema
correction is indicated by this acceptance. This does not prove universal
compatibility across all models or all 11 content variants.

## Deferred next slice

- Compare a coherent default Project reader with a small number of genuinely
  functional page-level modes (for example evidence comparison or runnable
  workbench), rather than styling six nominal whole-Project patterns.
- Review legacy Projects that already contain duplicate canonical block
  placements before considering any automated repair; this slice performs no
  data migration.
- Broader presentation refinements that do not arise from the new projection
  contract remain out of scope.
- Routine authoring fresh-connector acceptance is now complete; mobile testing
  belongs to the next frontend reader implementation, not this backend-only PR.
