/** Original TEST ONLY authoring material. No private corpus, observed result or learner record. */
export const parseCode=`function readCount(text) {
  const value = JSON.parse(text);
  if (value === null || Array.isArray(value) || typeof value !== "object") {
    throw new Error("Expected an object");
  }
  if (!Number.isInteger(value.count) || value.count < 0) {
    throw new Error("count must be a non-negative integer");
  }
  return value.count;
}
console.log(readCount('{"count":3}'));`;
export const dataArticle=`# TEST ONLY — Parsing JSON and validating a data contract

## Text becomes a JavaScript value

JSON is a text format for a limited set of values. A file or HTTP response can contain JSON text, but its bytes do not become a useful object merely because the filename ends in .json or a server labels it application/json. Parsing checks whether the text follows JSON grammar. Validation checks whether the resulting value fits the contract your program needs. These are separate boundaries.

This distinction is useful in a command-line importer, a browser response handler and a saved-settings reader. Each can receive syntactically valid data with the wrong shape. A parser can successfully produce null, an array or an object with no count property. None automatically satisfies a contract requiring one non-negative integer count.

## Predict before inspecting

Consider three independent inputs: {"count":3}, {"count":"3"}, and {"count":-1}. Which should this contract accept? You can predict privately, write a Note if useful, or go directly to the worked explanation. No answer or save is required.

\`\`\`javascript
${parseCode}
\`\`\`

The predicted display is 3. JSON.parse converts the input text into an object; it does not convert the string "3" into a number. Number.isInteger rejects that string. The negative number is an integer but fails the separate range condition. This example is original illustrative code; publication is not evidence that the learner executed it.

## Follow the boundaries

\`\`\`mermaid
flowchart TD
A[JSON text] --> B[Parse grammar]
B --> C[Validate object shape]
C --> D[Validate count]
D --> E[Use returned integer]
\`\`\`

The diagram separates the decisions instead of pretending all failures are network errors. A syntax error occurs before shape validation. A valid array reaches the object check and is rejected deliberately. A valid object reaches the count check, which rejects missing, fractional or negative counts. Return supplies a usable integer only after these checks.

| Input text | Parsing | Count contract |
|---|---|---|
| {"count":3} | Produces an object | Accepts 3 |
| {"count":"3"} | Produces an object | Rejects a string |
| {"count":-1} | Produces an object | Rejects a negative integer |
| null | Produces null | Rejects the shape |
| {count:3} | Throws a syntax error | Not reached |

## Inspect a failure without hiding it

When a real input fails, keep the actual text and error separately from your interpretation. Inspect the boundary that failed before changing the contract. If JSON.parse throws, changing the numeric predicate cannot repair invalid JSON grammar. If parsing succeeds but validation rejects a string, decide whether the source should send a number or whether an explicit conversion is genuinely part of the desired contract. Silently accepting every value would make the program look successful while weakening its meaning.

The typeof null result is "object", so the explicit null guard matters. Array.isArray distinguishes arrays from ordinary object-shaped records. These checks are a small example contract, not a general schema validator or a guarantee that arbitrary data is safe for every use.

## Vary one condition

Try count 0, 1.5 and a missing property. Predict which check rejects each input, then compare the actual result in your chosen environment. To practise a different contract, allow a fractional measurement and explain why that changes Number.isInteger rather than JSON grammar. The useful learning is the reason for the boundary, not copying a particular error message.

Authoritative link-only references: [JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) and [Number.isInteger](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger). No external text is imported.`;
export const httpArticle=`# TEST ONLY — HTTP status, JSON parsing and application data

## A fulfilled request can still have an error status

Fetch returning a Response does not mean the server accepted the operation. An HTTP 404 or 500 can produce a fulfilled fetch promise. Inspect response.ok or status before interpreting the body as your successful data contract. A rejected fetch instead means that obtaining a usable response failed, for example because of a network or browser-policy problem.

## Keep the three decisions separate

\`\`\`javascript
async function loadCount(url, fetcher = fetch) {
  const response = await fetcher(url);
  if (!response.ok) throw new Error("HTTP " + response.status);
  const text = await response.text();
  return readCount(text);
}
\`\`\`

This helper depends on the separately explained readCount function. A 404 is rejected at the status boundary, malformed JSON at parsing, and a negative count at application validation. A test that supplies an in-memory Response exercises this logic; it does not establish that an external service is reachable or grants access.

## Choose an experiment that separates explanations

If a page shows "nothing loaded", compare a 404 response with a 200 response containing malformed JSON. Predict which error each should produce. Then compare a 200 response containing a string count. The last case reaches a different boundary even though the request and parse succeeded. Keep these explanations distinct while investigating actual output.

Read [the JSON contract](minamo:data) for the reusable parser, shape check and variation. An actual service can also change permissions or endpoints, so verify its current official contract before building the rest of an integration.

Reference: [MDN Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok), link-only.`;
export const conciseArticle='# TEST ONLY — Parsing and validation\n\nParsing checks whether text follows a format and turns it into values. Validation checks whether those values satisfy a particular contract. Valid JSON can still be invalid application data: the text null parses successfully but does not supply an object with a count property.';
/** Deliberately false educational claim: preview-only negative control, never part of benchmarkDocuments(). */
export const wrongArticle='# TEST ONLY — Sorting numbers\n\n## Predict sorted order\n\nJavaScript arrays sort numbers from smallest to largest by default. For example, [2, 10, 1].sort() produces [1, 2, 10]. Because these elements are numbers, the default operation compares their numeric magnitude; a comparator is only needed for more specialised orderings.\n\n```javascript\nconst values = [2, 10, 1];\nvalues.sort();\nconsole.log(values);\n```\n\nThe predicted display is [1, 2, 10]. Sorting mutates the array, so keep a copy when the original sequence is still useful. A predicted display remains separate from a learner execution record.';

export function benchmarkRequest(operationId,documents,existing){return {purpose:'TEST ONLY PR27 ordinary future resource authoring acceptance',operationId,expectedGeneration:'legacy@0',synthetic:true,manuscript:{version:1,brief:'Create original independently reusable JSON parsing/validation explanations and a small command-line project. Keep route instructions, open questions and Library knowledge distinct. Provide optional prediction, worked reasoning, failure inspection and a useful variation without compulsory tests or records. These are synthetic development resources, never learner observations.',documents},...(existing?{existing}:{})};}
export function benchmarkDocuments(){return [
 {key:'area',role:'area',markdown:'# TEST ONLY — Data contracts and interfaces\n\nReusable mechanisms for turning text and responses into useful values.\n\n## Read a data boundary\n\n[JSON parsing and validation](minamo:data) distinguishes format grammar from the application contract.\n\n## Inspect a response\n\n[HTTP status and data](minamo:http) separates request, parse and validation failures.'},
 {key:'data',role:'article',markdown:dataArticle,catalogue:{summary:'Separate JSON grammar, object shape and a count contract; predict and inspect failures.',areas:[{ref:'area',reason:'Explains reusable data boundaries independently of a route.'}],references:[{term:'JSON.parse',kind:'api',definition:'Parses JSON text into the corresponding JavaScript value or throws for invalid grammar.',targetHeading:'Text becomes a JavaScript value'},{term:'Number.isInteger',kind:'api',definition:'Tests whether a value is a number representing an integer; strings are not converted.',targetHeading:'Predict before inspecting',exampleCodeLabel:'javascript'}]}},
 {key:'http',role:'article',markdown:httpArticle,catalogue:{summary:'Distinguish fulfilled Fetch requests, HTTP status, parsing and application-data validation.',areas:[{ref:'area',reason:'Explains HTTP and application boundary failures.'}],references:[{term:'Response.ok',kind:'api',definition:'True for response status codes in the 200–299 range.',targetHeading:'A fulfilled request can still have an error status'}]}},
 {key:'route',role:'journey',markdown:'# TEST ONLY — Inspect a tiny inventory snapshot\n\n## Read one local input\n\nIntent: Follow a text-to-value boundary in a small Node program.\n\nOutcome: Explain why parsing and validation answer different questions.\n\nCheckpoint: Retain a meaningful comparison only if explicitly requested.\n\nUse a local Node installation on Kali/Linux or Windows. First run node --version in your terminal to check that the command is available; if it is not, resolve that environment prerequisite before debugging this program.\n\nRead [the JSON mechanism](minamo:data). Create a disposable folder and save its example as count.mjs. From that folder, predict the displayed count and run:\n\n```sh\nnode count.mjs\n```\n\nThe predicted display is 3 for the supplied example. If the terminal cannot find count.mjs, inspect your working directory and the saved filename before changing the parser. Compare the actual result in your own environment. Change only the count type before trying a new condition. No result is claimed here.\n\n## Investigate a rejected value\n\nIntent: Select an experiment that distinguishes a grammar failure from a contract failure.\n\nOutcome: Explain the boundary identified by actual supplied output.\n\nCheckpoint: Keep evidence separate from the diagnosis.\n\nUse [the open question](minamo:question) when a result differs from your prediction. Reuse [the reference](minamo:data) instead of copying a project-specific explanation into another Article.'},
 {key:'question',role:'investigation',markdown:'# TEST ONLY — Which data boundary rejected the input?\n\nCompare malformed JSON, valid null and an object with a string count. What evidence would distinguish a parser failure from a shape or range failure? Inspect [the mechanism](minamo:data) and [the HTTP distinction](minamo:http) before choosing a hypothesis. This guide contains no claimed learner observations or conclusion.'}
];}
