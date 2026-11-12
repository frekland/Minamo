# Text-first authoring — proposed protocol and regression fixtures

**Design example, NOT a deployed MCP tool.** Work must reconcile exact contract with current code and actual installed plugin after implementation. The intent is to replace large hand-built `sections.parts`/`learningShape` manifests with a natural text submission.

## Minimal caller example

```json
{
  "purpose": "Build the owner's retro Python RPG learning experience",
  "operationId": "unique-stable-immutable-operation-id",
  "expectedGeneration": "generation-returned-by-workspace",
  "manuscript": {
    "version": 1,
    "brief": "COMPLETE ORIGINAL OWNER PROMPT WITHOUT TRUNCATION",
    "documents": [
      {
        "key": "rpg-route",
        "role": "journey",
        "markdown": "# THE LAST MEOW\n\n## Mission 1: An unreasonable kitten\n\nA meaningful explanation of why interactive programs repeat a prompt.\n\n### Your challenge\n\nPredict the response to unknown input before coding.\n\n```python\ncommand = input('> ')\nprint(command)\n```\n\n### Verify\n\nRecord real terminal output only if you actually execute the program."
      },
      {
        "key": "terminal-reference",
        "role": "article",
        "markdown": "# Command parsing in Python\n\nA reusable, independent explanation of grammar, input normalisation and return values, not a copied mission.\n\nRead [the Python string documentation](https://docs.python.org/3/library/stdtypes.html#string-methods)."
      },
      {
        "key": "open-question",
        "role": "investigation",
        "markdown": "# What makes a text game's commands discoverable?\n\nInvestigate by comparing user instructions and actual command behaviour. No observations are supplied or claimed."
      }
    ]
  }
}
```

The input example's `markdown` strings are original authored source: the compiler must retain **all** of them, including Markdown syntax. Real authoring may supply optional explicit semantic references using local keys, which the server resolves. Do not guess relationships from matching titles alone.

## Proposed compact success response

```json
{
  "status": "committed",
  "operationId": "unique-stable-immutable-operation-id",
  "sourceEdition": {"digest": "server-calculated", "available": true},
  "records": [
    {"key": "rpg-route", "family": "journey", "id": "actual-generated-id", "rev": 1, "href": "actual-deep-link"},
    {"key": "terminal-reference", "family": "article", "id": "actual-generated-id", "rev": 1, "href": "actual-deep-link"}
  ],
  "warnings": [],
  "replayed": false
}
```

No receipt may claim a hypothetical terminal experiment was observed. No record/edition/receipt may survive a failed all-or-none transaction. An interrupted acknowledgement is resolved through the existing immutable operation lookup.

## Fresh-code and lossless-reading probes

1. A creative brief **longer than 500 characters**: original full text is saved/read back; `purpose` remains only short audit metadata.
2. Markdown containing CRLF, emoji, escaped symbols, nested emphasis, multiple H-levels, lists, tables, HTTPS references, and Python code fences. Original source readback is exactly the authored text; rendered text is readable and richly formatted.
3. Code containing `# Not a heading` and `## Not a subsection` inside a fenced Python example stays one code block.
4. A graph with `A → B` and `B → A`: the server supports a semantically appropriate generic graph without rejecting a harmless cycle; no artificial state transitions or fabricated trigger labels.
5. Unsupported Mermaid, literal HTML, raw scripts and external image markup: safely visible lossless fallback; no HTML/JS execution, remote import or guesswork about licences.
6. An intended learning outcome consisting of a question rather than an outcome: the server may signal a risk, and GPT editorial review must spot and fix it. Do not claim regex guarantees semantic correctness.
7. Seven near-identical technical references repeating seven Journey tasks: GPT reviewer should challenge duplication and missing independent explanatory content.
8. Atomic 12-member publication with simulated failure at member 11, generation swap, stale revision, revoked source, same-payload replay and changed-payload replay: no partial records, history, edition or receipts.
9. External references linked as **link-only**, not represented as fetched/verified excerpts; test the no-permission case. Do not accept owner-private content in Git fixtures.
10. Mutation of a canonical block after a manuscript edition: retained original source remains accurately labelled, and historical selection/captures are not rewritten to point at new text.
11. Actual authenticated desktop and 390px/320px saved routes: stage switch, reference reading and return, code copy, rich formatting, safe diagrams, exact Flag/Annotate, Notes reopening and historical reading.
12. **Held-out prompts**: compare genuinely new learning requests using unchanged briefs, same available GPT configuration, no pre-coaching on the known RPG failures. Measure MCP calls, corrections, amount of original rich source preserved, real teaching usefulness and browser UX. Do not mistake article counts/diagram counts for quality.

Only dispose of synthetic acceptance content by exact ID under current revision and generation guards; preserved private genuine records must compare unchanged.

## Reviewer notes

The bundled `lib/manuscript-intake.ts` token scanner is deliberately conservative and has six focused tests. It is not a full Markdown compiler, semantic reviewer, diagram renderer, D1 writer or working GPT tool. Work must build those components before claiming acceptance.

