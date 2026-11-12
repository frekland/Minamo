# Activity Studio: interaction evidence and independent teaching challenge review

Scope: synthetic local engineering only. This reviewer implemented the Activity Studio UI, so the UI evidence below is **implementation verification, not independent approval**. The challenge generator/oracle review is independent of that module's implementer. No hosted, physical Android, screen-reader or live-browser click acceptance is claimed.

## Implemented interaction surface

`app/activity-studio.tsx` provides a source file navigator, checksummed ZIP handoff, current-rights checks before copying/exporting, deliberate trusted Foundry activation and disposal, server-only hint revelation, optional prediction/reflection/terminal/next-intention fields, explicit attempt submission and saved attempt readback. Imported project code is literal inert text. Pasted terminal output and GitHub commit references are labelled supplied and unverified. Nothing executes a local shell or creates a learning checkpoint.

Drafts are isolated by authenticated workspace scope, generation and exact Activity rendition. Pending operation bodies are serialized before transmission and retained unchanged for retry or receipt lookup; editing pauses while the result is uncertain. A later Activity edition does not silently retarget old evidence.

## Exact capture defect found and corrected

The domain already appended Activity source passages to `canonicalReadingParts`, but `app/reader.tsx` originally rendered only stored `article.sections`. This meant a valid source destination could resolve in D1 while its canonical text had no selectable Reader DOM. Added the derived Activity section to the real Reader in an ordinary collapsed disclosure. Exact destinations and whole-passage selection open it. Its presentation heading has no invented canonical capture identity.

The Activity file navigator, prompts and artefact canonical source now link to the exact immutable Reader edition/section/part. Existing Reader Flag/Annotation authority, draft recovery and Unicode validation remain responsible for capture. The UI introduces no second annotation queue.

## Actual verification

- `node --test tests/activity-ui.test.mjs`: **7 passing**, including inert hostile source rendering, selected-file isolation, supplied attempt readback, owner/generation/edition draft fences and immutable uncertain retry.
- The same test includes a real local Miniflare/D1 path: publish a valid project Activity; render its actual file link; resolve that destination through the same exact context read as Workspace; verify actual Reader canonical DOM; write a native Flag and Annotation over `あ😀` using exact UTF-16 offsets; revise the Activity and retrieve its earlier unchanged source edition.
- `node --test tests/rich-reader.test.mjs tests/reading-interactions.test.mjs tests/reader-polish.test.mjs`: **25 passing** after the Reader integration.
- Current aggregate TypeScript check passed at this implementation checkpoint. The owning run must revalidate the final combined source.
- Browser infrastructure could not reach the supported preview despite its reported healthy process. No screenshot or gesture-based acceptance was manufactured. SSR and D1 tests do not substitute for real selection gestures, mobile focus or physical Android testing.

## Independent generator/oracle challenge

Reviewed all twelve original challenge templates and the seeded variant generator in `lib/challenge-exchange/generators.ts`, the separated engineering repair harness in `scripts/activity-exchange-proof.mjs`, and the executable acceptance suite. Independently ran `node --test tests/activity-exchange.test.mjs`: **5 passing** at the reviewed checkpoint, including twelve intended red/green projects, eighteen variants, ZIP decode/hash verification and exact local Git round-trip.

The supplied framework makes useful distinctions: TCP EOF framing is explicitly separate from persistent protocols; Unicode code points are separate from graphemes; passing tests concerns program behavior rather than mastery; local Git/provider-contract simulation is separate from actual GitHub acceptance; repaired implementations remain outside learner starter packages.

Two concrete weaknesses were reproduced and reported to the generator owner for correction:

1. **Bash final record:** the reference `while IFS= read -r line; do ...` drops a final log record with no newline. An independent invocation on `alpha beta\nlast record` emitted only the first line. The stated teaching intent did not exclude this case. Requested a final-record guard and visible tests preserving spaces, backslashes and empty lines.
2. **Music variant oracle:** comparing `zip(actual, expected)` can vacuously accept a short/empty result for the added seeded case. An independent `actual=[]` experiment produced zero comparisons and a passing conjunction. Requested an explicit output-length assertion before approximate value checks.

Both bounded corrections are implemented. Bash now byte-compares visible cases covering final input without LF, backslashes, spaces and empty lines, while its reference preserves that final record. The music seeded oracle checks output length before approximate values. New `tests/activity-pedagogy.test.mjs` actually executes two near-correct mutants: the prior newline-dropping Bash repair fails the final-record case, and a music implementation returning `[]` only at 240 BPM passes original base cases but fails the strengthened seeded assertion. Both corrected references pass. Combined exchange and mutation acceptance: **7 passing**. `EXCHANGE-RUNTIME-RESULTS.json` is regenerated from the corrected source; raw UI/pedagogy retest output is retained alongside this assessment.

## Remaining acceptance boundaries

Real browser actions, Android touch/selection, keyboard focus restoration after an exact Reader return, active renderer cleanup across all three real workspace modes, hosted permissions and refreshed installed MCP catalogue remain acceptance gates unless the owning run separately obtains that evidence. A responsive stylesheet, static markup or green local suite alone does not prove them.
