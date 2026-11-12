# Interface design system — integrated staging

The canonical palette remains `app/theme.css`. `app/interface-foundry.css` introduces semantic `--if-*` aliases for existing Minamo tokens; it defines no alternative global palette and changes no root application mode. Activity Studio and Learning Atlas import those aliases and share their neutral charcoal surfaces, muted blue links, cyan selection emphasis, focus, status colors and typography. This is staged code requiring owner visual review before release.

## Token and component contract

| Role | Interface token | Canonical owner |
| --- | --- | --- |
| Page / panel / raised / source | `--if-canvas`, `--if-surface`, `--if-raised`, `--if-code` | `--mn-canvas`, `--mn-surface`, `--mn-surface-secondary`, `--mn-code-bg` |
| Heading / prose / supporting text | `--if-text`, `--if-body`, `--if-muted` | `--mn-text`, `--mn-text-body`, `--mn-text-muted` |
| Dividers / control boundaries | `--if-line`, `--if-control-line` | `--mn-border`, `--mn-border-control` |
| Accent / links / selection / focus | `--if-accent`, `--if-link`, `--if-selected`, `--if-focus` | Existing Minamo accent, interactive, selected and focus tokens |
| Evidence state | `--if-positive`, `--if-warning`, `--if-danger` | Existing Minamo success/warning/danger tokens |
| Panel / control radius | `--if-radius`, `--if-control-radius` | Existing Minamo radius tokens |
| Prose size / measure | `--if-prose-size`, `--if-measure` | Existing Workspace reading preferences |

Aliases have the exact canonical fallback values for isolated development stories without the application theme. Controls inherit system UI type; source uses the system monospace stack. No external font request is added. Prose follows the existing Workspace reading-size preference instead of a fixed miniature technical font. CJK uses ordinary selectable source text, strict line breaking and generous line height; ruby pronunciation metadata is non-selectable. These rules do not create or transform canonical ranges.

## Presentation rules

- Main task headings use a restrained 22–29px system UI scale. The original global Reader and its serif hierarchy remain independently owned.
- Controls have 44px minimum height as a design choice. W3C's WCAG2.2 minimum criterion is 24px or adequate spacing, with exceptions; 44px is not described as that criterion's universal legal threshold.
- Text labels carry all status meaning. An Activity save remains supplied evidence and never becomes a checkpoint through a green status color.
- Source is horizontally scrollable, keyboard-focusable and copyable. Overflow stays inside the source pane. Body text wraps; SHA/file paths may wrap at any character.
- Panels use a single border and quiet fill. Gradients, asymmetric decorative cards and the unrelated Atlas blue-black palette were removed. State is communicated through exact names, border/selection and provenance text.
- Focus uses a 3px canonical focus ring with offset. Search paints the ring around the whole compound input. Forced-colors mode preserves control and selected-node boundaries; reduced motion stops animation and smooth scrolling.
- No CSS rule mounts, hides or replaces the existing Notes coordinator. Workspace modes and Notes docking continue to own available space.

## Responsive decisions

Activity and Atlas are named inline-size containers. They respond to their actual allocated width, including when a desktop Note is docked, rather than assuming a wide viewport means a wide code pane. Source file lists become a two-column compact list at 650px and a one-column list below 360px. Workbench slot-specific navigation is implemented by the shared adaptive host, not by these styles.

Atlas defaults to a semantic card/list presentation. Its existing four graph layouts remain available; the map becomes the initial view only when the actual Atlas container is at least 900px wide, and the Evidence river initially remains a chronology. An explicit map/cards choice is respected. Cards and graph are equivalent alternative surfaces instead of a graph followed by a duplicate 24-card wall. The graph is not a mastery view.

Atlas uses one primary region and one source inspector. The inspector becomes a second column only at 900px of actual Atlas width; smaller layouts stack it. Selecting a card deliberately focuses its detail heading and scrolls that exact inspector into view. Escape or Return to references restores the originating card control. Every card controls the uniquely identified inspector. Filtering removes a now-hidden selected item immediately, preventing details unrelated to the visible results. Graph keyboard guidance says selection and Escape; it no longer advertises deletion when deletion is disabled.

## Alternatives and recommendation

The broader functional workbench compares context-first, artefact-first, sequential and power-user layouts. The selected geometry is independent from the theme. The recommended visual baseline is comfortable neutral charcoal with task/material first, deliberate hints and an optional inspector. Compact density is appropriate for experienced multi-file work; it must preserve label readability and touch controls. This document records engineering recommendation, not an owner preference result or a human usability study.

Rejected within this implementation: a fourth global app mode, a second palette per module, a permanent three-column phone miniature, tiny 9px graph/list captions, silent disclosure of hints and a second Note editor. A graph plus a full duplicate card catalogue was rejected because the visible toggle promised one representation but rendered both.

## Official evidence and limits

Retrieved through Firecrawl on 25 October 2026:

- [MDN container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries): inline-size containment lets children respond to the width of their actual container. The retrieved cached page was dated 24 October; current browser acceptance is reported separately.
- [W3C target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): 24-by-24 CSS pixel criterion or spacing, with inline/equivalent/essential and other exceptions. Our 44px controls are the chosen product ergonomics.

Retrieved through Context7's official React Flow documentation index `/websites/reactflow_dev`:

- [React Flow accessibility](https://reactflow.dev/learn/advanced-use/accessibility): Tab focus, Enter/Space selection, Escape cancellation, auto-pan on node focus and customizable `ariaLabelConfig`. Existing disabled dragging/deletion and exact source navigation remain intact.

The CSS and SSR tests are not physical Pixel, TalkBack, IME, actual native selection-handle or authenticated production evidence. Real staged browser screenshots/gestures and release limits belong in VISUAL-ACCEPTANCE.md. No source revocation, ownership or persistence authority is moved into CSS.

## Corrections from independent browser challenge

The first Chromium challenge found two concrete defects in the frozen Atlas behavior. Enter did not reliably populate the inspector despite the node's instruction, and the 30-second rights refresh removed the complete graph and reset the inspector while it was being read. The staged correction explicitly handles Enter/Space/Escape for known visible map node IDs and preserves same-query graph DOM/selected identity during revalidation. A changed query/lens/focus/owner generation clears the old graph. Failed or timed-out revalidation clears source content; revoked/removed/filter-hidden selected nodes no longer render details. A request times out after ten seconds so a stalled connection cannot retain an indefinitely unverified view. These changes preserve rights authority while avoiding unnecessary repeated reading interruption. Challenger rerun and screenshots are recorded by the independent acceptance owner.

The executable `tests/interface-design-system.test.mjs` checks 4.5:1 ordinary text contrast on five canonical workbench surfaces and 3:1 focus/control boundary contrast. This is color arithmetic for the actual palette, not a substitute for inspecting rendered controls, graph zoom or human assistive technology use.

A further browser challenge found Atlas source links caused full-document navigation, replacing the Workspace and pending Notes writer. The integrated Atlas now accepts the existing Workspace navigation callback for ordinary exact-source clicks and graph double-clicks. Anchors retain their real href and modified/new-tab behavior. Current query-context matching also prevents a transient prior-owner or prior-lens graph during request changes.
