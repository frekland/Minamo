import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`export * from './lib/reading-capture-flight.ts';export * from './lib/reading-action-flight.ts';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
const api=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
function store(){const data=new Map();return {data,get length(){return data.size},key:i=>[...data.keys()][i]??null,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}}
const anchor={recordFamily:'article',articleId:'reading',rendition:'exact',sectionId:'s',partId:'p',start:0,end:5,quote:'words'};
const create=(id,selection=anchor)=>({operationId:'operation-'+id,action:'create',family:'annotation',id,data:{body:'Original '+id,anchor:selection}});
const draft=command=>({selection:command.data.anchor,prose:command.data.body,annotating:true,pending:command});

test('two new captures retain independently while the first save is unresolved, including a later explicit same-operation retry',async()=>{
 const saved=store(),first=create('first'),second=create('second');let release;const waiting=new Promise(resolve=>{release=resolve});
 api.retainCaptureFlight('owner:g1',first,draft(first),saved);const a=api.runReadingAction(api.captureFlightLock('owner:g1',first.id),first.operationId,()=>waiting);
 api.retainCaptureFlight('owner:g1',second,draft(second),saved);const b=await api.runReadingAction(api.captureFlightLock('owner:g1',second.id),second.operationId,async()=>({operationId:second.operationId,status:'committed',recordRef:{family:'annotation',id:second.id,rev:1}}));api.captureFlightAcknowledgement(second,b);api.removeCaptureFlight('owner:g1',second.operationId,saved);
 assert.deepEqual(api.readCaptureFlights('owner:g1',saved).map(x=>x.id),['first']);assert.equal(api.readingActionBusy(api.captureFlightLock('owner:g1',first.id)),true);
 api.settleCaptureFlight('owner:g1',first.operationId,'uncertain',saved);assert.deepEqual(api.readCaptureFlights('owner:g1',saved)[0].draft.pending,first);api.retainCaptureFlight('owner:g1',first,draft(first),saved);assert.throws(()=>api.retainCaptureFlight('owner:g1',first,{...draft(first),prose:'Changed'},saved),/original annotation/);
 release('committed');await a;api.removeCaptureFlight('owner:g1',first.operationId,saved);assert.deepEqual(api.readCaptureFlights('owner:g1',saved),[]);
});

test('old capture ACK never clears a new passage draft or another operation, even when the old save settles later',()=>{
 const saved=store(),old=create('old'),current=create('new',{...anchor,start:6,end:11,quote:'other'});saved.setItem('active',JSON.stringify(draft(current)));api.clearSubmittedCaptureDraft('active',draft(old),old.operationId,saved);assert.deepEqual(JSON.parse(saved.getItem('active')),draft(current));
 saved.setItem('active',JSON.stringify({...draft(old),prose:'Newer unsent writing',pending:null}));api.clearSubmittedCaptureDraft('active',draft(old),old.operationId,saved);assert.match(saved.getItem('active'),/Newer unsent writing/);
 saved.setItem('active',JSON.stringify(draft(old)));api.clearSubmittedCaptureDraft('active',draft(old),old.operationId,saved);assert.equal(saved.getItem('active'),null);
});

test('source-origin background capture stores only owner writing, source coordinates and operation identity, never imported quotation or command',()=>{
 const saved=store(),source={...anchor,recordFamily:'source',articleId:'source',sectionId:'__article',partId:'__excerpt',quote:'PRIVATE IMPORTED QUOTATION'},command=create('source-capture',source);
 command.data.title='PRIVATE SOURCE TITLE';api.retainCaptureFlight('owner:g1',command,draft(command),saved);const json=[...saved.data.values()].join('');assert.doesNotMatch(json,/PRIVATE|data|anchor/);
 const kept=api.readCaptureFlights('owner:g1',saved)[0];assert.equal(kept.draft.prose,'Original source-capture');assert.equal(kept.draft.selection.quote,'');assert.equal(kept.draft.pending,null);assert.deepEqual(kept.draft.recoveryOperation,{operationId:command.operationId,family:'annotation',id:command.id});
 api.settleCaptureFlight('owner:g1',command.operationId,'rejected',saved);const rejected=api.readCaptureFlights('owner:g1',saved)[0];assert.equal(rejected.draft.prose,'Original source-capture');assert.equal(rejected.draft.recoveryOperation,null);assert.equal(rejected.draft.retryTargetId,command.id);assert.doesNotMatch([...saved.data.values()].join(''),/PRIVATE/);assert.deepEqual(api.readCaptureFlights('other:g1',saved),[]);
});

test('malformed or unrelated ACKs leave recovery intact and bounded storage failures cannot masquerade as safe background retention',()=>{
 const saved=store(),command=create('one');api.retainCaptureFlight('owner:g1',command,draft(command),saved);for(const receipt of [{operationId:'other',status:'committed',recordRef:{family:'annotation',id:command.id,rev:1}},{operationId:command.operationId,status:'committed',recordRef:{family:'note',id:command.id,rev:1}},{operationId:command.operationId,status:'conflict'}])assert.throws(()=>api.captureFlightAcknowledgement(command,receipt),/not confirmed/);assert.equal(api.readCaptureFlights('owner:g1',saved).length,1);
 assert.throws(()=>api.retainCaptureFlight('owner:g1',create('two'),draft(create('two')),{...saved,setItem(){throw Error('quota')}}),/quota/);
});
