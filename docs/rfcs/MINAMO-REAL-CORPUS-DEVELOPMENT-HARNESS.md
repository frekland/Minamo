# PR #12 — Real-corpus development and compatibility harness

**Implementation update:** The first deployed Work slice and current architectural recommendation are recorded in [PR12 implementation findings](PR12-IMPLEMENTATION-FINDINGS.md). Use that report for completed work, observed limits and next implementation slices; this document retains the original scope/background.

**Status:** Authoritative development/test strategy supporting [the main accumulation-and-composition RFC](MINAMO-ACCUMULATION-AND-COMPOSITION-RFC.md). This is an **early Work deliverable**, not evidence that fixture extraction or a test environment has already been built.

## Guiding decision

The owner explicitly authorises use and publication of the existing Minamo learning material in the **public** `frekland/minamo` repository. Treat the current corpus as a valuable, versioned, reusable engineering asset, not a private source that needs an elaborate anonymisation pipeline. Do not create unnecessary privacy-related extraction procedures or keep rebuilding throwaway example Projects.

This does **not** imply posting application secrets, authentication tokens, private API credentials, or content for which the owner cannot grant publication rights. Review third-party authored messages and licensed/external content for rights, and note any justified omissions in a manifest. This is a straightforward content/license check, not a new product or privacy subsystem. Some personal interactions may be in the corpus by owner's explicit preference. Preserve their original wording where publication is authorised.

## The test strategy

### A. Freeze a genuine, versioned source corpus

1. Use the *existing* Minamo MCP read APIs to collect **complete canonical saved content**, initially from `Making Friends` and `Japanese Speaking Practice`, including original messages/attempts/corrections where eligible, explanations, translations, tables, diagrams, flashcards (including card payloads), dialogues (including turns), typed rich parts, Project arrangements and actual relationships. Include other representative record families when useful.
2. Capture all genuinely available identities, revisions, renditions, parent-child references, scope, available timestamps, content kinds, and origin information. Do not claim absent revisions or original unsaved ChatGPT transcripts have been reconstructed. If historical editions are available through exact readers or revision tools, collect them with evidence; where not, declare **incomplete historical coverage**.
3. Commit an understandable snapshot manifest and a versioned, deterministic test corpus to a dedicated documented location (choose the repository's existing test naming convention). Include a corpus version, source snapshot date, extraction code/version, record/part counts, source revision/rendition, content hashes and a clear inventory of covered/omitted material. Record expected hashes in test assertions.
4. Make extraction **repeatable and deliberate**, with a reproducible refresh command or clearly documented workflow; it should detect content changes, produce a reviewable diff and keep prior snapshots/test outcomes available through Git history. Avoid refreshing on every run or relying on a live MCP call during ordinary tests.
5. Retain meaningful source types in the fixture. A single hand-picked 'hello world' page, an abstracted text-only copy or a synthetic approximation of the 127 cards is **not sufficient**. Preserve typed metadata and interactive definitions. Flag any resources whose external media bytes are not accessible; test a supported unavailable/fallback case instead of inventing assets.

### B. Load the corpus into an isolated, reproducible environment

Build on the repository's real local Miniflare/D1/R2 test fixture (`tests/private-storage-fixture.mjs`) and existing validation/migration setup. Create a fixture loader that restores eligible canonical test records, relationships and editions into a **test-only namespace**, making the input stable for multiple implementation variants.

Choose the correct method after inspecting validation, schema and revision behaviour: use supported app import/commands where practical, or a controlled local database seed that preserves exact identity. Don't use production recovery activation to clone the owner's live workspace. Never point the test loader at production credentials, endpoints or a live writable owner namespace.

The *same input corpus* should run against baseline and proposed implementations. Tests must distinguish a fixture's original ID from the isolated test tenant's ownership, and assert that legacy record reads still behave correctly. **This local fixture is for repeatable technical tests and compatibility experiments; it does not replace live owner-facing browser acceptance on the deployed Site.**

### C. Compare architectures rather than merely testing new code

Provide a repeatable **baseline vs candidate comparison**:

- The same original record/part/interactive identities, text, structured metadata, images/media availability, relationships, renditions and chronology are preserved or explicitly accounted for.
- Existing Projects remain readable, including their reading topics and interactive content.
- Alternate retrieval and arrangement designs work using canonical refs; one source can be used in several arrangements without moving or duplicating it.
- Disabled, unavailable, revoked, deleted or changed sources remain inaccessible as appropriate. Test stale references and different historical renditions. A public fixture does *not* relax live owner/rights checks.
- Show the current frontend versus one or more candidate frontend experiences on the **same source examples**, including real original attempts/corrections and GPT-created practice; evaluate navigation, first-view usefulness, provenance, stable refresh and mobile ergonomics.

Maintain a compatibility report or script that highlights expected semantic changes and unintended data losses. Record observations, not just green test counts.

### D. Test future growth without waiting two years

Generate **deterministic synthetic extensions** to the genuine baseline to simulate realistic accumulation across six months, one year and two years, retaining relationships, repetition, evolving corrections, mixed subjects, revisions, changing permissions and nested interactive resources.

Use targeted 100/1,000/10,000/50,000-part/sub-item test sizes where feasible; distinguish performance test sizes from predictions of real user behaviour. Measure how discovery, model context size, render performance and user task success change as the corpus grows. A larger dataset must offer better opportunities to find relevant earlier material without requiring a full-corpus read or overwhelming first view. Do not use vague 'more connections' or fabricated learner progress as success metrics.

### E. Live owner-visible experimental frontends

The owner has explicitly authorised deploying **multiple experimental frontend experiences to the existing Minamo Site**, accessible by deliberate selection in Settings while the stable UI remains the default. These should use existing real owner-authorised canonical content rather than a mock fixture when deployed. The local corpus remains the reproducible regression baseline, not a production test-data replacement.

Follow [the live experimental experience and deployment policy](MINAMO-LIVE-EXPERIMENTAL-EXPERIENCES.md): isolated routes/views, stable return, desktop/mobile browser inspection, fidelity and rights checks, source reconciliation from Sites to GitHub, and verifiable deployed revisions. Deployment of feature-gated non-destructive experiments is approved, not prohibited. Production data migrations and unrequested source edits remain out of scope.

### F. Minimise MCP churn, but allow necessary changes

Ordinary regression tests should be local/isolated and operate on the versioned corpus, without recurring live MCP calls or client schema reinstalls. MCP is used to **bootstrap or deliberately refresh the input** and for targeted live acceptance against current Minamo. **New MCP operations or policies are allowed when justified by an actual experimental capability**, with backwards-compatible typed schemas and post-deployment fresh-chat acceptance; avoid introducing new client contracts for each visual iteration.

## Expected early deliverables

1. A real-content snapshot manifest, checked-in representative corpus and extraction/refresh instructions.
2. A local isolated loader and focused preservation/compatibility tests using actual app code and storage.
3. An explicit inventory of unavailable materials or history and their reason (not guessed completeness).
4. A baseline UX walkthrough using real corpus passages and **at least one deployed, owner-selectable experimental frontend** where safely feasible; compare live browser behaviour on desktop and mobile, not only mocked screenshots or local builds.
5. An evidence-based recommendation for what new architecture, indexing or schema is actually necessary.

This harness is an **enabler**, not the entire product objective. Don't invest weeks in general-purpose export infrastructure when a small, repeatable corpus loader is enough.

## Guardrails and authority

- Production and authentic learner records stay unmodified during this task.
- Do not churn MCP contracts for purely internal or visual experiments. **Permit a narrowly justified MCP extension when necessary for a deployable user-facing prototype**, with real client-visible schema verification and fresh-chat acceptance.
- GitHub `main` is owner-confirmed as the current production-aligned code baseline for this commission. Compare PR #12 branch against main before edits; revise the assumption only upon concrete contrary evidence.
- No forced container taxonomy, automatic capture, inferred mastery, replacement of the stable default UI, destructive migration or unrequested modification of authentic source data. **Opt-in experimental Sites deployments are expressly authorised.**
- Keep PR #12 **draft and unmerged** until explicit owner review; document actual deployed Sites revisions, the corresponding GitHub commits, passed/failed checks, and any acceptance limitations.
