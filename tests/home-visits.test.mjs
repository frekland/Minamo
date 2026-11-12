import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHomeVisits,rememberHomeVisit,readHomeVisits,sortHomeRecords,mergeHomeBrowseRecords} from '../lib/home-visits.ts';
test('Home visit history retains only scoped IDs and uses actual opens instead of updated dates',()=>{
 const map=new Map();const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 rememberHomeVisit(storage,'owner-A','journey','japanese',new Date('2026-11-01'));
 rememberHomeVisit(storage,'owner-A','journey','computing',new Date('2026-11-02'));
 rememberHomeVisit(storage,'owner-A','journey','japanese',new Date('2026-11-03'));
 assert.equal(readHomeVisits(storage,'owner-A').length,2);
 assert.equal(readHomeVisits(storage,'owner-A')[0].id,'japanese');
 assert.equal(readHomeVisits(storage,'owner-B').length,0);
 const cards=[{family:'journey',id:'computing',title:'Computing',updatedAt:'2026-11-08'},{family:'journey',id:'japanese',title:'Japanese',updatedAt:'2026-11-01'}];
 assert.equal(sortHomeRecords(cards,readHomeVisits(storage,'owner-A'))[0].id,'japanese');
});
test('Home visits reject unknown families and malformed IDs',()=>{
 const items=parseHomeVisits([{family:'note',id:'personal',at:'2026-11-09'},{family:'journey',id:'x',at:'2026-11-09'},{family:'journey',id:'x',at:'2026-11-08'},{family:'article',id:'bad path',at:'2026-11-09'}]);
 assert.equal(items.length,1);
 assert.equal(items[0].id,'x');
});
test('Home includes a server-verified older visit beyond the first page, but no obsolete or trashed copy',()=>{
 const page=[{family:'journey',id:'page',rev:4,title:'First-page project',updatedAt:'2026-11-11'}];
 const verified=[{family:'journey',id:'older',rev:9,title:'Older Project',updatedAt:'2026-08-01'},{family:'journey',id:'page',rev:3,title:'Old page',updatedAt:'2026-11-01'},{family:'journey',id:'trash',rev:2,title:'Deleted',trashedAt:'2026-11-10',updatedAt:'2026-11-10'}];
 const merged=mergeHomeBrowseRecords(page,verified);
 assert.deepEqual(merged.map(record=>record.id),['page','older']);
 assert.equal(merged[0].rev,4);
 assert.equal(sortHomeRecords(merged,[{family:'journey',id:'older',at:'2026-11-11'}])[0].id,'older');
});
