// Repro: install kuromoji@0.1.2 into a disposable prefix, then pass its node_modules path.
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url), wr = createRequire(require.resolve('wrangler/package.json'));
const { build } = wr('esbuild');
const compiled = await build({ entryPoints: ['lib/foundry/language-tokenizer.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
const { proposeTokenizerReadings } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const modulePath = process.argv[2];
if (!modulePath) throw Error('Pass disposable node_modules directory; this experiment never installs or fetches packages.');
const kuromoji = require(path.resolve(modulePath, 'kuromoji')), packageRoot = path.resolve(modulePath, 'kuromoji');
const dictionary = readdirSync(path.join(packageRoot, 'dict')).filter(name => name.endsWith('.gz')).sort().map(name => { const bytes = readFileSync(path.join(packageRoot, 'dict', name)); return { name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') }; });
const dictionaryDigest = createHash('sha256').update(JSON.stringify(dictionary)).digest('hex');
const before = process.memoryUsage(), t = performance.now();
const tokenizer = await new Promise((resolve, reject) => kuromoji.builder({ dicPath: path.join(packageRoot, 'dict') }).build((error, value) => error ? reject(error) : resolve(value)));
const initializationMs = performance.now() - t, after = process.memoryUsage();
const cases = ['今日は日本語を勉強します。', '明日は一日中勉強します。', '生と学生と生きる。', '行く、行った。', '🙂 e\u0301 か\u3099 日本語', '小鳥遊さんとChatGPT。'].map(text => { const start = performance.now(), raw = tokenizer.tokenize(text), elapsedMs = performance.now() - start;
  const tokens = raw.map(token => ({ surface_form: token.surface_form, ...(token.reading ? { reading: token.reading } : {}), ...(token.pos ? { pos: token.pos } : {}), word_type: token.word_type }));
  let proposal, error; try { proposal = proposeTokenizerReadings(text, tokens, { name: 'kuromoji', version: '0.1.2', dictionaryDigest }); } catch (e) { error = { code: e.code, message: e.message }; }
  return { text, elapsedMs, tokens: raw.map(token => ({ surface: token.surface_form, proposedReading: token.reading ?? null, wordPosition: token.word_position, type: token.word_type })), proposal, ...(error ? { error } : {}) };
});
console.log(JSON.stringify({ classification: 'Actual Node tokenizer execution on original synthetic strings; proposals are not teacher-validated readings or Minamo learner evidence.', runtime: process.version, package: { name: 'kuromoji', version: require(path.join(packageRoot, 'package.json')).version, license: require(path.join(packageRoot, 'package.json')).license }, initializationMs, processMemoryBefore: before, processMemoryAfter: after, dictionary, dictionaryDigest, dictionaryCompressedBytes: dictionary.reduce((sum, entry) => sum + entry.bytes, 0), cases }, null, 2));
