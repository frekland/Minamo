import {admitMathExpression,captureMathSource,serializeMathML} from './math';
/** Deliberately invoked synthetic DOM checks; does not read any learner record or change storage. */
export function runMathBrowserProbes(host:HTMLElement){
 const results:{name:string;pass:boolean;detail:string}[]=[];
 const check=(name:string,pass:boolean,detail:string)=>results.push({name,pass,detail});
 const math=host.querySelector('math');check('native MathML exists',!!math,math?.namespaceURI??'No math element');
 check('MathML namespace preserved',math?.namespaceURI==='http://www.w3.org/1998/Math/MathML',String(math?.namespaceURI));
 const decorations=Array.from(host.querySelectorAll('[data-foundry-decoration]'));
 check('typeset decoration stays outside canonical mapping',decorations.every(node=>!node.closest('[data-reading-part]')&&!node.querySelector('[data-reading-part]')),'Mapped source text is a separate exact code element.');
 const source=String.raw`\frac{1}{3}`,expression=admitMathExpression({contract:'minamo.math.v1',id:'browser-exact',format:'tex',source,display:'block'}),capture=captureMathSource(expression);
 check('whole-expression capture retains exact UTF-16 source',capture.source===source&&capture.end===source.length,JSON.stringify(capture));
 const holder=document.createElement('div');holder.hidden=true;holder.innerHTML=serializeMathML({tag:'mtext',text:'<img src=x onerror=alert(1)>'});host.appendChild(holder);
 try{check('finite MathML text cannot create image/script nodes',!holder.querySelector('img,script,iframe')&&holder.textContent==='<img src=x onerror=alert(1)>',holder.textContent??'');}finally{holder.remove();}
 const result={status:results.every(x=>x.pass)?'passed':'failed',browser:navigator.userAgent,viewport:{width:window.innerWidth,height:window.innerHeight},results,limitations:'DOM checks only; no screen reader, hosted sign-in or physical Pixel acceptance.'};
 return result;
}
