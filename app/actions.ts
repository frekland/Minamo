"use server";
import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import {getChatGPTUser} from "./chatgpt-auth";
import {saveLabNote,LabError} from "../lib/lab";
export async function saveNote(input:unknown) {
 const user=await getChatGPTUser();if(!user)return {ok:false as const,error:"Sign in is required."};
 const h=await headers();const origin=h.get("origin"),host=h.get("host");
 if(!origin || new URL(origin).host!==host)return {ok:false as const,error:"Invalid request origin."};
 try{return {ok:true as const,note:await saveLabNote(env,user.userId,input)}}
 catch(e){return {ok:false as const,error:e instanceof LabError?e.message:"Save failed. Your draft is retained."}}
}
