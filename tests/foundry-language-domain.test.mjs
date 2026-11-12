import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
const require = createRequire(import.meta.url), wr = createRequire(require.resolve('wrangler/package.json')), { Miniflare } = wr('miniflare'), { build } = wr('esbuild');
async function load(entry) { const result = await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', write: false }); return import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64')); }
const language = await load('lib/foundry/language.ts'), { japaneseLanguageFixture: content } = await load('lib/foundry/language-fixtures.ts'), note = await load('lib/note-rich-codec.ts');
const bundled = await build({ stdin: { contents: 'import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler}', resolveDir: process.cwd() }, bundle: true, format: 'esm', platform: 'neutral', write: false });
test('dormant language source uses real existing synthetic D1/Notes/MCP/capture authority', async t => {
  const mf = new Miniflare({ modules: true, script: bundled.outputFiles[0].text, compatibilityDate: '2026-05-15', cf: false, d1Databases: ['DB'], r2Buckets: ['BUCKET'] });
  try {
    const db = await mf.getD1Database('DB');
    for (const file of readdirSync('drizzle').filter(f => f.endsWith('.sql')).sort()) for (const sql of readFileSync('drizzle/' + file, 'utf8').split('--> statement-breakpoint')) if (sql.trim()) await db.prepare(sql).run();
    const headers = { 'oai-authenticated-user-id': 'synthetic-foundry-language-owner', 'oai-authenticated-user-email': 'language@example.invalid', 'Content-Type': 'application/json' };
    const request = (path, body, otherOwner = false) => mf.dispatchFetch('https://foundry-language.test' + path, { method: body === undefined ? 'GET' : 'POST', headers: { ...headers, ...(otherOwner ? { 'oai-authenticated-user-id': 'different-synthetic-owner' } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const command = async c => { const r = await request('/api/commands', c); return { status: r.status, body: await r.json() }; };
    let article, savedNote;
    const source = language.languageManuscriptBlock(content);
    await t.test('explicit language source roundtrips through existing rich Note codec', () => { assert.equal(note.richNoteCompatibility(source).supported, true); assert.deepEqual(language.parseLanguageManuscriptBlock(note.serializeRichNote(note.parseRichNote(source))), content); });
    await t.test('canonical Article retains base characters, and Note stores exact candidate source', async () => {
      const created = await command({ operationId: 'foundry-language-article-create', action: 'create', family: 'article', id: 'foundry-language-article', data: { title: 'TEST ONLY Japanese language specimen', body: 'Original synthetic example; no learning outcome claimed.', synthetic: true, sections: [{ id: 'language', title: 'Original passage', parts: [{ id: 'ja-base', kind: 'paragraph', text: content.text }] }] } });
      assert.equal(created.status, 200, JSON.stringify(created.body)); article = created.body.record;
      const n = await command({ operationId: 'foundry-language-note-create', action: 'create', family: 'note', id: 'foundry-language-note', data: { title: 'TEST ONLY exact language source', body: source, bodyFormat: 'markdown-v1', synthetic: true, links: [{ family: 'article', id: article.id }] } });
      assert.equal(n.status, 200, JSON.stringify(n.body)); savedNote = n.body.record; assert.equal(savedNote.body, source);
      assert.equal(language.bindLanguageText(content, { family: 'article', id: article.id, rendition: article.rendition, sectionId: 'language', partId: 'ja-base', canonicalText: article.sections[0].parts[0].text, eligible: true }).content.text, content.text);
    });
    await t.test('base-text Flag and Annotation admit exact original characters', async () => {
      const anchor = { recordFamily: 'article', articleId: article.id, rendition: article.rendition, sectionId: 'language', partId: 'ja-base', ...language.languageQuote(content, 1, 11) };
      for (const family of ['flag', 'annotation']) { const result = await command({ operationId: 'foundry-language-capture-' + family, action: 'create', family, id: 'foundry-language-' + family, data: { title: 'TEST ONLY base-text capture', body: family === 'annotation' ? 'Synthetic interpretation is separate from exact Japanese base characters.' : '', anchor, synthetic: true } }); assert.equal(result.status, 200, JSON.stringify(result.body)); assert.equal(result.body.record.anchor.quote, content.text.slice(1, 11)); }
    });
    await t.test('MCP reads exact source Note through existing typed read tool', async () => {
      const response = await request('/mcp', { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'read_minamo_record', arguments: { purpose: 'Read synthetic dormant language source without claiming learning.', family: 'note', id: savedNote.id } } });
      assert.equal(response.status, 200); const result = (await response.json()).result; assert.notEqual(result.isError, true); const context = JSON.parse(result.content[0].text); assert.equal(context.record.body, source); assert.deepEqual(language.parseLanguageManuscriptBlock(context.record.body), content);
    });
    await t.test('current revision change retains old source and refuses retargeted decoration', async () => {
      const changedText = '明日は日本語を勉強します。';
      const updated = await command({ operationId: 'foundry-language-article-update', action: 'update', family: 'article', id: article.id, expectedRev: article.rev, data: { sections: [{ id: 'language', title: 'Original passage', parts: [{ id: 'ja-base', kind: 'paragraph', text: changedText }] }] } });
      assert.equal(updated.status, 200, JSON.stringify(updated.body)); assert.throws(() => language.bindLanguageText(content, { family: 'article', id: article.id, rendition: updated.body.record.rendition, sectionId: 'language', partId: 'ja-base', canonicalText: changedText, eligible: true }));
      const retained = await request('/api/context?family=article&id=' + article.id + '&rendition=' + article.rendition); assert.equal(retained.status, 200); const old = (await retained.json()).record; assert.equal(old.sections[0].parts[0].text, content.text);
      const revisedNote = await command({ operationId: 'foundry-language-note-title', action: 'update', family: 'note', id: savedNote.id, expectedRev: savedNote.rev, data: { title: 'TEST ONLY exact source retained' } }); assert.equal(revisedNote.status, 200); const previousRev = savedNote.rev; savedNote = revisedNote.body.record; const stale = await command({ operationId: 'foundry-language-note-stale', action: 'update', family: 'note', id: savedNote.id, expectedRev: previousRev, data: { body: 'must not overwrite exact source' } }); assert.equal(stale.status, 409);
    });
    await t.test('other owner and Trash eligibility remain server-controlled', async () => {
      assert.equal((await request('/api/context?family=note&id=' + savedNote.id, undefined, true)).status, 404);
      const trashed = await command({ operationId: 'foundry-language-note-trash', action: 'trash', family: 'note', id: savedNote.id, expectedRev: savedNote.rev }); assert.equal(trashed.status, 200);
      const read = await request('/api/context?family=note&id=' + savedNote.id); assert.equal(read.status, 404);
      assert.throws(() => language.bindLanguageText(content, { family: 'note', id: savedNote.id, rendition: savedNote.rendition, sectionId: 'language', partId: 'ja-base', canonicalText: content.text, eligible: false }));
    });
  } finally { await mf.dispose(); }
});
