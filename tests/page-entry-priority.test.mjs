import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const dir=mkdtempSync(join(tmpdir(),'minamo-entry-'));
const built=await wr('esbuild').build({entryPoints:['app/page.tsx'],bundle:true,platform:'node',format:'cjs',jsx:'automatic',write:false,plugins:[{name:'admission-adapters',setup(build){
 build.onResolve({filter:/^(cloudflare:workers|\.\/chatgpt-auth|\.\.\/lib\/domain|\.\.\/lib\/generations|\.\/workspace)$/},args=>({path:args.path,namespace:'adapters'}));
 build.onLoad({filter:/.*/,namespace:'adapters'},args=>({contents:args.path==='cloudflare:workers'?"export const env={};":args.path==='./chatgpt-auth'?"export async function getChatGPTUser(){return globalThis.entryTest.user}":args.path==='../lib/generations'?"export async function resolveGeneration(){return {namespace:'TEST-ONLY-owner',generation:'legacy@0'}};export const withGeneration=env=>env;":args.path==='./workspace'?"export default function Workspace(){return null}":`export async function readWorkspace(){globalThis.entryTest.collections++;return {records:globalThis.entryTest.collection,activity:[]}};export async function readContext(env,owner,family,id,rendition){globalThis.entryTest.exact.push({family,id,rendition});return {record:{family,id,title:'Exact permitted reading',body:'Complete original source',links:[],rev:1,rendition:rendition??'current',trashedAt:null},related:[]}}`,loader:'js'}));
 }}]});
const file=join(dir,'entry.cjs');writeFileSync(file,built.outputFiles[0].text);const {default:Home}=require(file);rmSync(dir,{recursive:true,force:true});
const setup=()=>globalThis.entryTest={user:{userId:'TEST-ONLY-owner'},collections:0,collection:[],exact:[]};
test('explicit exact and retained entries reach admitted reading without any broad collection read',async()=>{
 for(const family of ['article','journey','investigation','note']){const state=setup();const element=await Home({searchParams:Promise.resolve({family,id:'exact',view:'library',rendition:'retained',section:'s',part:'p'})});assert.equal(state.collections,0);assert.equal(element.props.initialCollectionPending,true);assert.equal(element.props.initialArticle.rendition,'retained');assert.equal(element.props.initialRecords[0].id,'exact');assert.deepEqual(state.exact.map(x=>x.rendition),[undefined,'retained']);}
});
test('untyped identity keeps collection ambiguity rules, and signed-out entry performs no private reads',async()=>{
 const state=setup();state.collection=[{family:'article',id:'ambiguous',links:[]},{family:'note',id:'ambiguous',links:[]}];const element=await Home({searchParams:Promise.resolve({id:'ambiguous'})});assert.equal(state.collections,1);assert.equal(state.exact.length,0);assert.match(element.props.initialTargetError,/explicit record family/);
 setup().user=null;await Home({searchParams:Promise.resolve({family:'article',id:'exact'})});assert.equal(globalThis.entryTest.collections,0);assert.equal(globalThis.entryTest.exact.length,0);
});
