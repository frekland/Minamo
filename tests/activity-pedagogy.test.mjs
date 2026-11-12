import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {exchangeSdk} from '../scripts/activity-exchange-proof.mjs';
const sdk=await exchangeSdk();
async function materialize(project){const dir=await mkdtemp(join(tmpdir(),'minamo-pedagogy-'));for(const file of project.files)await writeFile(join(dir,file.path),file.text);return dir;}
function run(cwd,command,args){const env={...process.env,PYTHONDONTWRITEBYTECODE:'1'};delete env.NODE_TEST_CONTEXT;return spawnSync(command,args,{cwd,env,encoding:'utf8',timeout:10000});}
test('Bash visible oracle kills newline-truncating near-repair and accepts literal record-preserving repair',async()=>{
 const {project}=await sdk.generateChallenge('bash-space-log'),dir=await materialize(project);
 try{
  await writeFile(join(dir,'main.sh'),'#!/usr/bin/env bash\nwhile IFS= read -r line; do printf "%s\\n" "$line"; done\n');
  const mutant=run(dir,'bash',['test.sh']);assert.equal(mutant.status,1,mutant.stderr);assert.match(mutant.stderr,/FAIL: literal-final-record/);
  await writeFile(join(dir,'main.sh'),'#!/usr/bin/env bash\nwhile IFS= read -r line || [[ -n "$line" ]]; do printf "%s\\n" "$line"; done\n');
  const repaired=run(dir,'bash',['test.sh']);assert.equal(repaired.status,0,repaired.stderr);assert.match(repaired.stdout,/literal log records, empty lines and final record/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('Seeded music oracle kills an empty-result mutant that passes original base cases',async()=>{
 const {project}=await sdk.generateChallengeVariant('beat-clock',7),dir=await materialize(project);
 try{
  const correct='def solve(bpm,count):\n    if bpm<=0 or count<0: raise ValueError("invalid pattern")\n    return [i*(60/bpm) for i in range(count)]\n';
  await writeFile(join(dir,'main.py'),'def solve(bpm,count):\n    if bpm==240: return []\n    if bpm<=0 or count<0: raise ValueError("invalid pattern")\n    return [i*(60/bpm) for i in range(count)]\n');
  const mutant=run(dir,'python3',['-B','-m','unittest','-v']);assert.equal(mutant.status,1,mutant.stderr);assert.match(mutant.stderr,/test_seed_7.*FAIL/s);assert.match(mutant.stderr,/AssertionError: 0 != 3/);assert.match(mutant.stderr,/test_120.*ok/);assert.match(mutant.stderr,/test_60.*ok/);
  await writeFile(join(dir,'main.py'),correct);const repaired=run(dir,'python3',['-B','-m','unittest','-v']);assert.equal(repaired.status,0,repaired.stderr);
 }finally{await rm(dir,{recursive:true,force:true});}
});
