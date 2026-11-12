# Engineering and GPT integration contract — unified Projects

This is a source-grounded starting design, **not** a claim that the code has already been changed. Read actual latest `main` before implementing, and update the implementation PR with any material differences found.

## 1. Relevant current architecture

At commission creation, `main` contains:

- `lib/contracts.ts`: canonical `FAMILIES` include `journey` and `investigation`; `LearningShape.kind='journey'` has ordered stable `stage.id` → `sectionId` mappings; `investigation` has an explicit `question`; `RecordLink` stores relation/destination and optional `sourceContext.stageId/sectionId`.
- `app/workspace.tsx`: separate `journeys`/`investigations` views, navigation labels, individual collection lists, breadcrumb, record routing and `returnJourney/returnStage` contextual URLs. The same file drives PageHeading, search and editing; do not just change the sidebar labels.
- `app/journey-route.tsx`: separate Project overview / Stage reading; overview lists stages and hides general linked references behind `<details>`; recent activity is collapsed. `journeyStages` falls back to authored sections. `sessionStorage` remembers last opened stage **as navigation, not evidence of learning**.
- `app/investigation-workspace.tsx`: Question reader and separate saved work/Development surface; explicitly linked Journey, Article or Area may appear as references.
- `app/learning-activity.tsx` and `lib/learning-activity.ts`: project-related saved work, explicitly linked Investigations and bounded hierarchy. `journeyActivityGroups` currently selects bounded Step/Investigation groups prioritised by linked recent writing, whereas `readLearningHierarchy` has its own graph limits. These are *not* complete, stable, user-facing Project outline catalogues.
- `lib/learning-work.ts`: exact learning target is either `{kind:'journey-stage',journeyId,stageId}` or `{kind:'investigation',investigationId}`. Whole Journeys are not checkpoint targets. Recent Home/Resume use real saved events and tolerate independent revisions; do not flatten the target distinction.
- `lib/layout-workspace.ts`, `lib/layout-gpt-intents.ts`, `app/gpt-handoff.tsx`: current task identity, typed task/reading handoffs, pinned or associated context. Avoid reintroducing removed Focus/Task **UI modes** just because historical types remain.
- `lib/journey-goal-request.ts`: explicit Journey+Investigation seed request. The requested user-facing change must update it to prefer coherent Projects with optional Questions, while keeping existing manuscript publishing type `journey`.
- `lib/assets.ts` and `lib/asset-client.ts`: private staged PNG/JPEG/WebP originals with per-owner identity, 8 MiB/8192px/32 MP bounds, stored in R2 and attached atomically through record commands. **Current attachment/admission/eligible-read logic finds image references in article `sections[].parts[]`, not in top-level Project cover metadata**. Cover work must correctly extend those checks.
- `lib/beta-site-tools.ts`: five private first-party Site Tools for workspace/Library/record read, preview and user-confirmed publication. No existing tool proves ChatGPT-generated image bytes can directly arrive as an owned asset. Owner personal MCP remains separate. Never invent direct image transfer.
- `lib/diagrams.ts`, `app/flow-diagram.tsx` / flow viewport, graph helpers: existing reusable presentation. Learning Atlas was retired as a visible product; reuse a safe rendering primitive, not Atlas navigation.

Project cover and unified overview require explicit work. Existing site project records may have saved reading image blocks; those are **not** automatically Project covers.

## 2. Stable records, new presentation

### Preserve wire and storage identities

Keep `family:'journey'` and `family:'investigation'`, saved `stageId`, learningTarget keys, old editions, Notes, bookmarks, annotations, source/passage coordinates, operation receipts and imported/onboarding manuscripts. Human labels change at the presentation boundary. Do not globally replace "journey" with "project" inside user-written or canonical content.

Implement a central, reusable learner-facing label layer (e.g. `project`, `step`, `question`) used by navigation, search, filters, history cards, breadcrumbs, editor labels, help, user-facing errors and authoring copy. Keep compatibility aliases where old textual deep links or GPT references contain "Journey". Avoid two permanent sets of navigation components.

Prefer one canonical **user-facing Projects route** (the concrete query-string URL scheme may reuse the current `/?view=journeys` internally to avoid risky broken links, or introduce `view=projects` with explicit old-route compatibility). Requirements:

- Existing `/?view=journeys&family=journey&id=...&stage=...` opens the same exact Project Step.
- Existing `/?view=investigations&family=investigation&id=...` opens its exact Question without loss of identity.
- Old `returnJourney/returnStage` context and deep section/part/rendition/passage links still resolve, including direct link, Back/Forward, refresh and new tab. Avoid redirects that discard parameters.
- Capture/source-rights, scoped language and private beta tenant behavior remain the existing authority.

Do not change the Learning Target's meaning merely because the UI now has one navigation home. Prefer an adapter/facade over a new family-wide migration.

## 3. Authoritative Project outline projection

A major fix is required: **the visible Project must contain a complete, permission-filtered, navigable outline independent of whether a Step or Question has saved activity.**

Design a server-backed, read-only projection from exact current canonical records and saved links; give it a clear versioned type. Suggested shape (conceptual, not a compulsory new public API):

```ts
type ProjectOutline = {
  project: { family: 'journey'; id: string; title: string; rev: number };
  steps: Array<{
    stageId: string; sectionId: string; title: string;
    optional: boolean; destination: string;
    questions: LinkedQuestion[];
    resources: LinkedResourceRef[];
  }>;
  projectQuestions: LinkedQuestion[];
  projectResources: LinkedResourceRef[];
  relationshipCoverage: { complete: boolean; nextCursor?: string };
};
```

Each `LinkedQuestion`/`LinkedResourceRef` carries exact `family/id`, available title, destination and *source of relationship* (outgoing authored link, incoming accepted link, step `sourceContext` or exact matching section relationship). Preserve optional relation reason only if authored. Use the active learning-space/tenant access and Source eligibility filters. No title/embedding similarity creates a structural edge.

### Relationship and ambiguity rules

1. A `journey` link to an `investigation` with exact `sourceContext.stageId` or matching valid source `sectionId` binds that Question under the named Step. An incoming `investigation` link to a `journey` with an exact valid section target can also bind where its semantics establish it.
2. A link only to the Project, without a valid Step relation, appears under **Project questions**, not as a guessed Step child.
3. An Investigation linked to two Projects can appear in two Project outlines but is **one original inquiry and one checkpoint target**, not duplicated work.
4. Duplicate reverse links must not produce two cards; retain provenance where useful. Do not reuse an invalid or stale `sourceContext` as if it matched another Step.
5. Referenced Article/Area links may be attached to Project or Step and from explicitly linked Questions, with genuine provenance, stable deduplication and exact edition/section/part links.
6. A linked Question/Article that is trashed, from another tenant/learning space or Source-restricted is omitted safely or shown as unavailable without leaking title/bytes.
7. A bounded read must indicate incompleteness and support paging/expansion for large Projects; **do not use `journeyActivityGroups`' 16-stage selection or `readLearningHierarchy`' 24-node limit as if it were the full Project**.
8. Independent Questions must be discovered server-side from eligible relationships, not by a partial client `records` array and not by lexical title matches. With partial coverage, say partial rather than claiming an inquiry has no parent.

The Project overview, Resources panel and Project map should all consume the **same relation semantics**. Avoid three slightly inconsistent traversals.

### Page efficiency

Do not retrieve/render whole Library manuscripts or image binary payloads to show a Project outline. Read small permitted metadata/excerpts and render card-sized projections; lazy-load Resources and Map only after user action. Page results must be cursor-safe and generation/scope-fenced; handle stale caches, concurrent changes and scope switches. Reuse existing index/query patterns and real page budgets. This is an opportunity to reduce duplicate navigation requests.

## 4. Exact continuation service

Create or consolidate a deterministic resolver for Home/Project/Step/Question/GPT that returns:

- Exact eligible destination (record family/id, rendition/Step ID if applicable).
- Authority `explicit checkpoint`, `recent meaningful linked writing`, `deliberate last-opened local position`, or `authored starting Step`.
- Optional truthful one-line reason and available alternate genuinely saved context.
- Unavailable/missing-target outcome that exposes safe alternatives without silently retargeting.

Work from current `get_minamo_learning_context`, `scope:'home'`, `scope:'resume'`, per-target learning records, recent linked Notes and `LearningResumeView`. Maintain existing correction/supersession and source eligibility semantics; never interpret an authored content update, cover image edit or opening event as learner progress.

A newer Note is not an authoritative correction of an earlier checkpoint; the UI may use it to choose where to reopen while explicitly separating it from the formal checkpoint. A checkpoint tied to a Question must remain a Question checkpoint. Avoid "merge sibling decisions into Project summary" behaviour. If scope resolution finds two equally plausible targets, let the user choose rather than choosing by title or database order.

Prefer the same resolver for a user-facing `Continue` and the GPT handoff's target/destination. Test stale target races and exact readback, not merely URL formatting.

## 5. Cover image storage, security and recovery

### Data model

Prefer an optional validated field on current/revisioned Journey record data, such as:

```ts
projectCover?: {
  assetId: string;           // exact owned image asset
  alt?: string;              // supplied accessible description if informative
  decorative?: boolean;     // intentional empty alt for decorative art
  focalPoint?: { x: number; y: number }; // optional presentation metadata
}
```

Use the actual existing coding/validation conventions; this shape is illustrative. Enforce `family==='journey'`, allow no cover and explicit removal, and ensure data is admitted through shared domain/command paths with exact CAS, generation fencing, operation IDs and correct revision semantics. Replacing a cover should not rewrite the Project body/sections or pretend canonical text changed. Existing exact reading renditions and anchors remain valid.

**Critical current-code gap:** section image attachment statements and `eligibleImageBasis` only inspect `sections[].parts[]`. Do not attach a cover by planting an invisible `image` passage in the teaching material. Adapt the attachment guard, atomic finalize statements, metadata fetch, active/retained eligibility, recovery archive/export/import and cleanup logic to recognise validated `projectCover.assetId` **in addition to** existing reading images. Verify both current and retained Project cover reads; do not inadvertently grant arbitrary asset reads because a Journey contains an asset ID.

Use `/api/assets/stage` only after explicit user action and existing owner-scoped verification. Preserve real original bytes, MIME/dimension checks, "file selected locally" vs "uploaded/staged" vs "attached after guarded parent commit" state, historical protected attachments, revocation floors and irreversible purge rights.

### Lifecycle

- New Project with no cover: normal record save; no staged asset required.
- New Project + image: stage original; parent Project creation/CAS attaches exact asset in the successful same guarded operation. If creating the Project first simplifies safe flow, preserve the user's chosen file and offer an immediate explicit attach without pretending it was already saved.
- Existing Project: change or remove metadata via revisioned update; lost CAS shows a small correct retry/refresh path.
- Change: old image must remain available to eligible prior reading/recovery references, unless explicitly revoked under existing policy. **Do not delete old R2 bytes because the cover is no longer current**.
- Removal: remove only active Project cover association. Do not delete the image from unrelated reading blocks, other Projects or historical originals.
- Trash, permanent deletion, stage expiry and recovery: follow actual current rights and atomic deletion/retention policies. Write focused synthetic tests before modifying these paths.
- Tenant isolation: no cover from another beta account; no stale cross-account upload response, cached image response or ID can be used to attach an asset in a different namespace. Respect any private-beta `X-Minamo-Workspace` fencing and no-store/no-sniff response requirements.
- Security: do not allow arbitrary remote URL as a "cover" to bypass uploads; reject SVG, animation and executable formats consistent with the existing private-image boundary. No remote image import or third-party fetch without a separately authorised, source/rights-safe protocol.
- Accessibility: capture decorative vs informative intent; never auto-describe pixels the server did not inspect. Use actual owner-authored alt when meaningful.

## 6. GPT-generated Project images: end-to-end honesty

The owner wants to ask GPT to create a Project image **during Project creation or at any later time**.

Check actual available ChatGPT image-generation, installed owner MCP and beta WebMCP/file transport surfaces. Do not infer an arbitrary multimodal byte-upload tool from a JSON record command. Current `mcp__Minamo__` and `lib/beta-site-tools.ts` provide learning record/material workflows, not an attested generic image binary transfer.

Implement both parts:

1. **Project-aware user request**: `Create image with GPT` or a similarly brief action prepares a specific handoff grounded in the exact Project title/goal and selected style request, and works before or after Project creation. Creation remains owner-initiated. If GPT cannot perform image generation in that context, say so honestly and offer device upload; do not fabricate a successful image. An existing authoring workflow can mention an optional cover request without forcing one.
2. **Actual image assignment**:
   - **Preferred when supported and verified:** review the generated image and send owned original bytes through a genuine supported first-party tool/hand-off; stage/confirm/attach with explicit authorisation and readback. Integrate existing image guard. Record *which* platform/test proved this transport. Never smuggle bytes through an unauthorised public URL.
   - **Required fallback when direct transport is unsupported:** ChatGPT generates a visible image the learner can save/share; user chooses it from device or pastes a real browser `File`/`Blob` where supported; Minamo previews, uploads privately and attaches. One clear, working flow on Android and desktop, with truthful language (not "set automatically"). Test the actual file route rather than a purely textual copy prompt.

No paid external image API, no automatic illustration generation, and no dependency on another learner having access to the owner's personal MCP. Each learner's imported image stays in their own tenant. A GPT-created picture can be user-approved and used decoratively, but does not become cited learning evidence.

## 7. Modal map and Library read contracts

Use one shared authorised Project outline graph, with a lightweight presentation-specific projection:
- nodes: Project anchor if useful, stable Steps, eligible Questions, optional eligible Library Article/Area nodes;
- edges: ordered Step sequence and exact authored relationships; each edge has **documented provenance**, never a guess;
- destinations: exact internal navigation URLs with optional rendition/section/part, or explicit unavailable state;
- cover counts and link counts reflect the actual returned coverage, not server-side undocumented truncation.

Graph payload should omit full personal Note bodies, source excerpts not already permitted and unnecessary image data. The Map is not displayed/read by default. Lazy import the existing graph renderer rather than shipping a new always-loaded dependency. Server filters and direct API checks still protect target reads; UI graph nodes are not authorisation tokens.

Resources may fetch short canonical article excerpts on deliberate preview; enforce same privacy and source-rights checks as ordinary Reader. A link back to an exact Step should survive the preview, browser history and closing either modal.

## 8. GPT, manuscript and beta compatibility

- Update `lib/journey-goal-request.ts` to create a Project with meaningful Steps and **only justified** linked Questions, not a quota of Investigations. Retain current manuscript compiler role codes and already-authored source precision.
- Update `lib/layout-gpt-intents.ts`, `app/gpt-handoff.tsx`, `app/workspace-help.tsx`, user-facing Site Tools descriptions and universal beta Markdown preview labels. Never falsely rename a protocol enum in a registered callable schema without corresponding deployed client/tool compatibility.
- Owner-installed MCP tools such as `get_minamo_learning_context`, `read_minamo_record` and explicit `record_minamo_learning_development` must keep working with exact existing IDs and family qualifiers. Where human help refers to "Project", natural-language resume should still resolve valid `journey` stages and Questions, including multi-parent ambiguity.
- First-party WebMCP Tools for invited beta accounts are separate from the owner's hosted plugin. Site share does not install/share that plugin. Preserve signed-in tenant authorisation, user confirmation of proposed Markdown and zero-write preview. Do not invent an image-upload tool if binary transfer is not supported.
- Existing beta onboarding Journey and Library guide should display with updated UI labels, and their *canonical original text* must not be silently rewritten. When a future content revision is necessary, use exact authored publication and preserve old editions. Correct onboarding *UI* wording separately.
- Check status of old browser local-storage keys, URL query states, deep links and saved GPT handoff strings; migrate or retain as compat aliases without overwriting drafts or reading positions.

## 9. Testing and publishing

Keep app+MCP shared validation where possible, rather than creating a Web-only cover shortcut. If a new D1 migration is genuinely needed, make it additive with owner/tenant/recovery tests. No schema-on-request migrations or auto-batched destructive cleanup.

Source publication follows `docs/SOURCE-SYNCHRONISATION.md`: known GitHub source commit, native Sites source, verified common tree and guarded ref update, then a private production release only after acceptance. A GitHub PR alone is not a deployed Site. Do not force GitHub CI or pay for Actions; run actual available local/Sites/Worker checks. Tests must differentiate synthetic D1/browser artefacts from real owner and independent beta account evidence.

**Keep the implementation PR focused:** compare old vs new navigation across all routes, document any new endpoint/field, prove exact origin/read/checkpoint integrity, show image R2 admission/readback, and link the acceptance evidence. If direct GPT image transfer is blocked, deliver and verify the usable fallback rather than leaving the whole UX half-implemented.
