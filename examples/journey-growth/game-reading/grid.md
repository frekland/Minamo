# Grid coordinates, collision and a reachable goal

## Agree on the coordinate system

In a row-array map, y selects the row and x selects the character within that row: `map[y][x]`. The top-left cell is `(0,0)`. Increasing x moves right; increasing y moves down. This is a chosen screen convention, not a universal mathematical rule. Swapping x and y may look correct on a symmetrical map while failing elsewhere.

```text
#####
#..*#
#.#.#
#...#
#####
```

Here `#` is a wall, `.` is floor and `*` is the goal. The starter begins at `(1,3)`. Coordinates refer to map cells; font size and browser pixels do not change the rule. A small visible legend avoids forcing a new player to guess what each symbol means.

## Check before storing

Collision testing evaluates the proposed destination before updating the player. An optional lookup such as `map[next.y]?.[next.x]` avoids reading a character from an absent row. The rule still needs to reject absent cells and walls. Checking only the outer border assumes every future map has a closed wall boundary, which is a fragile hidden condition.

A legal move is not the same as a solvable map. The goal might be isolated by walls even though each individual move respects collision. Trace a route by hand for a small map, then later explore breadth-first search if generating larger levels becomes interesting. Keep that extra algorithm optional until it answers a real question.

## Use asymmetry to expose mistakes

Right, Right, Up, Up from the initial position reaches `(3,1)`, the star. Up, Up, Right, Right is also legal on this map. Adding a wall at `(3,2)` blocks the first route while leaving the second route open. A rectangular map exposes swapped x/y indexing more clearly than a symmetrical square map.

The [MDN array guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections) explains indexed collections. JavaScript strings contain UTF-16 code units; this starter uses one-code-unit ASCII tiles. If a later map uses emoji as tiles, choose and test a consistent representation rather than assuming string indexing and spread iteration have identical units.
