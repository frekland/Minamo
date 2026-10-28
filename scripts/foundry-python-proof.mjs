import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {loadPyodide} from 'pyodide';
const require=createRequire(import.meta.url),root=resolve('.'),path=resolve('public/runtime/foundry-python');
const manifest=JSON.parse(await readFile(path+'/manifest.json','utf8'));
for(const a of manifest.assets){const b=await readFile(path+'/'+a.file);assert.equal(b.length,a.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),a.sha256);}
let attemptedNetwork=0;globalThis.fetch=async()=>{attemptedNetwork++;throw Error('Network forbidden during offline proof');};
const started=performance.now(),stdout=[],stderr=[];
const py=await loadPyodide({indexURL:dirname(require.resolve('pyodide/package.json'))+'/',packageCacheDir:path,lockFileContents:JSON.parse(await readFile(path+'/pyodide-lock.json','utf8')),stdout:x=>stdout.push(x),stderr:x=>stderr.push(x)});
const coreReady=performance.now();await py.loadPackage(manifest.requested,{checkIntegrity:true});const loaded=performance.now();
const cases=[
 {name:'numpy+matplotlib',code:`import matplotlib\nmatplotlib.use('agg')\nimport numpy as np\nimport matplotlib.pyplot as plt\nimport io,base64,json,hashlib,struct\nx=np.linspace(0,1,51)\ny=x*x\nfig,ax=plt.subplots(figsize=(4,3),dpi=100)\nax.plot(x,y)\nax.set(xlabel='x',ylabel='x squared',title='Synthetic x squared')\nb=io.BytesIO()\nfig.savefig(b,format='png',dpi=100)\na=b.getvalue()\nw,h=struct.unpack('>II',a[16:24])\nassert a.startswith(bytes([137,80,78,71,13,10,26,10]))\nassert (w,h)==(400,300)\nresult={'integralApprox':float(np.trapezoid(y,x)),'pngBytes':len(a),'pngSha256':hashlib.sha256(a).hexdigest(),'width':w,'height':h,'rows':[[float(i),float(j)] for i,j in zip(x[::10],y[::10])]}\nplt.close('all')\njson.dumps(result)`},
 {name:'sympy',code:`import sympy as s,json\nx=s.symbols('x')\na=s.integrate(x*x,(x,0,1))\nassert a==s.Rational(1,3)\njson.dumps({'integral':str(a),'tex':s.latex(a),'derivative':str(s.diff(x**3,x))})`},
 {name:'pandas',code:`import pandas as pd,json\ndf=pd.DataFrame({'sample':['a','b','c'],'value':[4,8,15]})\nassert int(df.value.sum())==27\njson.dumps({'sum':int(df.value.sum()),'rows':df.values.tolist()})`},
 {name:'pillow',code:`from PIL import Image\nimport numpy as np,json,io\na=np.arange(256,dtype=np.uint8).reshape((16,16))\nim=Image.fromarray(a).resize((128,128))\nb=io.BytesIO();im.save(b,format='PNG')\nassert im.size==(128,128)\njson.dumps({'size':list(im.size),'mode':im.mode,'pngBytes':len(b.getvalue())})`},
 {name:'scipy',code:`import scipy.integrate as i,json\nv,error=i.quad(lambda x:x*x,0,1)\nassert abs(v-1/3)<1e-12\njson.dumps({'integral':v,'reportedNumericalError':error})`},
 {name:'network-denial',code:`import js\ntry:\n    await js.fetch('https://example.com')\n    raise AssertionError('Network unexpectedly permitted')\nexcept Exception as e:\n    str(e)\n'network-denial-confirmed'`},
];
const results=[];
for(const c of cases){const began=performance.now(),value=await py.runPythonAsync(c.code);results.push({name:c.name,inputSha256:createHash('sha256').update(c.code).digest('hex'),code:c.code,durationMs:performance.now()-began,result:c.name==='network-denial'?value:JSON.parse(value)});}
const report={contract:'minamo.foundry-science-proof.v1',environment:'Node.js '+process.version+' executing actual Pyodide '+py.version+' WebAssembly (not browser/hosted authentication)',observedAt:new Date().toISOString(),runtimeVersion:py.version,assetBytes:manifest.totalBytes,packageCount:manifest.packages.length,coreStartupMs:coreReady-started,packageLoadMs:loaded-coreReady,totalMs:performance.now()-started,memory:process.memoryUsage(),networkDenialAttempts:attemptedNetwork,results,stdout,stderr,limits:'No browser viewport/GPU/Android/authenticated owner execution is claimed. Node proof code is trusted synthetic source only.'};
await writeFile(root+'/docs/capability-foundry/python/EXECUTION-EVIDENCE.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,results:results.map(r=>({...r,code:undefined})),stdout:undefined,stderr:undefined}));
