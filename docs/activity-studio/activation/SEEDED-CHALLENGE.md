# Publish a verified seeded variant — bounded content task

Prerequisite: owner-approved candidate release. Read lib/challenge-exchange/generators.ts and the exact MCP envelopes in CHALLENGE-PUBLISH.md. Reuse one of the six trusted seeded generators; do not generate arbitrary executable components or invent test outcomes.

Choose a supported seed, obtain its immutable checksummed package, run the existing independent red/green oracle locally, then compose/publish its original Activity through the same high-level typed call. Keep repaired source outside the starter package and ordinary client bundle. Return exact edition, file digests and a useful next question. User-submitted output stays supplied evidence.

Check `node --test tests/activity-exchange.test.mjs tests/activity-pedagogy.test.mjs`. No dependency, schema, privileged runner or migration is needed. Rollback only exact synthetic publication/attempt records via recoverable Trash.
