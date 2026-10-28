import {existsSync,readFileSync,rmSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
/** Clear the optional executable public input BEFORE Vite copies it.
 * Retain expensive local scientific asset staging; final distribution policy
 * excludes those generated package bytes from an ordinary release. */
export function prepareFoundryPublicAssets(root=process.cwd(),includeScience=process.env.MINAMO_FOUNDRY_PACKAGE_SCIENCE==='1'){
 const runtime=resolve(root,'public/runtime/foundry-python'),controller=resolve(root,'public/foundry-python-isolate.js');
 if(!includeScience){rmSync(controller,{force:true});return {scienceStaged:false};}
 if(!existsSync(resolve(runtime,'manifest.json'))||!existsSync(controller))throw Error('Scientific assets must be explicitly staged before opt-in packaging.');
 const manifest=JSON.parse(readFileSync(resolve(runtime,'manifest.json'),'utf8'));
 if(manifest.contract!=='minamo.python-assets.v1')throw Error('Invalid staged science manifest.');
 if(!readFileSync(controller).equals(readFileSync(resolve(root,'vendor/foundry-python-isolate.js'))))throw Error('Staged science controller must match the exact vendor source.');
 return {scienceStaged:true};
}
/** Fixed generated distribution paths only. Never remove local lab source/assets. */
export function applyFoundryPackagePolicy(root=process.cwd(),includeScience=process.env.MINAMO_FOUNDRY_PACKAGE_SCIENCE==='1'){
 const output=resolve(root,'dist/client'),runtime=resolve(output,'runtime/foundry-python'),controller=resolve(output,'foundry-python-isolate.js');
 if(includeScience){if(!existsSync(resolve(runtime,'manifest.json'))||!existsSync(controller))throw Error('Scientific assets must be explicitly staged before opt-in packaging.');const manifest=JSON.parse(readFileSync(resolve(runtime,'manifest.json'),'utf8'));if(manifest.contract!=='minamo.python-assets.v1')throw Error('Invalid staged science manifest.');return {scienceIncluded:true};}
 rmSync(runtime,{recursive:true,force:true});rmSync(controller,{force:true});return {scienceIncluded:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(applyFoundryPackagePolicy()));
