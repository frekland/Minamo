# Small activation trial: publish an existing tested challenge

Prerequisite: owner-approved deployment of the exact combined candidate and refreshed Activity MCP catalogue. This is not permission to deploy or mutate genuine learner records. Use a synthetic local identity for the engineering trial.

1. Discover the Activity capability schema and choose `generateChallenge('tcp-chunks')` from `lib/challenge-exchange/generators.ts`.
2. Compose `challengeCartridgeBlocks(template,project)` in the exact published cartridge envelope from the Activity domain capability example. Preserve `authored-exercise / not-executed` provenance.
3. Preview once. Publish with an explicit unique operation ID, current generation and expected revision. Read back the exact returned Activity ID/rendition and verify the source-browser file hashes and separate hint ladder.
4. Download the package using `deterministicProjectZip`, then run the generated local command. An expected failing baseline is not setup failure or learner progress.
5. Save any explicit attempt as learner-supplied evidence and next intention. Do not submit repaired oracle source, invent Minamo-observed evidence or create a Development.

Validation: `node --test tests/activity-exchange.test.mjs`; integrated Activity tests named in the candidate receipt. No new schema, dependency, executable renderer or migration is needed for a new content instance of an already supported template. Rollback is recoverable Trash of the exact synthetic Activity/Attempt through the shared domain. Production activation remains owner-controlled.

## Standalone local acceptance harness and exact contracts

Use `tests/private-storage-fixture.mjs` with:

```js
const fixture = await privateStorageFixture('import {domainHandler} from "./lib/domain-handler.ts";export default {fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1",MINAMO_LEARNING_ATLAS:"1"});}}');
const client = fixture.client('TEST-ONLY-cold-activation');
```

`client.request('/mcp', {jsonrpc:'2.0',id:1,method:'tools/list'})` exposes the actual schema. Tool calls use `method:'tools/call',params:{name,arguments}`; parse `result.content[0].text` and check `result.isError`. This is the real domain endpoint, not a mocked authoring service. Dispose the fixture in `finally`.

Exact source interfaces: `lib/activity/mcp.ts` (tool schemas/dispatch), `lib/activity/domain.ts` (high-level request envelopes), `lib/activity/schema.ts` (typed palette), `lib/domain-handler.ts` (actual authenticated JSON-RPC transport), `lib/challenge-exchange/generators.ts` and `lib/foundry/specimens.ts` (trusted declared formats/examples). Reading these named interfaces is sufficient; no broad architecture/research history is needed.

Publication arguments: `{purpose,operationId,id,title,synthetic:true,activity:{contract:'minamo.activity.v1',template:'debugging',authorship:'original-exercise',intent:template.intent,blocks:challengeCartridgeBlocks(template,project)}}`. `publish_minamo_activity_package` returns `{receipt,record,deepLink}`. `read_minamo_activity` accepts `{id,rendition}`. `get_minamo_activity_context` accepts `{purpose,query,includeSynthetic:true}`. IDs are created only for the synthetic publication; later resume uses its natural title.

Attempt: `record_minamo_activity_attempt` accepts `{purpose,operationId,id,title,synthetic:true,attempt:{contract:'minamo.attempt.v1',activity:{family:'experiment',id,rendition},state:'submitted',prediction:'...',nextIntention:'...',hintsRevealed:[],evidence:[{classification:'supplied-terminal',text:'...'}]}}`. Include expectedGeneration after generation changes; include expectedRev for an update. Existing generated packages are intentionally red; never call them observed executions merely because a supplied report says PASS.
