# Technology decisions and source boundaries

The supplied commission contains the wider30+candidate landscape. This implementation revalidated the technologies chosen for the critical path; it does not claim every landscape library was installed or independently benchmarked.

| Role | Selected implementation | Evidence / alternatives |
|---|---|---|
| Structured semantic Atlas |@xyflow/react12.12.0, lazy |[Official accessibility](https://reactflow.dev/learn/advanced-use/accessibility) and [SSR](https://reactflow.dev/learn/advanced-use/ssr-ssg-configuration), queried through Context7; actual D1, deterministic layouts, SSR and mobile card source checks |
| Freeform optional canvas |tldraw5.5.2, DEV all-synthetic wrapper |[Licence keys](https://tldraw.dev/sdk-features/license-key), [custom shapes](https://tldraw.dev/features/customization/custom-shapes-and-tools); pinned SDK licence source differs from older community summary, so exact licence/host/telemetry acceptance stays gated |
| Source editing/navigation |Existing CodeMirror and inert exact file viewer |Avoided an additional Monaco runtime; local/GitHub workflow runs real challenge code |
| Maths/Japanese/graphs/3D/audio |Frozen Foundry trusted adapters; existing KaTeX/Three/Web Audio |Actual adapter registry admission/composition/disposal and canonical selection tests; no extra widget authority or arbitrary component imports |
| Scientific outputs |Existing pinned Pyodide0.28.3, bounded typed bundles and private R2 assets |Actual Node shared-controller computation; browser-origin enforcement remains unverified; default package excludes50MBscience assets |
| Data exercises |Existing SQLite/sql.js, CSV and Foundry table/chart helpers |No measured requirement justified adding DuckDB/Plotly/Vega/Observable Plot to ordinary boot; generated SQL/CSV oracles actually execute |
| Attempts/state |Existing domain CAS/receipts and explicit UI pending state |A new XState or form-state database would duplicate existing lifecycle authority; no claim of an installed XState experiment |
| Untrusted React/JS live preview |Local/external package handoff |[Sandpack bundler documentation](https://sandpack.codesandbox.io/docs/advanced-usage/bundlers) confirms external bundler/CDN dependency; no private code was transmitted, and no same-origin sandbox guarantee was invented |

Sandbox research used [MDN iframe sandbox documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox) and a read-only SOFA search/post on browser-held delegated authority. These inform engineering decisions; actual source, D1/Worker tests and observed runtime results determine conformance. Research calls sent public technical terms, never private learner content or credentials.

No service subscription, new provider account, paid runtime or production SDK licence was purchased. Existing user-connected research services and official package registries were used within the authorised engineering task.
