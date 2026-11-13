/* Local Kuromoji/IPADIC worker. Only the fixed same-origin dictionary is fetched. */
let ready;
self.onmessage=async({data})=>{
 if(!Number.isSafeInteger(data?.id)||typeof data.text!=='string'||data.text.length>12000)return;
 try{
  if(!ready)ready=new Promise((resolve,reject)=>{importScripts('/runtime/kuromoji/kuromoji.js');self.kuromoji.builder({dicPath:'/runtime/kuromoji/dict/'}).build((error,tokenizer)=>error?reject(error):resolve(tokenizer));});
  const tokenizer=await ready;
  const tokens=tokenizer.tokenize(data.text).map(({surface_form,word_type,reading})=>({surface_form,word_type,reading}));
  self.postMessage({id:data.id,tokens});
 }catch{self.postMessage({id:data.id,error:'Tokenizer unavailable'});}
};
