import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
/** Real bounded iframe viewports for development QA, not device emulation. */
export default async function MobilePreview({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 if(!import.meta.env.DEV)notFound();const params=await searchParams;
 const width=[320,360,390,768,1280,1440].includes(Number(params.width))?Number(params.width):390;
 const previewPath=params.fixture==='growth'?'/preview-growth':params.fixture==='notes'?'/preview-notes':'/preview-test';
 const target=new URLSearchParams();for(const key of ['view','family','id','stage']){const value=params[key];if(typeof value==='string'&&/^[a-zA-Z0-9_.:-]{1,160}$/.test(value))target.set(key,value);}
 return <main style={{padding:12,maxWidth:'none',overflowX:'auto'}}><p style={{fontSize:12}}>SYNTHETIC UI TEST ONLY · actual {width} × 844 CSS iframe · no device acceptance</p><iframe title="Narrow synthetic workspace" src={previewPath+(target.size?'?'+target:'')} width={width} height="844" style={{boxSizing:'content-box',border:'1px solid var(--mn-border-control)'}}/></main>
}
