import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { privateStorageFixture } from './private-storage-fixture.mjs';
import { decodeBundleFixture } from './portable-bundle-fixture.mjs';
const require = createRequire(import.meta.url), wr = createRequire(require.resolve('wrangler/package.json')), { build } = wr('esbuild');
const built = await build({ stdin: { contents: 'export * from "./lib/foundry/platform.ts";export * from "./lib/foundry/math.ts";export * from "./lib/foundry/math-platform.ts";export * from "./lib/foundry/language.ts";export * from "./lib/foundry/language-platform.ts";export * from "./lib/foundry/language-fixtures.ts";export * from "./lib/foundry/data-platform.ts";export * from "./lib/note-rich-codec.ts";', resolveDir: process.cwd() }, bundle: true, format: 'esm', platform: 'node', write: false });
const sdk = await import('data:text/javascript;base64,' + Buffer.from(built.outputFiles[0].text).toString('base64'));
const worker = 'import{domainHandler}from"./lib/domain-handler.ts";export default{fetch:domainHandler}';
/** All results here are explicitly supplied/illustrative fixtures, never a forged engine receipt. */
test('composite language/math/data source survives current D1, Notes, MCP, immutable capture and protected recovery', async t => {
  const fixture = await privateStorageFixture(worker), client = fixture.client('synthetic-foundry-composite-owner'), other = fixture.client('synthetic-foundry-composite-other');
  const ok = response => { assert.equal(response.status, 200, JSON.stringify(response.data)); return response.data; };
  const mcp = async (name, args) => { const r = ok(await client.request('/mcp', { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: { purpose: 'Read or validate original synthetic foundry integration fixtures; no learning achievement or real execution claimed.', ...args } } })); assert.notEqual(r.result.isError, true, r.result.content[0].text); return JSON.parse(r.result.content[0].text); };
  const tex = '\\int_0^1 x^2\\,dx = \\frac{1}{3}', code = 'import sympy as sp\nx = sp.symbols("x")\nprint(sp.integrate(x**2, (x, 0, 1)))\n', csv = 'x,y\n0,0\n0.5,0.25\n1,1\n';
  const expression = sdk.admitMathExpression({ contract: sdk.MATH_CONTRACT, id: 'composite-integral', format: 'tex', source: tex, display: 'block', description: 'Original authored equality, displayed but not evaluated by this fixture.' });
  const sourceNote = 'Synthetic prediction: I expect an area near one third. No actual learner response is claimed.\n\n' + sdk.mathDeclaration(expression) + '\n\n' + sdk.languageManuscriptBlock(sdk.japaneseLanguageFixture) + '\n\n```csv\n' + csv + '```\n\nThe table is an illustrative supplied fixture. Rendering and saving do not establish computation or learning.';
  let article, experiment, run, investigation, journey, note, originalRun, originalArticle, composite, output;
  try {
    await t.test('actual source adapters compose into a supplied existing text Run without a new durable type', async () => {
      article = ok(await client.command({ action: 'create', family: 'article', id: 'composite-reference', data: { title: 'TEST ONLY language, integral and supplied table', body: 'Independent original synthetic reading. Neither displayed equality nor table proves execution.', synthetic: true, sections: [{ id: 'language', title: 'Original Japanese', parts: [{ id: 'ja-base', kind: 'paragraph', text: sdk.japaneseLanguageFixture.text, language: 'ja' }] }, { id: 'science', title: 'Exact mathematical and tabular source', parts: [{ id: 'integral-source', kind: 'code', text: tex, language: 'minamo-math-source' }, { id: 'table-source', kind: 'code', text: csv, language: 'csv' }] }] } })).record;
      const ref = (sectionId, partId) => ({ family: 'article', id: article.id, rendition: article.rendition, sectionId, partId });
      composite = { format: 'minamo.foundry-composite-fixture.v1', classification: 'supplied-artifact', execution: 'not-executed-in-this-test', description: 'Synthetic presentation-only source bundle; actual separate runtime tests are not promoted into this record.', artefacts: [{ ...await sdk.languageTextArtefact(sdk.japaneseLanguageFixture), sourceRef: ref('language', 'ja-base') }, { ...await sdk.mathTexArtefact(expression), sourceRef: ref('science', 'integral-source') }, { ...await sdk.dataTableArtefact(csv), sourceRef: ref('science', 'table-source') }] };
      output = 'SUPPLIED / ILLUSTRATIVE FIXTURE — NOT MINAMO-OBSERVED EXECUTION\n' + JSON.stringify(composite);
      experiment = ok(await client.command({ action: 'create', family: 'experiment', id: 'composite-experiment', data: { title: 'TEST ONLY symbolic program source', body: 'Program supplied for inspection. This integration test does not run Python.', code, engine: 'python', synthetic: true, links: [{ family: 'article', id: article.id }] } })).record;
      run = ok(await client.command({ action: 'create', family: 'run', id: 'composite-supplied-run', data: { title: 'TEST ONLY supplied composite output fixture', body: 'Supplied/illustrative fixture in the existing legacy text output field; no runtime execution receipt.', code, engine: 'python', evidence: 'illustrative', output, synthetic: true, links: [{ family: 'experiment', id: experiment.id }, { family: 'article', id: article.id }] } })).record;
      originalRun = run; originalArticle = article;
      assert.equal(run.evidence, 'illustrative'); assert.equal(run.output, output); assert.equal(run.code, code);
      assert.equal(run.outputs, undefined); assert.equal(composite.artefacts.length, 3);
    });
    await t.test('existing Journey/Investigation/Note relationships retain reasoning and rich source', async () => {
      investigation = ok(await client.command({ action: 'create', family: 'investigation', id: 'composite-question', data: { title: 'TEST ONLY what does this display establish?', body: 'Compare authored notation, supplied data and actual execution evidence. This question has no inferred answer or achievement.', synthetic: true, links: [{ family: 'article', id: article.id }, { family: 'experiment', id: experiment.id }, { family: 'run', id: run.id }] } })).record;
      journey = ok(await client.command({ action: 'create', family: 'journey', id: 'composite-journey', data: { title: 'TEST ONLY language and calculus exploration', body: 'An original synthetic route linking source, prediction and supplied artefacts. No learner progress saved.', synthetic: true, links: [{ family: 'investigation', id: investigation.id }, { family: 'article', id: article.id }] } })).record;
      const request = { operationId: 'composite-exact-note-create', action: 'create', family: 'note', id: 'composite-note', data: { title: 'TEST ONLY prediction and exact source', body: sourceNote, bodyFormat: 'markdown-v1', synthetic: true, links: [{ family: 'journey', id: journey.id }, { family: 'investigation', id: investigation.id }, { family: 'article', id: article.id }, { family: 'run', id: run.id }] } };
      note = ok(await client.command(request)).record;
      const replay = ok(await client.command(request)); assert.equal(replay.replayed, true); assert.equal(replay.recordRef.id, note.id); assert.equal(replay.recordRef.rev, note.rev); assert.equal(ok(await client.context('note', note.id)).record.body, sourceNote);
      const reconstructed = sdk.serializeRichNote(sdk.parseRichNote(note.body));
      assert.equal(sdk.richNoteCompatibility(note.body).supported, true); assert.equal(sdk.readMathDeclarations(reconstructed)[0].expression.source, tex); assert.match(reconstructed, /minamo-language/);
      assert.equal(note.body, sourceNote); assert.equal(note.links.length, 4);
    });
    await t.test('three source adapters re-admit exact D1/MCP readback under live current-source authority', async () => {
      const read = await mcp('read_minamo_record', { family: 'run', id: run.id, rendition: run.rendition }); assert.equal(read.record.output, output); assert.equal(read.record.evidence, 'illustrative');
      const decoded = JSON.parse(read.record.output.slice(read.record.output.indexOf('\n') + 1)); assert.equal(decoded.execution, 'not-executed-in-this-test');
      const registry = new sdk.ArtefactRegistry(); registry.register(sdk.languageTextAdapter); registry.register(sdk.mathTexAdapter); registry.register(sdk.dataTableAdapter);
      const authority = { canRead: async ref => { const response = await client.context(ref.family, ref.id, ref.rendition); return response.status === 200 && !!response.data.record.sections?.find(s => s.id === ref.sectionId)?.parts.find(p => p.id === ref.partId && !p.unavailable); }, verifyRun: () => false };
      const admitted = await Promise.all(decoded.artefacts.map(a => registry.admit(a, authority)));
      assert.equal(admitted[0].fallback, sdk.japaneseLanguageFixture.text); assert.match(admitted[1].fallback, /not evaluated or proved/); assert.match(admitted[2].fallback, /Supplied table: 3 rows/);
      const context = await mcp('get_minamo_context', { family: 'investigation', id: investigation.id, relatedRefs: [{ family: 'article', id: article.id }, { family: 'run', id: run.id }, { family: 'note', id: note.id }] });
      assert.ok(context.record.links.some(r => r.id === experiment.id)); assert.ok(context.selectedRelated.some(r => r.record?.id === note.id || r.id === note.id), JSON.stringify(context.selectedRelated));
      const noteRead = await mcp('read_minamo_record', { family: 'note', id: note.id }); assert.equal(noteRead.record.body, sourceNote);
    });
    await t.test('exact TeX and supplied-output captures use current immutable canonical offsets', async () => {
      for (const item of [{ id: 'composite-equation-flag', family: 'article', record: article, sectionId: 'science', partId: 'integral-source', text: tex }, { id: 'composite-output-flag', family: 'run', record: run, sectionId: '__article', partId: '__output', text: output }]) {
        const anchor = { recordFamily: item.family, articleId: item.record.id, rendition: item.record.rendition, sectionId: item.sectionId, partId: item.partId, start: 0, end: item.text.length, quote: item.text };
        const saved = ok(await client.command({ action: 'create', family: 'flag', id: item.id, data: { title: 'TEST ONLY exact source bookmark', body: '', synthetic: true, anchor } })); assert.equal(saved.record.anchor.quote, item.text);
      }
      const exact = await mcp('get_minamo_context', { family: 'article', id: article.id, rendition: article.rendition, selection: { sectionId: 'science', partId: 'integral-source', start: 0, end: tex.length } }); assert.equal(exact.selection.quote, tex); assert.ok(exact.deepLinks.reading.includes('start=0'));
    });
    await t.test('new current editions preserve exact original Run/TeX and reject stale CAS', async () => {
      article = ok(await client.command({ action: 'update', family: 'article', id: article.id, expectedRev: article.rev, data: { sections: article.sections.map(s => ({ ...s, parts: s.parts.map(p => p.id === 'integral-source' ? { ...p, text: tex + '\\,+0' } : p) })) } })).record;
      run = ok(await client.command({ action: 'update', family: 'run', id: run.id, expectedRev: run.rev, data: { output: output + '\nLater illustrative commentary; original edition remains exact.' } })).record;
      const retainedArticle = ok(await client.context('article', article.id, originalArticle.rendition)).record, retainedRun = ok(await client.context('run', run.id, originalRun.rendition)).record;
      assert.equal(retainedArticle.sections[1].parts[0].text, tex); assert.equal(retainedRun.output, output);
      assert.equal((await client.command({ action: 'update', family: 'run', id: run.id, expectedRev: originalRun.rev, data: { output: 'must not overwrite' } })).status, 409);
      assert.equal(ok(await client.context('flag', 'composite-equation-flag')).anchor.state, 'retained-revision'); assert.equal(ok(await client.context('flag', 'composite-output-flag')).anchor.state, 'retained-revision');
    });
    await t.test('forged observed evidence and new unadmitted structured persistence fields are rejected', async () => {
      const response = ok(await client.request('/mcp', { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'apply_minamo_command', arguments: { purpose: 'Negative synthetic attestation test; must reject.', command: { operationId: 'composite-forged-observed', action: 'create', family: 'run', id: 'composite-forged-observed', data: { title: 'TEST ONLY invalid forged receipt', body: 'No execution occurred.', engine: 'python', code, output: '1/3', evidence: 'observed', synthetic: false } } } } }));
      assert.equal(response.result.isError, true); assert.equal(JSON.parse(response.result.content[0].text).code, 'unattested_execution');
      const extra = await client.command({ action: 'create', family: 'run', id: 'composite-unsupported-outputs', data: { title: 'TEST ONLY unsupported structured outputs', engine: 'python', code, output, outputs: [], evidence: 'illustrative', synthetic: true } }); assert.equal(extra.status, 400);
      assert.equal((await other.context('run', run.id, originalRun.rendition)).status, 404);
    });
    let exported, staged, exportSnapshot;
    const passphrase = 'Synthetic-composite-recovery-password';
    await t.test('protected encrypted export preserves complete legacy fields without inventing binary assets', async () => {
      exported = await client.request('/api/recovery/export', { operationId: 'composite-encrypted-export', expectedGeneration: client.generation, passphrase }); assert.equal(exported.status, 200, JSON.stringify(exported.data));
      exportSnapshot = decodeBundleFixture(Buffer.from(exported.data), passphrase);
      const rows = exportSnapshot.manifest.tables.v2_records, record = row => typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      assert.equal(record(rows.find(r => r.id === note.id)).body, sourceNote); assert.equal(record(rows.find(r => r.id === run.id)).output, run.output); assert.equal(record(rows.find(r => r.id === run.id)).evidence, 'illustrative');
      assert.equal(exportSnapshot.assets.size, 0); assert.equal(exportSnapshot.manifest.assets.length, 0);
    });
    await t.test('Trash closes source admission before protected import stage and activation restore exact snapshot', async () => {
      ok(await client.command({ action: 'trash', family: 'article', id: article.id, expectedRev: article.rev }));
      assert.equal((await client.context('article', article.id, originalArticle.rendition)).status, 404);
      const unavailable = ok(await client.context('flag', 'composite-equation-flag')); assert.equal(unavailable.anchor.state, 'unavailable');
      const registry = new sdk.ArtefactRegistry(); registry.register(sdk.mathTexAdapter);
      await assert.rejects(registry.admit(composite.artefacts[1], { canRead: async ref => (await client.context(ref.family, ref.id, ref.rendition)).status === 200, verifyRun: () => false }), e => e.code === 'unavailable');
      const metadata = Buffer.from(JSON.stringify({ operationId: 'composite-encrypted-import', expectedGeneration: client.generation, passphrase })), prefix = Buffer.alloc(4); prefix.writeUInt32BE(metadata.length);
      const payload = Buffer.concat([prefix, metadata, Buffer.from(exported.data)]);
      staged = ok(await client.request('/api/recovery/import', payload, { raw: true, headers: { 'content-type': 'application/octet-stream' } })); assert.equal(staged.staged.state, 'ready');
      assert.equal((await client.context('article', article.id)).status, 404, 'Staging must not silently activate a restored namespace.');
      const activated = ok(await client.recover('activate', { operationId: 'composite-activate-import', stagedId: staged.staged.id })); assert.notEqual(activated.generation, 'legacy@0'); assert.ok(activated.backupArchiveId); client.setGeneration(activated.generation);
      assert.equal(ok(await client.context('note', note.id)).record.body, sourceNote); assert.equal(ok(await client.context('run', run.id, originalRun.rendition)).record.output, output); assert.equal(ok(await client.context('article', article.id, originalArticle.rendition)).record.sections[1].parts[0].text, tex);
      const stale = await client.request('/api/commands', { operationId: 'composite-old-generation-write', expectedGeneration: 'legacy@0', action: 'update', family: 'note', id: note.id, expectedRev: note.rev, data: { body: 'must not cross generation' } }, { headers: { 'x-minamo-generation': 'legacy@0' } }); assert.equal(stale.status, 409); assert.equal(stale.data.code, 'generation_conflict');
    });
    await t.test('restored MCP exact readback remains supplied and no learning checkpoints were manufactured', async () => {
      const read = await mcp('read_minamo_record', { family: 'run', id: run.id, rendition: originalRun.rendition }); assert.equal(read.record.evidence, 'illustrative'); assert.equal(read.record.output, output);
      const noteRead = await mcp('read_minamo_record', { family: 'note', id: note.id }); assert.equal(sdk.readMathDeclarations(noteRead.record.body)[0].expression.source, tex);
      const portable = ok(await client.recover('export')); assert.equal(portable.restorable, false); assert.ok(portable.records.some(r => r.id === journey.id));
      const checkpointRows = await fixture.db.prepare('SELECT name FROM sqlite_master WHERE type=? AND name LIKE ?').bind('table', '%development%').all();
      assert.ok(checkpointRows.results.some(row => row.name === 'v2_learning_developments'), 'The actual learning-development table was inspected.');
      for (const row of checkpointRows.results) { const count = await fixture.db.prepare('SELECT COUNT(*) AS n FROM "' + row.name.replaceAll('"', '""') + '"').first(); assert.equal(count.n, 0, 'No automatic Development rows.'); }
    });
  } finally { await fixture.dispose(); }
});
