import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import SourceReference from './app/source-reference.tsx';export const render=source=>renderToStaticMarkup(React.createElement(SourceReference,{source}));`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'source-permission-ui-')),entry=join(dir,'ui.cjs');writeFileSync(entry,built.outputFiles[0].text);const {render}=require(entry);rmSync(dir,{recursive:true,force:true});
test('a withheld excerpt retains its independent reference without claiming current permission',()=>{
 const source={url:'https://example.invalid/reference',attribution:'Original synthetic source',rights:'permitted-excerpt',excerpt:{state:'permitted',text:'canary'}};
 assert.match(render(source),/Permitted excerpt/);
 for(const excerpt of [{state:'revoked',text:'',unavailable:true},{state:'permitted',text:'',unavailable:true}]){const html=render({...source,excerpt});assert.match(html,/Excerpt unavailable/);assert.match(html,/independent reference retained/);assert.doesNotMatch(html,/Permitted excerpt/);assert.match(html,/Original source/);}
});
