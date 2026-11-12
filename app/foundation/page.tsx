import Link from "next/link";
import {env} from "cloudflare:workers";
import {getChatGPTUser,chatGPTSignInPath} from "../chatgpt-auth";
import {readLab,TITLE} from "../../lib/lab";
import LabClient from "../lab-client";
import ClientProof from "../client-proof";
export const dynamic="force-dynamic";
export default async function Home(){
 const user=await getChatGPTUser();let data=null;let error="";
 if(user)try{data=await readLab(env,user.userId)}catch{error="The server could not read the lab. Please retry."}
 const rendered=new Date().toISOString();const requestId=crypto.randomUUID();
 return <><div className="breadcrumb">Foundation Lab <span>/</span> Investigation 01</div><div className="page-heading"><p className="eyebrow">A QUESTION TO EXPLORE</p><h1>{TITLE}</h1><p className="lede">Follow a thought from your browser to the server — and see what remains when you return.</p></div><div className="tags"><span>SYNTHETIC TEST ONLY</span><span>Foundation experiment</span></div><section className="intro"><span className="section-number">01</span><div><h2>Predict. Save. Return.</h2><p>A note feels saved when the interface says so. This lab asks a smaller, more useful question: has the server acknowledged it, and can you read the same note after a refresh?</p><p>Write a prediction, save it, then reload. The revision number lets the server reject an older draft instead of overwriting newer work.</p></div></section><Link href="/reading" className="reading-card"><span className="book-icon">▤</span><div><p className="eyebrow">RELATED ARTICLE · 2 MIN</p><h3>Where does “saved” live?</h3><p>Client state, server records and the acknowledgement between them.</p></div><span className="arrow">↗</span></Link>{user?<LabClient initial={data} initialError={error}/>:<section className="note-panel"><h2>Your synthetic note</h2><p>Sign in to use your private D1 records and R2 test file.</p><a className="button" href={chatGPTSignInPath("/")} target="_top">Sign in with ChatGPT ↗</a><p className="muted">No personal learning data is connected to this lab.</p></section>}<ClientProof/><details className="render-proof"><summary>Server render receipt</summary><p>Generated per request by an async React Server Component. Compare two direct requests; the receipt should change.</p><code>{rendered}</code><small>Request {requestId}</small><p>Framework: vinext App Router on Cloudflare Workers. This is not conventional Next.js. Hosted RSC/hydration acceptance remains pending until exercised.</p></details></>
}
