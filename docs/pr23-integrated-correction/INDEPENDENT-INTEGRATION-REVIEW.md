# Independent integration and learner-quality challenge

23 October 2026. A separate agent, which did not implement these features, reviewed the commission, owner Library clarification, current diff, actual component rendering tests and a synthetic request/response tutor handoff. This is an engineering review, not physical Android owner acceptance or proof of universally correct GPT tutoring.

## Material findings sent to implementation owners

| Finding | Evidence and required correction | Disposition |
|---|---|---|
| Rich Note conversion could silently rewrite unsupported source | Executing the real ProseMirror codec flattened a multiline table into one line and escaped task/strike syntax on an unrelated edit. The existing custom Note renderer is not a GFM renderer; the demonstrated defect is source/round-trip loss, not a claim that V19 rendered those constructs richly. A parser→serializer→parser equality check alone cannot catch loss at initial parse. | Notes owner added compatibility guards and original-source fallback; final regression verification recorded below. |
| Library search term was ignored | New `ServerLibraryIndex` constructed `query=`, while the actual GET handler reads `q=`. Source-grounded path mismatch would make typed search return unrelated results. | Corrected; independent actual authenticated HTTP path regression passes. |
| Decision evidence could open the wrong edition | New decision refs accepted an exact record revision without rendition, but initial eligibility projection only enriched fact refs. A link labelled revision 1 could open current revision 2. | MCP owner enriched decisions through the same exact-revision cache; added changed-Note regression. |
| A summary correction could retain an uneditable wrong decision | Initial correction form preserved new decisions/reasons/nextAction invisibly while editing only summary/facts/questions. | Explicit decision choice/reason/status/removal and next-action controls added; independent interface regression passes. |
| Paging earlier history could replace current perspective | Initial history paging spread the older page's `resume` over the first page's current projection. | Current context retained when appending history; independent interface regression passes. |

The review also prompted removal of a duplicate Library heading, use of the saved practical next action in Home cards, and a rich-editor lifecycle fix when the same Note changes from rich-compatible to source-only content. The Notes owner corrected the detached-view risk and added safe fenced-code/newline handling. Root browser testing subsequently found and drove correction of a heading-to-prose update loop, code-editor contrast and an overwritten paused-save explanation.

The MCP owner also checked the recovery boundary prompted by new decision evidence: export/import sanitization must redact decision text and nextAction when underlying source permission is revoked. It added that regression and correction rather than relying on normal context-read tests alone.

## Independent tutor continuation

Input: the actual local MCP `profile:tutor` response produced by a synthetic owner fixture. Its one current checkpoint contained a provisional combined optional-profiling/immediate-results choice and its reason; a learner-reported `node --version` attempt with no supplied output; a misconception about installing Node versus executing JavaScript; an unresolved value-change question; and the next Node exercise. No real learner transcript or record was copied into this review.

Continuation composed by this reviewing agent using that response:

> We can keep your provisional design: immediate recommendations, with optional profiling to refine them. That gives someone a useful first result without requiring a questionnaire. There is no need to reopen that choice before this coding step.
>
> You reported trying `node --version`, but the checkpoint contains no output. Run it in your terminal and paste what it actually prints. This checks whether Node is available; it does not run your JavaScript file. Once that is confirmed, we will create `mood.js` containing `const mood = "calm";` followed by `console.log(mood);`, predict the output, and run `node mood.js`.

Assessment: the continuation uses the preserved choice **and reason**, respects its provisional status, recognises missing execution evidence, addresses the saved misconception and starts the agreed practical action. It does not restart the onboarding dilemma, claim a successful program, infer mastery, or create a checkpoint. This is one independent agent example from a synthetic response, not a controlled model study or a guarantee for all future chats.

## Verification status

Initial focused execution found three outdated presentation assertions after checkpoint/overview administration moved. They were corrected. Final independent focused execution passed **41/41** tests: 36 across real Notes codec/history, MCP/D1, exact-mark rendering/selection, manuscript authoring and educational SSR; and five covering the real authenticated Library HTTP route, resume/correction/paging and recovery/catalogue round trips with revoked evidence. This is a bounded independent run; the lead engineer owns the complete mandatory suite, release build and hosted acceptance receipts.

Physical Android, TalkBack and third-party playback are not inferred from code or synthetic viewport tests. No unresolved material defect was found in the independently reviewed integrated paths; the final Notes browser corrections and hosted release still require the lead engineer's final verification.

## Independent Library educational and rendered review

The revised existing JavaScript, React/Vite and Fetch/HTTP Articles were read independently before publication. They now explain runtime boundaries, binding/mutation, ordered collections, errors and modules; render snapshots and queued state updates; and HTTP/parse/schema/cancellation boundaries. They are reusable explanations with original worked examples and troubleshooting, rather than copies of Journey tasks. The beginner task begins with actual Node/terminal inspection and a tiny file; the associated open Investigation separates UI execution, metadata matching and listening evidence.

Three concrete teaching corrections were applied before publication: remove repeated React project-anatomy explanation, explicitly place `addTwo` inside the component owning its state setter, and include the `useState` import in the independent Picker example. Actual Reader server rendering retained all 23 sections, 14 CodeMirror reading viewers and three native flow/state diagrams. Independent execution of the actual original JS/HTTP examples passed 13 assertions, covering expected values, mutation, indices, deliberate errors, map/filter, missing-data checks, and HTTP/JSON/schema failures. These are reviewer runs with no network and no learner-execution claim.

Independent browser review used a separate cloud tab and the supported internal preview after its initial execution-profile repair. In the rendered synthetic Library, Area→topics→Functions→exact `list.copy()` search reached the correct pinned section/part/rendition, and Back to Library restored the subject, category and search. The same flow was examined in a real 390×844 CSS iframe. Code stayed inside its viewer with horizontal scrolling/wrap available; the connected identity diagram remained visible; ongoing section navigation selected the requested section. This is simulated viewport evidence, not physical Android/touch-handle acceptance. A duplicate outer Library heading was identified visually and removed by the UI owner.

An additional independent browser pass of the production resume component confirmed that the practical task, earlier provisional choice and its reason, reported attempt, GPT interpretation and unresolved question are visibly distinguished. Selecting a corrected latest checkpoint replaced the practical action. Unavailable evidence and withdrawn saved work withheld the unsupported account instead of presenting an older checkpoint as current.

Pedagogical verdict: the revised material provides enough explanation, executable examples, boundary conditions and diagnostic guidance for independent reuse. Journey instructions remain actions, Investigations remain unresolved questions with evidence methods, and Library articles explain reusable mechanisms. Publication and section counts alone were not the acceptance basis: source reading, concrete teaching corrections, actual example execution and rendered reference navigation were assessed together. The live publication agent separately verified exact readback for its guarded seven-record correction and unchanged genuine checkpoints; that private receipt was not copied into Git.

## Future ordinary GPT authoring follow-up

The owner's clarification places ordinary future resource creation ahead of curated examples. The independent follow-up reviewed the actual tool descriptions, server editorial guide and normal manuscript paths. `publish_minamo_manuscript` now directly exposes the Library quality intent and optional natural catalogue declaration; the lazily retrieved guide supplies connected original examples, role distinctions, exact reuse/revision shapes, relevant rich syntax and source boundaries. It does not require fetching a manual on every tutoring turn or force every Article into a fixed template.

Structural author feedback is more actionable than the previous generic short-body reminder. A code-only section identifies its document, canonical section path and explanatory repair; heading-only material is not miscounted as prose. Exact Journey-body copies and recognised repeated administrative scaffolding produce distinct cues. These are advisory observed-structure signals, not semantic certification: plausible but inaccurate prose can still pass, and GPT retains responsibility for usefulness, correctness and teaching depth. No minimum word count, compulsory code, sources, diagram or video quota was added.

`tests/pr26-independent-authoring.test.mjs` uses a separately authored working-directory explanation rather than the commissioned JS/React/HTTP corpus or the server's example. Through ordinary local MCP it publishes an Area, substantial Article and practical Journey together; discovers an exact `pwd` command/alias; inserts a new section through an explicit revision while preserving the command's section/example IDs, Area membership and old rendition; and reuses the same Article from a different Journey without duplication or mutation. A code-only reference receives an exact nonblocking repair, while a short standalone conceptual explanation can publish without mandatory code/media. Ordinary preview omits the complete canonical echo/source map; explicit `detail:true` restores both for actual rendered inspection. This validates reusable mechanics and editorial feedback separately from any single curated article's quality.

## Bounded existing dependency-advisory review

The package audit still reports existing `next@16.3.8` advisories; this review does not claim zero advisories or a general proof against denial of service. The actual Worker imports `vinext/server/fetch-handler`; its built image and action handling are Vinext implementations, with no bundled Next-native `image-optimizer`, `use-cache-wrapper`, or `app-render/action-handler` path found.

- [GHSA-2464-fhr4-w9xw](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw): the official advisory gives `sharp >=0.35.5` as a workaround for its glibc image-optimization condition. Resolving `sharp` from the installed Next package returned **0.35.5**. The deployed Worker uses a Cloudflare/Vinext image adapter, not a glibc Next server.
- [GHSA-673q-mjm6-r5xr](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr): the stated condition requires Cache Components with a `use cache` function returning multiple typed arrays. No such directive exists in app/lib/worker source; the Next-native wrapper was not found in the built Worker.
- [GHSA-p3m5-59mp-jv5r](https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r): this app has a server action, so absence of actions is **not** a valid dismissal. Its request/decoding path is Vinext's `app-server-action-execution`, not the affected Next-native action handler. This source/bundle inspection found no demonstrated path to the specified Next implementation; it does not establish that all similar decoder or resource-exhaustion risks are absent.

No unrelated framework migration was introduced on this evidence. Reassess when changing the serving runtime, enabling Cache Components or changing image processing. Official advisory pages were retrieved through Firecrawl during this review.
