export const LAB_ID = "synthetic-foundation-20261021-8a64";
export const TITLE = "How does a note become durable?";
export type Note = { body: string; revision: number; updated_at: string };
export class LabError extends Error { constructor(public status: number, message: string) { super(message); } }
export function validateNote(input: unknown): {body:string;revision:number} {
 if (!input || typeof input !== "object") throw new LabError(400,"Invalid note payload.");
 const {body,revision} = input as Record<string,unknown>;
 if (typeof body !== "string" || body.trim().length === 0 || body.length > 4000 || !Number.isSafeInteger(revision) || (revision as number) < 1) throw new LabError(400,"Use 1–4,000 characters and a valid revision.");
 return {body,revision:revision as number};
}
function db(env: Cloudflare.Env) { if(!env.DB) throw new LabError(503,"D1 binding unavailable.");return env.DB; }
function key(owner:string) { return `synthetic-test-only/${encodeURIComponent(owner)}/${LAB_ID}.txt`; }
export async function readLab(env:Cloudflare.Env,owner:string) {
 const investigation=await db(env).prepare("SELECT id,title FROM investigations WHERE owner=? AND id=?").bind(owner,LAB_ID).first();
 const note=await db(env).prepare("SELECT body,revision,updated_at FROM notes WHERE owner=? AND investigation_id=?").bind(owner,LAB_ID).first<Note>();
 const object=env.BUCKET ? await env.BUCKET.head(key(owner)) : null;
 return {investigation,note,storage:{d1:"read succeeded",r2:env.BUCKET ? object ? "object available" : "not created" : "binding unavailable"}};
}
export async function initializeLab(env:Cloudflare.Env,owner:string) {
 // Explicit authenticated command, never performed by GET, SSR or panel state.
 const stamp=new Date().toISOString();
 await db(env).batch([
 db(env).prepare("INSERT OR IGNORE INTO investigations(owner,id,title) VALUES(?,?,?)").bind(owner,LAB_ID,TITLE),
 db(env).prepare("INSERT OR IGNORE INTO notes(owner,investigation_id,body,revision,updated_at) VALUES(?,?,?,1,?)").bind(owner,LAB_ID,"SYNTHETIC TEST ONLY — I predict a server acknowledgement will survive refresh.",stamp)
 ]);
 if(env.BUCKET && !(await env.BUCKET.head(key(owner)))) await env.BUCKET.put(key(owner),"SYNTHETIC TEST ONLY — durable object α → β\n",{httpMetadata:{contentType:"text/plain; charset=utf-8"}});
 return readLab(env,owner);
}
export async function saveLabNote(env:Cloudflare.Env,owner:string,input:unknown) {
 const {body,revision}=validateNote(input);
 const result=await db(env).prepare("UPDATE notes SET body=?,revision=revision+1,updated_at=? WHERE owner=? AND investigation_id=? AND revision=? RETURNING body,revision,updated_at").bind(body,new Date().toISOString(),owner,LAB_ID,revision).first<Note>();
 if(!result) throw new LabError(409,"This note changed elsewhere. Reload the saved note before trying again; your draft is retained.");
 return result;
}
export async function readFile(env:Cloudflare.Env,owner:string) {
 if(!env.BUCKET) throw new LabError(503,"R2 binding unavailable.");
 const object=await env.BUCKET.get(key(owner));if(!object) throw new LabError(404,"Synthetic file has not been created.");return object.text();
}
export async function writeFile(env:Cloudflare.Env,owner:string) {
 if(!env.BUCKET) throw new LabError(503,"R2 binding unavailable.");
 await env.BUCKET.put(key(owner),"SYNTHETIC TEST ONLY — modified durable object β → γ\n",{httpMetadata:{contentType:"text/plain; charset=utf-8"}});
 return {saved:true};
}
