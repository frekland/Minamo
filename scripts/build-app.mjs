import {spawnSync} from 'node:child_process';
for(const script of ['scripts/prepare-tool-assets.mjs','scripts/run-framework.mjs','scripts/foundry-package-policy.mjs']){
 const result=spawnSync(process.execPath,[script,...(script.endsWith('run-framework.mjs')?['build']:[])],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status??1);
}
