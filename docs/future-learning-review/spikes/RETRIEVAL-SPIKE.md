# Synthetic passage retrieval spike

This is a bounded research artifact, not production search code or a migration. Every passage, case and canary is original **synthetic test data**. No private learner corpus, real record identifier, connected Minamo read/write or deployed database is used.

## Reproduce

```sh
python docs/future-learning-review/spikes/retrieval-spike.py
node docs/future-learning-review/spikes/retrieval-d1-probe.mjs --checkout /absolute/minamo-v2-checkout
```

The Python program uses only the standard library and an in-memory SQLite database. Its default output is `retrieval-results.json` beside the script. The optional D1 compatibility probe resolves existing Wrangler/Miniflare dependencies from the supplied checkout; it installs nothing, creates a fresh isolated local D1 database and exits after a hard 20-second limit if startup hangs.

## Fixed method

The manually labelled fixture contains 33 short passages and 40 queries: eight literal, eight natural-language, four diagnostic, five synonym/semantic, eight exact technical, three no-answer, three eligibility and one adversarial query-syntax case. There are 33 cases with a labelled useful destination and seven without a labelled corpus answer. Ground truth and the query normalizer were written before inspecting outcomes. No model, synonym dictionary, stemming or per-case tuning is used.

All four strategies use the **same exact technical-name/alias path first**, preserving authored case and punctuation. This controls for an existing successful capability; it is not a claim that current global Minamo search already uses exact-first ranking. The lexical fallback comparisons are:

- `literal`: case-insensitive full-query substring over title plus text, ordered by ID. This is a simplified comparator for the current query shape, not execution of production `queryLibrary`/`queryRecords` with their complete projection logic.
- `fts-and`: FTS5 `unicode61`, with a fixed small stopword list, at most 12 safely quoted derived tokens, AND matching and BM25 title weighting 4:1. It never accepts caller FTS operators.
- `fts-or`: the same parser and ranker with OR matching. This deliberately tests the recall/noise trade-off; it is not recommended as an unconditional production default.
- `fts-and-local`: the same AND candidate matcher, then a deterministic score using only each eligible passage's own token coverage, title matches and contiguous derived-token phrase matches. Formula: `100 × coverage + 10 × titleHits + 5 × titlePhrase + 2 × bodyPhrase`; ties use the stable passage ID. No IDF, global frequency, corpus length or other row's content contributes to the score. This additional comparison was requested after the BM25 isolation counterexample; the fixture/ground truth/query parser were not changed.

Each labelled destination is a separate article/passage in this fixture. The experiment does not model combining many passage hits into one article result. Each query receives a warmup and 20 measured SQL repetitions. The response-size comparison uses an identical small ID/title/220-character-preview projection for every strategy. Current production DTOs differ.

## Observed results

Run on SQLite 3.53.1 in the executor, 23 October 2026. See the committed JSON for each case and timings. Millisecond values vary across reruns; these tiny local measurements say nothing about hosted Site/MCP latency.

| Strategy | Useful destination in top five | Correct first result | Cases returning candidates despite no labelled corpus answer | Mean UTF-8 result payload |
| --- | --- | --- | --- | --- |
| Literal plus common exact path | 16 / 33 | 16 / 33 | 0 / 7 | 88.4 bytes |
| FTS AND plus common exact path | 24 / 33 | 23 / 33 | 0 / 7 | 149.8 bytes |
| FTS OR plus common exact path | 31 / 33 | 28 / 33 | 2 / 7 | 459.6 bytes |
| FTS AND with per-passage local scoring | 24 / 33 | 23 / 33 | 0 / 7 | 149.8 bytes |

The eight exact cases succeed through the separate exact path in every strategy. The AND strategy misses ordinary inflections/missing tokens and most indirect semantic wording. OR finds more useful destinations, but can surface irrelevant/context-only passages for a parcel-return question and a request for an unknown private client secret. A retrieved passage is a candidate, not an assertion that the corpus contains the requested answer. The no-answer labelling tests that distinction, not whether displaying background context is always wrong.

Literal comparison using the complete natural question is deliberately strict. GPT can already reformulate searches to a short mechanism or exact term; that successful conversational baseline is not measured here. Therefore **these numbers do not establish that FTS is necessary, that it replaces GPT judgement, or that the production improvement will be this large**.

## Safety and runtime evidence

The simplified head model filters another owner, an old generation and an ineligible canary. It rejects a passage after head revocation without requiring an index refresh, rejects a changed head or stale FTS revision and restores an eligible destination after rebuilding the derived table. Exact `curl -i`/`curl -I`, `Map`/`map`, `??`/`||` distinctions remain intact. This is a SQL seam test; Minamo's source rights, source-derived facts, restore generation, retention and CAS integration are not exercised.

An additional counterexample demonstrates a privacy-relevant ranking risk. Two eligible owner-one passages initially rank A then B for `alpha OR beta`. Adding 100 excluded owner-two `alpha` documents makes B rank before A, despite the owner predicate. **An owner WHERE clause does not scope BM25 document statistics.** Raw scores need not be displayed for another namespace to influence visible ordering. Production must address current-eligible owner/generation scoring/index isolation, rather than copy this global FTS-table schema. The experiment intentionally includes forbidden rows to test defensive projection; a production index should avoid controlled source excerpts and personal Notes and should not retain inactive material casually.

The isolated Miniflare D1 probe succeeded: FTS5 virtual-table creation, insertion, MATCH and `bm25()` returned the expected single synthetic row, score `-0.000001`. This establishes local compatibility in the existing dependency runtime, **not actual hosted Sites D1 performance or support in a live deployment**. An earlier unbounded startup attempt stalled and was terminated; the single bounded retry succeeded with the same `cf:false` configuration. No external networking permission or infrastructure was changed.

## Corpus-independent ranking comparison

The added local-score strategy matches the AND/BM25 strategy's aggregate quality here: 24/33 useful top-five results and 23/33 correct first results, with zero candidates in the seven no-answer/canary cases. It does not resolve AND's synonym/inflection failures, so this is not a general semantic-search solution. The small corpus cannot show whether this simple heuristic preserves ranking quality at scale.

Its explicit invariance test ranks two eligible owner-one `alpha` passages A then B; adding 100 excluded owner-two rows and then 100 retired-generation rows leaves A,B unchanged. Both remain AND matches. The fixed title/phrase score only sees each permitted passage and the query. The original BM25 counterexample remains separately recorded in the JSON.

This experiment fetches the **complete small eligible matching set** before local reranking. It does not prove that a production cap preserves the best results. A credible initial production approach could take an explicit bounded candidate window, selected by a stable eligible passage ID rather than global BM25, locally score that window, and return honest candidate/truncation metadata plus a scoped cursor for more. Exact aliases remain separate. Changing unrelated owner/generation rows must not alter that window or its order. The cap, payload, D1 work and lost-relevant-result rate require measurement before choosing a value; a window of early IDs is not a claim of corpus-wide top ranking.

For the current owner-private, multi-generation product, this offers a simpler first path than maintaining one virtual table per generation solely to isolate BM25 statistics. Index only current original Article prose, validate current generation/revision/rights and rebuild derived rows through existing lifecycle hooks. Do not index Notes, excerpts or inactive generations. Local scoring avoids statistical dependencies but does not replace those eligibility controls, establish timing-side-channel isolation or solve large-corpus completeness. If a bounded local-score path performs poorly, retain literal/exact search with GPT reformulation rather than quietly falling back to globally influenced ranking.

## Implementable conclusion

Keep exact aliases untouched. Prototype a bounded passage candidate mode using lexical ranking only if an end-to-end task benchmark justifies it. Per-passage local scoring is a credible initial candidate, with the cap/completeness caveat above. Give explicit match provenance, exact destinations and a way to open the full eligible explanation. Keep GPT's semantic expansion and educational selection in the conversation. Do not ship raw OR matching as an answer engine or blindly adopt global BM25 across owners/generations. Specify index lifecycle, current-eligibility and ranking isolation before production implementation; measure actual hosted payload/latency only then.
