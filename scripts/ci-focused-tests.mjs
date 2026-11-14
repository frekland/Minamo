/**
 * Routine PR/release feedback: changed tests plus affected current contracts.
 * Historical full audits are a separate explicit owner opt-in.
 */
import {execFileSync,spawnSync} from 'node:child_process';
import {existsSync,readdirSync} from 'node:fs';
import {basename} from 'node:path';
import {fileURLToPath} from 'node:url';

const mapped={
  'lib/accumulation-contract.ts':['tests/pr12-accumulation.test.mjs','tests/pr12-presentation.test.mjs'],
  'lib/composed-presentation.ts':['tests/pr12-presentation.test.mjs'],
  'lib/presentation-inspection.ts':['tests/pr12-presentation.test.mjs'],
  'app/presentation-inspection.tsx':['tests/pr12-presentation.test.mjs'],
  'app/composed-workspaces.tsx':['tests/pr12-presentation.test.mjs'],
  'app/composed-workspaces.css':['tests/pr12-presentation.test.mjs'],
  'lib/accumulation-index.ts':['tests/pr12-accumulation.test.mjs'],
  'lib/accumulation-service.ts':['tests/pr12-accumulation.test.mjs'],
  'app/accumulation-studio.tsx':['tests/pr12-accumulation.test.mjs','tests/pr27-workspace-presentation.test.mjs'],
  'app/composition-reading.tsx':['tests/pr12-accumulation.test.mjs'],

  'lib/experience-client.ts':['tests/pr12-experience-client.test.mjs'],
  'lib/experience-discovery.ts':['tests/pr12-experiences.test.mjs'],
  'app/experimental-experience.tsx':['tests/pr12-experiences.test.mjs','tests/pr27-workspace-presentation.test.mjs'],
  'app/experimental-experience.css':['tests/pr12-experiences.test.mjs'],

  'lib/domain.ts':['tests/domain-http.test.mjs','tests/domain-recovery.test.mjs','tests/project-learning-mcp.test.mjs','tests/collaboration-preferences.test.mjs','tests/source-reference-permission.test.mjs'],
  'lib/domain-handler.ts':['tests/domain-http.test.mjs','tests/domain-recovery.test.mjs','tests/project-learning-mcp.test.mjs','tests/collaboration-preferences.test.mjs'],
  'lib/project-service.ts':['tests/project-structure-edit.test.mjs','tests/project-learning-mcp.test.mjs','tests/project-reading-topics.test.mjs','tests/collaboration-preferences.test.mjs'],
  'lib/project-composition.ts':['tests/project-structure-edit.test.mjs','tests/project-learning-map.test.mjs','tests/project-learning-mcp.test.mjs','tests/project-reading-topics.test.mjs'],
  'lib/project-learning-map.ts':['tests/project-learning-map.test.mjs','tests/project-learning-mcp.test.mjs'],
  'lib/project-reading-topics.ts':['tests/project-reading-topics.test.mjs','tests/project-learning-map.test.mjs'],
  'lib/beta-access.ts':['tests/beta-compiled-worker.test.mjs','tests/beta-site-tools.test.mjs'],
  'tests/private-storage-fixture.mjs':['tests/private-storage-fixture-cleanup.test.mjs','tests/domain-recovery.test.mjs'],
  'lib/scenario-control.ts':['tests/scenario-controller.test.mjs'],
  'lib/test-transcript.ts':['tests/test-transcript.test.mjs'],
  'lib/test-observation.ts':['tests/test-observation.test.mjs','tests/test-observation-adversarial.test.mjs'],
  'lib/project-context.ts':['tests/project-context.test.mjs','tests/unified-projects-acceptance.test.mjs'],
  'lib/learning-work.ts':['tests/retired-checkpoint-authoring.test.mjs','tests/project-learning-mcp.test.mjs'],
  'lib/editorial-policy.ts':['tests/retired-checkpoint-authoring.test.mjs','tests/project-learning-mcp.test.mjs']
};

export function selectFocusedTests(changed,exists=existsSync,listTests=()=>readdirSync('tests')){
  const selected=new Set();
  const add=path=>{if(exists(path))selected.add(path);};
  let rootTests;
  for(const path of changed){
    if(/^tests\/[^/]+\.test\.mjs$/.test(path))add(path);
    if(path.startsWith('examples/mood-to-music/')){
      add('tests/mood-to-music-scenario.test.mjs');
      add('examples/mood-to-music/tests/revisions.test.mjs');
    }
    const scenario=path.match(/^tests\/project-scenarios\/([^/]+)\//)?.[1];
    if(scenario){
      // A subject's replay/seed change exercises all its personas, even when
      // the PR changes only an existing fixture file and no root test file.
      rootTests??=listTests();
      const subjectTests=rootTests.filter(file=>file.startsWith(scenario+'-')&&file.endsWith('.test.mjs')&&exists('tests/'+file));
      if(subjectTests.length===0)throw Error('Missing required subject replay tests for '+scenario);
      for(const file of subjectTests)add('tests/'+file);
      if(scenario==='mood-to-music')add('tests/scenario-controller.test.mjs');
    }
    if(path==='db/schema.ts'||path.startsWith('drizzle/0013_')){
      add('tests/scenario-controller.test.mjs');add('tests/test-transcript.test.mjs');add('tests/test-observation.test.mjs');add('tests/test-observation-adversarial.test.mjs');
    }
    if(path.startsWith('drizzle/0014_'))add('tests/test-transcript.test.mjs');
    if(path.startsWith('drizzle/0015_')){
      add('tests/test-observation.test.mjs');add('tests/test-observation-adversarial.test.mjs');
    }
    if(path==='scripts/ci-focused-tests.mjs')add('tests/ci-focused-tests.test.mjs');
    if(path==='scripts/release-check.mjs'||path==='.github/workflows/check.yml'){
      add('tests/release-check.test.mjs');add('tests/ci-focused-tests.test.mjs');
    }
    if(path.startsWith('lib/source-')){
      add('tests/source-reference-permission.test.mjs');add('tests/source-permission-integration.test.mjs');
    }
    if(path==='db/schema.ts'||path.startsWith('drizzle/')){
      add('tests/domain-recovery.test.mjs');add('tests/source-reference-permission.test.mjs');
    }
    if(path.startsWith('app/')&&/project|journey/i.test(path)){
      add('tests/project-ui.test.mjs');
      add('tests/project-reading-topics.test.mjs');
    }
    if(path.startsWith('app/')&&/header-learning-space|japanese|furigana/.test(path)){
      add('tests/compact-header-icons.test.mjs');add('tests/reading-canonical-dom.test.mjs');
    }
    for(const name of mapped[path]??[])add(name);
    if(!mapped[path]&&/^(app|lib)\//.test(path)&&/\.(?:ts|tsx|js|jsx|mjs)$/.test(path)){
      const stem=basename(path).replace(/\.(?:ts|tsx|js|jsx|mjs)$/,'');
      add('tests/'+stem+'.test.mjs');
    }
  }
  return [...selected].sort();
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  const base=process.env.CI_BASE_SHA;
  if(!base){console.error('Supply CI_BASE_SHA, or use scripts/release-check.mjs --base <comparison commit>.');process.exit(1);}
  const diffArgs=['diff','--no-renames','--name-only',base,'HEAD'];
  let changed;
  try{
    changed=execFileSync('git',diffArgs,{encoding:'utf8'}).trim().split('\n').filter(Boolean);
  }catch(error){
    console.error('Unable to determine changed paths; supply an exact CI_BASE_SHA.',error.message);
    process.exit(1);
  }
  const selected=selectFocusedTests(changed);
  console.log('Changed files:',changed.length,'; selected focused tests:',selected.length);
  if(selected.length===0){
    console.log('No directly mapped tests. Use scripts/release-check.mjs for build/typecheck planning.');
  }else{
    console.log(selected.join('\n'));
    // Disposable Miniflare/Workerd fixtures can retain idle process handles
    // after all tests and awaited disposals finish. Preserve real test exit
    // status while avoiding an artificial CI timeout on focused checks.
    const result=spawnSync(process.execPath,['--test','--test-force-exit','--test-concurrency=2',...selected],{stdio:'inherit'});
    if(result.error){console.error(result.error);process.exit(1);}
    process.exit(result.status??1);
  }
}
