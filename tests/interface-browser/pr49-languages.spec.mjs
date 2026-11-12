import {test,expect} from '@playwright/test';
const origin=process.env.MINAMO_INTERFACE_URL;
if(!origin)throw Error('Use the supported interface-browser runner with the exact local preview URL.');
const ja={version:1,text:'今日は日本語を勉強します。',language:'ja',direction:'ltr',spans:[{start:0,end:2,base:'今日',reading:'きょう',origin:'author-verified'},{start:3,end:6,base:'日本語',reading:'にほんご',origin:'author-verified'}],translation:{text:'I study Japanese today.',language:'en',direction:'ltr',provenance:'authored-translation'}};
const zh={version:1,text:'妈妈在银行工作。',language:'zh-Hans',direction:'ltr',spans:[{start:0,end:2,base:'妈妈',reading:'māma',origin:'author-verified'},{start:3,end:5,base:'银行',reading:'yínháng',origin:'author-verified'}],translation:{text:'Mum works at a bank.',language:'en',direction:'ltr',provenance:'authored-translation'}};
const fr={version:1,text:'J’apprends le français.',language:'fr',direction:'ltr',spans:[],grammar:'J’apprends is present tense.',translation:{text:'I am learning French.',language:'en',direction:'ltr',provenance:'authored-translation'}};
test('native multilingual reading copies original characters across ruby paragraphs and retains independent translation controls',async({page})=>{
 const id='synthetic-language-copy-'+Date.now(),endpoint=origin+'/preview-interface/api?path='+encodeURIComponent('/mcp');let record;
 const rpc=async(name,args)=>{const response=await page.request.post(endpoint,{data:{jsonrpc:'2.0',id:name,method:'tools/call',params:{name,arguments:{purpose:'Original synthetic author-run multilingual clipboard acceptance, not learner progress.',...args}}}});expect(response.ok()).toBeTruthy();const envelope=await response.json();expect(envelope.result?.isError).not.toBe(true);return JSON.parse(envelope.result.content[0].text);};
 try{
  const created=await rpc('apply_minamo_command',{command:{operationId:id+'-create',action:'create',family:'note',id,data:{title:'TEST ONLY multilingual clipboard',body:'Original synthetic language source, no progress.',synthetic:true,sections:[{id:'sentences',title:'Original sentences',parts:[ja,zh,fr].map((language,index)=>({id:'sentence-'+index,kind:'paragraph',semantic:{contract:'minamo.semantic.v1',kind:'ruby',language}}))}]}}});record=created.record;
  await page.goto(origin+'/preview-interface/workspace?'+new URLSearchParams({view:'work',family:'note',id,learningSpace:'all'}));await expect(page.locator('[data-reading-part="sentence-0"][data-canonical-start]').first()).toBeVisible();
  await expect(page.locator('.minamo-semantic-ruby').nth(1).locator('rt').first()).toHaveAttribute('lang','zh-Latn-pinyin');await expect(page.locator('.minamo-semantic-ruby').nth(2).locator('ruby')).toHaveCount(0);
  const copied=await page.evaluate(()=>{
   const regions=[...document.querySelectorAll('.minamo-semantic-ruby > p')],first=regions[0].querySelector('[data-reading-part]'),last=regions[2].querySelector('[data-reading-part]');
   const firstText=document.createTreeWalker(first,NodeFilter.SHOW_TEXT).nextNode(),walker=document.createTreeWalker(last,NodeFilter.SHOW_TEXT);let lastText,node;while((node=walker.nextNode()))lastText=node;
   const range=document.createRange();range.setStart(firstText,0);range.setEnd(lastText,lastText.textContent.length);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
   const data=new DataTransfer(),event=new ClipboardEvent('copy',{bubbles:true,cancelable:true,clipboardData:data});regions[0].dispatchEvent(event);return {text:data.getData('text/plain'),prevented:event.defaultPrevented};
  });expect(copied).toEqual({text:[ja.text,zh.text,fr.text].join('\n'),prevented:true});expect(copied.text).not.toMatch(/きょう|にほんご|māma|yínháng|Show translation/);
  await page.evaluate(()=>window.getSelection()?.removeAllRanges());const first=page.locator('.minamo-semantic-ruby').first();await first.getByText('Show translation',{exact:true}).click();await expect(first.getByText(ja.translation.text,{exact:true})).toBeVisible();await first.getByRole('button',{name:'Hide readings',exact:true}).click();await expect(first.locator('rt').first()).toHaveCSS('visibility','hidden');
 }finally{if(record)await rpc('apply_minamo_command',{command:{operationId:id+'-trash',action:'trash',family:'note',id,expectedRev:record.rev}});}
});
