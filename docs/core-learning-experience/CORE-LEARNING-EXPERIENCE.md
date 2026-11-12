# Minamo V2 — Core Learning Experience and Rich Content

**Implementation-ready continuation brief · 21 October 2026**  
**Parent commission:** `frekland/minamo-v2`, issue #1.  
**Owner priority:** a beautiful, rich, interconnected personal learning resource and a natural two-way GPT/MCP portal. Real Kali/GitHub work is primary; browser experiments are supporting utilities.  
**New visual requirement:** restore the owner's neutral charcoal palette, with slightly more muted blue/cyan accents. Preserve V2's improved composition and interaction, not V1's old page structure.

## 0. Start here: integrate into the running build

This brief makes the existing commission's core-experience requirements concrete. It is **not a new discovery phase, a restart, a replacement architecture, or a requirement to wait for another owner approval**. Continue current implementation and fold these increments into its existing integration/release process.

Recheck current main, active branch/native Site source, issue #1 and its latest receipts before editing. The reviewed baseline is GitHub commit `82583c84fe30ef59bb9bca6085064cd40d551cac`, common source tree `fdbd41476dd9f22c179d942cac743c767f270684`. It records the version-3 reading/collection continuation. These are review coordinates, not an instruction to reset to that commit. Equivalent work completed concurrently takes precedence over the implementation suggestions below; reconcile once and reuse it.

Implement the theme as an early, independently testable increment. In parallel, integrate the content, relationships and MCP work into the active source/admission/upload workstream. Do not rebuild engines or repeat successful foundation tests merely to satisfy a new document heading.

**Execution boundaries:** only the existing private V2 Site/repository may change. Preserve original Minamo and `frekland/cyber-learning`; reference reads do not grant import/write permission. Preserve genuine V2 records, owner identity, source rights, saved anchors and uncertain operations. Use labelled synthetic fixtures for engineering. The owner has reported mobile use works; do not turn that into a claim that every current interaction, device or accessibility path has been tested.

The files in this package are specification/reference assets, **not an applied application patch**. Merge or otherwise incorporate them through the documented native/GitHub source-sync route without overwriting the in-flight native tree. No application release is needed merely to publish these documents.

## 1. Outcome, not feature count

Minamo should let the owner do meaningful computing work at the PC, discuss it with GPT, and then return to a coherent, attractive, increasingly useful body of knowledge on either desktop or phone. The reading, personal reflections, actual code/evidence and GPT explanations should stay connected without repetitive administrative work.

Core completion means demonstrating these outcomes:

- **Read and go deeper:** substantial explanations, readable code, useful visuals, references and personal context appear in the right places. Following a connection preserves an intelligible route back.
- **Discuss and retain:** GPT can find the exact relevant material, make an authorised targeted contribution, and return a working deep link. The Site can prepare precise context for a connected GPT conversation without exporting the whole corpus.
- **Revisit and improve:** existing canonical explanations are reused and improved. A second Investigation can benefit from the same article without copying it or contaminating either Investigation's personal evidence.
- **Feel coherent:** the owner's neutral theme, readable typography, quiet controls, reliable Notes and mobile layouts work across every ordinary surface.

A populated page of cards, a successful MCP write, a screenshot, or a rising test count does not establish these outcomes. Conversely, owner review is not a reason to stop routine implementation: record remaining human-evaluation limits and keep shipping verified improvements.

## 2. Actual baseline and source map

The table separates observed code from required additions. Follow real callers again if the running build has changed them.

| Reviewed source | Observed at review | Continuation responsibility |
|---|---|---|
| `lib/contracts.ts` | Ten record families; nine readable families; `sections` made of `paragraph`, `code`, `diagram`; plain `links`; exact family-qualified UTF-16 anchors | Add compatible rich block contracts, semantic relationships and stable textual projections; do not create another article store |
| `lib/domain-handler.ts` | Eight MCP tools; same command domain as HTTP; bounded requests/queries; existing tools use `purpose` and revision/operation identity | Extend these real contracts for rich authoring, projected context, deep links and media retrieval; retain compatibility |
| `lib/domain.ts` | Domain ownership, validation, retained reads and atomic command/receipt/history flow identified by implementation docs | Integrate block/asset/source eligibility, relation indexing and targeted patches into this path; no UI-only admission |
| `app/reader.tsx` | Shared exact reader; diagram overview currently derives up to eight labels from the first arrow-containing line | Use a declared diagram format and faithful rendering; do not represent a branched mechanism as a guessed single chain |
| `app/workspace.tsx`, `app/page.tsx` | Persistent React workspace and server-provided initial context | Compose shared content and relationship views; add scoped refresh and handoff without mounting a second shell |
| `app/notes-panel.tsx` | Persistent writing and retained drafts/operations | Integrate rich personal content without losing text, editor identity, autosave/recovery or docking capabilities |
| `app/source-reference.tsx` | Source-link presentation | Distinguish a link, checked repository location, admitted excerpt and actual observed artefact |
| `app/globals.css`, `app/workspace.css` | Green-tinted base tokens, sage accents and many literal colour overrides; some labels use very small text | Replace colour ownership, not just one accent variable; apply readable type and actual component-state checks |
| `app/reader-notes.css`, `app/tools.css`, editor/diagram styling | Additional component styling | Bring under the same semantic tokens, including portals and isolated visual surfaces |
| `docs/RELEASE-READING-CONTINUATION-2026-10-21.md` | 152 reported checks; non-article exact reading, paging, real hosted MCP continuation; explicit remaining source/upload/recovery gaps | Retain these achievements; extend their coverage, do not reimplement them |
| `docs/SOURCE-SYNCHRONISATION.md` | Separate Site-native and GitHub histories; verified common source tree | Preserve both histories and expected-head checks; reconcile this docs branch into the real release source |

The existing MCP names are `get_minamo_next_probe`, `get_minamo_workspace`, `read_minamo_record`, `query_minamo_records`, `get_minamo_context`, `preview_minamo_command`, `apply_minamo_command`, and `read_minamo_operation`. Names below for *new* fields/components are design proposals, not claims about installed tools. Prefer additive extensions or equivalent work already underway.

## 3. Shared content contract

### 3.1 One authored representation, several contextual views

Retain records and their existing `body`/`sections`. The body remains the introduction or independent personal prose; sections hold authored structured content. Do not persist a second rendered-HTML or duplicate-Markdown document as competing authority.

Extend the existing block union in a versioned way. Keep old `paragraph`, `code` and `diagram` payloads valid. Existing saved blocks keep IDs; modifying a block is not a reason to regenerate every section/part ID. Media geometry and interface controls are not text coordinates.

Use one shared content renderer, editor contract, validation/projection layer and MCP representation for eligible content in Articles, Investigations, Journeys, Notes/annotations, Areas and source/evidence views. Surface-specific wrappers may vary density and actions, but not the meaning or fidelity of a block. Brief/list previews are bounded projections, not truncated editable copies.

**Required content classes for this core programme**

| Class | Durable content | Reading/authoring behaviour |
|---|---|---|
| Prose / lists / callouts | Exact text, limited semantic spans/list structure, optional callout meaning | Proper paragraphs/lists; restrained callouts; accessible headings; no arbitrary HTML or instructions hidden in rendering |
| Code | Exact code string, language, optional explicit original file/commit/line reference | Copy exact code; optional wrap; readable syntax; line numbers and controls outside selection; never execute by opening |
| Table / small dataset | Typed columns and cells, explicit null/missing values, optional units | Semantic table, compact caption, contained horizontal scroll where necessary; no fabricated values |
| Diagram | Declared format, exact source/structured geometry, caption and explanatory text | Faithful branches/labels, readable sizing and enlargement, inspectable source; honest error fallback |
| Image / screenshot | Owner-private asset reference, mandatory alt text for informative images, optional caption/source reference | Intrinsic dimensions to prevent jumps; fit and open larger; no page overflow; original and any edited derivative remain distinguishable |
| Audio / video | Private asset or explicit external reference, title, duration where verified, caption/transcript references | No autoplay; native accessible controls for supported bytes; transcript beside the explanation; external references remain links unless approved embedding is genuinely supported |
| File / document | Typed private asset or external link, descriptive label, provenance; optional separately admitted text representation | Open/download through authenticated route; readable extraction only when actually supported and verified; never treat file bytes as searchable text by assumption |
| Canonical reference / excerpt | Exact target record/section or approved source passage, relation purpose, current versus pinned revision mode | Reusable contextual presentation, title/relevance/return route; no copied article body merely to show a preview |

Implement full web+MCP parity for the text/code/table/diagram/image/reference set. Include the media/file path as part of the existing upload work; do not claim an unsupported decoder, transcript generator or host attachment route. An external audio/video reference with an explicitly supplied transcript is an acceptable supported representation, but **is not evidence of native media upload/playback**. Report those capability distinctions rather than creating dead controls.

Do not add tldraw, native apps, a general executable-content format, arbitrary iframes or a new AI service to fulfil this table. A faithful safe diagram renderer and existing media capabilities are sufficient.

### 3.2 Proposed additive shape and stable projections

The implementation may adapt field names to newer concurrent work, but must preserve the following semantics. This is an interface sketch, not code to paste over `lib/contracts.ts`:

```ts
type ContextRef = {
  family: Family; id: string;
  sectionId?: string; blockId?: string;
  revision?: number; rendition?: string;
};

type PrivateAssetRef = { assetId: string }; // no public URL or storage key

type ImageBlock = {
  id: string; kind: 'image'; asset: PrivateAssetRef;
  alt: string; caption?: string; sourceRef?: ContextRef;
};

type ReferenceBlock = {
  id: string; kind: 'reference'; target: ContextRef;
  mode: 'current' | 'pinned'; purpose: string;
  presentation: 'card' | 'inline-excerpt';
};

type LearningRelation = {
  id: string; target: ContextRef;
  kind: 'explains' | 'evidence-for' | 'uses-concept' |
        'reading-for' | 'source-for' | 'related';
  purpose?: string; // why this connection is useful
};
```

`inline-excerpt` is allowed only when the target's eligibility and source-use policy permit it. A source URL or relationship is not that permission. Start with one level of expanded canonical references; cycles become links, not recursive transclusion. Stable relationship IDs support targeted edits; reverse links are computed/indexed, not separately maintained copied prose.

Each block codec must provide: validate; enumerate textual parts; enumerate asset/source dependencies; bounded summary; web render; eligible MCP projection; edit/patch support; export representation; and migration/unknown-version behaviour. Missing one of these is an incomplete block implementation, not a harmless UI omission.

Keep a content/projector version in the retained reading envelope. **Do not recompute old anchors under a new projection algorithm.** Preserve old retained editions and the existing legacy read-only projections. For new media/table fields, derive stable canonical subpart identities from block ID and field/cell identity, never display order alone. Row/cell identity must survive reordering where the authored data model promises it. Code remains literal; captions/transcripts are text; media pixels/timestamps are not UTF-16 ranges.

An exact passage inside a referenced source retains that source's family/record/revision/rendition coordinates, with separate display/return context. A citation inside an Investigation does not turn the source words into the Investigation's own prose. If multiple canonical sources are displayed together, selecting across them must produce explicit separate targets or a clear refusal, never a guessed single target.

Historical content is immutable, but historical **eligibility is current**. A revoked source/asset cannot remain exposed through history, cache, previews, exports, MCP or a saved handoff. Preserve independent personal prose when its origin becomes unavailable.

### 3.3 Targeted edits and compatibility

The current update path must preserve every rich field that was not explicitly changed. Add narrow `patchBlock`, `insertBlock`, `removeBlock`, `setRelations`-equivalent actions under the existing revision/operation pipeline, or demonstrate equally safe existing field-level updates. The UI and GPT must not resubmit a whole old article to update one caption.

Preview is validation, not a new mandatory approval ceremony. A successful save returns compact committed identity/revision and exact destinations. A stale edit leaves the current record and local proposal intact. Retrying an uncertain save retains the original operation ID and immutable payload. A token or cache library must not create a second durable queue.

Unsupported content versions: never silently delete or flatten unknown blocks on edit. Preserve their original bytes and show a bounded 'Unsupported content — update required' state; pause edits that cannot preserve them. New database tables/columns must have explicit migrations, not writes during page rendering.

## 4. Private assets, sources and genuine evidence

### 4.1 Integrate with the current upload/source workstream

Implement one owner-private asset lifecycle: staged bytes → verified metadata → committed attachment → authenticated read/export. Store bytes in V2 R2 and owner/size/digest/MIME/dimensions/state/provenance metadata in V2 storage. Record references use opaque IDs, not bucket paths, long-lived public URLs or embedded base64.

Use bounded streaming, signature/MIME validation and appropriate decoding. Initial product budgets to validate against the actual host are **8 MiB per image, 20 MiB per document, 25 MiB per audio file and 50 MiB per video**, with image dimensions capped at 8192 on either axis and an aggregate pixel limit. These are proposed app budgets, not claims about Sites limits. Use lower supported values when required and expose the actual limits before upload; report an incompatibility rather than silently accepting a broken asset. Do not enlarge the existing JSON command limit to carry binary data.

Allow only tested formats. PNG/JPEG/WebP are a reasonable first image set; raw uploaded SVG/HTML must not be executed. A PDF/file attachment is not automatically an interactive source reader. Audio/video playback requires actual format/browser support; supply text alternatives where available. Do not fetch arbitrary remote URLs on behalf of the server as an unbounded import mechanism.

A stage/finalize retry must converge. Failed attachment preserves the local Note/proposal; unreferenced staging cleanup must not delete historical or active referenced assets. Authenticated media responses must handle permitted byte-range reads correctly where playback requires them; otherwise mark the format unsupported, not partially working. Check rights again on every relevant read path.

Redaction is deliberate, not implied: warn before uploading likely secret-bearing terminal screenshots, offer a genuine preview/removal path, and never silently upload real repository secrets. A derivative image cannot overwrite the original under the same immutable asset identity. No third-party analytics or media-host upload is necessary.

### 4.2 Distinguish four things that otherwise look alike

1. **External reference:** a URL and description, not an imported source or verified repository bytes.
2. **Admitted source/excerpt:** retained content with a recorded use basis, attribution, exact edition and revocable display/export rules.
3. **Actual learning evidence:** a user-provided observation or identifiable Kali/GitHub artefact; state the basis and what was actually verified.
4. **Illustration:** GPT explanation, synthetic sample or browser reproduction, explicitly separate from actual Kali execution.

Actor/channel is not sufficient provenance. 'GPT saved this' does not mean 'GPT authored the underlying code', and 'user saved this' does not prove the user ran it. Retain source, author/basis, verification state, synthetic status and relationships independently. Readiness, task completion and learning achievement are not inferred from any save.

For a GitHub reference, preserve supplied repository, full commit, path and line range. Never invent a commit or rewrite an ambiguous branch URL into a guessed pinned URL. The saved link must distinguish 'linked' from 'bytes inspected'. External work remains authoritative for its original code; Minamo explains and references it rather than becoming a competing development repository.

## 5. A library that compounds in value

### 5.1 Editorial reuse and improvement

Before an authorised contribution, retrieve bounded existing coverage by concept/alias/relationship and inspect the closest relevant article section. Choose **reuse/link → targeted improvement → distinct addition → no write**. Similar titles alone do not prove duplication, equivalence or a relationship.

Provide canonical concept/function/command entries inside suitable Library articles. Each entry has a stable ID, explicit term/aliases, concise definition, article/section destination and applicable language/environment where needed. Case-sensitive command flags and symbols must not be normalised away. Ambiguous aliases offer meaningful choices; missing coverage is an honest gap.

A concept preview should answer the immediate question, explain why the link is relevant and open its full context. Backlinks should show actual related Investigations/personal work. Do not generate a decorative knowledge graph or automatic prerequisite structure to satisfy 'interconnected'.

Support quick targeted improvement of an existing explanation after a new discussion: add a discriminating example, connect a related idea, correct a mistake or refine a diagram. Existing personal captures remain tied to their original retained edition. Offer the newer explanation without silently moving old annotations.

**Editorial authority:** do not copy V1's standing remit into V2. Use a verified V2 setting with revocable, bounded scope if implemented; otherwise require explicit direction for writes. Searching/reading/flagging is not permission to maintain the Library automatically. Background generation and wholesale conversation ingestion are outside scope.

### 5.2 Content-quality rubric

Each representative populated topic should have a clear question/purpose, a direct explanation, concrete detail, one discriminating example where useful, actual source/evidence links, and a purposeful next connection. These are quality checks, not mandatory article templates or a quota of media per page.

An added diagram must explain something the prose benefits from showing. An added table must support comparison. Further reading must explain what it adds. Avoid repeated generic introductions, repeated 'GPT original' badges, filler, duplicate articles and synthetic observations disguised as personal findings. Keep a quiet, accessible provenance disclosure near the content it describes.

No numerical learning score, compulsory study sequence, streak, prerequisite course or extra personal profile is needed. Search and navigation should expose an improving resource, not a growing administrative inventory.

## 6. Two-way GPT ↔ MCP ↔ Minamo

### 6.1 Site to GPT: exact context with low friction

Provide one contextual **Discuss in ChatGPT** action in the workspace/context actions, not duplicated boxes on every page. Keep the ordinary text-selection toolbar at **Flag / Annotate**. The discussion action can use the current record, selected saved capture, or a deliberately chosen bounded set of relevant items.

Before handoff show a compact preview: topic, selected targets, edition/current status, optional short user question, and what will be included. Default to the current saved target and directly relevant linked context, not every Note or the entire Journey. Unsaved local writing is not silently uploaded or assumed visible to GPT; permit deliberate save or explicitly user-selected inclusion only when safe.

Use the host's genuinely supported ChatGPT opening/copy/share route. Do not invent an API to inject a conversation or assume the chat can read the current browser selection. The required fallback is a short copyable instruction with machine-resolvable **V2** target identities, followed by an actual supported way to open ChatGPT. It must not include private prose in URL/query strings, analytics or public share links.

Example instruction format (generated with real identifiers, never placeholders in delivered UI):

> Use Minamo V2. Discuss the saved annotation [family/id] and its exact source passage. My question is: …

The connected tool retrieves the actual private content after authenticating. Handoff references are not bearer access grants. A persistent multi-item handoff token is optional if required by the host: make it owner-scoped, bounded and revocable, store references rather than duplicated source bodies, and do not count it as learner activity. Single-record discussion should not require a new data subsystem.

### 6.2 GPT to Site: author and return to the result

Extend existing query/read/context and apply/preview operations so GPT can discover block/asset capabilities, author supported rich blocks and meaningful relationships, perform targeted changes, and read back the acknowledged result. The Site need not be open.

For an authorised learning contribution, the normal sequence is: inspect coverage → retrieve exact relevant source/record → create/update through shared guarded domain → verify committed representation → return an exact working Site destination. Do not require a separate preview for every safe ordinary write; do preserve validation and conflicts.

Receipts/readback must support a usable record/section/block destination and relevant edition identity. Display labels can change; saved identifiers must not. Return `committed`, `unchanged`, `conflict`, `unavailable` and genuinely unresolved outcomes distinctly. A 'Saved' message is valid only after acknowledgement or operation-status reconciliation.

### 6.3 Explicit context projection and modality support

Evolve `get_minamo_context` rather than always sending a whole workspace. Proposed additive options: selected targets (up to eight), optional exact saved captures, `detail: brief|standard|expanded`, and bounded relation depth (default one). Clamp to existing request/read budgets; return coverage, omissions and continuations explicitly.

The result should separate question/intent, canonical explanation references, actual evidence, personal Notes/captures, related concepts/sources, and exact return destinations. It must state whether content is current or pinned, why the relationship exists, whether an item is synthetic, and what was **actually retrieved**. An unavailable source must not leak its title/quote through an otherwise permitted parent.

For a figure/media block, provide eligible caption/alt text, semantic content if available, asset identity and the session-supported retrieval representation. A JSON asset ID does not prove GPT saw image pixels. Test a supported private image/file delivery path; if the host cannot deliver the bytes, report `visualContentInspected:false` (or equivalent) and use the eligible textual projection. Do not claim that posting an authenticated Site URL gives every GPT session visual access. The same honesty applies to audio/video and transcripts.

Publish actual supported block kinds, read/author capabilities, size budgets and catalogue/schema identity. Verify newly added fields through client-visible tools after publication where the host permits it; a working old eight-tool catalogue does not prove acceptance of new optional fields. Keep older clients functional without silently dropping unsupported supplied fields.

### 6.4 Reading changes and continuity

On navigation, foreground return and deliberate refresh, revalidate relevant current records/rights through bounded reads. A same-tab acknowledgement or cross-tab notification is an invalidation hint, not authoritative fresh data. MCP writes from another session require actual server revalidation; browser BroadcastChannel is not a server feed.

Keep an active historical reading/selection stable. If GPT updates its source, show a quiet 'Newer version available' action without rewriting the selected text or local draft. Permission revocation is different: clear restricted cached content/popups/media immediately when discovered and preserve unrelated personal prose. Use one scoped store/domain service, not a competing automatic mutation queue.

Optional cross-device 'Continue' can store acknowledged target and semantic position at deliberate milestones, not a surveillance stream of every click/scroll. Unsaved browser-local drafts are **not** cross-device synced; say so and protect them. The core two-way portal does not depend on installing a native mobile app.

## 7. Reading, composition and interaction specification

Preserve the clean V2 shell and working Notes controls. Make useful improvements, not a reskin of V1 or a gratuitous replacement of every component.

**Reading composition:** use roughly 62–72 characters per ordinary prose line; body text starts around 17–18 CSS px with 1.6–1.75 line height, responsive to available space and zoom. Controls are normally 14–16 px; supporting text 12–14 px, not the current 7–10 px decorative-label pattern for meaningful content. Maintain a clear heading scale. Existing serif display headings can remain; the palette image does not instruct a font change. Prefer spacing to boxes inside boxes.

**Desktop:** primary reading, meaningful section navigation and optional personal-work companion. Do not open every panel by default. Context references appear beside/after the relevant passage, not in a distant universal attachments area. The Notes panel may dock/focus/minimise/collapse and reopen without remounting the writing service or losing its selection.

**Mobile:** reading is primary; section navigation and context use compact labelled controls; Notes become an intentional panel/sheet with a clear return to reading. No forced four-panel dashboard. The software keyboard must not cover the current input or close/save control. Preserve the same data/capabilities and permit simple drill-down instead of squeezing desktop columns.

**Figures/code:** real intrinsic sizes, contained overflow and an enlarge/close path with focus restoration. Never render a tiny diagram in an oversized empty reservation. Diagrams with branches must retain them. Code wraps only when requested and still copies original bytes. Preserve theme-specific syntax, visible captions and actual source attribution. Images receive concise alt text, not guessed transcripts.

**Relationships:** show a short bounded related-reading/context group, each entry labelled with why it helps. Place detailed provenance/history behind an intentional disclosure. Empty/unavailable/pending/error states remain distinct and useful; no silent empty placeholders or 'No records' when only one page was examined.

**Personal overlays:** annotations and Flags must be visually distinct from inline code and native selection. Hover previews remain pointer-hoverable, keyboard accessible, touch-openable and dismissible; meaningful actions are not hover-only. An annotation editor and Notes must coexist without pretending that a blocking modal permits interaction behind it.

**Motion:** subtle functional transitions only. Honour reduced motion. No animated background, decorative graph motion, confetti or shimmering paragraphs. Loading reserves sensible dimensions and does not jump the current passage.

Use shared components such as `LearningContent`, `ContentBlock`, `ReferencePreview`, `RelationshipList`, `EvidenceReference`, `ContextHandoff` and `SaveStatus` if helpful. These names are proposals; ownership boundaries and behaviour matter more than naming. Do not introduce a new design-system library merely because this document uses component language.

## 8. Theme restoration — required early delivery

Read [THEME-IMPLEMENTATION.md](THEME-IMPLEMENTATION.md) and the reference [theme-tokens.css](theme-tokens.css). The sampled neutral values are binding design input; muted accent values are the concrete implementation selection made for this brief.

| Role | Owner image sample | Implement |
|---|---|---|
| Main canvas | `#1B1B1B` | `#1B1B1B` |
| Raised surfaces | `#252525` | `#252525` |
| Secondary surfaces | `#2D2D2D` | `#2D2D2D` |
| Subtle structural borders | `#3A3A3A` | `#3A3A3A` |
| Primary text | `#F5F5F5` | `#F5F5F5` |
| Muted text | `#B1B1B1` | `#B1B1B1` |
| Interactive blue | `#6CB6FF` | **`#8CAED1`** — less saturated |
| Cyan accent | `#43D2E6` | **`#7DB9C4`** — less saturated, used sparingly |

The reference image's surrounding background samples `#0E0E0E`; **do not mistake that for the labelled main-canvas swatch**. Do not keep green/olive page, panel, code or hover backgrounds under a new blue accent. Neutral RGB channels must stay equal for the four structural tokens.

The border swatch is deliberately subtle and does not provide sufficient contrast as the sole means of identifying a form control. Use the separately specified strong control boundary/focus/label treatments. On filled blue/cyan buttons use dark text, not white. Muting the accents must not mean making links, focus or personal annotations faint.

Theme acceptance spans Home, search, reading, Notes, organiser, authoring, source/relationship previews, modal/portal surfaces, code editors, diagram enlargement, optional tools and narrow mobile states. Audit literal colour overrides and inline/JS-generated styles, not only `:root` variables. Reuse tested layout; do not disturb content or save behaviour during the palette patch.

## 9. Delivery workstreams and dependency order

These are concurrent engineering increments within issue #1, not new owner commissions.

| Workstream | Work | Depends on / verification |
|---|---|---|
| A — neutral theme and reading polish | Map semantic tokens, remove sage overrides, readable type, focus/selection and editor/media styling | Start immediately; colour script plus actual populated component review; independent of new database schema |
| B — rich content and assets | Reconcile current source/upload work, implement block registry and versioned textual projections, asset lifecycle, shared render/edit/export | Domain admission before writes; retain old editions; image/table/diagram/source examples |
| C — knowledge relationships | Typed purposes, canonical references, reverse links, targeted editorial patches, useful contextual discovery | Use B's stable targets and existing query/eligibility; no duplicated bodies or invented links |
| D — two-way GPT continuity | Bounded context projections, supported handoff, return links, MCP rich-authoring/readback and modality honesty | Reuse real eight-tool domain; test host-provisioned fields separately; B/C supported representations |
| E — integrated acceptance | Re-run changed-contract regressions, realistic populated flow and adversarial cases, compare on mobile/desktop | Integrate throughout; no final screenshot-only certification |

Keep a concise implementation disposition in the current release record keyed to the requirement IDs below. When a requirement is already met, cite the actual implementation/test and continue. If a host feature is unavailable, implement the useful supported path and document the exact blocked capability; do not use that to postpone unrelated core improvements.

## 10. Acceptance specification

### 10.1 Representative end-to-end scenario

Use one meaningful small topic for integrated verification: for example a Python Unicode question grounded in a user-provided Kali snippet/terminal output and a supplied GitHub reference. Do not seek private learner artefacts merely to run an engineering test; a synthetic fixture with the same shape is sufficient for automated acceptance and must be labelled as such. Genuine learning acceptance remains a separately described observation when available.

1. Begin with the question and authentic/synthetic evidence correctly labelled. In GPT, find an existing relevant article and improve one explanation rather than creating a duplicate by default.
2. Through the installed MCP, save a useful code block, a comparison table, a faithful explanatory diagram, a privately stored illustrative screenshot/image and appropriate source/relationship references. The same operations must work with the Site closed.
3. Follow the returned Site link to the intended section. Read a coherent, populated composition—not a raw JSON editor or attachments list. Open a canonical function/concept explanation and return without losing the Investigation context.
4. On the narrow layout, annotate an exact passage and make a linked personal Note. Reopen it, check acknowledged saving, and follow its source back. Open/close Notes without losing reading position.
5. In a fresh connected GPT context, retrieve the exact capture, its original edition and relevant Note. Confirm the actual fields returned, including media inspection limits. Do not count a same-chat remembered description as fresh retrieval.
6. Improve the canonical article again. The original captured passage still returns to its retained edition, and another Investigation sees the updated current explanation without a copied article.
7. Remove permission to one admitted source/asset in the fixture. Its content stops appearing through ordinary/history/preview/MCP/export paths; independent personal writing remains usable.

An optional browser reproduction can illustrate the concept, but is not a prerequisite to completing this core flow and never becomes evidence of a Kali execution.

### 10.2 Required checks and evidence

| ID | Observable acceptance | Minimum evidence |
|---|---|---|
| CE-01 | Reuses current implementation; no original-project writes; existing genuine V2 data retained | Source diff/release identity and scoped test record inventory |
| CE-02 | One content contract/renderer across at least Article, Investigation and Note, and compatible reading across other supported families | Schema, API/MCP roundtrip and populated surface tests |
| CE-03 | Rich prose/code/table/diagram/image/reference appears in context and stays editable without losing unrelated blocks | Field-targeted update/readback and rendered UI |
| CE-04 | Media/file capability is accurately declared; supported private reads/playback and supplied transcript are usable | Tested capability matrix; no claimed unsupported modes |
| CE-05 | Branching diagram preserves every meaningful node/edge/label; unsupported source shows a truthful fallback | Expected semantic structure plus rendered inspection |
| CE-06 | Assets are owner-private, validated, bounded, retry-safe, retained historically and recoverable/exportable under current rights | Actual R2/domain tests, not mocked success |
| CE-07 | Old text/rendition identities remain valid; new captions/tables/transcripts have stable exact textual parts | Legacy + new projection tests, repeated text and Unicode cases |
| CE-08 | A source excerpt retains source coordinates and a separate display return; cross-source selection never guesses | Multi-display/source capture and return tests |
| CE-09 | Text/code copy excludes UI chrome and preserves expected bytes; wrapping/highlight changes do not change the saved text | Exact-string assertions and real browser selection |
| CE-10 | Two Investigations reuse one canonical article; purposeful links/backlinks remain truthful and permission-filtered | Record identity/count check and navigation flow |
| CE-11 | Canonical aliases resolve correctly, including ambiguity, case-sensitive identifiers and unavailable targets | Domain cases and keyboard/tap preview |
| CE-12 | An authorised second discussion improves an existing explanation without automatic duplication or fake learner activity | Before/after revisions and actor/basis review |
| CE-13 | Site handoff resolves exact V2 targets with bounded context and a working fallback; no private prose in URL | Real produced request/deep link and supported host route |
| CE-14 | GPT rich-authoring/readback works through actual installed tools with Site closed | Hosted receipts + independent readback; local tests labelled separately |
| CE-15 | A new GPT context retrieves the saved Note/capture and exact edition, not remembered chat text | Actual fresh-context tool evidence or explicit host limitation |
| CE-16 | Media not actually delivered to GPT is never reported as visually/audibly inspected | Text-only and supported-binary host cases |
| CE-17 | Relevant MCP updates appear after bounded revalidation; current writing/selection survives | Two-client or MCP/browser update/conflict cases |
| CE-18 | Source/asset revocation hides restricted material from previews, history, cache, exports and context | Admission/revocation tests including relation and filename leakage |
| CE-19 | Local draft/uncertain save/replay keeps exact operation; no duplicated Note or lost text after reload | Existing regression suite extended for rich content |
| CE-20 | Neutral palette and muted accents applied throughout ordinary, overlay and tool surfaces | Token script plus computed styles/populated screenshots |
| CE-21 | Text, links, focus, selected state and controls remain distinguishable; colour is not the only signal | Contrast + keyboard/high-contrast/hover inspection |
| CE-22 | Usable at 320, 390, 768 and 1440 CSS-pixel widths, text enlargement and keyboard opening on mobile | Real viewport tests; physical device evidence only when performed |
| CE-23 | Exact passage → reference preview → related article → return → Note has no context or focus loss | Whole-flow desktop and narrow-layout test |
| CE-24 | Unknown blocks, corrupt assets, timeouts, permission failures and empty/partial results have honest recoverable states | Fault-injection cases and UI readback |
| CE-25 | Rich content is exported with relationships/provenance and permitted bytes, and restored by the active protected recovery work | Archive integrity + fresh isolated restore; not merely a download button |
| CE-26 | Ordinary reading does not eagerly load optional engines/media; improvements do not regress measured loading/typing | Same-fixture cold/warm bundle, request, input and memory comparison |
| CE-27 | New component/update does not imply running code or changing learning status; tools remain contextual/secondary | Opening/reading tests and activity audit |
| CE-28 | Current private deployment corresponds to checked source; old and new schemas/clients fail safely or remain compatible | Native/GitHub tree identity, CI, saved/deployed version and host catalogue evidence |

**Product-quality review (no score):** Is the explanation actually useful? Can the owner identify the question, evidence, explanation and next worthwhile connection? Are prose/code/figures readable without zooming the entire page? Is the original context recoverable? Is the page pleasant without oversized empty regions or repetitive controls? Record specific shortcomings and fix them; a subjective 'looks premium' sentence is not acceptance.

### 10.3 Particularly important adversarial cases

Use the same text twice; compose/decompose Unicode and include astral characters; annotate code that contains tabs/CRLF; reorder a table row or content block; revise a linked article while a Note is dirty; send an identical operation twice; receive a save acknowledgement after navigation; revoke an image during enlargement; Trash an externally updated relation target; request a source through a stale handoff; open a direct link from outside the loaded collection; switch accounts/history generation; reload with a pending asset/Note; restore an archive with missing or tampered bytes. Preserve existing guards instead of implementing new exceptions solely to pass a test.

## 11. Done means integrated, not everything imaginable

This continuation is complete when the required rich-content set, deliberate media capability, shared presentation, canonical relationships, real two-way GPT flow and neutral theme satisfy the specified tests and have a coherent private release. Unavailable host-mediated binary delivery or genuinely unperformed human/device checks must be named precisely; they must not be described as complete.

Finish the active source-permission, upload and protected-recovery work as dependencies of the core, not as a competing backlog. Do not hide unfinished core items under 'future enhancement'. Equally, do not add native apps, tldraw, new learning engines, semantic-vector infrastructure, automatic ingestion or compulsory exercises to this programme.

The next report should explain **what the owner can now read, discover, discuss, retain and revisit**, with exact evidence and remaining limits—not primarily the number of components or tests.

## 12. Sources and implementation evidence

Repository sources are private and should be read through the connected GitHub tool. The pinned review coordinates are for reproducibility; current equivalent implementation should be reused.

- [Active full-build commission](https://github.com/frekland/minamo-v2/issues/1)
- [Owner learning-experience priority](https://github.com/frekland/minamo-v2/issues/1#issuecomment-6317344179)
- [Version-3 release receipt](https://github.com/frekland/minamo-v2/issues/1#issuecomment-6317354047)
- [Reviewed contracts](https://github.com/frekland/minamo-v2/blob/82583c84fe30ef59bb9bca6085064cd40d551cac/lib/contracts.ts)
- [Reviewed HTTP/MCP adapter](https://github.com/frekland/minamo-v2/blob/82583c84fe30ef59bb9bca6085064cd40d551cac/lib/domain-handler.ts)
- [Reviewed reader](https://github.com/frekland/minamo-v2/blob/82583c84fe30ef59bb9bca6085064cd40d551cac/app/reader.tsx)
- [Reviewed workspace CSS](https://github.com/frekland/minamo-v2/blob/82583c84fe30ef59bb9bca6085064cd40d551cac/app/workspace.css)
- [Reviewed global CSS](https://github.com/frekland/minamo-v2/blob/82583c84fe30ef59bb9bca6085064cd40d551cac/app/globals.css)
- [Source-sync contract](https://github.com/frekland/minamo-v2/blob/82583c84fe30ef59bb9bca6085064cd40d551cac/docs/SOURCE-SYNCHRONISATION.md)
- Owner-supplied palette image, 472×695 pixels, 21 October 2026; centre swatches sampled, not OCR-inferred. Image is not copied into the repository.

Accessibility references and calculated palette evidence are in THEME-IMPLEMENTATION.md. Proposed component names, new data fields, media budgets and design dimensions in this brief are implementation decisions/recommendations, not claims that those capabilities already exist.

