# Browser events and a useful debugging loop

## An input handler is a connection

A button does nothing to game state until a handler connects its click event to a transition. The starter assigns a `data-move` pair to each movement button and converts it to numbers before calling `step`. Arrow keys use the same step function. Sharing the transition path prevents keyboard and touch controls from quietly implementing different rules.

```javascript
button.addEventListener("click", () => step(1, 0));
```

This one-line snippet needs existing `button` and `step` values. It is an example of event wiring, not a complete game. `addEventListener` registers work for a future event; it does not perform the move immediately. The [MDN event listener reference](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) describes this API.

## Inspect three boundaries

When movement appears broken, inspect whether the handler was reached, what state the transition returned, and whether render ran. A temporary console message at one boundary can distinguish these explanations. Remove noisy debugging messages once the question is answered. A terminal or console capture records the displayed text; the learner's explanation of it belongs in separate prose.

The browser's developer tools console is available outside Minamo. A JavaScript error may stop setup before any button handler is attached. Start with the first relevant error and source location, not a collection of unrelated edits. Reload after saving the actual file and verify which file the browser loaded. The filename ending matters: an accidental `index.html.txt` may open as text.

## Keyboard and touch

The starter calls `preventDefault()` only for handled arrow keys so the page does not scroll while moving. Visible buttons provide a touch and pointer route. The status is a live region, but that alone is not a complete screen-reader or mobile accessibility assessment. Real keyboard focus, zoom, touch sizes and assistive technology need actual checking.

A button wired to the wrong direction can produce different movement from the corresponding arrow key even when both controls reach the same transition function. Comparing their supplied direction values identifies the wiring discrepancy. Desktop play establishes no evidence about physical Android controls.