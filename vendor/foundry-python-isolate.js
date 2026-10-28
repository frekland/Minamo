/* Trusted lab controller. Opaque iframe only: sandbox=allow-scripts, never allow-same-origin. */
function scienceWorker(){
 self.onmessage=async({data})=>{
  try{
   const assets=data.assets,decode=name=>new TextDecoder().decode(assets[name]),runtimeURL='https://pyodide.invalid/';
   self.fetch=async url=>{const target=typeof url==='string'?url:url?.url??String(url);const name=target.startsWith(runtimeURL)?decodeURIComponent(target.slice(runtimeURL.length)):'';if(!Object.hasOwn(assets,name))throw Error('Network is disabled in the isolated scientific runtime; unstaged asset: '+target.slice(0,200));return new Response(assets[name],{headers:{'Content-Type':name.endsWith('.wasm')?'application/wasm':name.endsWith('.json')?'application/json':'application/octet-stream'}});};
   const loadScript=name=>{const u=URL.createObjectURL(new Blob([decode(name)],{type:'text/javascript'}));try{importScripts(u);}finally{URL.revokeObjectURL(u);}};
   loadScript('pyodide.asm.js');loadScript('pyodide.js');let stdout='',stderr='',truncated=false;
   const append=(kind,text)=>{text=String(text)+'\n';const before=kind==='stdout'?stdout:stderr;const next=before+text.slice(0,Math.max(0,20000-before.length));if(kind==='stdout')stdout=next;else stderr=next;if(before.length+text.length>20000)truncated=true;};
   self.postMessage({phase:'Initialising verified offline scientific Python'});
   const py=await loadPyodide({indexURL:runtimeURL,packageBaseUrl:runtimeURL,lockFileContents:JSON.parse(decode('pyodide-lock.json')),stdout:t=>append('stdout',t),stderr:t=>append('stderr',t)});
   await py.loadPackage(data.packages,{checkIntegrity:true,messageCallback:m=>self.postMessage({phase:String(m).slice(0,200)}),errorCallback:m=>append('stderr',m)});
   if(stderr)throw Error('Offline package bootstrap failed: '+stderr);
   await py.runPythonAsync(`
import sys, types, json, io, base64, struct
_minamo_output = types.ModuleType('_minamo_output')
_minamo_output.values = []
def _minamo_emit_table(label, columns, rows):
    if len(_minamo_output.values) >= 8 or not 1 <= len(columns) <= 30 or len(rows) > 200:
        raise ValueError('Table output budget exceeded')
    columns = [str(c) for c in columns]
    if any(len(c)>100 for c in columns): raise ValueError('Table column label too long')
    if any(len(r)!=len(columns) for r in rows): raise ValueError('Table row width mismatch')
    value={'kind':'table','label':str(label),'columns':columns,'rows':[list(r) for r in rows]}
    if len(json.dumps(value)) > 500000: raise ValueError('Table output byte budget exceeded')
    _minamo_output.values.append(value)
sys.modules['_minamo_output'] = _minamo_output
`);
   stdout='';stderr='';truncated=false;let error=null;
   try{await py.runPythonAsync(data.code);}catch(e){error=String(e.message||e).slice(0,10000);}
   let outputs=[];
   try{
    const serialized=await py.runPythonAsync(`
import sys, json, io, base64, struct
_out = sys.modules['_minamo_output'].values
if 'matplotlib.pyplot' in sys.modules:
    _plt=sys.modules['matplotlib.pyplot']
    try:
        for _number in _plt.get_fignums()[:4]:
            if len(_out)>=8: break
            _figure=_plt.figure(_number)
            _target_width=_figure.get_figwidth()*100
            _target_height=_figure.get_figheight()*100
            if not 0 < _target_width <= 4096 or not 0 < _target_height <= 4096 or _target_width*_target_height>4194304: raise ValueError('Figure raster budget exceeded before rendering')
            _buffer=io.BytesIO()
            _figure.savefig(_buffer,format='png',dpi=100)
            _bytes=_buffer.getvalue()
            if len(_bytes)>2097152: raise ValueError('Figure exceeds 2 MiB')
            _width,_height=struct.unpack('>II',_bytes[16:24])
            _out.append({'kind':'png','label':'Python figure '+str(_number),'base64':base64.b64encode(_bytes).decode('ascii'),'width':_width,'height':_height})
    finally:
        _plt.close('all')
json.dumps(_out,allow_nan=False)
`);outputs=JSON.parse(serialized);
   }catch(e){error=(error?error+'\n':'')+String(e.message||e).slice(0,5000);outputs=[];}
   self.postMessage({result:{contract:'minamo.python-results.v1',stdout,stderr,error,truncated,outputs,runtime:'Pyodide 0.28.3'}});
  }catch(e){self.postMessage({error:String(e.message||e).slice(0,10000)});}
 };
}
window.addEventListener('message',event=>{
 if(event.source!==parent||!event.data?.assets||typeof event.data.token!=='string'||typeof event.data.code!=='string'||event.data.code.length>30000)return;
 const {token,assets,code,packages}=event.data;
 const url=URL.createObjectURL(new Blob(['('+scienceWorker.toString()+')()'],{type:'text/javascript'})),worker=new Worker(url);
 let done=false;const finish=value=>{if(done)return;done=true;clearTimeout(timer);worker.terminate();URL.revokeObjectURL(url);parent.postMessage({token,...value},'*');};
 const timer=setTimeout(()=>finish({error:'Scientific Python timed out at 30 seconds'}),30000);
 worker.onmessage=e=>{if(e.data?.phase){parent.postMessage({token,phase:e.data.phase},'*');return;}finish(e.data);};
 worker.onerror=e=>finish({error:e.message||'Scientific worker failed'});
 worker.postMessage({assets,code,packages});
},{once:true});
parent.postMessage({ready:true},'*');
