import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareFoundryPublicAssets} from './foundry-package-policy.mjs';
const require=createRequire(import.meta.url),root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
prepareFoundryPublicAssets(root);
const py=dirname(require.resolve('pyodide/package.json')),sql=dirname(require.resolve('sql.js/package.json'));
await mkdir(join(root,'public/runtime/pyodide'),{recursive:true});
for(const name of ['pyodide.js','pyodide.asm.js','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json'])await copyFile(join(py,name),join(root,'public/runtime/pyodide',name));
for(const name of ['sql-wasm.js','sql-wasm.wasm'])await copyFile(join(sql,'dist',name),join(root,'public/runtime',name));
const versions={pyodide:JSON.parse(await readFile(join(py,'package.json'),'utf8')).version,sqljs:JSON.parse(await readFile(join(sql,'package.json'),'utf8')).version};
await writeFile(join(root,'public/runtime/versions.json'),JSON.stringify(versions));
// Include published package license files where available, plus provenance pointers.
for(const [folder,label] of [[py,'pyodide'],[sql,'sqljs']])for(const name of ['LICENSE','LICENSE.md','LICENSE.txt'])try{await copyFile(join(folder,name),join(root,'public/runtime',label+'-'+name));}catch{}
await writeFile(join(root,'public/runtime/NOTICE.txt'),'Locally bundled published packages: Pyodide '+versions.pyodide+' (MPL-2.0, https://github.com/pyodide/pyodide); sql.js '+versions.sqljs+' (MIT, https://github.com/sql-js/sql.js). Generated from locked npm dependencies; no external runtime fetches.\n');
console.log('Prepared local Pyodide '+versions.pyodide+' and SQL.js '+versions.sqljs+' browser assets.');
