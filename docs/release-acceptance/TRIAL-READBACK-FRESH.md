# Fresh restricted-context typed readback trial

Executed 25 October 2026 against frozen base `9971481` in the isolated `trial-readback-fresh` clone. This is a fresh restricted-context future-Light engineering trial, not a literal small-model speed or cost benchmark. No application source, production service, browser, credentials or dependency changed. The only retained trial additions are this report and `tests/release-light-readback.test.mjs`.

The read boundary was the root AGENTS, LIGHT-ACTIVATION, SDK-RECIPES, template CLI, existing cold-handoff test, private-storage fixture, current Activity schema/MCP schema, and the necessary public MCP catalogue/read_minamo_record excerpt in domain-handler. No broad architecture investigation or application repair was needed. Existing dependencies were linked from the frozen source checkout. The template CLI wrote one exploratory original synthetic request to `/tmp/minamo-readback-template-9971481.json`; it did not publish. No temporary generated fixture or log was written in the working-directory root.

## Executed acceptance

The preserved test compiles the actual Worker and uses `privateStorageFixture` with real local D1/R2, synthetic owner identities and typed JSON-RPC `/mcp`. It discovers the live compiled `tools/list` and Activity capabilities before constructing its publication. It confirms the advertised Attempt CAS field is `expectedRev` and that immutable Activity rendition and supplied-terminal evidence fields exist in the typed catalogue.

The test previews and publishes one original TEST ONLY Activity, explicitly saves one synthetic supplied Attempt, revises both its canonical source and presentation recipe, and reads the original retained Activity edition. The Attempt remains pinned to the original edition. Original and revised recipe patterns are respectively `read-and-annotate` and `predict-explore-compare`; original source uses the existing `text/plain-v1` Foundry kind with an exact SHA-256 binding.

| Verified object | Exact result |
| --- | --- |
| Original Activity rendition | `r-91a5b6f88ee82a02685f7cd1d8edb18115d767a50c187750532209c3b271b9a4` |
| Revised Activity rendition | `r-d96d41ac27ea44e50cdd45f1868789ba669c768365150197b93a227dc534ced2` |
| Original Attempt rendition | `r-929627ca0ff4ba8f2bfd2c93f935909d49b271d05db29fccb19f6cb687fd242a` |
| CAS-updated Attempt rendition | `r-ed8bb56aefba307788ff3cddc8b16e995758ff26424e6f4f2c0a9682caaeaec5` |
| Original source | 88 UTF-8 bytes; `49035d892cab45e719d292625c83aa72d1847deb3f75be5b230dac4615d02feb` |
| Supplied terminal | 2,697 UTF-8 bytes; `a628797dbd977ba076baab7d4b2891086786fc8f3f582e038e8c462e20885175` |

Full Attempt readback uses `read_minamo_record` with `family:"run"`, the exact Attempt ID and rendition, and compares the complete typed Attempt plus UTF-8 bytes. Invented supplied terminal text includes literal CRLF, ANSI SGR sequences, tabs, emoji, combining acute marks, stdout/stderr labels, an explicit nonexecution statement and a supplied exit label. No displayed command is run. The saved next intention remains exact.

Natural-name resume uses only `query:"Aurora literal continuity"` plus `includeSynthetic:true`. It returns the saved Attempt with `classification:"supplied-terminal"`, original Activity rendition, exact next intention, `evidenceMayBeTruncated:true`, and an explicit `exactRead` descriptor naming `read_minamo_record`, `family:"run"`, Attempt ID and exact rendition. The final 72-line terminal is longer than 1,200 UTF-16 units, and the test proves the resumed evidence is a strict, shorter prefix rather than the full original. It then follows that returned descriptor and verifies the complete terminal text and record evidence classification `illustrative`. The response makes no observed execution or achievement claim.

Both initial Attempt creation and a subsequent CAS update are retried with identical operation payloads. Each returns `receipt.replayed:true` and the same exact rendition. A distinct stale operation using the old `expectedRev` returns `receipt.status:"conflict"` and `record:null`; current Attempt rendition/state remain the successfully updated ones. Foreign owners cannot read either the retained Activity or Attempt and receive no natural-name result or source/terminal content.

Final D1 record-family counts are exactly one `experiment` and one `run`. Both discovered learning-development tables are empty. No checkpoint or development tool is called. The successful test always disposes its owned synthetic D1/R2 fixture in `finally`.

## Actual failures and retries

1. An initial discovery-only `node --input-type=module -e ...` fixture startup produced no output after approximately 90 seconds. The coordinator confirmed sibling fixtures were working. Its owned Node process was terminated; a first SIGTERM did not complete promptly, then SIGKILL was used. No application conclusion was drawn from the startup stall.
2. A discovery-only retry with `WRANGLER_SEND_METRICS=false` and `timeout -k 5s 120s` printed `discovery fixture start` but no ready/catalogue result. The bounded executable test subsequently initialized the same fixture normally, without source or system-setting changes. A process check afterward found no remaining discovery Node/workerd processes. These discovery stalls are separate from the passing acceptance run.
3. The first executable acceptance run initialized normally, passed publication, retained source, full Attempt readback, natural-name resume/exactRead, and update/replay, then failed because the trial incorrectly expected stale CAS to set MCP `result.isError:true`. Actual response was HTTP 200 with application `receipt.status:"conflict"`, `record:null`, and `learningDevelopmentCreated:false`. The test was corrected to the observed receipt contract and to verify that no stale revision was committed. No SDK/application fix was made. The coordinator independently reproduced that same assertion failure before this correction.
4. The corrected complete run passed: one test, zero failures, 19 typed calls; Node reported 2.103 seconds total, with 1.833 seconds in the test. It also explicitly followed the resume-provided exactRead descriptor and asserted both idempotent receipt flags.
5. The coordinator requested a stronger summary/full-evidence seam check. The supplied terminal was enlarged from 24 lines (1,017 UTF-8 bytes; SHA-256 `165cbd640bcac1ef1e4267fe51d5591afa00bf1c2637d0331f7e9578211ce4b4`) to 72 lines (2,697 bytes, final hash above). New assertions require actual bounded truncation, an exact original prefix, and complete full evidence through the returned descriptor. Final rerun passed one test, zero failures, 19 typed calls; Node reported 2.133 seconds total, with 1.875 seconds in the test. The table above records this final stronger run; the earlier successful Attempt rendition was `r-3da4aec572fc244515b5c9e33fe3e0d4ec5a6666e312685f8a76f8f3b4fac80e`.

Reproduce from the isolated clone:

```sh
WRANGLER_SEND_METRICS=false timeout -k 5s 130s node --test tests/release-light-readback.test.mjs
```

The outcome is local compiled Worker/D1/R2 evidence only. No hosted-client refresh, production deployment, browser gesture, actual terminal execution, learner understanding or lower-model performance is claimed. Broad application release gates were outside this test-only trial; the preserved executable test is the narrowly scoped acceptance evidence.
