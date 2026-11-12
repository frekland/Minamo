import {notFound} from 'next/navigation';
import {getChatGPTUser} from '../../chatgpt-auth';
export const dynamic='force-dynamic';
const WIDTHS=[320,375,390,768,1280] as const;
const READING_KEYS=['view','family','id','stage','rendition','section','part','start','end','returnJourney','returnStage'] as const;
const VIEWS=['journeys','investigations','library','sources','work'];
const FAMILIES=['journey','investigation','article','area','source','note','annotation','flag','run'];
/** An authenticated same-origin view of the real reading, never a copied fixture. */
export default async function HostedViewport({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const user=await getChatGPTUser();if(!user)notFound();
 const params=await searchParams;
 const width=typeof params.width==='string'&&WIDTHS.includes(Number(params.width) as typeof WIDTHS[number])?Number(params.width):390;
 const target=new URLSearchParams();
 for(const key of READING_KEYS){
  const value=params[key];if(typeof value!=='string'||!value.length||value.length>240||/[\u0000-\u001f\u007f]/.test(value))continue;
  if(key==='view'&&!VIEWS.includes(value))continue;
  if(key==='family'&&!FAMILIES.includes(value))continue;
  if((key==='start'||key==='end')&&(!/^\d{1,9}$/.test(value)||!Number.isSafeInteger(Number(value))))continue;
  target.set(key,value);
 }
 const src='/?'+target.toString();
 return <main style={{padding:16,maxWidth:'none'}}>
  <h1 style={{fontSize:22,lineHeight:1.3,margin:'0 0 10px'}}>Actual hosted viewport review</h1>
  <p style={{fontSize:13,lineHeight:1.6,margin:'0 0 14px'}}>Real owner-private V2 pages, rendered at {width} × 844 CSS pixels. This is a responsive viewport review, not physical-device acceptance. The page uses its normal authentication, data and save controls.</p>
  <form action="/diagnostics/viewport" method="get" style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:14}}>
   {Array.from(target).map(([key,value])=><input key={key} type="hidden" name={key} value={value}/>)}
   <label style={{fontSize:13}}>CSS viewport width <select name="width" defaultValue={String(width)} style={{marginLeft:8,padding:6}}>{WIDTHS.map(value=><option key={value} value={value}>{value}px</option>)}</select></label>
   <button type="submit" style={{padding:'7px 12px'}}>Review this width</button>
   <a href={src} style={{fontSize:13}}>Open this page at full width</a>
  </form>
  <div style={{maxWidth:'100%',overflowX:'auto',paddingBottom:8}}>
   <iframe title="Actual hosted Minamo V2 content viewport" src={src} width={width} height={844} style={{display:'block',width,minWidth:width,maxWidth:'none',height:844,boxSizing:'content-box',border:'1px solid var(--mn-border-control)'}}/>
  </div>
 </main>;
}
