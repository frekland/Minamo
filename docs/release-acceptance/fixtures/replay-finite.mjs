import {spawnSync} from 'node:child_process';
import {mkdtempSync,copyFileSync,mkdirSync,rmSync,symlinkSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Local-only replay: the synthetic registration never enters the release source.
const root=fileURLToPath(new URL('../../../',import.meta.url));
const trial=mkdtempSync(join(tmpdir(),'minamo-finite-replay-'));
function run(cmd,args,options={}){
 const result=spawnSync(cmd,args,{cwd:trial,encoding:'utf8',...options});
 if(result.status!==0)throw Error(`${cmd} failed (${result.status}): ${result.stderr??''}${result.stdout??''}`);
 return result.stdout??'';
}
try{
 run('git',['clone','--local','--no-hardlinks',root,trial]);
 // Include current code corrections when run before the final release commit.
 const delta=run('git',['diff','--binary','HEAD','--','app','lib','scripts'],{cwd:root});
 if(delta)run('git',['apply','-'],{input:delta});
 run('git',['apply',resolve(root,'docs/release-acceptance/TRIAL-FINITE-FRESH-APPLICATION.patch')]);
 symlinkSync(resolve(root,'node_modules'),join(trial,'node_modules'),'dir');
 mkdirSync(join(trial,'docs/release-acceptance/fixtures'),{recursive:true});
 for(const [from,to] of [
  ['release-light-finite.test.mjs','tests/release-light-finite.test.mjs'],
  ['interface-view-trace-fresh-beacon-v1.json','docs/release-acceptance/fixtures/interface-view-trace-fresh-beacon-v1.json'],
 ])copyFileSync(resolve(root,'docs/release-acceptance/fixtures',from),join(trial,to));
 run(process.execPath,['--test','tests/release-light-finite.test.mjs'],{stdio:'inherit'});
 console.log('Disposable finite-view replay passed; release checkout was unchanged.');
}finally{
 if(existsSync(trial))rmSync(trial,{recursive:true,force:true});
}
