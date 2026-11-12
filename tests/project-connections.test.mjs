import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const build=await wr('esbuild').build({stdin:{contents:"export {projectWriting,projectLinks,projectLinkGroups,readableProjectLinks} from './app/project-connections.tsx'; export {relationDescription,relationTitle,projectCitation,projectCitationLocation,matchingIncomingCitation,matchingIncomingLocations,savedPageLocationParts} from './lib/working-relation-presentation.ts';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'},external:['react']});
const module={exports:{}};new Function('require','module','exports',build.outputFiles[0].text)(require,module,module.exports);
const {projectWriting,projectLinks,projectLinkGroups,readableProjectLinks,relationDescription,relationTitle,projectCitation,projectCitationLocation,matchingIncomingCitation,matchingIncomingLocations,savedPageLocationParts}=module.exports;

test('Project connections show authentic writing and bookmarks without reconstructing an attempt or checkpoint',()=>{
 const items=['authored-writing','bookmark','saved-checkpoint','supplied-attempt'].map((basis,index)=>({basis,title:'Record '+index}));
 assert.deepEqual(projectWriting(items).map(item=>item.title),['Record 0','Record 1']);
});

test('Project link projection keeps one exact admitted original per destination and omits its own Project',()=>{
 const link=(family,id,rendition,destination)=>({from:{family:'journey',id:'current',rev:3},to:{family,id,rev:2,rendition},destination,quality:'saved-record-link',reason:'Saved context'});
 const a=link('note','note-a','note-a@2','/?view=work&family=note&id=note-a&rendition=note-a%402');
 const b=link('note','note-a','note-a@1','/?view=work&family=note&id=note-a&rendition=note-a%401');
 const own=link('journey','current','current@3','/?view=journeys&id=current');
 assert.deepEqual(projectLinks([own,a,a,b], 'current'),[a,b]);
});

test('Project link groups keep incoming and outgoing citations to the same edition, grouped only by exact source identity',()=>{
 const source={family:'article',id:'frame-source',rev:2,rendition:'frame-r2'};
 const outgoing={from:{family:'journey',id:'current',rev:4},to:source,title:'Framing notes',destination:'/?view=library&id=frame-source&rendition=frame-r2',quality:'exact-edition',reason:'Diagram node reference'};
 const incoming={...outgoing,direction:'incoming',quality:'saved-inbound-record-link',citedProject:{family:'journey',id:'current',rev:4,rendition:'project-r4'},reason:'Article links back to Project'};
 const sameTitleDifferentId={...outgoing,to:{...source,id:'another-article'},title:'Framing notes'};
 const links=projectLinks([outgoing,incoming,outgoing,sameTitleDifferentId],'current');
 assert.equal(links.length,3,'a duplicate direction is deduplicated, not a reciprocal authored reference');
 const grouped=projectLinkGroups(links);
 assert.equal(grouped.length,2,'matching titles cannot combine separate source identities');
 assert.deepEqual(grouped[0].items,[outgoing,incoming],'both directions and their precise editions survive under one title');
 assert.deepEqual(grouped[1].items,[sameTitleDifferentId]);
});

test('An older Project edition remains explicit on a Note already shown in the writing list',()=>{
 const incoming={from:{family:'journey',id:'japanese',rev:10,rendition:'project-r10'},to:{family:'note',id:'sequence-note',rev:1,rendition:'note-r1'},title:'Sequence constructions',quality:'saved-inbound-record-link',direction:'incoming',citedProject:{family:'journey',id:'japanese',rev:10,rendition:'project-r10'},path:[{rendition:'project-r10'}],destination:'/?view=work&family=note&id=sequence-note'};
 const writing=[{basis:'authored-writing',source:{family:'note',id:'sequence-note',rev:1},title:incoming.title}];
 assert.equal(projectCitation(incoming,'japanese'),'Cites Project r10');
 assert.equal(matchingIncomingCitation([incoming],'note','sequence-note',1,'japanese'),'Cites Project r10');
 assert.deepEqual(readableProjectLinks([incoming],'japanese',writing),[],'the same Note is shown once with its citation label');
 assert.deepEqual(readableProjectLinks([incoming],'japanese',[]),[incoming],'a source excluded by the bounded writing window remains discoverable as a link');
 assert.deepEqual(readableProjectLinks([incoming],'japanese',[{source:{family:'note',id:'sequence-note',rev:2}}]),[incoming],'a different retained edition cannot hide the original');
 assert.equal(projectCitation({...incoming,path:[{}]},'japanese'),'References Project (edition not pinned)','the read must not invent a retained citation from current read revision');
});

test('Two exact older-edition Note page pins remain separate but appear under one writing source',()=>{
 const base={from:{family:'journey',id:'japanese',rev:10,rendition:'project-r10'},to:{family:'note',id:'grammar-note',rev:1,rendition:'note-r1'},title:'Sentence-order question',direction:'incoming',quality:'saved-inbound-record-link',citedProject:{family:'journey',id:'japanese',rev:10,rendition:'project-r10'},destination:'/?view=work&family=note&id=grammar-note&rendition=note-r1'};
 const dialogue={...base,path:[{rendition:'project-r10',sectionId:'dialogue',partId:'turn-nine'}],citedDestination:'/?view=journeys&family=journey&id=japanese&rendition=project-r10&section=dialogue&part=turn-nine'};
 const grammar={...base,path:[{rendition:'project-r10',sectionId:'grammar',partId:'sequence'}],citedDestination:'/?view=journeys&family=journey&id=japanese&rendition=project-r10&section=grammar&part=sequence'};
 const links=projectLinks([dialogue,grammar,dialogue],'japanese');
 assert.equal(links.length,2,'do not collapse two citations just because the Note and Project edition match');
 assert.equal(projectLinkGroups(links).length,1,'the Note remains one source rather than two redundant cards');
 assert.deepEqual(matchingIncomingLocations(links,'note','grammar-note',1,'japanese'),[dialogue,grammar]);
 assert.equal(projectCitationLocation(dialogue,'japanese'),'Cites Project r10 · Section: dialogue · Part: turn-nine');
 assert.equal(projectCitationLocation(grammar,'japanese'),'Cites Project r10 · Section: grammar · Part: sequence');
 assert.equal(relationDescription(dialogue,'japanese'),'Note · r1 · Cites Project r10 · Section: dialogue · Part: turn-nine');
 assert.deepEqual(savedPageLocationParts({rendition:'r10',sectionId:'grammar',partId:'sequence'}),['Section: grammar','Part: sequence']);
 const writing=[{basis:'authored-writing',source:{family:'note',id:'grammar-note',rev:1},title:'Sentence-order question'}];
 assert.deepEqual(readableProjectLinks(links,'japanese',writing),[],'the Project panel renders both pins beneath its one Note entry');
 assert.deepEqual(readableProjectLinks(links,'japanese',[]),links,'both pins survive when the Note falls outside bounded writing previews');
});

test('Creative sources retain separate titles, editions and directions without converting references into achievements',()=>{
 const base={from:{family:'journey',id:'visual',rev:4},title:'Framing and attention: comparing visual alternatives',to:{family:'article',id:'framing',rev:1,rendition:'r1'},quality:'older-edition',destination:'/?view=library&family=article&id=framing&rendition=r1'};
 const older={...base,reason:'Project cites an exact earlier edition'};
 const newer={...base,to:{...base.to,rev:2,rendition:'r2'},quality:'saved-inbound-record-link',direction:'incoming',citedProject:{family:'journey',id:'visual',rev:4,rendition:'project-r4'},path:[{rendition:'project-r4'}],destination:'/?view=library&family=article&id=framing&rendition=r2'};
 assert.equal(relationTitle(older),'Framing and attention: comparing visual alternatives');
 assert.equal(relationDescription(older),'Article · r1 · older retained edition');
 assert.equal(relationDescription(newer,'visual'),'Article · r2 · Cites Project r4');
 assert.equal(projectLinkGroups(projectLinks([older,newer],'visual')).length,1);
 assert.equal(projectLinkGroups(projectLinks([older,newer],'visual'))[0].items.length,2);
 assert.equal(relationTitle({...older,title:''}),'Linked article','unknown titles remain explicitly generic');
});
