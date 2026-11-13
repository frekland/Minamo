import {execFileSync,spawnSync} from 'node:child_process';
import {appendFileSync,existsSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {selectFocusedTests} from './ci-focused-tests.mjs';

const tooling=p=>p==='AGENTS.md'||p.startsWith('docs/')||(!p.includes('/')&&p.endsWith('.md'))||p.startsWith('tests/')||p.startsWith('.github/')||['scripts/release-check.mjs','scripts/ci-focused-tests.mjs','scripts/verify-sites-source-snapshot.mjs','scripts/verify-sites-v175-source-reconciliation.mjs'].includes(p);
export function releasePlan(changed,{full=false,exists=existsSync,listTests=()=>readdirSync('tests')}={}){
 const runtime=changed.filter(p=>!tooling(p));
 let tests=full?listTests().filter(p=>p.endsWith('.test.mjs')).map(p=>'tests/'+p).sort():selectFocusedTests(changed,exists,listTests);
 const notes=[];
 const unmapped=full?[]:runtime.filter(p=>selectFocusedTests([p],exists,listTests).length===0);
 if(unmapped.length){
  const smoke=unmapped.every(p=>/^(app|public)\//.test(p))?'tests/reading-canonical-dom.test.mjs':'tests/domain-http.test.mjs';
  if(!exists(smoke))throw Error('Missing required release smoke: '+smoke);
  tests=[...new Set([...tests,smoke])].sort();notes.push('Review smoke coverage: no specific test mapping for '+unmapped.join(', '));
 }
 const compiled=tests.some(p=>/compiled|built-worker|product-worker|worker-domain-routes|foundry-packaging|interface-lab-production/.test(p));
 const build=full||runtime.length>0||compiled,typecheck=full||runtime.some(p=>/\.(?:ts|tsx|js|jsx|mjs|json|ya?ml|sql)$/.test(p));
 const overBudget=!full&&tests.length>40;
 return {mode:full?'explicit-full-audit':'focused',changed,runtime,typecheck,build,tests,notes,overBudget,install:build||typecheck||tests.length>0};
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 try{
  const args=process.argv.slice(2),at=args.indexOf('--base'),base=at>=0?args[at+1]:process.env.CI_BASE_SHA;
  if(!base||base.startsWith('--'))throw Error('Supply --base <exact comparison ref> or CI_BASE_SHA; HEAD^ is not a reliable PR baseline.');
  const ref=/^0+$/.test(base)?execFileSync('git',['hash-object','-w','-t','tree','--stdin'],{input:'',encoding:'utf8'}).trim():execFileSync('git',['rev-parse','--verify',base+'^{commit}'],{encoding:'utf8'}).trim();
  const changed=execFileSync('git',['diff','--no-renames','--name-only','--diff-filter=ACDMRT',ref,'HEAD'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
  const plan=releasePlan(changed,{full:args.includes('--full')||process.env.RELEASE_FULL_AUDIT==='true'});
  console.log(JSON.stringify({base:ref,head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),...plan},null,2));
  if(plan.overBudget)throw Error('More than 40 suites selected. Review the comparison baseline/mappings and use bounded affected checks; --full is an explicit audit opt-in, never an automatic fallback.');
  if(process.env.GITHUB_OUTPUT)appendFileSync(process.env.GITHUB_OUTPUT,`install=${plan.install}\n`);
  if(args.includes('--plan'))process.exit(0);
  if(spawnSync('git',['diff','--quiet','HEAD'],{stdio:'inherit'}).status!==0)throw Error('Commit tracked changes first so checks identify the exact release source.');
  const run=(cmd,argv)=>{const r=spawnSync(cmd,argv,{stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status??1);};
  if(plan.typecheck)run('pnpm',['run','typecheck']);
  if(plan.build)run('pnpm',['run','build']);
  if(plan.tests.length)run(process.execPath,['--test','--test-force-exit','--test-concurrency=2','--test-timeout=120000',...plan.tests]);
  console.log('Release checks passed. Record source and Sites deployment; live acceptance is separate.');
 }catch(error){console.error(error.message);process.exit(1);}
}
