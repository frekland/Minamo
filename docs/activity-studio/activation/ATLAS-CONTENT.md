# Use an existing Atlas lens — bounded content task

Prerequisite: owner-approved candidate release and MINAMO_LEARNING_ATLAS deliberately enabled after browser acceptance. Source contracts lib/atlas/types.ts and atlasQuerySchema in lib/atlas/service.ts; existing API /api/learning-graph and MCP get_minamo_learning_graph. No new graph database or migration is needed.

Choose route/constellation/river/galaxy and an exact Journey, Investigation or Library focus. Query a bounded neighbourhood, follow returned scoped cursors, and retain exact destination renditions. Synthetic records are excluded by default. A suggested edge is accepted:false and needs explicit review through the existing relationship API before becoming canonical; do not infer mastery or causation.

Verify `node --test tests/atlas-domain.test.mjs tests/atlas-projection.test.mjs tests/atlas-ui.test.mjs`. Rollback is disabling the feature on the same candidate; layout preferences and projection reads are not learning records. tldraw is a separate gated development lane, not required for these four views.
