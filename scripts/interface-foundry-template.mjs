#!/usr/bin/env node
/** Local-only original synthetic Activity producer. Never contacts a Site or writes a learner record. */
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,readFileSync,mkdirSync,rmSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
const args=process.argv.slice(2),options={};
for(let i=0;i<args.length;i+=2){if(!['--id','--output','--validate','--view'].includes(args[i])||!args[i+1])throw Error('Use --id synthetic-name --output path.json [--view source.bytes-v1] OR --validate path.json.');if(options[args[i]])throw Error('Duplicate option '+args[i]);options[args[i]]=args[i+1];}
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:'export{deriveActivityPresentation}from"./lib/interface-foundry.ts";export{validateActivityCartridge}from"./lib/activity/schema.ts";export{admitActivityContent}from"./lib/activity/admission.ts";export{plainTextArtefact}from"./lib/foundry/core-adapters.ts";export{mathTexArtefact}from"./lib/foundry/math-platform.ts";',resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'}});
const temporary=mkdtempSync(join(tmpdir(),'minamo-interface-template-')),modulePath=join(temporary,'sdk.cjs');writeFileSync(modulePath,built.outputFiles[0].text);const sdk=require(modulePath);rmSync(temporary,{recursive:true,force:true});
if(options['--validate']){
 if(Object.keys(options).length!==1)throw Error('--validate cannot be combined with producer options.');
 const request=JSON.parse(readFileSync(resolve(options['--validate']),'utf8')),activity=sdk.validateActivityCartridge(request.activity);await sdk.admitActivityContent(activity);
 process.stdout.write('Local Activity and renderer source validation passed. MCP preview still must recheck current owner/generation/source authority. No write performed.\n');
}else{
 const id=options['--id']??'synthetic-interface-composition';if(!/^synthetic-[a-z0-9][a-z0-9-]{0,100}$/.test(id))throw Error('Use a synthetic- prefixed lowercase ID with at most 110 characters.');
 const blocks=[{id:'task',kind:'instruction',text:'Inspect two original components, then capture a short question using the existing Notes host.'},
 {id:'passage',kind:'foundry',artefact:await sdk.plainTextArtefact('TEST ONLY — original supplied text. An authored explanation and displayed formula are separate from observed execution and saved learning.')},
 {id:'formula',kind:'foundry',artefact:await sdk.mathTexArtefact({contract:'minamo.math.v1',id:'authored-square',format:'tex',source:'(x+1)^2=x^2+2x+1',display:'block',description:'Original authored algebraic identity; no learner achievement or computation receipt.'})},
 {id:'reflect',kind:'reflection',text:'What source would you inspect to verify your interpretation? Saving an attempt is optional.'}];
 const activity={contract:'minamo.activity.v1',template:'mathematics',intent:'Inspect an original synthetic two-component composition with the existing trusted interface.',authorship:'original-exercise',blocks};activity.presentation=sdk.deriveActivityPresentation(activity);if(options['--view']){if(options['--view']!=='source.bytes-v1')throw Error('This template supports only the advertised source.bytes-v1 view over its text block; omit --view for original prose.');activity.presentation={...activity.presentation,slots:activity.presentation.slots.map(slot=>slot.blockId==='passage'?{...slot,viewId:options['--view']}:slot)};}sdk.validateActivityCartridge(activity);await sdk.admitActivityContent(activity);
 const request={purpose:'TEST ONLY — owner-requested original synthetic Activity composition for interface acceptance; no learning claim.',operationId:id+'-publish',id,title:'TEST ONLY — '+id.replace(/^synthetic-/,'').replaceAll('-',' '),synthetic:true,activity};
 const json=JSON.stringify(request,null,2)+'\n';
 if(options['--output']){const destination=resolve(options['--output']);mkdirSync(dirname(destination),{recursive:true});writeFileSync(destination,json,{flag:'wx'});process.stdout.write('Created '+destination+'; no publication performed.\n');}else process.stdout.write(json);
}
