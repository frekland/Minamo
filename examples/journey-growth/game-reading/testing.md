# Testing game rules without mistaking a screenshot for proof

## A tiny rules table

A useful first test names an initial state, one action and an expected next state. In the starter, Right from `(1,3)` predicts `(2,3)`; Up from `(2,3)` predicts the same `(2,3)` because a wall blocks it. A reset should restore `(1,3)`. These expectations can be calculated from the map independently of the transition code.

| Before | Action | Expected position | Reason |
|---|---|---|---|
| 1,3 | Right | 2,3 | Floor |
| 2,3 | Up | 2,3 | Wall |
| 1,3 | Right, Right, Up, Up | 3,1 | Star reached |

A screenshot shows one rendering at one time. It does not prove the handler fired once, every collision rule works, or reset restored the authoritative state. Use the status coordinates and a short action sequence to make the claim inspectable. A pure transition test also cannot prove that the DOM event wiring and visible controls work; both levels have a purpose.

## Preserve a failed prediction

Suppose you expected Up from `(2,3)` to work. Keep that original expectation, the observed unchanged coordinates and your revised map explanation. Do not rewrite the expectation as if you knew the wall rule all along. An ordinary short Note is sufficient; it need not become a formal checkpoint or a permanent project ledger.

When a later inventory or key rule is added, preserve the old movement tests and add examples for the new state. A key icon on screen is not necessarily an inventory item in state. Test whether collecting it changes a value and whether a locked door checks that value before moving. This is a likely next question, not an instruction to implement every feature at once.

## Scope honest evidence

The complete HTML starter is intended to run as a local file in a modern browser. It uses no external services. Its JavaScript can be checked in an isolated rules harness, but only an actual browser interaction establishes that this UI path rendered and handled input in that browser. Mobile-width rendering does not establish physical touch or screen-reader behavior. Keep those statuses explicit when discussing the result with GPT.
