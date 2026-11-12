import {test,expect} from '@playwright/test';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:'export{practicalFoundryActivities}from"./lib/activity/practical-foundry-examples.ts";',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false});
const dir=mkdtempSync(join(tmpdir(),'pr49-browser-fixtures-')),file=join(dir,'sdk.cjs');writeFileSync(file,built.outputFiles[0].text);const {practicalFoundryActivities}=require(file);rmSync(dir,{recursive:true,force:true});
const examples=await practicalFoundryActivities(),origin=process.env.MINAMO_INTERFACE_URL;
if(!origin)throw Error('Use the exact supported sites-preview URL through scripts/interface-browser.mjs.');
const names={'source.diff-v1':'Supplied unified diff','algorithm.graph-v1':'Graph algorithm steps','game.maze-v1':'Finite route planner','game.sudoku-v1':'Sudoku constraint steps','math.contrast-v1':'Colour contrast laboratory','source.bytes-v1':'Exact UTF-8 source byte inspector','trace.signal-ledger-v1':'Supplied signal ledger','systems.life-v1':'Finite cellular-automaton steps'};
for(const [index,example] of examples.entries())for(const width of [390,1280])test(`PR49 practical ${index} ${width}px exact Activity view`,async({page},testInfo)=>{
 const id=example.id+'-'+width+'-'+Date.now(),purpose='TEST ONLY original PR49 browser fixture; no learner achievement.',endpoint=origin+'/preview-interface/api?path='+encodeURIComponent('/mcp');let current;
 const rpc=async(name,input)=>{const response=await page.request.post(endpoint,{data:{jsonrpc:'2.0',id:name,method:'tools/call',params:{name,arguments:{purpose,...input}}}});expect(response.ok()).toBeTruthy();const envelope=await response.json();expect(envelope.result?.isError,JSON.stringify(envelope)).not.toBe(true);return JSON.parse(envelope.result.content.find(block=>block.type==='text').text);};
 try{
  const result=await rpc('publish_minamo_activity_package',{operationId:id+'-create',id,title:example.title,synthetic:true,learningScope:{version:1,spaces:['computing'],provenance:'authored'},activity:example.activity});expect(result.receipt.status).toBe('committed');current=result.record;
  const exact=await rpc('read_minamo_activity',{id,rendition:current.rendition});expect(exact.record.activity).toEqual(example.activity);
  await page.setViewportSize({width,height:844});await page.goto(origin+'/preview-interface/workspace?'+new URLSearchParams({view:'tools',family:'experiment',id,learningSpace:'computing'}));
  await expect(page.getByRole('region',{name:'Activity Studio',exact:true})).toBeVisible();await expect(page.locator('.if-workbench')).toBeVisible();await page.getByRole('tab',{name:'Explore',exact:true}).click();
  const open=page.getByRole('button',{name:'Open interactive view',exact:true});const count=await open.count();expect(count).toBeGreaterThan(0);
  for(let n=0;n<count;n++)await open.first().click();
  const requested=example.activity.presentation?.slots.find(slot=>slot.viewId)?.viewId;
  if(requested&&names[requested])await expect(page.getByRole('region',{name:names[requested],exact:true})).toBeVisible();
  const host=page.locator('.as-render-host');await expect(host.first()).toBeVisible();
  if(requested==='source.diff-v1')await expect(host).toContainText('Display only; no patch is applied.');
  if(requested==='algorithm.graph-v1'){await host.getByRole('button',{name:'Next step',exact:true}).click();await expect(host).toContainText('Step 2 of');await host.getByRole('button',{name:'First step',exact:true}).focus();await page.keyboard.press('Enter');await expect(host).toContainText('Step 1 of');}
  if(requested==='game.maze-v1'){await host.getByRole('button',{name:'Move right',exact:true}).click();await expect(host).toContainText('1 moves');await host.getByRole('button',{name:'Reset route',exact:true}).click();await expect(host).toContainText('0 moves');}
  if(requested==='game.sudoku-v1'){await host.getByRole('button',{name:'Next step',exact:true}).click();await expect(host).toContainText('Step 2 of');}
  if(requested==='systems.life-v1'){await host.getByRole('button',{name:'Next generation',exact:true}).click();await expect(host).toContainText('Generation 1 of');await host.getByRole('button',{name:'Reset simulation',exact:true}).click();await expect(host).toContainText('Generation 0 of');}
  if(requested==='source.bytes-v1'){await host.getByText('Exact Base64, UTF-16 and normalization comparison',{exact:true}).click();await expect(host).toContainText('NFC differs');await expect(host).toContainText('d83d de00');}
  const geometry=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));expect(geometry.width).toBeLessThanOrEqual(geometry.viewport+2);
  await page.screenshot({path:testInfo.outputPath('pr49-practical-'+index+'-'+width+'.png'),animations:'disabled',fullPage:true});
  await page.getByRole('tab',{name:'Task',exact:true}).click();await expect(page.locator('.as-render-host')).toHaveCount(0);
  const resumed=await rpc('read_minamo_activity',{id,rendition:current.rendition});expect(resumed.record.activity).toEqual(example.activity);expect(resumed.record.rev).toBe(current.rev);
 }finally{if(current){const cleaned=await page.request.post(origin+'/preview-interface/api?path='+encodeURIComponent('/api/commands'),{data:{operationId:id+'-cleanup',action:'trash',family:'experiment',id,expectedRev:current.rev}});expect(cleaned.ok()).toBeTruthy();}}
});
