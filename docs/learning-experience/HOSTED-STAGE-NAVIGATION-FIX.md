# Hosted stage navigation correction — PR15 continuation

The first private PR15 application release (saved version11, native `a0c26766f997c19871c76e346adb052e2767906c`, GitHub implementation `e301b0ac91f50fb944cae6011ada30434ce8e493`, merge `f83b0e161a95128ebc26ae074fb676405d3c8859`, tree `1b3bf73d55f5812b16e64b89d9a1903ecbb06692`) passed456 tests and GitHub CI.

A real authenticated production browser walkthrough then found a significant defect that local unauthenticated fixtures could not reveal: clicking a stage within the same Journey set the exact-record state to loading, while the fetch effect only depended on record family/ID. Those dependencies had not changed, so no fetch could clear loading.

## Correction

`lib/record-navigation.ts` distinguishes record changes from in-record stage/passage navigation. `app/workspace.tsx` keeps admitted edition/context for the same record and only enters loading for a changed exact record. Explicit revalidation and adoption of a newer edition remain deliberate paths. Back/Forward applies the same record-identity distinction.

Regression tests run the serverReads=true state transition across overview → stages → overview → passage, verify a different family/ID enters loading, and verify collection/local navigation does not create false waits. Real hosted stage navigation must be repeated after this correction is deployed; a pure transition test alone does not prove the live result.

Local fix aggregate passed: TypeScript, production build, whitespace check and **459/459 tests**, zero failed/skipped. GitHub CI and actual redeployed browser results belong in the follow-up PR release receipt.

## Acceptance remains honest

The live existing30-record baseline was read after version11 and matches all pre-release family/IDs/revisions/renditions/links; no genuine content was mutated. The owner-private audience remains one owner, no external viewers.

The deployed server advertises contract `minamo-v2-2026-10-21.15`, policy `minamo-editorial-2026-10-21.1` and the three new authoring operations. The current installed ChatGPT catalogue still exposes only the legacy tools: the new operation names are absent. EDU19/20 remain blocked until a genuine plugin refresh makes those callable; no live synthetic package has yet been created. The authenticated website itself is accessible and was used to discover this defect.

After this focused fix, complete GitHub/native tree correspondence, full local/CI checks and a safe private redeployment, then verify the actual stage interaction. Resume final installed-MCP-to-hosted-content authoring/inspection/exact recoverable cleanup after the required Minamo V2 reinstall/reconnect. Do not resume PR12 or unrelated backlog, migrate genuine content, or claim full commission completion.

