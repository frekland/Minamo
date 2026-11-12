/** Build a single-file DevTools snippet from the same checked library-export code as the V165 UI. */
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const root=new URL('../',import.meta.url);
const input=fs.readFileSync(new URL('lib/library-backup-client.ts',root),'utf8');
let js=ts.transpileModule(input,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
js=js.replace(/^export /gm,'');
const output=`/* Minamo Legacy Library backup — generated from V165 export source.
 * READ ONLY: all requests are authenticated GETs to the CURRENT legacy site.
 * Downloads private, unencrypted ZIP to your computer. No uploads or writes.
 * Open https://minamo-legacy-2.jscymru.chatgpt.site/ and run this in Chrome Sources > Snippets.
 */
(async () => {
 if (location.hostname !== 'minamo-legacy-2.jscymru.chatgpt.site') {
  alert('Open the signed-in Minamo Legacy Site before running this snippet.');
  return;
 }
 if (!confirm('Download an UNENCRYPTED local backup of your Legacy Minamo Library, including permitted media and available retained editions? No data will be changed.'))return;
 const status = document.createElement('div');
 status.style.cssText = 'position:fixed;bottom:16px;right:16px;max-width:450px;background:#17212d;color:white;padding:14px 16px;border:1px solid #5a8299;border-radius:10px;font:13px system-ui;z-index:2147483647;box-shadow:0 3px 14px #0006';
 status.textContent = 'Starting Library backup…'; document.body.append(status);
 const report=(message)=>{status.textContent='Minamo Library backup: '+message;console.info('[Minamo backup]',message);};
 try {
 ${js}
  const result=await downloadLibraryBackup({origin:location.origin+'/',fetcher:fetch.bind(window),history:true,includeSources:true,progress:report});
  report(result.complete?'Download started. Check Downloads, then verify manifest.json and keep the ZIP securely.':'Partial archive download started. Check its manifest.json for missing files.');
  console.info('Minamo backup summary:',JSON.stringify({filename:result.filename,counts:result.counts,warnings:result.warnings,complete:result.complete},null,2));
 } catch(error) {
  status.style.borderColor='#d66';
  report('FAILED — '+(error instanceof Error?error.message:String(error))+'. No Library changes were made.');
  console.error(error);
 }
})();
`;
const target=process.argv[2]||'./legacy-library-backup-snippet.js';
fs.writeFileSync(new URL(target,import.meta.url),output);
console.log('Generated',target,'from',root.pathname+'lib/library-backup-client.ts');
