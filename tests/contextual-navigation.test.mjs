import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {NavigationContext} from './app/navigation-context';export * from './lib/navigation-origin';export {NavigationContext,useContextualHref} from './app/navigation-context';export {LearningSpaceContext} from './app/learning-space-ui';export {ThinkingItems} from './app/learning-activity';export function render(Component,props,context={}){return renderToStaticMarkup(React.createElement(NavigationContext.Provider,{value:context},React.createElement(Component,props)));}`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'import.meta.env':'{"DEV":false}','process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'context-nav-')),entry=join(dir,'navigation.cjs');writeFileSync(entry,built.outputFiles[0].text);const api=require(entry);rmSync(dir,{recursive:true,force:true});
const selection={sectionId:'s',partId:'p',start:1,end:4,segments:[{sectionId:'s',partId:'p',start:1,end:4},{sectionId:'s',partId:'p2',start:0,end:2}]};

test('N01: canonical Project interception retains exact URL edition, multi-segment UTF-16 selection and task return',()=>{
 const source='/?view=library&family=article&id=reference&rendition=e1&section=s&part=p&start=1&end=4&segments='+encodeURIComponent(JSON.stringify(selection.segments))+'&returnJourney=P&returnStage=S';
 const target=api.routeDestination(source);
 assert.equal(target.view,'library');assert.equal(target.target.rendition,'e1');assert.deepEqual(target.target.segments,selection.segments);
 assert.equal(target.target.returnJourney,'P');assert.equal(target.target.returnStage,'S');
 assert.equal(api.routeDestination(source+'&start=6'),undefined,'duplicate selectors must not choose an arbitrary version');
 assert.equal(api.routeDestination(source.replace('end=4','end=9')),undefined,'first range must match first segment');
 assert.equal(api.routeDestination('https://evil.example/?family=article&id=reference'),undefined);
});

test('N07: original Question Q2 and Stage S are selected from navigation, never a Note backlink to Q1',()=>{
 const original=api.extendViewOrigin(undefined,{family:'investigation',id:'Q2',rendition:'q-e3'},{journeyId:'P',stageId:'S'});
 assert.deepEqual(original.task,{family:'investigation',id:'Q2',projectId:'P',stageId:'S'});
 const href=api.withViewOrigin('/?view=work&family=note&id=N',original);
 assert.deepEqual(api.routeDestination(href).target.origin.task,original.task);
 const stillOriginal=api.extendViewOrigin(original,{family:'note',id:'N'},undefined);
 assert.deepEqual(stillOriginal.task,original.task);
 const otherBacklink={family:'investigation',id:'Q1',relation:'related'};
 assert.equal(stillOriginal.task.id,'Q2');assert.notEqual(stillOriginal.task.id,otherBacklink.id);
 assert.equal(api.routeDestination('/?view=work&family=note&id=N').target.origin,undefined,'cold Note has no invented origin');
});

test('A04: Article e1 passage, Activity X and originating Q2 remain distinct after multi-hop navigation',()=>{
 const fromQuestion=api.extendViewOrigin(undefined,{family:'investigation',id:'Q2',rendition:'q1'},{journeyId:'P',stageId:'S'});
 const fromArticle=api.extendViewOrigin(fromQuestion,{family:'article',id:'A',rendition:'e1',...selection},{journeyId:'P',stageId:'S'});
 const fromActivity=api.extendViewOrigin(fromArticle,{family:'experiment',id:'X',rendition:'x1'});
 const returnFromNote=api.extendViewOrigin(fromActivity,{family:'note',id:'N'});
 const href=api.withViewOrigin('/?view=tools&family=experiment&id=X&rendition=x1',returnFromNote);
 assert.deepEqual(api.routeDestination(href).target.origin,fromActivity);
 assert.equal(fromActivity.source.rendition,'e1');assert.deepEqual(fromActivity.source.segments,selection.segments);assert.equal(fromActivity.activity.id,'X');assert.equal(fromActivity.task.id,'Q2');
 assert.equal(api.extendViewOrigin(fromActivity,{family:'article',id:'A',rendition:'e2'}).source.rendition,'e1');
});

test('R2/E6: origin is bounded view metadata, not a recursive URL, prose, permission claim or unchecked exact range',()=>{
 assert.equal(api.parseViewOrigin(JSON.stringify({v:1,task:{family:'investigation',id:'Q2'},url:'https://other.example'})),undefined);
 assert.equal(api.parseViewOrigin(JSON.stringify({v:1,source:{family:'article',id:'A',rendition:'e1',title:'May I save a link?'}})),undefined);
 assert.equal(api.parseViewOrigin(JSON.stringify({v:1,source:{family:'article',id:'A',rendition:'e1',sectionId:'s',partId:'p',start:1,end:4,segments:[{sectionId:'s',partId:'p',start:1,end:3}]}})),undefined);
 assert.equal(api.parseViewOrigin(JSON.stringify({v:1,task:{family:'investigation',id:'Q2',projectId:'P',stageId:'S'}})).task.id,'Q2');
 assert.equal(api.routeDestination('/?view=work&family=note&id=N&origin=%7Bbad'),undefined);
});

test('N07: rendered recent Note native link carries the actual Question task return even without a click handler',()=>{
 const context={selection:{learningSpace:'computing'},project:{journeyId:'P',stageId:'S'},current:{family:'investigation',id:'Q2',rendition:'q1'}};
 const item={family:'note',id:'N',title:'A later Note',rev:2,updatedAt:'2026-11-01T10:00:00Z',actor:'learner',text:'Working through a different option.',textComplete:true,afterCheckpoint:true,connectionReason:'Accepted link',destination:'/?view=work&family=note&id=N'};
 const html=api.render(api.ThinkingItems,{items:[item]},context);
 const href=html.match(/href="([^"]+)"/)?.[1]?.replaceAll('&amp;','&');assert.ok(href);
 const origin=api.routeDestination(href).target.origin;
 assert.deepEqual(origin.task,{family:'investigation',id:'Q2',projectId:'P',stageId:'S'});
 assert.match(href,/learningSpace=computing/);
});
