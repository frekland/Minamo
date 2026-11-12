'use client';

import type {WorkspaceRecord} from '../lib/contracts';
import type {ActivityBlock,ActivityCartridge} from '../lib/activity/schema';
import type {ProjectPackage} from '../lib/challenge-exchange/package';
import {generationFetch} from '../lib/workspace-generation';
import {ActivityArtefact,ActivitySourceBrowser,ActivityInstructions} from './activity-studio';
import PracticeAudio from './practice-audio';

/** Retained Activity cartridges are useful references and interactive artefacts.
 * Their former answer/attempt/feedback lifecycle is intentionally not mounted. */
export default function LegacyActivityViewer({record,scope}:{record:WorkspaceRecord;scope:string}){
 const activity=record.activity as ActivityCartridge|undefined;
 if(!activity)return record.attempt?<p className="v2-muted">This is a retained legacy response. Its original text and revision remain available above; no new attempt or review can be submitted.</p>:null;
 const edition=record.rendition??'';
 const prompts=activity.blocks.filter((block):block is Extract<ActivityBlock,{kind:'practice'}>=>block.kind==='practice');
 const source=(block:Extract<ActivityBlock,{kind:'source-browser'}>)=><ActivitySourceBrowser bundle={block.bundle as ProjectPackage} reading={{id:record.id,rendition:edition,blockId:block.id}} loadArchive={async()=>{const response=await generationFetch(scope,'/api/activities/project?'+new URLSearchParams({id:record.id,rendition:edition,blockId:block.id}),{cache:'no-store'});if(!response.ok)throw Error('This retained source package is unavailable.');return new Uint8Array(await response.arrayBuffer());}}/>;
 return <section className="activity-studio" aria-label="Retained interactive material">
  <header className="as-header"><div><p className="as-eyebrow">RETAINED MATERIAL</p><h2>{record.title}</h2><p>{activity.intent}</p></div></header>
  <p className="as-muted">Archived for reference. Continue learning in GPT, and keep useful examples or observations in the Project or Notes.</p>
  {activity.blocks.filter(block=>block.kind!=='hint-ladder'&&(block.kind!=='practice'||block.id===prompts[0]?.id)).map(block=><div key={block.id} data-activity-block={block.id} className="as-block">
   {block.kind==='instruction'||block.kind==='prediction'||block.kind==='reflection'?<details><summary>{block.kind==='reflection'?'Earlier reflection prompt':'Earlier instructions'}</summary><ActivityInstructions block={block}/></details>:
   block.kind==='source-browser'?source(block):
   block.kind==='foundry'?<ActivityArtefact artefact={block.artefact} authority={{scope,id:record.id,rendition:edition,allowed:()=>true}} sourceHref={'/?'+new URLSearchParams({view:'tools',family:'experiment',id:record.id,rendition:edition,section:'activity',part:block.id+'-source'})}/>:
   block.kind==='reading'?<p><a href={'/?'+new URLSearchParams({view:block.ref.family==='journey'?'journeys':block.ref.family==='article'?'library':'work',family:block.ref.family,id:block.ref.id,rendition:block.ref.rendition,...(block.ref.sectionId?{section:block.ref.sectionId}:{}),...(block.ref.partId?{part:block.ref.partId}:{})})}>Open related retained reading</a></p>:
   block.kind==='listening'?<PracticeAudio block={block} ownerScope={scope}/>:
   block.kind==='practice'?block.id===prompts[0]?.id?<details className="as-archived-prompts"><summary>Earlier practice prompts ({prompts.length})</summary><ol>{prompts.map(prompt=><li key={prompt.id}>{prompt.exercise.prompt}</li>)}</ol><p className="as-muted">These are historical prompts, not a submission form. You can discuss them in GPT.</p></details>:null:
   block.kind==='hint-ladder'?null:
   <p className="as-muted">Earlier guided interaction retired. The retained source and related Project material remain readable.</p>}
  </div>)}
 </section>;
}
