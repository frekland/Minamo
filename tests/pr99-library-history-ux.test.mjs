import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:"export {hasVisibleProjectDifference,exactProjectEditionHref} from './app/project-revision-trail.tsx';export {routeDestination} from './lib/navigation-origin.ts';export {personalWorkRouteFilters,personalWorkQuery} from './lib/personal-work-organiser.ts';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'},external:['react']});
const module={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(require,module,module.exports);
const {hasVisibleProjectDifference,exactProjectEditionHref,routeDestination,personalWorkRouteFilters,personalWorkQuery}=module.exports;

test('Lab Library explicitly includes illustrative canonical records without changing default MCP selection',()=>{
 const client=readFileSync(new URL('../app/library-browser.tsx',import.meta.url),'utf8');
 const http=readFileSync(new URL('../lib/domain-handler.ts',import.meta.url),'utf8');
 assert.match(client,/limit:'30',includeSynthetic:'true',\.\.\.learningSpaceParams\(learningSelection\)/);
 assert.match(http,/case '\/api\/library':return respond\(await queryLibrary\([^\n]*includeSynthetic:url\.searchParams\.get\('includeSynthetic'\)==='true'/);
 assert.match(http,/case 'query_minamo_library':\{const \{purpose,\.\.\.input\}=args;return freshFirstPageRead\(input.cursor,\(\)=>queryLibrary\(env,owner,\{\.\.\.input,includeSynthetic:args.includeSynthetic===true\}/);
 assert.match(client,/learningSelection\.learningSpace==='unclassified'\?'topics':initialFacet/,'Other starts with articles rather than a misleading empty Subject catalogue');
 assert.match(client,/>Browse articles<\/button>/,'empty Subjects provide a direct route to their Articles');
});

test('history distinguishes content and arrangement differences from other saves while preserving all exact editions',()=>{
 const base={revision:36,rendition:'r-retained',titleChanged:false,descriptionChanged:false,arrangementChanged:false,sectionChanges:[],changes:[],sourceMappingChanges:[]};
 assert.equal(hasVisibleProjectDifference(base),false);
 assert.equal(hasVisibleProjectDifference({...base,arrangementChanged:true}),true);
 assert.equal(hasVisibleProjectDifference({...base,changes:[{change:'revised'}]}),true);
 assert.equal(hasVisibleProjectDifference({...base,sourceMappingChanges:[{path:'work.py'}]}),true);
 const path=exactProjectEditionHref('project-id',{revision:36,rendition:'r-retained'});
 assert.equal(routeDestination(path).target.revision,36);
 assert.equal(routeDestination(path).target.rendition,'r-retained');
 assert.equal(exactProjectEditionHref('project-id',{revision:36}),undefined,'do not fabricate an exact link without a retained rendition');
});

test('Project Connections can direct to saved writing filtered by exact Project context',()=>{
 const parsed=personalWorkRouteFilters('?view=work&context=journey%3Aproject-id');
 assert.equal(parsed.contextKey,'journey:project-id');
 assert.deepEqual(personalWorkQuery({tab:'all',contextKey:parsed.contextKey,advanced:true}).context,{family:'journey',id:'project-id'});
 const project=readFileSync(new URL('../app/project-connections.tsx',import.meta.url),'utf8');
 assert.match(project,/Find connected writing in Your Work/);
 assert.doesNotMatch(project,/Recent saved changes/,'the revision summary belongs only in Saved editions');
});
