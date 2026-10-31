# V86 candidate — observed MCP eligibility, resilience and privacy matrix

Date: 31 October 2026. Scope: the existing owner-gated TEST-ONLY Mood-to-Music observation infrastructure, not natural learner telemetry.

## Tested contract and correction

V85 proved basic connected read/error metadata and a real Flag state diff. This follow-up tightens one selector and corrects a privacy statement:

- A user-controlled synthetic-looking **operation ID alone** no longer makes an ordinary record mutation eligible for observation. An actual current-epoch synthetic target or explicit synthetic discovery is required. Exact synthetic operation *readbacks* remain eligible because their purpose is to inspect that receipt ID.
- Opaque Flag IDs can now be observed on exact record reads **only after** a private D1 lookup verifies the saved Flag is synthetic and refers to a current-epoch synthetic target. Ordinary or unrelated Flag IDs do not qualify.
- The API now explicitly says that the **private D1 storage rows contain an owner-scoping key** for isolation, while returned observation events omit it. The earlier absolute claim that no authenticated identifier was stored anywhere was inaccurate.
- The result includes `coverage.hostComplete:false` and `coverage.bestEffort:true`. The Minamo endpoint cannot observe ChatGPT host-side failures, prompt composition, hidden reasoning, tool calls that never reach the server, or external program execution. This is an explicit coverage boundary, not a missing event to fabricate.

## Automated adversarial matrix

The new `tests/test-observation-adversarial.test.mjs` runs against isolated actual Miniflare D1/R2 and compiled MCP handlers. No hosted learner data is involved.

| Case | Assertion | Result |
| --- | --- | --- |
| Ordinary Article read while armed | Not recorded | PASS |
| Ordinary Article Flag preview with synthetic-looking operation ID | Not recorded; target determines eligibility | PASS |
| Wrong-epoch synthetic Note ID | Not recorded | PASS |
| Current-epoch synthetic Article and command | Recorded with outcome/timing metadata | PASS |
| Opaque synthetic Flag readback | Exact canonical target verified, read recorded | PASS |
| Synthetic operation receipt and missing synthetic operation | Success and server error code recorded | PASS |
| Direct D1 privacy/schema audit | Stored owner key is private; event fields constrained; no content canary in calls or state snapshots | PASS |
| Simulated D1 trace INSERT failure | Canonical read still succeeds; server error remains its original error; no fake trace | PASS |
| Call quota at 600 | Six concurrent calls cannot increase stored count above 600; quota flag true | PASS |
| Bounded paging | Limit 50 accepted; 51 rejected; explicit next offset | PASS |
| Concurrent pause with same expected revision | Exactly one CAS succeeds; other receives revision conflict | PASS |
| Idempotent control retry and different-payload reuse | Replay identified; mismatched reuse rejected | PASS |

Existing `tests/test-observation.test.mjs` continues to cover owner visibility and denial, ordinary-call exclusion, immutable snapshot replay, D1 diffs, pause/re-arm/seal, session pinning, fixture reset retirement and error attribution.

The quota corpus is inserted **only into an isolated local test D1**, not generated through 600 hosted MCP calls. The injected storage failure is also local; it verifies graceful degradation, not availability of the production D1 service.

## Independent live D1 metadata inspection

The owner-authorized Sites database viewer was used *read-only* against the live V85 `DB` binding, limited to these three tables; no ordinary Notes, transcripts or learner records were queried:

| Table | Rows inspected | Relevant columns |
| --- | ---: | --- |
| `v2_test_observation_runs` | 1 | Owner scope, fixture/run identity, state and control metadata |
| `v2_test_observed_calls` | 10 | Owner scope, call ID, session/phase, tool, outcome/code, milliseconds and timestamp |
| `v2_test_state_snapshots` | 6 | Owner scope, checkpoint/moment, controller and namespace metadata, state JSON |

The viewer returned all ten call rows with no omitted rows/columns. No prompt, response, Note body, bearer token or credential-shaped content appeared in those sampled rows. The snapshot viewer **truncated the six large `state_json` values**, so this was not a full physical byte-for-byte privacy audit. Full canonical snapshots were independently read through the restricted observer API in V85; the schema and new local direct-D1 tests constrain the serialized fields, but do not establish that every future execution path remains free of leakage.

Private row ownership is necessary for tenant isolation; neither the owner-scoping key nor private record bodies are included in the public report's observation event list.

## Separate evidence boundaries still open

1. **Coordinated three-layer acceptance versus host completeness:** The existing `append_minamo_test_transcript` Markdown log is GPT-reported and intentionally complements server observations and D1 diffs. A **joint per-call reconciliation test has not yet been performed** for the V85 observed interval; follow the [three-layer protocol](three-layer-reconciliation-protocol.md) next. This bounded reconciliation needs no new host runner. Separately, exhaustive ChatGPT-host dispatch capture cannot be implemented by changing Minamo's Worker alone and would require an independently consented host/API trace provider. Do not label either model-reported Markdown or a server event list “host-complete”.
2. **Production fault injection:** Not performed on live D1; intentionally keep failure and quota attacks in isolated local storage. Production observability still has best-effort loss.
3. **Browser-observed learner UX:** A signed-in cloud browser opened the live V85 synthetic Project, followed its Step 4 link, and confirmed the step heading, stage selector, guide, linked question, recent work and saved-learning region rendered after loading. This is positive navigation/rendering evidence only. No real learner was assessed, no comparative learning task was run, and no improvement in learning quality was established. Never treat MCP call volume as a quality metric.
4. **Cryptographic deployment provenance:** Public Git SHA, native Sites SHA, saved-version hash and provider deployment receipt can be independently compared. The Sites API does not itself provide a cryptographic proof of every executing runtime byte; retain that distinction in each release receipt.
5. **Real-user telemetry:** Remains disabled. No new general tracing, retention policy, tenant-wide observation or learner assessment machinery is authorized or implemented.

## Release gate

Run:

- `node --test tests/test-observation.test.mjs tests/test-observation-adversarial.test.mjs`
- `pnpm run typecheck`
- `pnpm run build`
- `pnpm test`

For a production publication, follow `docs/SITES-RELEASE-WORKFLOW.md`: port only the reviewed changed source/tests/documentation to the current native Sites HEAD, verify exact hashes and tests, preserve private hosting and audience, and publish the saved native source version. A public PR merge is not a Sites deployment.
