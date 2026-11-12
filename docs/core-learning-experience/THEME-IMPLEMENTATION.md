# Minamo V2 — neutral charcoal and restrained blue/cyan

**Required continuation of issue #1 · 21 October 2026**

Restore the owner's supplied palette while keeping the new, cleaner V2 layout. This is not a return to V1's navigation or a request to recolour the ChatGPT interface. The only intentional adjustments to the eight supplied roles are slightly less saturated blue and cyan.

## 1. Evidence and selected values

The uploaded image is 472×695 pixels. Central interior samples, away from rounded edges, labels and antialiasing, produce the values below. Each sampled patch contained 1,080 pixels of its reported colour. These are screenshot samples, not a claim to have recovered the original design source file.

| Role in owner's image | Sample | Required implementation | Decision |
|---|---|---|---|
| Main canvas / primary background | `#1B1B1B` | `#1B1B1B` | Retain |
| Raised surfaces / panels, reading surfaces | `#252525` | `#252525` | Retain |
| Secondary surfaces / hover, nested areas | `#2D2D2D` | `#2D2D2D` | Retain |
| Borders / subtle structural separation | `#3A3A3A` | `#3A3A3A` | Retain for structure, not every control |
| Primary text / titles and important content | `#F5F5F5` | `#F5F5F5` | Retain |
| Muted text / supporting information | `#B1B1B1` | `#B1B1B1` | Retain |
| Interactive blue / links, selection, focus | `#6CB6FF` | `#8CAED1` | Selected muted blue; lower saturation, still readable |
| Cyan accent / sparing secondary accent | `#43D2E6` | `#7DB9C4` | Selected muted cyan; use sparingly |

The image outside the labelled swatches is `#0E0E0E`. It is **not** the supplied main-canvas role. Keep the labelled canvas at `#1B1B1B`.

Added semantic values: body text `#E2E2E2`, required control border `#888888`, selected fill `#2A3A4A`, annotation fill `#273D42`, code background `#202020`, and dark text on filled accents `#1B1B1B`. These are design choices in this brief, not extra colours sampled from the image. Restrained success/warning/error colours are reserved for actual statuses and do not reintroduce a green brand palette.

## 2. One token owner and a complete migration

Observed current palette owners are `app/globals.css` and `app/workspace.css`. Both use tinted charcoal and sage accents. `workspace.css` additionally hard-codes colours on search, navigation, cards, badges, buttons and decoration. Changing only `--v2-accent` will leave a largely green application.

Use [theme-tokens.css](theme-tokens.css) as the reference. Promote its canonical `--mn-*` variables to one actual application theme file, then map the existing `--bg`, `--panel`, `--line`, `--ink`, `--muted`, `--accent` and `--v2-*` aliases to it. Remove or reconcile duplicate root definitions. Keep the existing build and CSS import order deterministic.

The historic `--accent` and `--v2-accent` roles drive actions, so they map to the **interactive blue**. Cyan has its own secondary semantic role. Do not give every card/heading/icon a cyan accent.

Audit all of:

- `app/globals.css`, `app/workspace.css`, `app/reader-notes.css`, `app/tools.css`;
- inline React styles, CSS-in-JS, SVG-generated diagram styles and chart configurations;
- CodeMirror and other editor theme extensions, code highlights and placeholder styling;
- dialogs/popovers portalled outside `.v2-app`, native form controls, file/media views;
- any iframe/isolated rendered surface that needs explicit theme input rather than inherited CSS.

Replace literals **by meaning**. Do not blindly turn every green pixel into blue: real code syntax, a success status, or an original screenshot may legitimately contain another colour. Rendered source screenshots must not be globally filtered to match the interface.

Apply the theme during initial server/HTML rendering, not after a delayed client effect. No green/white flash before hydration. Preserve a real existing theme preference if one exists; do not invent or silently remove a light-mode setting. The requested default is this dark neutral theme.

## 3. Component-state rules

| Element | Resting state | Interaction/state treatment |
|---|---|---|
| Page/chrome | Neutral canvas | No green gradients or coloured ambient wash |
| Reading/personal panels | Raised surface; subtle structural border | Elevation through restrained separation, not tinted panels |
| Nested region/hover | Secondary neutral surface | Hover must not be the only discoverable action cue |
| Prose links | Muted blue and underline | Hover `#A3C1DF`; keyboard ring; not colour alone |
| Filled primary action | Blue background, **dark** label | Hover/pressed tokens; keep a dark gap before focus outline |
| Secondary action | Neutral, readable text/icon | Explicit outline when needed to recognise the control; do not rely on subtle panel border alone |
| Search/inputs | Canvas or raised surface; readable placeholder | Strong boundary `#888888` when required; visible focus even inside search wrappers |
| Selected navigation | Quiet selected fill plus blue edge/icon and active state | `aria-current`/selected semantics; fill colour alone is insufficient |
| Native text selection | Selected fill, primary text | Distinct from personal annotation and inline code |
| Annotation | Cyan-tinted quiet fill and solid cyan underline/marker | Keyboard/touch access; do not interfere with exact text offsets |
| Passage Flag | Dotted blue underline/explicit marker | Distinguishable from annotation; no filled neon highlight |
| Inline code | Neutral nested fill, monospace, normal text contrast | Not the same visual shape as a personal annotation |
| Diagram | Neutral geometry; blue for meaningful actions/paths, cyan selectively | Labels/text alternatives; distinguish branches without colour alone |
| Save/error status | Text label + restrained icon/status colour | 'Saved' only after acknowledgement; status colour never means learner progress |
| Disabled control | Clearly unavailable with semantic state | Do not globally apply `cursor:wait` to every disabled control; wait means busy, not unavailable |

Use a two-pixel focus outline with a three-pixel offset as the implementation baseline. Ensure the gap reveals the dark adjacent surface around filled blue buttons; a blue ring touching an identical blue fill is not sufficient. Keep focus visible and unclipped by rounded/overflow containers. Respect forced-colours and reduced-motion preferences.

Keep meaningful text at readable sizes. The current 7–10 px badge/eyebrow patterns should not be used for information the learner needs. Body 17–18 px, controls 14–16 px and secondary information 12–14 px are starting design dimensions; validate actual layouts rather than forcing every label into one size. Do not use opacity on whole cards to mute text, because it also changes all contrast pairs.

## 4. Calculated contrast evidence

The supplied script checks **70 solid sRGB foreground/background pairs**, neutral values and reduced accent saturation. It uses unrounded ratios for pass/fail. Selected results:

| Foreground | Canvas `#1B1B1B` | Raised `#252525` | Secondary `#2D2D2D` |
|---|---:|---:|---:|
| Primary `#F5F5F5` | 15.80:1 | 14.06:1 | 12.63:1 |
| Body `#E2E2E2` | 13.30:1 | 11.83:1 | 10.63:1 |
| Muted `#B1B1B1` | 8.03:1 | 7.15:1 | 6.42:1 |
| Blue `#8CAED1` | 7.46:1 | 6.64:1 | 5.96:1 |
| Cyan `#7DB9C4` | 7.88:1 | 7.01:1 | 6.30:1 |

The text pairs exceed the WCAG 2.2 AA 4.5:1 normal-text threshold. Important non-text control/state information uses at least 3:1 against its relevant adjacent colours. These are token checks, **not whole-app conformance or screenshot verification**. Transparency, gradients, actual foreground choice, focus geometry and overriding CSS need browser inspection.

Two explicit failures to prevent:

- `#3A3A3A` against `#252525` is **1.35:1**: useful for quiet structural separation, not as the sole information identifying an input/control.
- `#F5F5F5` on filled `#8CAED1` is **2.12:1**: use dark `#1B1B1B` labels instead, which give **7.46:1**.

Run from this folder:

```sh
node verify-theme.mjs
node verify-theme.mjs --json > palette-evidence.json
```

`palette-evidence.json` is generated reference evidence, not a statement that the application has adopted these tokens. Re-run after a deliberate palette change. Do not merely change test thresholds to make a new colour pass.

## 5. Browser acceptance for the palette increment

Test populated Home, Journey, Investigation, Library article, source preview, Notes, organiser, intentional authoring, search, diagram enlargement and optional tool editor. Include code, an annotated passage, a Flag, a screenshot, a table, pending/failed/saved messages and a disabled control. Every imported neutral surface and every portal should match the selected theme.

Check computed styles for the sampled neutral roles and semantically map all remaining literals. Inspect default, hover, focus, active, selected, error and disabled states. Test opening/closing and back navigation with retained Notes. Check first paint/hydration and direct links, not only the final rendered dashboard.

Use 320, 390, 768 and 1440 CSS-pixel viewports, 200% text enlargement, and 400% zoom/reflow where supported. Ordinary content should not require two-dimensional page scrolling at 320 CSS pixels; tables/code/diagrams may use clearly contained overflow where meaning requires it. Prefer 44×44 CSS-pixel touch targets for primary mobile controls as a product target. WCAG's AA target-size minimum is 24×24 with specific exceptions; do not present 44 as that criterion's universal requirement.

Run keyboard interaction through search, navigation, content, reference/annotation popover, Notes and return. A hover popup must remain usable while moving the pointer into it and provide focus/tap alternatives. No permanent tiny/saturated accent text on muted panels, no hidden focus ring, and no auto-opening editor that obscures the reading after a theme change.

**Release scope:** this increment changes visual ownership and typography/interaction styling only. It must not reset Notes state, saved drafts, layout preferences, source rights, editorial controls, records or runtime execution. Layout changes beyond necessary readability corrections belong to the wider core brief and must be deliberately tested.

## 6. References

Checked 21 October 2026. The following are official W3C explanatory references; application values and design dimensions above are this project's implementation choices.

- [WCAG 2.2: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)
- [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)

