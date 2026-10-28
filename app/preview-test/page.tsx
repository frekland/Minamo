import {readerPolishFixture} from '../../lib/reader-polish-fixture';
import {notFound} from 'next/navigation';
import Workspace from '../workspace';
import {syntheticRecords} from '../../lib/domain';
import {sourceExcerptFixture} from '../../lib/source-excerpt-fixture';
import {interactionFixture} from '../../lib/interaction-fixture';
import {syntheticMediaReading} from '../../lib/media-fixture';
import {educationalFixture,independentLearningFixture} from '../../lib/educational-fixture';
import {FAMILIES} from '../../lib/contracts';
import type {Family} from '../../lib/contracts';
export const dynamic='force-dynamic';
/** Development-only UI fixture. It grants no API identity and cannot acknowledge a save. */
export default async function Preview({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 if(!import.meta.env.DEV)notFound();
 const records=[...readerPolishFixture(),...interactionFixture(sourceExcerptFixture(await syntheticRecords())),syntheticMediaReading,...await educationalFixture(),...await independentLearningFixture()];const params=await searchParams;
 const scalar=(key:string)=>typeof params?.[key]==='string'?params[key] as string:undefined;
 const rawFamily=scalar('family');const family=rawFamily&&(FAMILIES as readonly string[]).includes(rawFamily)?rawFamily as Family:undefined;
 return <><div className="synthetic-ui-banner" style={{padding:'8px 20px',background:'var(--mn-surface-secondary)',color:'var(--mn-text-muted)',fontSize:12}}>SYNTHETIC UI TEST ONLY · no authenticated identity · durable saves must be rejected</div><Workspace initialWorkTab={scalar('tab')==='notes'?'note':'all'} initialRecords={records} initialActivity={[]} authenticated={true} initialView={scalar('view')??'home'} initialId={scalar('id')} initialFamily={family} initialReadingTarget={scalar('stage')?{stageId:scalar('stage')}:undefined} routeBase="/preview-test" draftScope={scalar('id')?.startsWith('edu-')?'synthetic-educational-preview-pr15':scalar('id')===syntheticMediaReading.id?'synthetic-ui-preview-v2-media':'synthetic-ui-preview-v2'}/></>;
}
