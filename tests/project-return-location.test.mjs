import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const bundle=await wr('esbuild').build({stdin:{contents:`export{withExactProjectReturn,projectReturnLocationFromRoute}from'./lib/project-return-location';export{routeDestination,routeTarget}from'./lib/navigation-origin';export{nativeProjectReturnEligible}from'./lib/project-native-return';`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false});
const dir=mkdtempSync(join(tmpdir(),'project-return-location-')),path=join(dir,'test.cjs');
writeFileSync(path,bundle.outputFiles[0].text);const routes=require(path);rmSync(dir,{recursive:true,force:true});

test('Note destination retains its exact identity and gains a separate Project return location',()=>{
 const destination='/?view=work&family=note&id=analysis&rendition=note-edition&section=writing&part=body';
 const linked=routes.withExactProjectReturn(destination,{id:'dns-project',rendition:'project-old',sectionId:'dns-cache',partId:'python-model'});
 const params=new URL(linked,'https://example.test').searchParams;
 for(const [field,value] of Object.entries({family:'note',id:'analysis',rendition:'note-edition',section:'writing',part:'body',returnJourney:'dns-project',returnRendition:'project-old',returnSection:'dns-cache',returnPart:'python-model'}))assert.equal(params.get(field),value);
 assert.deepEqual(routes.projectReturnLocationFromRoute(params),{id:'dns-project',rendition:'project-old',sectionId:'dns-cache',partId:'python-model'});
 assert.equal(routes.routeDestination(linked).target.returnPart,'python-model');
});

test('numeric revision routes are valid for standalone readable records, but require an exact rendition',()=>{
 for(const family of ['note','article','investigation','annotation','journey']){
  const route=routes.routeTarget(new URLSearchParams({family,id:'retained',rendition:'edition',revision:'3'}));
  assert.equal(route?.revision,3);
  assert.equal(route?.recordFamily,family);
 }
 assert.equal(routes.routeTarget(new URLSearchParams({family:'note',id:'retained',revision:'3'})),undefined);
 assert.equal(routes.routeTarget(new URLSearchParams({family:'flag',id:'retained',rendition:'edition',revision:'3'})),undefined);
 assert.equal(routes.routeTarget(new URLSearchParams({family:'note',id:'retained',rendition:'edition',revision:'0'})),undefined);
});

test('Project returns can be opened directly in another tab and are only navigation context',()=>{
 const linked=routes.withExactProjectReturn('/?view=work&family=note&id=analysis',{id:'project',rendition:'edition-2',sectionId:'code',partId:'block'});
 const reloaded=routes.routeDestination(linked);
 assert.deepEqual({family:reloaded.target.recordFamily,id:reloaded.id}, {family:'note',id:'analysis'});
 const returnLocation=routes.projectReturnLocationFromRoute(new URL(linked,'https://example.test').searchParams);
 assert.deepEqual(returnLocation,{id:'project',rendition:'edition-2',sectionId:'code',partId:'block'});
 assert.equal(routes.withExactProjectReturn('/?view=journeys&family=journey&id=project',{id:'project',rendition:'edition-2'}),'/?view=journeys&family=journey&id=project');
 assert.equal(routes.withExactProjectReturn('/?view=work&family=note&id=analysis',{id:'project'}).includes('returnSection'),false);
});

test('Malformed or incomplete Project selectors do not become trusted return routes',()=>{
 for(const query of [
  'returnJourney=project&returnPart=part',
  'returnJourney=project&returnRendition=edition&returnPart=part',
  'returnJourney=project&returnRendition=edition&returnSection=bad%2Fsection',
  'returnJourney=project&returnJourney=other',
  'returnJourney=project&returnRendition=edition&returnSection=section&returnPart=bad%0Apart',
  'returnRendition=edition&returnSection=section',
 ]){
  const params=new URLSearchParams('view=work&family=note&id=analysis&'+query);
  assert.equal(routes.projectReturnLocationFromRoute(params),undefined,query);
  assert.equal(routes.routeTarget(params),undefined,query);
 }
 assert.equal(routes.withExactProjectReturn('https://elsewhere.test/',{id:'project',rendition:'edition'}),'https://elsewhere.test/');
});

test('two Project saves may share a rendition but retain separate exact revision routes',()=>{
 const shared='/?view=journeys&family=journey&id=radio&rendition=shared-reading';
 assert.equal(routes.routeDestination(shared+'&revision=35').target.revision,35);
 assert.equal(routes.routeDestination(shared+'&revision=36').target.revision,36);
 for(const query of ['revision=0','revision=-1','revision=NaN','revision=1.2','revision=9007199254740992','revision=35&revision=36'])
  assert.equal(routes.routeDestination(shared+'&'+query),undefined,query);
 assert.equal(routes.routeDestination('/?view=library&family=article&id=radio&rendition=shared-reading&revision=35')?.target.revision,35,'the same exact revision contract now applies to readable Library material');
 assert.equal(routes.routeDestination('/?view=journeys&family=journey&id=radio&revision=35'),undefined,'retained revision links must identify the content rendition too');
});

test('The native tabbed Project view admits only an exact eligible current section',()=>{
 const project={family:'journey',id:'project',rendition:'r1',sections:[{id:'s3',parts:[{id:'p3',kind:'paragraph',text:'Control'}, {id:'p4',kind:'code',text:'print(1)'}]}]};
 const target={recordFamily:'journey',rendition:'r1',sectionId:'s3',partId:'p3'};
 assert.equal(routes.nativeProjectReturnEligible(project,project,target),true);
 for(const bad of [{...target,rendition:'old'},{...target,partId:'missing'},{...target,sectionId:'missing'},{...target,captureId:'captured'},{...target,start:0,end:7},{...target,stageId:'legacy-step'}])assert.equal(routes.nativeProjectReturnEligible(project,project,bad),false);
 assert.equal(routes.nativeProjectReturnEligible(project,{...project,rendition:'r2'},target),false,'A historical revision stays a retained whole-reading view.');
 assert.equal(routes.nativeProjectReturnEligible(project,project,{...target,partId:'p3',segments:[{sectionId:'s3',partId:'p3',start:0,end:3}]}),false);
});
