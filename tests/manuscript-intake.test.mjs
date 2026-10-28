import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const wranglerRequire = createRequire(require.resolve('wrangler/package.json'));
const {build} = wranglerRequire('esbuild');
const compiled = await build({
  stdin: {contents: 'export * from "./lib/manuscript-intake.ts";', resolveDir: process.cwd()},
  bundle: true, format: 'esm', platform: 'node', write: false,
});
const {inspectManuscriptSubmission, scanManuscript, ManuscriptIntakeError} =
  await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64'));

const sample = (markdown, more = {}) => ({
  version: 1,
  brief: 'Create a genuine learning experience and keep my entire creative brief.',
  documents: [{role: 'journey', markdown, ...more}],
});

test('source is byte-for-byte lossless across CRLF, emoji, markup and code fences', () => {
  const markdown = '# Kittens 🐈\r\nIntro **bold** & <script>literal</script>\r\n\r\n```python\r\n# Not a heading\r\nprint("😼")\r\n```\r\n\r\n## Next mission\r\n';
  const input = sample(markdown);
  const output = inspectManuscriptSubmission(input);
  const document = output.documents[0];
  assert.equal(document.source, markdown);
  assert.equal(document.blocks.map(block => block.raw).join(''), markdown);
  assert.deepEqual(document.blocks.filter(block => block.kind === 'heading').map(block => block.heading), ['Kittens 🐈', 'Next mission']);
  assert.equal(document.blocks.filter(block => block.kind === 'code-fence').length, 1);
  assert.match(document.blocks.find(block => block.kind === 'code-fence').code, /# Not a heading/);
  for (const block of document.blocks) assert.equal(markdown.slice(block.start, block.end), block.raw);
  assert.equal(document.suggestedTitle, 'Kittens 🐈');
  assert.equal(input.documents[0].markdown, markdown, 'input not mutated');
});

test('tilde fences and unknown Markdown survive as literal source', () => {
  const source = '# Graph\n~~~mermaid\ngraph LR\nA --> B\nB --> A\n~~~\n\n| A | B |\n|---|---|\n|x|y|\n';
  const parsed = scanManuscript(source);
  assert.equal(parsed.blocks.map(part => part.raw).join(''), source);
  assert.equal(parsed.blocks.find(part => part.kind === 'code-fence').language, 'mermaid');
  assert.equal(parsed.blocks.filter(part => part.kind === 'text').some(part => part.raw.includes('|---|')), true);
  assert.deepEqual(parsed.diagnostics, []);
});

test('unclosed code remains recoverable, with an advisory, not silent loss', () => {
  const source = '# Example\n```python\nprint(1)\n';
  const parsed = scanManuscript(source, 'example');
  assert.equal(parsed.blocks.map(part => part.raw).join(''), source);
  assert.equal(parsed.blocks.some(part => part.kind === 'code-fence'), false);
  assert.equal(parsed.diagnostics[0].code, 'unclosed_fence');
  assert.equal(parsed.diagnostics[0].documentKey, 'example');
});

test('full >500-character creative brief, multiple roles and explicit keys are preserved', () => {
  const brief = 'Novel learning premise and expectations. '.repeat(35);
  const input = {version: 1, brief, documents: [
    {key: 'route', role: 'journey', markdown: '# Path\nDo some learning.'},
    {key: 'reference', role: 'article', markdown: '# Explanation\nReusable material.'},
    {role: 'investigation', markdown: 'A question without a heading.'},
  ]};
  const output = inspectManuscriptSubmission(input);
  assert.equal(output.brief, brief);
  assert.deepEqual(output.documents.map(document => document.key), ['route', 'reference', 'document-3']);
  assert.equal(output.documents[2].diagnostics[0].code, 'missing_heading');
});

test('duplicate keys, invalid roles, controls and unpaired Unicode reject without repair', () => {
  assert.throws(() => inspectManuscriptSubmission({version: 1, brief: 'x', documents: [
    {key: 'same', role: 'journey', markdown: '# A'},
    {key: 'same', role: 'article', markdown: '# B'},
  ]}), error => error instanceof ManuscriptIntakeError && error.code === 'invalid_key');
  assert.throws(() => inspectManuscriptSubmission(sample('# Bad', {role: 'source'})), /supported learning role/);
  assert.throws(() => inspectManuscriptSubmission(sample('bad\uD800')), /well-formed Unicode/);
  assert.throws(() => inspectManuscriptSubmission(sample('bad\u0000control')), /well-formed Unicode/);
});

test('size limits reject intact source and never truncate it', () => {
  const oversized = '# Long\n' + 'a'.repeat(221_000);
  assert.throws(() => inspectManuscriptSubmission(sample(oversized)), error =>
    error instanceof ManuscriptIntakeError && error.code === 'invalid_text');
});

