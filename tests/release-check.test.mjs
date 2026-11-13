import {test} from 'node:test';
import assert from 'node:assert/strict';
import {releasePlan} from '../scripts/release-check.mjs';
import {spawnSync} from 'node:child_process';
const options={exists:()=>true,listTests:()=>['a.test.mjs','b.test.mjs','fixture.mjs']};
test('documentation releases need no install, build or tests',()=>{
 const p=releasePlan(['docs/receipt.md','AGENTS.md'],options);
 assert.equal(p.install,false);assert.equal(p.build,false);assert.equal(p.typecheck,false);assert.deepEqual(p.tests,[]);
});
test('test-only work runs selected tests without rebuilding the application',()=>{
 const p=releasePlan(['tests/release-check.test.mjs'],options);
 assert.equal(p.build,false);assert.equal(p.typecheck,false);assert.deepEqual(p.tests,['tests/release-check.test.mjs']);
});
test('an explicit current-contract mapping does not pull in a retired namesake suite',()=>{
 const p=releasePlan(['lib/learning-work.ts'],options);
 assert.ok(p.tests.includes('tests/retired-checkpoint-authoring.test.mjs'));
 assert.ok(!p.tests.includes('tests/learning-work.test.mjs'));
});
test('compiled tests require a build even when application source is unchanged',()=>{
 assert.equal(releasePlan(['tests/beta-compiled-worker.test.mjs'],options).build,true);
});
test('a shared writer change retains recovery, Note ownership, rights and preference checks without historical scenarios',()=>{
 const p=releasePlan(['lib/domain.ts'],options);
 for(const path of ['tests/domain-recovery.test.mjs','tests/project-learning-mcp.test.mjs','tests/source-reference-permission.test.mjs','tests/collaboration-preferences.test.mjs'])assert.ok(p.tests.includes(path));
 assert.equal(p.build,true);assert.equal(p.typecheck,true);assert.ok(!p.tests.some(x=>/scenario|activity/.test(x)));
});
test('unknown runtime changes receive a smoke and a visible mapping diagnostic',()=>{
 const p=releasePlan(['app/new-widget.tsx'],{...options,exists:p=>!p.endsWith('new-widget.test.mjs')});
 assert.deepEqual(p.tests,['tests/reading-canonical-dom.test.mjs']);assert.equal(p.notes.length,1);
});
test('full historical testing requires explicit opt-in',()=>{
 const focused=releasePlan(['docs/x.md'],options),full=releasePlan(['docs/x.md'],{...options,full:true});
 assert.deepEqual(focused.tests,[]);assert.deepEqual(full.tests,['tests/a.test.mjs','tests/b.test.mjs']);assert.equal(full.build,true);assert.equal(full.typecheck,true);
});
test('large imports cannot silently turn routine checks into the entire suite',()=>{
 const changed=Array.from({length:50},(_,i)=>`tests/case-${i}.test.mjs`);
 assert.equal(releasePlan(changed,options).overBudget,true);
});
test('content markdown is runtime material while CSS avoids an unnecessary typecheck',()=>{
 assert.equal(releasePlan(['app/lesson.md'],options).build,true);
 assert.equal(releasePlan(['app/layout.css'],options).typecheck,false);
});
test('an unmapped path remains visible even alongside a mapped change',()=>{
 const p=releasePlan(['lib/domain.ts','app/new-widget.tsx'],{...options,exists:p=>!p.endsWith('new-widget.test.mjs')});
 assert.ok(p.tests.includes('tests/reading-canonical-dom.test.mjs'));assert.equal(p.notes.length,1);
});
test('the CLI rejects a missing baseline instead of checking only the last commit',()=>{
 const env={...process.env};delete env.CI_BASE_SHA;
 const result=spawnSync(process.execPath,['scripts/release-check.mjs','--plan'],{encoding:'utf8',env});
 assert.equal(result.status,1);assert.match(result.stderr,/Supply --base/);
});
