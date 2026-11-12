import {readEligibleMediaMetadata} from './media';
import {validateListeningBlock,type ListeningBlock} from './practice-audio';

export {validateListeningTranscript} from './practice-audio';
export async function requireListeningMedia(env:Cloudflare.Env,owner:string,input:ListeningBlock){
 const block=validateListeningBlock(input),asset=await readEligibleMediaMetadata(env,owner,block.media.assetId);
 if(asset.state!=='attached'||asset.kind!=='audio'||asset.revision!==block.media.revision||asset.digest!==block.media.digest||!asset.details.durationSeconds||Math.abs(asset.details.durationSeconds-block.media.durationSeconds)>.02)throw Error('The exact attached audio revision, hash and duration must match the listening manifest.');
 // Guard one actual current/retained attachment witness during writes. Media
 // revision alone does not change when its last owning record enters Trash.
 const basis=await env.DB!.prepare(`SELECT r.family,r.id,r.rev FROM v2_media_attachments a JOIN v2_records r ON r.owner=a.owner AND r.family=a.family AND r.id=a.record_id WHERE a.owner=? AND a.asset_id=? AND r.trashed_at IS NULL AND (EXISTS(SELECT 1 FROM json_each(r.data,'$.sections') s,json_each(s.value,'$.parts') p WHERE json_extract(p.value,'$.kind')='media' AND json_extract(p.value,'$.media.assetId')=?) OR EXISTS(SELECT 1 FROM v2_revisions h,json_each(h.data,'$.sections') s,json_each(s.value,'$.parts') p WHERE h.owner=r.owner AND h.family=r.family AND h.id=r.id AND json_extract(p.value,'$.kind')='media' AND json_extract(p.value,'$.media.assetId')=?)) ORDER BY r.family,r.id LIMIT 1`).bind(owner,asset.assetId,asset.assetId,asset.assetId).first<{family:import('./contracts').Family;id:string;rev:number}>();
 if(!basis)throw Error('The exact audio attachment context is unavailable.');
 return {...asset,eligibilityTarget:basis};
}
