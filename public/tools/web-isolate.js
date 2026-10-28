// Fixed finite event handler only. No eval, user script execution or network bridge.
const token=window.name||new URL(location.href).searchParams.get('run');let loaded=false;const log=[];
function publish(){parent.postMessage({token,type:'observation',text:document.body.innerText.slice(0,5000),console:log.slice(-30),viewport:innerWidth,contentWidth:document.documentElement.scrollWidth},'*');}
window.addEventListener('message',event=>{
 if(event.source!==parent||event.data?.token!==token)return;
 if(event.data.type==='capture'){publish();return;}
 if(loaded||typeof event.data.files?.html!=='string'||typeof event.data.files?.css!=='string')return;
 loaded=true;document.body.innerHTML=event.data.files.html;
 const style=document.createElement('style');style.textContent=event.data.files.css;document.head.append(style);
 const button=document.getElementById('add'),output=document.getElementById('count');let count=0;
 if(button&&output)button.addEventListener('click',()=>{count+=1;output.textContent=String(count);log.push('Count '+count);publish();});
 publish();
});
parent.postMessage({token,type:'ready'},'*');
