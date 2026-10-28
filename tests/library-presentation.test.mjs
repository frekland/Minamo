import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup}from'react-dom/server';import {LibraryCatalogueView,LibrarySearchResults}from'./app/library-browser';export{subjectLibraryPresentation,areaHubModel}from'./app/library-browser';export const catalogue=props=>renderToStaticMarkup(React.createElement(LibraryCatalogueView,{loading:false,error:'',onOpen:()=>{},onChange:()=>{},onMore:()=>{},onRetry:()=>{},...props}));export const results=props=>renderToStaticMarkup(React.createElement(LibrarySearchResults,{onOpen:()=>{},...props}));`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'},define:{'import.meta.env':'{"DEV":false}','process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'library-presentation-')),entry=join(dir,'ui.cjs');writeFileSync(entry,built.outputFiles[0].text);const ui=require(entry);rmSync(dir,{recursive:true,force:true});
const base={rev:1,actor:'gpt',synthetic:true,createdAt:'2026-10-27T12:00:00Z',updatedAt:'2026-10-27T12:00:00Z',trashedAt:null,rendition:'edition',body:'An authored explanation.',links:[]};
const article=(id,title,areas=['n5'])=>({...base,id,family:'article',title,links:areas.map(id=>({family:'area',id}))});
const a=article('one','03 · Values'),b=article('two','02 · Expressions'),shared=article('shared','Shared kanji',['n5','n4']),other=article('other','N4 listening',['n4']);
const area={...base,family:'area',id:'n5',title:'Japanese JLPT N5',body:'Actual authored subject purpose.',sections:[{id:'start',title:'Values and expressions',parts:[{id:'intro',kind:'paragraph',text:'Authored group context.'},{id:'hidden',kind:'excerpt',text:'WITHHELD-CANARY',unavailable:true}]}],links:[{family:'article',id:'two',sourceContext:{sectionId:'start'}},{family:'article',id:'one',sourceContext:{sectionId:'start'}},{family:'article',id:'other',sourceContext:{sectionId:'start'},rendition:'older-edition',sectionId:'old',partId:'exact'}]};
const item=record=>({family:'article',id:record.id,title:record.title,rendition:record.rendition,summary:record.body,summaryOrigin:'canonical-excerpt',areas:record.links.map(link=>({id:link.id,title:link.id==='n5'?'Japanese JLPT N5':'Japanese JLPT N4'}))});
const browse={facet:'topics',query:'',kind:'',areaId:'n5',areaTitle:area.title};
test('Subject placement follows only explicit authored groups, with shared/contextual Articles separate and originals unchanged',()=>{
 const items=[item(a),item(shared),item(b)],before=JSON.stringify({area,items,records:[a,b,shared,other]}),model=ui.subjectLibraryPresentation(items,area,[a,b,shared,other]);
 assert.deepEqual(model.groups[0].items.map(item=>item.id),['two','one'],'Title numbering cannot override accepted link order');assert.equal(model.groups[0].title,'Values and expressions');assert.deepEqual(model.articles,[]);assert.deepEqual(model.related.map(item=>item.id),['other','shared']);
 assert.equal(model.related[0].destination.rendition,'older-edition');assert.equal(model.related[0].destination.sectionId,'old');assert.equal(model.related[0].destination.partId,'exact');assert.equal(model.related[0].summary,undefined,'A pinned older edition cannot inherit the current edition summary');assert.doesNotMatch(JSON.stringify(model),/WITHHELD-CANARY/);assert.equal(JSON.stringify({area,items,records:[a,b,shared,other]}),before);
 const uncurated=ui.subjectLibraryPresentation([item(a),item(b)],{...area,links:[],sections:[]},[a,b]);assert.equal(uncurated.groups.length,0);assert.deepEqual(uncurated.articles.map(item=>item.id),['one','two'],'Unordered presentation retains server order rather than guessing by title');
});
test('catalogue has one scoped search, one compact view selector and a single subject breadcrumb',()=>{
 const html=ui.catalogue({browse,page:{items:[item(a),item(shared),item(b)]},areaRecord:area,records:[a,b,shared,other],onPreview:()=>{}});
 assert.equal((html.match(/type="search"/g)||[]).length,1);assert.match(html,/aria-label="Search this subject"/);assert.equal((html.match(/aria-label="Library location"/g)||[]).length,1);assert.match(html,/aria-current="page">Japanese JLPT N5/);assert.match(html,/aria-label="Show Library entries"/);assert.match(html,/Related articles/);assert.match(html,/Full introduction/);assert.match(html,/Values and expressions/);assert.doesNotMatch(html,/All results|All subject topics|All subject articles|Look up|Read explanation|Browse topics|Preview explanation|>Article<|>Article excerpt</);
});
test('each Article and Subject has one Open action; previews and actual other-subject links remain secondary',()=>{
 const html=ui.results({items:[item(a)],areaId:'n5',onPreview:()=>{}});assert.equal((html.match(/>Open</g)||[]).length,1);assert.equal((html.match(/>Preview</g)||[]).length,1);assert.equal((html.match(/href=/g)||[]).length,2);const destinations=[...html.matchAll(/href="([^"]+)"/g)].map(match=>match[1]);assert.equal(destinations[0],destinations[1],'Title and Open share the exact native destination');assert.match(html,/aria-label="Open 03 · Values"/);assert.match(html,/data-summary-origin="canonical-excerpt"/);assert.doesNotMatch(html,/>Article<|Read explanation/);
 const subject=ui.results({items:[{family:'area',id:'n5',title:area.title,topicCount:3}],areasOnly:true,onPreview:()=>{}});assert.equal((subject.match(/>Open</g)||[]).length,1);assert.doesNotMatch(subject,/About this subject|Browse topics|>Preview</);assert.match(subject,/3 articles/);
 const related=ui.results({items:[item(shared)],areaId:'n5'});assert.match(related,/Other subjects/);assert.match(related,/Japanese JLPT N4/);assert.match(related,/family=area&amp;id=n4/);assert.doesNotMatch(related,/family=area&amp;id=n5/);
});
test('warm revalidation keeps rows and quiet status while cold reads show a structural skeleton and no fake empty result',()=>{
 const warm=ui.catalogue({browse,page:{items:[item(a)]},loading:true});assert.match(warm,/03 · Values/);assert.match(warm,/Refreshing…/);assert.match(warm,/aria-busy="true"/);assert.doesNotMatch(warm,/loading-skeleton|No articles/);
 const cold=ui.catalogue({browse,page:{items:[]},loading:true});assert.match(cold,/loading-skeleton/);assert.match(cold,/Loading articles…/);assert.doesNotMatch(cold,/No articles are available|No articles match/);
 const failed=ui.catalogue({browse,page:{items:[item(a)]},error:'Refresh failed.'});assert.match(failed,/03 · Values/);assert.match(failed,/This list could not be refreshed/);assert.match(failed,/>Retry</);assert.doesNotMatch(failed,/No articles/);
 const partial=ui.catalogue({browse:{...browse,query:'git',facet:'search'},page:{items:[],nextCursor:'next',searchIncomplete:true}});assert.match(partial,/No matches in the material checked so far/);assert.doesNotMatch(partial,/No articles match/);
});
test('reference filters stay compact and exact edition/section/part links are unchanged',()=>{
 const reference={...item(a),reference:{id:'print',term:'print()',kind:'python-function',definition:'Write a supplied value.',target:{rendition:'retained',sectionId:'values',partId:'example'}}};
 const html=ui.catalogue({browse:{...browse,facet:'references',query:'print',kind:'python-function'},page:{items:[reference]},onPreview:()=>{}});assert.equal((html.match(/aria-label="Reference kind"/g)||[]).length,1);assert.match(html,/Find a name or alias/);assert.match(html,/Python functions/);assert.match(html,/rendition=retained&amp;section=values&amp;part=example/);assert.match(html,/In 03 · Values/);
 const css=readFileSync(new URL('../app/library-browser.css',import.meta.url),'utf8');assert.match(css,/max-width:1160px/);assert.match(css,/flex-wrap:wrap/);assert.match(css,/overflow-wrap:anywhere/);assert.doesNotMatch(css,/mask-image/);
});

test('display order is labelled honestly and authored order is offered only with server-backed availability',()=>{
 const plain=ui.catalogue({browse,page:{items:[item(a),item(b)],order:{kind:'title',label:'Title A–Z',authoredAvailable:false}},areaRecord:area,records:[a,b]});assert.match(plain,/aria-label="Article order"/);assert.match(plain,/Title A–Z/);assert.doesNotMatch(plain,/>Authored order</);assert.doesNotMatch(plain,/>Values and expressions</);assert.ok(plain.indexOf('03 · Values')<plain.indexOf('02 · Expressions'),'The presentation must not silently reinterpret server title order or infer a numbered curriculum');
 const authored=ui.catalogue({browse:{...browse,sort:'authored'},page:{items:[item(a),item(b)],order:{kind:'authored',label:'Authored order',authoredAvailable:true}},areaRecord:area,records:[a,b]});assert.match(authored,/>Authored order</);assert.match(authored,/>Values and expressions</);assert.ok(authored.indexOf('02 · Expressions')<authored.indexOf('03 · Values'));
 const fallback=ui.catalogue({browse:{...browse,sort:'authored'},page:{items:[item(a)],order:{kind:'title',label:'Title A–Z',authoredAvailable:false}}});assert.match(fallback,/value="title" selected=""/);assert.doesNotMatch(fallback,/>Authored order</);
 const ranked=ui.catalogue({browse:{...browse,facet:'search',query:'value'},page:{items:[item(a)]}});assert.doesNotMatch(ranked,/aria-label="Article order"/);
});

test('native Article Open and full introduction links retain bounded Subject catalogue context for new tabs',()=>{
 const html=ui.catalogue({browse:{...browse,sort:'updated'},page:{items:[item(a)]},areaRecord:area,records:[a]});
 const tag=html.match(/<a [^>]*aria-label="Open 03 · Values"[^>]*>/)[0],href=tag.match(/href="([^"]+)"/)[1].replaceAll('&amp;','&'),params=new URL(href,'https://minamo.invalid').searchParams;assert.equal(params.get('id'),'one');assert.equal(params.get('rendition'),'edition');
 const back=new URLSearchParams(params.get('returnLibrary'));assert.equal(back.get('family'),'area');assert.equal(back.get('id'),'n5');assert.equal(back.get('libraryFacet'),'topics');assert.equal(back.get('librarySort'),'updated');assert.equal(back.has('areaTitle'),false);assert.equal(back.has('rendition'),false);
 const introTag=html.match(/<a [^>]*class="v2-text-button le-area-about"[^>]*>/)[0],intro=new URL(introTag.match(/href="([^"]+)"/)[1].replaceAll('&amp;','&'),'https://minamo.invalid').searchParams;assert.equal(intro.get('family'),'area');assert.equal(intro.get('rendition'),'edition');assert.equal(new URLSearchParams(intro.get('returnLibrary')).get('id'),'n5');
 const returnContext='view=library&family=area&id=n5&learningSpace=languages&language=ja&returnJourney=project&returnStage=step';
 const exact=ui.results({items:[{...item(a),destination:{family:'article',id:'one',rendition:'retained',sectionId:'section',partId:'part',start:2,end:8}}],areaId:'n5',returnLibrary:returnContext});const exactHref=exact.match(/href="([^"]+)"/)[1].replaceAll('&amp;','&'),p=new URL(exactHref,'https://minamo.invalid').searchParams;for(const[k,v]of Object.entries({rendition:'retained',section:'section',part:'part',start:'2',end:'8',returnJourney:'project',returnStage:'step'}))assert.equal(p.get(k),v);
});

test('catalogue layout overrides legacy workspace Reader rules while mobile rows can still wrap',()=>{
 const postcss=createRequire(require.resolve('@tailwindcss/postcss'))('postcss'),sheet=postcss.parse(readFileSync(new URL('../app/library-browser.css',import.meta.url),'utf8'));
 const declarations=rule=>Object.fromEntries(rule.nodes.filter(node=>node.type==='decl').map(node=>[node.prop,node.value]));
 const find=(selector,media)=>{let found;sheet.walkRules(rule=>{if(rule.selector===selector&&(media?rule.parent.type==='atrule'&&rule.parent.params===media:rule.parent.type==='root'))found=declarations(rule);});assert.ok(found,selector+' '+(media??'desktop'));return found;};
 const prefix='.wp-workspace .v2-library-browser ',row=prefix+'.le-library-results>:is(.le-library-result,.le-library-area)',actions=prefix+'.le-library-result-actions';
 // The extra browser ancestor outranks reader-modern.css's two-class block/left-alignment rules regardless of stylesheet order.
 assert.equal(find(row).display,'flex');assert.equal(find(row)['justify-content'],'space-between');assert.equal(find(actions).width,'auto');assert.equal(find(actions).flex,'0 0 auto');assert.equal(find(actions)['justify-content'],'flex-end');assert.equal(find(actions).margin,'0');
 const mobile=prefix+'.le-library-results .le-library-result-actions';assert.equal(find(mobile,'(max-width:700px)')['flex-direction'],'column');assert.equal(find(mobile,'(max-width:390px)')['flex-basis'],'100%');assert.equal(find(row,'(max-width:390px)')['flex-wrap'],'wrap');
 const hidden=find(prefix+'.v2-sr-only');assert.equal(hidden.position,'absolute');assert.equal(hidden.width,'1px');assert.equal(hidden.height,'1px');assert.equal(hidden['clip-path'],'inset(50%)');assert.equal(hidden.overflow,'hidden');assert.equal(hidden.display,undefined,'Search labels remain in the accessibility tree');assert.equal(hidden.visibility,undefined);
});
