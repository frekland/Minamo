import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {existsSync} from 'node:fs';
import {dirname,join} from 'node:path';
const require=createRequire(import.meta.url),args=process.argv.slice(2),at=args.indexOf('--url'),raw=at>=0?args[at+1]:process.env.MINAMO_INTERFACE_URL;
if(!raw){console.error('Provide the exact running sites-preview URL: node scripts/interface-browser.mjs --url http://terminal.local:4173/ [--capture] [--update-snapshots --approve-baselines]. Start the supported preview first.');process.exit(2);}
let url;try{url=new URL(raw);}catch{console.error('Invalid preview URL.');process.exit(2);}
if(!['http:','https:'].includes(url.protocol)||!['terminal.local','localhost','127.0.0.1','[::1]'].includes(url.hostname)||url.username||url.password){console.error('Only an explicit local preview origin is accepted. This suite never targets production or a genuine learner owner.');process.exit(2);}
const update=args.includes('--update-snapshots');if(update&&!args.includes('--approve-baselines')){console.error('Review captured screenshots first. Re-run with --approve-baselines to intentionally replace approved local baselines.');process.exit(2);}
// Pinned 1.58.2 registry resolves the same default headless binary as the test runner.
// Read availability only: never launch or download a browser during this preflight.
if(!args.includes('--list')&&!args.includes('--help')){
 const fromTest=createRequire(require.resolve('@playwright/test/package.json')),core=fromTest.resolve('playwright-core/package.json');
 const {registry}=fromTest(join(dirname(core),'lib/server/registry/index.js')),browser=registry.findExecutable('chromium-headless-shell'),binary=browser?.executablePath();
 if(!binary||!existsSync(binary)){console.error('Browser suite NOT RUN: the pinned Chromium headless shell is unavailable. No application assertion or screenshot comparison executed. Use a supported local Playwright environment with its pinned Chromium installed; this runner does not install or substitute a browser.');process.exit(2);}
}
const command=require.resolve('@playwright/test/cli'),forward=args.filter((value,index)=>(at<0||index!==at&&index!==at+1)&&!['--capture','--approve-baselines'].includes(value));
const result=spawnSync(process.execPath,[command,'test','--config',new URL('./interface-browser.config.mjs',import.meta.url).pathname,...forward],{stdio:'inherit',env:{...process.env,MINAMO_INTERFACE_URL:url.origin,MINAMO_INTERFACE_CAPTURE:args.includes('--capture')?'1':'0'}});process.exit(result.status??1);
