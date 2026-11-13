import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

test('a failed synthetic storage fixture startup releases its runtime and lets the process exit',async()=>{
 const program=`
  import assert from 'node:assert/strict';
  import {privateStorageFixture} from './tests/private-storage-fixture.mjs';
  await assert.rejects(()=>privateStorageFixture("throw new Error('SYNTHETIC startup rejection');export default {fetch(){return new Response('unused')}}"));
  console.log('fixture failure released');
 `;
 const result=await promisify(execFile)(process.execPath,['--input-type=module','-e',program],{cwd:process.cwd(),timeout:45000,maxBuffer:1024*1024});
 assert.match(result.stdout,/fixture failure released/);
});
