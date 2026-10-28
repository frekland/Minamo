import {env} from "cloudflare:workers";
import {getChatGPTUser} from "../chatgpt-auth";
import {readLab} from "../../lib/lab";
export const dynamic="force-dynamic";
export default async function Diagnostics(){const user=await getChatGPTUser();let state=null;try{if(user)state=await readLab(env,user.userId)}catch{}
const rows=[
["Framework","vinext 1.0.0-beta.5 / React 19.2.6 / TypeScript 5.9.3","Configured"],
["Request-time rendering",new Date().toISOString(),"This response"],
["ChatGPT identity",user?"Authenticated identity received server-side":"No authenticated identity in this request",user?"Observed":"Sign in required"],
["D1",state?.note?`Read revision ${state.note.revision}`:state?"Read succeeded; records not created":"Not verified in this request",state?"Observed":"Unverified"],
["R2",state?.storage.r2??"Not verified in this request",state?.storage.r2==="object available"?"Observed":"Unverified"],
["Server Actions","Selectable in the Note editor; acceptance requires a real successful browser save","Unverified hosted"],
["MCP","Read-only probe declared at /mcp; hosted discovery and ChatGPT invocation require separate evidence","Unverified hosted"],
["Release boundary","Independent project, database and bucket declarations; no production Minamo integration","Isolated design"]];
return <><div className="breadcrumb">Foundation Lab <span>/</span> Diagnostics</div><p className="eyebrow">EVIDENCE BEFORE ASSUMPTIONS</p><h1>Foundation diagnostics</h1><p className="lede">A response receipt is an observation. A configured capability is not a passed hosted test.</p><div className="diagnostics">{rows.map(([name,detail,status])=><section key={name}><h2>{name}</h2><p>{detail}</p><span>{status}</span></section>)}</div><p className="muted">No account identifiers, secrets or private storage keys are exposed. All lab records are synthetic.</p></>}
