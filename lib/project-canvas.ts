import {executeTool,cancelToolExecution} from './tool-runtime';
export type CanvasCommand={op:'clear'|'line'|'circle'|'rect'|'text';args:(string|number)[]};
export type CanvasFrame={duration:number;commands:CanvasCommand[]};
export function validateFrames(value:unknown):CanvasFrame[]{
 if(!Array.isArray(value)||!value.length||value.length>120)throw Error('Use 1–120 bounded frames.');let count=0;
 return value.map(f=>{if(!f||Object.keys(f).some(k=>!['duration','commands'].includes(k))||!Number.isFinite(f.duration)||f.duration<16||f.duration>10000||!Array.isArray(f.commands))throw Error('Invalid animation frame.');
 const commands=f.commands.map((c:any)=>{if(++count>600||!c||Object.keys(c).some(k=>!['op','args'].includes(k))||!Array.isArray(c.args))throw Error('Drawing command limit exceeded.');const n={clear:1,line:6,circle:4,rect:5,text:5}[c.op as CanvasCommand['op']];if(c.args.length!==n)throw Error('Unsupported drawing command.');for(const v of c.args)if(typeof v==='number'?(!Number.isFinite(v)||Math.abs(v)>10000):typeof v!=='string'||v.length>500)throw Error('Invalid drawing value.');for(let i=0;i<c.args.length-1;i++){if(c.op==='text'&&i===0){if(typeof c.args[i]!=='string')throw Error('Canvas text must be a string.');}else if(typeof c.args[i]!=='number')throw Error('Canvas coordinates and sizes must be finite numbers.');}const colour=c.args.at(-1);if(typeof colour!=='string'||!/^#[0-9a-f]{6}$/i.test(colour))throw Error('Use six-digit colour values.');return c as CanvasCommand;});return{duration:f.duration,commands};});
}
const prelude=`import json as _mc_json, types as _mc_types, sys as _mc_sys, random as _mc_random
_mc_frames=[]
_mc_commands=[]
_mc_count=0
def _mc_draw(op,*args):
 global _mc_count
 _mc_count+=1
 if _mc_count>600: raise ValueError('Canvas command limit exceeded')
 _mc_commands.append({'op':op,'args':list(args)})
def _mc_frame(duration=33):
 global _mc_commands
 if len(_mc_frames)>=120: raise ValueError('Canvas frame limit exceeded')
 _mc_frames.append({'duration':duration,'commands':_mc_commands})
 _mc_commands=[]
_mc_module=_mc_types.ModuleType('minamo_canvas')
_mc_module.clear=lambda colour='#ffffff': _mc_draw('clear',colour)
_mc_module.line=lambda x1,y1,x2,y2,width=2,colour='#333333': _mc_draw('line',x1,y1,x2,y2,width,colour)
_mc_module.circle=lambda x,y,r,colour='#3366aa': _mc_draw('circle',x,y,r,colour)
_mc_module.rect=lambda x,y,w,h,colour='#3366aa': _mc_draw('rect',x,y,w,h,colour)
_mc_module.text=lambda text,x,y,size=16,colour='#333333': _mc_draw('text',text,x,y,size,colour)
_mc_module.frame=_mc_frame
_mc_sys.modules['minamo_canvas']=_mc_module
`;
export async function runPythonCanvas(code:string,inputs:Record<string,unknown>,seed:number,onPhase:(s:string)=>void){
 const inputJson=JSON.stringify(JSON.stringify(inputs));const wrapped=prelude+'\n_mc_module.inputs=_mc_json.loads('+inputJson+')\n_mc_random.seed('+seed+')\n'+code+"\nif _mc_commands or not _mc_frames: _mc_frame()\n_mc_payload=_mc_json.dumps(_mc_frames,separators=(',',':'))";
 const r=await executeTool('python',{code:wrapped,canvasOutput:true},onPhase);if(r.status!=='completed')throw Error(r.output);
 if(!r.canvasJson)throw Error('Python returned no drawing data. Run again or check the Python source.');
 let frames;try{frames=validateFrames(JSON.parse(r.canvasJson));}catch(e){throw Error('The drawing could not be displayed. '+(e as Error).message);}
 return{frames,stdout:r.output==='(no output)'?'':r.output,observedAt:r.observedAt,durationMs:r.durationMs};
}
export {cancelToolExecution as stopPythonCanvas};
export function paintFrame(canvas:HTMLCanvasElement,frame:CanvasFrame){const c=canvas.getContext('2d');if(!c)throw Error('Canvas2D is unavailable.');for(const {op,args:a} of frame.commands){c.fillStyle=c.strokeStyle=a.at(-1) as string;c.beginPath();if(op==='clear')c.fillRect(0,0,canvas.width,canvas.height);if(op==='line'){c.lineWidth=Math.max(.1,Math.min(30,a[4] as number));c.moveTo(a[0] as number,a[1] as number);c.lineTo(a[2] as number,a[3] as number);c.stroke();}if(op==='circle'){c.arc(a[0] as number,a[1] as number,Math.max(0,a[2] as number),0,Math.PI*2);c.fill();}if(op==='rect')c.fillRect(a[0] as number,a[1] as number,a[2] as number,a[3] as number);if(op==='text'){c.font=Math.max(8,Math.min(72,a[3] as number))+'px sans-serif';c.fillText(a[0] as string,a[1] as number,a[2] as number);}}}
