import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({entryPoints:['lib/overlay-interactions.ts'],bundle:true,format:'cjs',platform:'node',write:false});
const mod={exports:{}};new Function('module','exports',built.outputFiles[0].text)(mod,mod.exports);
const {closeOnDialogBackdrop,overlayEscape,cyclePopoverFocus}=mod.exports;

test('outside native-dialog clicks dismiss, while form controls and empty interior padding stay open',()=>{
 const dialog={getBoundingClientRect:()=>({left:100,right:500,top:50,bottom:600})};let closes=0;
 const event=(x,y,target=dialog)=>({currentTarget:dialog,target,clientX:x,clientY:y});
 assert.equal(closeOnDialogBackdrop(event(120,80),()=>closes++),false,'padding inside the modal is not its backdrop');
 assert.equal(closeOnDialogBackdrop(event(100,50),()=>closes++),false,'border is still inside');
 assert.equal(closeOnDialogBackdrop(event(10,20,{}),()=>closes++),false,'an inner control never dismisses the editor');
 assert.equal(closes,0);
 assert.equal(closeOnDialogBackdrop(event(90,80),()=>closes++),true);
 assert.equal(closes,1);
});
test('Escape is owned by the innermost editing interaction and respects native modal and IME state',()=>{
 const escape={key:'Escape',defaultPrevented:false,isComposing:false};
 assert.equal(overlayEscape(escape),true);
 assert.equal(overlayEscape({...escape,defaultPrevented:true}),false,'a rename cancel cannot also close its popover');
 assert.equal(overlayEscape({...escape,isComposing:true}),false);
 assert.equal(overlayEscape(escape,true),false,'an open settings/help/GPT dialog owns Escape above recent Notes');
 assert.equal(overlayEscape({...escape,key:'Enter'}),false,'form editing and submission do not light-dismiss');
});
test('recent-Notes keyboard cycle wraps visible controls and its trigger without reaching covered page controls',()=>{
 let focused=null,prevented=0;
 const node=name=>({name,isConnected:true,hidden:false,closest:()=>null,getClientRects:()=>[{}],focus(){focused=name;}});
 const first=node('search'),last=node('action'),trigger=node('trigger'),hidden={...node('hidden'),hidden:true},inert={...node('inert'),closest:()=>({})};
 const panel={querySelectorAll:()=>[first,last,hidden,inert]};
 const event=shiftKey=>({key:'Tab',defaultPrevented:false,isComposing:false,shiftKey,preventDefault(){prevented++;}});
 assert.equal(cyclePopoverFocus(event(false),panel,trigger,trigger),true);assert.equal(focused,'search');
 assert.equal(cyclePopoverFocus(event(true),panel,trigger,first),true);assert.equal(focused,'trigger');
 assert.equal(cyclePopoverFocus(event(false),panel,trigger,first),false,'ordinary Tab advances natively inside the popover');
 assert.equal(cyclePopoverFocus(event(false),panel,trigger,node('covered-page')),true);assert.equal(focused,'search');
 assert.equal(prevented,3);
 assert.equal(cyclePopoverFocus({...event(false),isComposing:true},panel,trigger,trigger),false);
});
