import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const manifest=JSON.parse(readFileSync('docs/SITES-V174-SOURCE-MANIFEST.json','utf8'));
const tracked=new Map(execFileSync('git',['ls-files','--stage','-z'],{encoding:'utf8'}).split('\0').filter(Boolean).map(row=>{const [meta,path]=row.split('\t');return [path,meta.split(' ')[0]];}));
const exceptions=new Set([...manifest.githubOnlyDocumentation,...manifest.reconciliationFiles]);
const failures=[];let exact=0,excluded=0,overridden=0;
for(const file of manifest.files){
 if(file.mode==='excluded-generated-evidence'){excluded++;if(tracked.has(file.path))failures.push('Excluded artefact is tracked: '+file.path);continue;}
 exceptions.add(file.path);
 if(file.mode==='preserved-github-release-documentation'){overridden++;continue;}
 if(!tracked.has(file.path)){failures.push('Missing native source: '+file.path);continue;}
 const hash=createHash('sha256').update(readFileSync(file.path)).digest('hex');
 if(hash!==file.sha256)failures.push('Content mismatch: '+file.path);
 if(tracked.get(file.path)!==file.gitMode)failures.push('Mode mismatch: '+file.path);
 exact++;
}
for(const path of tracked.keys())if(!exceptions.has(path))failures.push('Undeclared GitHub-only file: '+path);
for(const path of manifest.undeployedBranchFilesRemovedFromSnapshotButRetainedInHistory)if(tracked.has(path))failures.push('Undeployed branch implementation remains: '+path);
console.log(JSON.stringify({nativeRevision:manifest.nativeRevision,nativeFileCount:manifest.nativeFileCount,exact,excluded,documentationOverrides:overridden,failures},null,2));
if(failures.length)process.exitCode=1;
