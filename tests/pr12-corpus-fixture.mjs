import {readFileSync} from 'node:fs';
import {privateStorageFixture} from './private-storage-fixture.mjs';
export const corpusFiles=['making-friends-japanese-20261112','japanese-speaking-practice-20261113'];
export const corpusRecords=()=>corpusFiles.map(id=>JSON.parse(readFileSync('tests/corpus/pr12/'+id+'.json','utf8')).record);
/** Local Miniflare only. No endpoint, credential, recovery activation or caller owner accepted. */
export async function pr12CorpusFixture(){
 const fixture=await privateStorageFixture(`import {domainHandler} from './lib/domain-handler';export default {fetch:domainHandler}`);
 const owner='TEST-ONLY-pr12-corpus';
 try{for(const record of corpusRecords()){
  await fixture.db.prepare('INSERT INTO v2_records(owner,family,id,data,rev,trashed_at,last_operation) VALUES(?,?,?,?,?,NULL,?)').bind(owner,record.family,record.id,JSON.stringify(record),record.rev,'TEST-ONLY-pr12-seed').run();
  await fixture.db.prepare('INSERT INTO v2_revisions(owner,family,id,revision,data,rendition) VALUES(?,?,?,?,?,?)').bind(owner,record.family,record.id,record.rev,JSON.stringify(record),record.rendition).run();
 }
 return {...fixture,owner,reader:fixture.client(owner)};
 }catch(error){await fixture.dispose();throw error}
}
