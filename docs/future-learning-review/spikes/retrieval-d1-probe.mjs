/** Optional synthetic compatibility probe. Never reads a deployed DB or network service.
 * node retrieval-d1-probe.mjs --checkout /absolute/current/source/checkout
 * Uses existing Wrangler/Miniflare dependencies, no installs. Hard 20s exit prevents a stuck probe.
 */
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const index=process.argv.indexOf('--checkout');
const checkout=resolve(index>=0?process.argv[index+1]:process.cwd());
const require=createRequire(resolve(checkout,'package.json'));
const wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wranglerRequire('miniflare');
const timeout=setTimeout(()=>{console.error('D1_PROBE_TIMEOUT: local Miniflare did not complete within 20 seconds; this does not prove hosted D1 lacks FTS5.');process.exit(2)},20000);
let mf;
try {
  mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("synthetic-only")}}',compatibilityDate:'2026-05-15',cf:false,d1Databases:['DB']});
  const db=await mf.getD1Database('DB');
  await db.prepare('CREATE VIRTUAL TABLE synthetic_probe USING fts5(text)').run();
  await db.prepare('INSERT INTO synthetic_probe(text) VALUES(?)').bind('Original synthetic lexical probe').run();
  const found=await db.prepare('SELECT rowid,text,bm25(synthetic_probe) score FROM synthetic_probe WHERE synthetic_probe MATCH ?').bind('lexical').all();
  if(found.results.length!==1)throw Error('Synthetic FTS5 probe returned unexpected rows.');
  console.log(JSON.stringify({synthetic:true,backend:'local Miniflare D1, not hosted Sites',fts5:true,result:found.results}));
} finally {
  await mf?.dispose();clearTimeout(timeout);
}
