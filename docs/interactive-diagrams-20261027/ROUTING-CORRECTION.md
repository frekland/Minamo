# Shared connector correction after owner screenshot

The owner correctly identified a poor released layout: an entire canvas was available, but reciprocal endpoints were separated by only a 24px gutter. The renderer bent each connection by 32px inside that gap, producing a pinched arch rather than a legible connection. Earlier screenshots showed this; accepting them was a review failure.

The correction changes shared geometry, with no article-ID or node-name special case:

- Reserve at least 84px of connection run on narrow screens and 112px on larger screens, increasing it further when labels need room.
- Adapt node width to available space and wrap text to the actual node width. Prefer a short first line over splitting ordinary words such as “connecting”. Long unbroken tokens can still wrap without truncation.
- Use separate straight lanes for aligned reciprocal relationships; labels have distinct positions above/below or beside their corresponding lane.
- Route same-layer skip edges around intervening nodes, rather than through them.
- Preserve LR/RL/TB/BT for newly authored two-node cycles. Self-loop recovery reserves space instead of allowing a negative path extent.
- Keep the existing static/explore/guided contract, identities, source, exact editions and permissions unchanged. The permanent Netcat article requires no further editorial revision.

Browser recheck at 320px measured the two Netcat paths as `M 97.5 198 L 181.5 198` and `M 181.5 218 L 97.5 218`: an 84px run with separate lanes. The 390px expanded view showed complete words, a straight initiation arrow and readable labels. New regression cases cover 264–1200px geometry, freshly named reciprocal nodes in all four directions, three-node cycles with skip relationships and short-prefix word wrapping, alongside previous dense-flow, state, grid, fallback and source tests.

Validation: typecheck, complete supported build and 38 targeted diagram/MCP/compiled-production-security checks passed, zero failures. The earlier full feature suite remains 1,260 passed / zero failed / four skips; that result is not misrepresented as a new full-suite rerun after this correction.

## Newly authored MCP acceptance

This is not only a Netcat check. Actual installed MCP preview/publication `diagram-routing-new-authoring-20261027-v1` created exactly one TEST ONLY article `ms-606cf5461b52a3c2d8bdbc7b50ba2e1ae6cddbfd`, revision 1, rendition `r-c94b2aa5e891de7afa6b021eee019eb987b0241de610baa11d768412e2145a0c`.

Its four fresh diagrams use different identities and shapes: an explorable reciprocal pair, a layered three-node cycle with skip edges, a static branching flow with longer labels and a guided reciprocal pair. Detailed preview returned valid with no warnings. Canonical readback matched all four definitions; immutable original Markdown matched exactly. These sources are published before the renderer correction so the final production check can demonstrate that the shared change applies automatically without editing their records.

Final renderer deployment identity, authenticated production recheck and recoverable cleanup receipt are appended to the implementation PR once those operations complete. This second synthetic article must be trashed after checking; the permanent Netcat article must remain active. Physical touch/TalkBack and a separate fresh human GPT conversation remain unperformed.
