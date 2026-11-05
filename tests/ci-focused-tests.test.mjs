import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectFocusedTests} from '../scripts/ci-focused-tests.mjs';

const present=()=>true;
test('draft checks pick changed test files and Mood-to-Music source changes',()=>{
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
test('routine Library and language edits select the relevant modern tests',()=>{
  const known=path=>['tests/ux-library-search.test.mjs','tests/pr85-speech.test.mjs','tests/pr85-language.test.mjs'].includes(path);
  assert.deepEqual(selectFocusedTests(['app/library-browser.tsx'],known),['tests/ux-library-search.test.mjs']);
  assert.deepEqual(selectFocusedTests(['lib/language-speech.ts','app/project-speech.tsx'],known),['tests/pr85-speech.test.mjs']);
  assert.deepEqual(selectFocusedTests(['lib/language-tags.ts','app/project-language.tsx'],known),['tests/pr85-language.test.mjs','tests/pr85-speech.test.mjs']);
});
test('scenario controller and its D1 migration select the synthetic MCP tests',()=>{
  assert.deepEqual(selectFocusedTests(['lib/scenario-control.ts','drizzle/0013_wide_robbie_robertson.sql']),[
    'tests/scenario-controller.test.mjs','tests/test-observation-adversarial.test.mjs',
    'tests/test-observation.test.mjs','tests/test-transcript.test.mjs'
  ]);
  assert.deepEqual(selectFocusedTests(['drizzle/0014_test_transcript.sql'],present),[
    'tests/test-transcript.test.mjs'
  ]);
  assert.deepEqual(selectFocusedTests(['drizzle/0015_bumpy_sharon_ventura.sql'],present),[
    'tests/test-observation-adversarial.test.mjs','tests/test-observation.test.mjs'
  ]);
  assert.deepEqual(selectFocusedTests(['tests/project-scenarios/mood-to-music/seed.mjs'],present),[
    'tests/mood-to-music-docs-variant.test.mjs','tests/mood-to-music-privacy-variant.test.mjs','tests/mood-to-music-scenario.test.mjs',
    'tests/mood-to-music-weekend-variant.test.mjs','tests/scenario-controller.test.mjs'
  ]);
});
test('new Project subject fixtures select only their own scenario and persona tests',()=>{
  const available=()=>[
    'mood-to-music-scenario.test.mjs','retired-htb-cap-scenario.test.mjs',
    'retired-htb-cap-command-log-variant.test.mjs','retired-htb-cap-packet-variant.test.mjs',
    'automatic-plant-screamer-scenario.test.mjs'
  ];
  assert.deepEqual(selectFocusedTests(['tests/project-scenarios/retired-htb-cap/seed.mjs'],present,available),[
    'tests/retired-htb-cap-command-log-variant.test.mjs',
    'tests/retired-htb-cap-packet-variant.test.mjs',
    'tests/retired-htb-cap-scenario.test.mjs'
  ]);
  assert.deepEqual(selectFocusedTests(['tests/project-scenarios/automatic-plant-screamer/manifest.json'],present,available),[
    'tests/automatic-plant-screamer-scenario.test.mjs'
  ]);
  assert.throws(()=>selectFocusedTests(['tests/project-scenarios/unprepared-subject/seed.mjs'],present,available),
    /Missing required subject replay tests/);
});
