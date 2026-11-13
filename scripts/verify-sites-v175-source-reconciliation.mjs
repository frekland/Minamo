import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

const manifest=JSON.parse(readFileSync('docs/SITES-V175-PRODUCTION-SOURCE-MANIFEST.json','utf8'));
const baseline=manifest.githubBaselineCommit;
const treeRows=execFileSync('git',['ls-tree','-r','--format=%(objectmode) %(path)',baseline],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
const baselineFiles=new Map(treeRows.map(row=>{const split=row.indexOf(' ');return [row.slice(split+1),row.slice(0,split)];}));
const expected=new Set();
const failures=[];
let exact=0,documentation=0,excluded=0;

for(const file of manifest.files){
  if(expected.has(file.path))failures.push(`Duplicate manifest path: ${file.path}`);
  expected.add(file.path);
  const baselineMode=baselineFiles.get(file.path);
  if(file.disposition==='native-only-documentation-evidence'){
    excluded++;
    if(baselineMode)failures.push(`Native-only evidence unexpectedly exists in GitHub baseline: ${file.path}`);
    if(!file.path.startsWith('docs/'))failures.push(`Non-documentation source was excluded: ${file.path}`);
    continue;
  }
  if(!baselineMode){failures.push(`Missing native path from GitHub baseline: ${file.path}`);continue;}
  const baselineBytes=execFileSync('git',['show',`${baseline}:${file.path}`],{maxBuffer:64*1024*1024});
  const baselineHash=createHash('sha256').update(baselineBytes).digest('hex');
  const expectedBaselineHash=file.baselineSha256??file.nativeSha256;
  const expectedBaselineMode=file.baselineGitMode??file.gitMode;
  if(baselineMode!==expectedBaselineMode)failures.push(`Baseline mode mismatch: ${file.path}`);
  if(baselineHash!==expectedBaselineHash)failures.push(`Baseline hash mismatch: ${file.path}`);
  if(file.disposition==='exact-native-source'){
    exact++;
    if(expectedBaselineHash!==file.nativeSha256||expectedBaselineMode!==file.gitMode)failures.push(`Declared exact source differs: ${file.path}`);
  }else if(file.disposition==='post-deployment-github-documentation'){
    documentation++;
    if(expectedBaselineHash===file.nativeSha256)failures.push(`Documentation override is not a difference: ${file.path}`);
    if(!file.path.startsWith('docs/'))failures.push(`Non-documentation override: ${file.path}`);
  }else failures.push(`Unknown disposition: ${file.path}`);
}

for(const path of manifest.githubOnlyFiles){
  if(expected.has(path))failures.push(`GitHub-only path is also in native manifest: ${path}`);
  expected.add(path);
  if(!baselineFiles.has(path))failures.push(`Declared GitHub-only file is missing: ${path}`);
}
for(const path of baselineFiles.keys())if(!expected.has(path))failures.push(`Undeclared GitHub baseline path: ${path}`);
for(const path of expected)if(!baselineFiles.has(path)&&!manifest.files.some(file=>file.path===path&&file.disposition==='native-only-documentation-evidence'))failures.push(`Unexpected path outside baseline: ${path}`);

const result={siteVersion:manifest.siteVersion,nativeRevision:manifest.nativeRevision,nativeTree:manifest.nativeTree,githubBaseline:baseline,nativeFiles:manifest.nativeFileCount,exactSharedFiles:exact,postDeploymentDocumentation:documentation,nativeOnlyDocumentationEvidence:excluded,githubOnlyFiles:manifest.githubOnlyFiles.length,failures};
console.log(JSON.stringify(result,null,2));
if(failures.length)process.exitCode=1;
