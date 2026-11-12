process.on('uncaughtException',error=>{console.error(error?.code??error?.name,error?.message);process.exitCode=1;});
/** Read-only isolated conversion. Never imports/publishes records or alters wave state. */
import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
if(!process.argv[2])throw Error('Pass the isolated content-packs/japanese-jlpt-n5-n4 directory. No network or production write is performed.');
const root=path.resolve(process.argv[2]),bundle=await build({stdin:{contents:'export * from "./lib/reading-cue-compiler.ts";export {compileManuscript} from "./lib/manuscript.ts"',resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',write:false});
const {compileReadingCues,compileManuscript}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const sha=s=>createHash('sha256').update(s).digest('hex'),units=[];
for(const level of ['n5','n4'])for(const file of readdirSync(path.join(root,level)).filter(f=>f.endsWith('.md')).sort()){
 const relative=level+'/'+file,markdown=readFileSync(path.join(root,relative),'utf8'),canonical=/\*\*Canonical Japanese[^\n]*\n\n((?:>[^\n]*(?:\n|$))+)/u.exec(markdown);
 if(!canonical)throw Error('No canonical Japanese block in '+relative);
 const text=canonical[1].trimEnd().split('\n').map(s=>s.replace(/^> ?/,'')).join('\n'),cueLine=markdown.split('\n').find(l=>l.startsWith('**Contextual furigana cues'));
 if(!cueLine)throw Error('No contextual cues in '+relative);
 const cues=[...cueLine.matchAll(/`([^`]+?)\s*→\s*([^`]+?)`/gu)].map(m=>({expression:m[1].trim(),reading:m[2].trim(),source:'PR51 original authored reading cue; linguistic certification not attested'})),resolved=[],diagnostics=[];
 for(const [i,cue] of cues.entries())try{resolved.push(...compileReadingCues({version:1,text,language:'ja',direction:'ltr',cues:[cue]}).language.spans);}catch(e){diagnostics.push(...e.diagnostics.map(d=>({...d,path:'cues['+i+']',expression:cue.expression})));}
 const language=compileReadingCues({version:1,text,language:'ja',direction:'ltr',spans:resolved.sort((a,b)=>a.start-b.start)}).language;
 // Preserve full unit source; replace only the exact canonical block with its equivalent semantic representation.
 const converted=markdown.replace(/^---\n[\s\S]*?\n---\n/u,'').replace(canonical[1],'```minamo-language\n'+JSON.stringify(language)+'\n```\n');
 const compiled=await compileManuscript({purpose:'TEST ONLY isolated PR51 complete-unit conversion; no publication',operationId:'pr51-dryrun-'+level+'-'+file.slice(0,2),expectedGeneration:'legacy@0',synthetic:true,manuscript:{version:1,brief:'Validate full staged Japanese source conversion without advancing publication waves or recording learner activity.',documents:[{key:level+'-'+file.slice(0,2),role:'article',learningScope:{version:1,spaces:['languages'],languages:['ja'],provenance:'authored'},markdown:converted}]}});
 const record=compiled.pkg.records[0],semantic=record.data.sections.flatMap(s=>s.parts).find(p=>p.semantic?.kind==='ruby');
 if(semantic?.text!==text)throw Error('Converted canonical source drift in '+relative);
 units.push({path:relative,sourceSha256:sha(markdown),canonicalSha256:sha(text),cueCount:cues.length,resolved:resolved.length,diagnostics,canonicalReadbackExact:true,convertedParts:record.data.sections.reduce((n,s)=>n+s.parts.length,0),warnings:compiled.warnings.map(w=>({code:w.code,message:w.message}))});
}
const result={kind:'isolated-pr51-conversion-v1',sourceRef:'f8cb60dc1466e514df77cc2087e6c704a4a150e2',publication:false,units:units.length,cues:units.reduce((n,u)=>n+u.cueCount,0),resolved:units.reduce((n,u)=>n+u.resolved,0),diagnosed:units.reduce((n,u)=>n+u.diagnostics.length,0),allCanonicalReadbacksExact:units.every(u=>u.canonicalReadbackExact),results:units};
if(result.units!==24||result.cues!==325)throw Error('Unexpected complete-pack inventory: '+JSON.stringify({units:result.units,cues:result.cues}));
console.log(JSON.stringify(result,null,2));
