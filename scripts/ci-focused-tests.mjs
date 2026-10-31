/**
 * Draft-PR feedback only: run directly changed test files and a few explicit
 * source-to-test mappings. Not an impact-analysis proof or a replacement for
 * the full regression gate when the PR is ready for review.
 */
import {execFileSync,spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {basename} from 'node:path';
import {fileURLToPath} from 'node:url';

const mapped={
  'lib/domain.ts':['tests/domain-http.test.mjs','tests/domain-rich-integration.test.mjs'],
  'lib/domain-handler.ts':['tests/domain-http.test.mjs','tests/mcp-learning-quality.test.mjs','tests/scenario-controller.test.mjs','tests/test-transcript.test.mjs','tests/test-observation.test.mjs','tests/test-observation-adversarial.test.mjs'],
  'lib/scenario-control.ts':['tests/scenario-controller.test.mjs'],
  'lib/test-transcript.ts':['tests/test-transcript.test.mjs'],
  'lib/test-observation.ts':['tests/test-observation.test.mjs','tests/test-observation-adversarial.test.mjs'],
  'lib/project-context.ts':['tests/project-context.test.mjs','tests/unified-projects-acceptance.test.mjs'],
  'lib/learning-work.ts':['tests/learning-work.test.mjs','tests/journey-resume.test.mjs']
};

export function selectFocusedTests(changed,exists=existsSync){
  const selected=new Set();
  const add=path=>{if(exists(path))selected.add(path);};
  for(const path of changed){
    if(/^tests\/[^/]+\.test\.mjs$/.test(path))add(path);
    if(path.startsWith('examples/mood-to-music/')){
      add('tests/mood-to-music-scenario.test.mjs');
      add('examples/mood-to-music/tests/revisions.test.mjs');
    }
    if(path.startsWith('tests/project-scenarios/mood-to-music/')){
      add('tests/mood-to-music-scenario.test.mjs');
      add('tests/scenario-controller.test.mjs');
    }
    if(path==='db/schema.ts'||path.startsWith('drizzle/0013_')){
      add('tests/scenario-controller.test.mjs');add('tests/test-transcript.test.mjs');add('tests/test-observation.test.mjs');add('tests/test-observation-adversarial.test.mjs');
    }
    if(path.startsWith('drizzle/0014_'))add('tests/test-transcript.test.mjs');
    if(path.startsWith('drizzle/0015_')){
      add('tests/test-observation.test.mjs');add('tests/test-observation-adversarial.test.mjs');
    }
    if(path==='scripts/ci-focused-tests.mjs')add('tests/ci-focused-tests.test.mjs');
    if(path.startsWith('app/')&&/project|journey/i.test(path)){
      add('tests/project-ui.test.mjs');
      add('tests/projects-home-continuation.test.mjs');
    }
    for(const name of mapped[path]??[])add(name);
    if(/^(app|lib)\//.test(path)&&/\.(?:ts|tsx|js|jsx|mjs)$/.test(path)){
      const stem=basename(path).replace(/\.(?:ts|tsx|js|jsx|mjs)$/,'');
      add('tests/'+stem+'.test.mjs');
    }
  }
  return [...selected].sort();
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  const base=process.env.CI_BASE_SHA;
  const diffArgs=base?['diff','--name-only',base,'HEAD']:['diff','--name-only','HEAD^','HEAD'];
  let changed;
  try{
    changed=execFileSync('git',diffArgs,{encoding:'utf8'}).trim().split('\n').filter(Boolean);
  }catch(error){
    console.error('Unable to determine changed paths for focused checks; full review checks remain required.',error.message);
    process.exit(1);
  }
  const selected=selectFocusedTests(changed);
  console.log('Draft PR changed files:',changed.length,'; selected focused tests:',selected.length);
  if(selected.length===0){
    console.log('No directly mapped tests; typecheck still runs. Full suite is required when the PR leaves draft.');
  }else{
    console.log(selected.join('\n'));
    // Disposable Miniflare/Workerd fixtures can retain idle process handles
    // after all tests and awaited disposals finish. Preserve real test exit
    // status while avoiding an artificial CI timeout on draft feedback.
    const result=spawnSync(process.execPath,['--test','--test-force-exit','--test-concurrency=2',...selected],{stdio:'inherit'});
    if(result.error){console.error(result.error);process.exit(1);}
    process.exit(result.status??1);
  }
}
