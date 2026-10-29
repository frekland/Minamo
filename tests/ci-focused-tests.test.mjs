import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectFocusedTests} from '../scripts/ci-focused-tests.mjs';

const present=()=>true;
test('draft checks pick changed test files and new Mood-to-Music fixtures',()=>{
  assert.deepEqual(selectFocusedTests([
    'docs/DEVELOPMENT-TRACKS.md',
    'tests/mood-to-music-scenario.test.mjs',
    'examples/mood-to-music/src/versions/v5.jsx'
  ],present),['examples/mood-to-music/tests/revisions.test.mjs','tests/mood-to-music-scenario.test.mjs']);
});
test('known shared modules select bounded related tests without an entire suite',()=>{
  assert.deepEqual(selectFocusedTests(['lib/project-context.ts'],present),[
    'tests/project-context.test.mjs','tests/unified-projects-acceptance.test.mjs'
  ]);
});
test('documentation-only changes select no tests; deleted files are excluded',()=>{
  assert.deepEqual(selectFocusedTests(['README.md'],present),[]);
  assert.deepEqual(selectFocusedTests(['tests/old.test.mjs'],()=>false),[]);
});
test('changing the selector tests its own behaviour',()=>{
  assert.deepEqual(selectFocusedTests(['scripts/ci-focused-tests.mjs'],present),['tests/ci-focused-tests.test.mjs']);
});
