import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
/** Real 390px child browsing viewport, not a physical Android/assistive-device claim. */
export default function FoundryPhone(){if(!import.meta.env.DEV)notFound();return <main style={{padding:16,background:'#0b1116',color:'#dce7eb',minHeight:'100vh'}}><h1>390px browser specimen</h1><p>Desktop Chromium in a 390 × 844 child viewport. This does not test physical Android, touch hardware or TalkBack.</p><iframe title="Foundry 390px viewport" src="/capability-foundry" width={390} height={844} style={{border:'1px solid #637c88',maxWidth:'100%'}}/></main>;}
