import type {ActivityCartridge,ActivityAttempt} from './activity/schema';
import type {ExternalVideo} from './external-media';
import {noteMarkdownText} from './note-markdown';
import {noteImageSegments,parseNoteImagePlacements} from './note-image-placement';
import type {AuthoredDiagram} from './diagrams';
import type {ReadingInline} from './reading-inline';
/** Shared JSON contracts. Durable validation and identity are enforced on the server. */
export const FAMILIES = ['journey','investigation','article','area','note','annotation','flag','source','experiment','run'] as const;
export type Family = typeof FAMILIES[number];
export const READING_FAMILIES = ['journey','investigation','article','area','note','annotation','source','experiment','run'] as const;
export type ReadingFamily = typeof READING_FAMILIES[number];
export function isReadingFamily(value:unknown):value is ReadingFamily{return typeof value==='string'&&(READING_FAMILIES as readonly string[]).includes(value);}
export type Actor = 'user'|'gpt'|'system';
export const RELATIONS=['related','explains','applies','contrasts','supports','extends','source','next'] as const;
export type RecordLink = { relationId?:string;sourceContext?:{sectionId?:string;stageId?:string}; family: Family; id: string; relation?:typeof RELATIONS[number];reason?:string;sectionId?:string;partId?:string;rendition?:string };
export type ReadingTable={headers:string[];rows:string[][];caption?:string};
export type ReadingCallout={tone:'note'|'question'|'warning';label?:string};
export type ReadingReference={url:string;label:string;alt?:string;rights:'link-only';commit?:string;path?:string;sourceId?:string;externalVideo?:ExternalVideo};
export type ReadingImage={assetId:string;alt:string;caption?:string};
/** Personal presentation metadata; excluded from canonical reading identity. */
export type ProjectCover={assetId:string;decorative:boolean;alt?:string};
export type ReadingMedia={assetId:string;kind:'document'|'audio'|'video';description:string;caption?:string;transcript?:string};
export function mediaCanonicalText(media:ReadingMedia):string{return media.description+(media.caption?'\n'+media.caption:'')+(media.transcript?'\n'+media.transcript:'');}
export type MediaDisplay={mime:string;bytes:number;kind:ReadingMedia['kind'];details:{format:string;codecs?:string[];durationSeconds?:number;width?:number;height?:number;sampleRate?:number;channels?:number}};
export function imageCanonicalText(image:ReadingImage):string{return image.alt+(image.caption?'\n'+image.caption:'');}
export type SourceExcerpt={id:string;text:string;locator:string;edition:string;basis:'owner-authored'|'permission'|'licence';permissionNote:string;ownerAttested:true;state:'permitted'|'revoked';exportAllowed:boolean;unavailable?:true};
export type ReadingExcerpt={sourceId:string;rendition:string;start:number;end:number};
export type ExcerptDisplay={sourceTitle:string;url:string;attribution:string;locator:string;edition:string;basis:SourceExcerpt['basis'];permissionNote:string;exportAllowed:boolean;sourceExcerptId:string};
export type PassageDisplayReturn={recordFamily:Family;id:string;rendition:string;sectionId:string;partId:string;start:number;end:number};
export type SourceUpdate={excerpt:{state?:'revoked';exportAllowed?:false}};
export type PassagePart = { semantic?:import('./semantic-content').SemanticContent; inline?:ReadingInline[]; id:string; kind:'paragraph'|'code'|'diagram'|'table'|'callout'|'reference'|'image'|'excerpt'|'media'; text:string; language?:string; joinBefore?:''|'\n';table?:ReadingTable;callout?:ReadingCallout;reference?:ReadingReference;image?:ReadingImage;media?:ReadingMedia;mediaDisplay?:MediaDisplay;diagram?:AuthoredDiagram;excerpt?:ReadingExcerpt;excerptDisplay?:ExcerptDisplay;unavailable?:true;imageDisplay?:{width:number;height:number;mime:string} };
export type ArticleSection = { id:string; title:string; parts:PassagePart[] };
export const MAX_PASSAGE_SEGMENTS=40;
export const MAX_PASSAGE_QUOTE=12000;
export type PassageAnchor = { articleId:string; recordFamily?:Family; rendition:string; sectionId:string; partId:string; start:number; end:number; quote:string; displayReturn?:PassageDisplayReturn; segments?:{sectionId:string;partId:string;start:number;end:number}[] };
export type ReadingSelection=Pick<PassageAnchor,'sectionId'|'partId'|'start'|'end'|'segments'>;
/** Deliberately selected related sources may pin an edition and exact passage.
 * The older family/id form continues to request the current eligible head. */
export type SelectedContextRef=Pick<RecordLink,'family'|'id'|'rendition'> & {selection?:ReadingSelection};
export type ContextOptions=import('./learning-spaces').LearningScopeQuery & {selection?:ReadingSelection;relatedRefs?:SelectedContextRef[]};
export function tableCanonicalText(table:ReadingTable):string{return [table.headers.join('\t'),...table.rows.map(row=>row.join('\t'))].join('\n');}
export type SourceInfo = { url:string; attribution:string; rights:'link-only'|'original'|'permitted-excerpt'; commit?:string;path?:string;kind?:'documentation'|'repository'|'external';excerpt?:SourceExcerpt };
export const CONCEPT_LIMITS={entries:40,aliases:12,term:120,definition:1000,environment:120,matches:20} as const;
/** Exact case-sensitive matching by default. false opts into ASCII-only folding, never Unicode normalization. */
export type ConceptEntry={kind?:'concept'|'python-function'|'shell-command'|'api'|'language-syntax';signature?:string;usage?:string;examplePartId?:string;id:string;term:string;aliases:string[];definition:string;sectionId:string;partId?:string;environment?:string;caseSensitive?:boolean};
export type ConceptDestination={concept:ConceptEntry;destination:RecordLink;deepLink:string};
export type ConceptMatch=ConceptDestination & {article:{family:'article';id:string;title:string;rev:number;rendition:string};match:'term'|'alias';matchedTerm:string;discovery?:'exact'|'case-folded'};
export type FlagTarget={kind:'record';family:Family;id:string}|{kind:'passage';anchor:PassageAnchor};
export type BookmarkState={targetKey:string;targetRev:number;active:boolean;available:boolean;flagRef?:{family:'flag';id:string;rev:number}};
export type FlagBookmark=BookmarkState & {target:FlagTarget};
export type LearningShape =
 | {version:1;kind:'journey';stages:{id:string;sectionId:string;title:string;intent?:string;outcome?:string;checkpoint?:string;optional?:boolean;prerequisites?:string[]}[]}
 | {version:1;kind:'investigation';question:string;mode:'suggested'|'active';provenance:'gpt-prompt'|'owner-created'}
 | {version:2;kind:'investigation';question:string}
 | {version:1;kind:'library-topic';subject:string;reusableBeyondProject:boolean}
 | {version:1;kind:'area';subject:string;categoryPurpose:string};
export type WorkspaceRecord = {
 id:string;family:Family;title:string;body:string;bodyFormat?:'markdown-v1';flagTarget?:FlagTarget;bookmark?:FlagBookmark;status?:string;links:RecordLink[];
 learningScope?:import('./learning-spaces').LearningScope;learningScopeRev?:number;learningScopeInherited?:boolean;learningShape?:LearningShape;sections?:ArticleSection[]; concepts?:ConceptEntry[]; anchor?:PassageAnchor; rendition?:string; source?:SourceInfo;
 projectCover?:ProjectCover|null;
 outputBundle?:import('./typed-outputs').TypedOutputBundle; activity?:ActivityCartridge;attempt?:ActivityAttempt;
 engine?:'regex'|'unicode'|'sql'|'python'|'web'; code?:string; output?:string; evidence?:'observed'|'illustrative';
 rev:number;createdAt:string;updatedAt:string;trashedAt:string|null;actor:Actor;synthetic:boolean;
};
export type RecordData = Pick<WorkspaceRecord,'title'|'body'> & Partial<Pick<WorkspaceRecord,'status'|'links'|'sections'|'concepts'|'learningShape'|'learningScope'|'anchor'|'bodyFormat'|'engine'|'code'|'output'|'outputBundle'|'evidence'|'synthetic'|'activity'|'attempt'|'projectCover'>> & {source?:SourceInfo|SourceUpdate};
export type BlockChanges=Partial<Omit<PassagePart,'id'|'kind'|'table'|'callout'|'reference'|'image'|'media'|'unavailable'|'imageDisplay'|'mediaDisplay'|'excerptDisplay'>> & {table?:Partial<ReadingTable>;callout?:Partial<ReadingCallout>;reference?:Partial<ReadingReference>;image?:Partial<ReadingImage>;media?:Partial<ReadingMedia>};
/** Ordered, bounded edits against one exact record revision. No patch data is persisted. */
export type ContentPatch=
 | {op:'patchBlock';sectionId:string;partId:string;changes:BlockChanges}
 | {op:'insertBlock';sectionId:string;afterPartId?:string|null;block:PassagePart}
 | {op:'removeBlock';sectionId:string;partId:string}
 | {op:'setRelations';links:RecordLink[]}
 | {op:'upsertRelation';match?:RecordLink;link:RecordLink}
 | {op:'removeRelation';match:RecordLink}
 | {op:'upsertConcept';concept:ConceptEntry}
 | {op:'removeConcept';id:string}
 | {op:'clearNoteAnchor'};
export const CONTENT_CAPABILITIES={
 contract:'minamo-v2-2026-10-22.19',catalogue:'server-tools-list',
 semantic:{contract:'minamo.semantic.v1',kinds:['ruby','math'],canonical:'Existing part.text retains literal UTF-16 base text or exact TeX; metadata never rewrites old text.',manuscript:'Explicit minamo-semantic, minamo-language or minamo-math JSON fences in newly published manuscripts compile to native metadata. Invalid declarations remain literal code with warning.',rendering:'Owner-enabled display adapter; math package loads only after deliberate typesetting.'},
 outputs:{contract:'minamo.outputs.v1',classifications:['supplied-output','browser-reported-output'],transport:'Typed tables and same-Run private PNG image parts; exact codeSha256, history and encrypted recovery. Transported output is never server-observed execution.'},
 blockKinds:['paragraph','code','diagram','table','callout','reference','image','excerpt','media'],
 readingFamilies:[...READING_FAMILIES],
 learning:{version:1,kinds:['journey','investigation','library-topic','area'],stageNavigation:'Stable stage IDs reference canonical sections; last opened is navigation, never completion.',investigations:'Questions have no learning lifecycle or creator classification; legacy v1 content remains exact.',work:{read:'get_minamo_learning_context',record:'record_minamo_learning_development',revise:'revise_minamo_learning_development',targets:['investigation','journey-stage'],batch:{targets:4,intent:'multiTargetRequested:true',localDependencyAliases:'operationId:1 through operationId:4 resolve to bounded stable event identities'},evidence:{facts:20,refsPerFact:8,uniqueSavedRevisionsPerCheckpoint:8,perspectiveDependencies:40},intent:'Explicit owner checkpoints only. No sessions, automatic checkpoints or per-turn logs.'}},
 authoring:{manuscript:{publish:'publish_minamo_manuscript',preview:'preview_minamo_manuscript',source:'read_minamo_manuscript_source',version:1,documents:16,bytes:220000,stages:'H2 headings; optional authored Intent:/Outcome:/Checkpoint: paragraphs.',localLinks:'[label](minamo:document-key); exact existing family:id must be declared in existing.',limits:'Creation by default. Whole-document replacement requires target family/id/rev and a matching declared targeted-update. No paid inference.'},policy:'get_minamo_editorial_policy',policyVersion:'minamo-editorial-2026-10-27.1',packagePreview:'preview_minamo_authoring_package',packageApply:'apply_minamo_authoring_package',packageLimits:{records:16,relationships:64,bytes:220000},packageAtomic:true,canonicalStructuredInput:'Omitted text derives from declared table/diagram/image/media metadata; explicit mismatches reject. Substantial GPT learning publication requires current policy package preflight.',command:'apply_minamo_command',preview:'preview_minamo_command',targetedField:'command.data.patch',updateOnly:true,expectedRevisionRequired:true,operations:['patchBlock','insertBlock','removeBlock','setRelations','upsertRelation','removeRelation','upsertConcept','removeConcept','clearNoteAnchor'],immutableBlockFields:['id','kind'],metadataMerge:['table','callout','reference','image','media'],tableText:'Canonical TSV is derived after header/row edits unless explicitly supplied.',imageText:'Alternative text followed by LF and optional caption; derived after metadata edits unless explicitly supplied.'},
 diagrams:{formats:['flow-v1','state-v1','grid-v1','graph-v1'],nodes:12,edges:20,cycles:'graph-v1 for generic directed graphs; state-v1 for trigger-labelled state transitions',grid:{rows:12,columns:12,cells:144},manuscript:'Typed minamo-diagram JSON or a faithful bounded Mermaid flowchart/state subset; unsupported notation stays code.',legacy:'Plain diagram text remains supported without parsing or invented graph relationships.',presentation:{version:1,modes:['static','explore','guided'],orientation:['auto','TB','BT','LR','RL'],steps:'Guided: 2–20 explicit steps, each id/title/explanation/activeNodes/activeEdges; optional visibleNodes/visibleEdges/nodeLabels/prediction. Edges use authored id or edge-N, zero-based. initialStep resets to the authored initial step.',authoring:'Use minamo-diagram JSON fences in manuscript Markdown. Optional node/edge descriptions and exact reference {family,id,rendition,sectionId?,partId?}. Library guided steps explain states directly without prediction fields or learner questions. No executable content. Preview and publication share validation; diagrams are optional and do not record progress.'}},
 limits:{jsonBytes:220000,patchOperations:40,sections:30,partsPerSection:40,partText:20000,totalPartText:100000,links:30,tableColumns:8,tableRows:40},
 images:{formats:['image/png','image/jpeg','image/webp'],maxBytes:8388608,maxAxis:8192,maxPixels:33554432,maxAssetsPerRecord:16,admission:'Owner-private staged upload plus atomic record attachment; container headers validated, pixels not interpreted.',revocation:'Current eligibility applies to every rendition; unavailable image metadata is withheld.'},
 media:{formats:['application/pdf','text/plain','text/markdown','audio/mpeg','audio/wav','video/mp4','video/webm'],maxBytes:{document:16777216,audio:16777216,video:20971520},maxAssetsPerRecord:16,description:2000,caption:1000,transcript:12000,canonicalText:'Owner-authored description, optional caption and optional transcript joined by LF. Media bytes are not decoded as canonical text.',binaryDelivery:'Authenticated byte ranges; documents download, audio/video require explicit browser load.',interpretation:'No OCR, transcription, pixel/audio interpretation or successful playback is claimed.'},
 concepts:{kinds:['concept','python-function','shell-command','api','language-syntax'],metadata:['signature','usage','environment','examplePartId'],limits:CONCEPT_LIMITS,store:'Revisioned catalogue sidecar for current Article references; raw legacy concepts remain in retained content identities',defaultCaseSensitive:true,caseInsensitive:'Explicit ASCII-only folding; Unicode code points and symbols are preserved.',query:'Exact whole term or alias; ambiguity is returned as choices, never resolved by title similarity.',editorialAuthority:'Reads, Flags and matching entries never grant automatic write authority.'},
 excerpts:{maxText:12000,maxSourcesPerRecord:8,admission:'Explicit owner Web attestation only; immutable source edition, no remote fetching.',revocation:'Permanent on this Source identity; all retained reads and captures use current source eligibility.',origin:'Excerpt captures anchor the original Source __excerpt with a separately validated displayReturn.'},
 bookmarks:{targets:['record','passage'],command:'setFlag',stateRead:'POST /api/bookmarks {target}',ordering:'Exact expectedTargetRev with durable off tombstones; retry immutable operation IDs.',externalURLs:false},
 recovery:{format:'minamo-recovery-bundle@2',legacyFormats:['minamo-recovery-bundle@1'],export:'POST /api/recovery/export',import:'POST /api/recovery/import',encryption:'Passphrase PBKDF2-SHA256 100000 iterations and 64KiB authenticated AES-GCM frames; no plaintext download.',fullProductTables:16,fileMaxBytes:94371840,assetMaxBytes:83886080,jsonMaxBytes:67108864,rows:100000,totalMaxBytes:92274688,pageMaxBytes:480000,sourceAuthority:'File content never grants Source permissions; all editions/captures are scrubbed by current export rights.',mediaRestore:'Explicit restoreMediaAttested:true may restore missing validated owned files, while known revocation floors and conflicting current identities remain authoritative.',activation:'Imported files stage a separate generation only. Explicit reviewed activation takes an automatic backup and mutation-watermark CAS.'},
 externalVideo:{manuscript:'minamo-video JSON fence with provider, id, embed:true, label and description; optional transcriptUrl.',providers:['youtube','vimeo'],activation:'No provider iframe, thumbnail or request before explicit activation. Privacy mitigations do not guarantee no cookies.'},
 unsupported:['remote content import','arbitrary HTML','unknown block kinds'],
 clientCompatibility:'This describes the current server. Installed clients may cache an older typed catalogue. Inspect client-visible command.data.patch before using it; otherwise retain the proposal and refresh the client catalogue. Never silently flatten unsupported fields.'
} as const;
export type WorkspaceCommand = { operationId:string;action:'create'|'update'|'trash'|'restore'|'seed'|'setFlag';family?:Family;id?:string;expectedRev?:number;expectedGeneration?:string;target?:FlagTarget;active?:boolean;expectedTargetRev?:number;data?:Partial<RecordData> & {classifyLearningScope?:{expectedScopeRev:number;learningScope:import('./learning-spaces').LearningScope};patch?:ContentPatch[];noteContent?:import('./note-content').NoteContentBlock[]} };
export type ActivityItem={id:string;family:Family;recordId:string;verb:string;actor:Actor;synthetic:boolean;at:string};
export type WorkspaceSnapshot={records:WorkspaceRecord[];activity:ActivityItem[];truncated?:boolean;recordLimit?:number;byteLimit?:number;nextCursor?:string|null};
export type CommandReceipt={operationId:string;status:'committed'|'conflict';bookmark?:BookmarkState;record?:WorkspaceRecord;records?:WorkspaceRecord[];replayed:boolean;recordRef?:RecordLink & {rev:number};recordRefs?:(RecordLink & {rev:number})[];error?:string};
export type Command=WorkspaceCommand;
/** Canonical exact-selection order, shared by the reader and server admission. */
export function canonicalReadingParts(article:WorkspaceRecord):{sectionId:string;part:PassagePart}[]{
 const mapped:{sectionId:string;part:PassagePart}[]=[{sectionId:'__article',part:{id:'__title',kind:'paragraph',text:article.title,joinBefore:'\n'}}];
 if(article.family==='source'&&article.source?.excerpt)mapped.push({sectionId:'__article',part:{id:'__excerpt',kind:'paragraph',text:article.source.excerpt.text,joinBefore:'\n',...(article.source.excerpt.unavailable?{unavailable:true}:{})}});
 const placed=new Set<string>();
 if(article.family==='note'&&article.bodyFormat==='markdown-v1'&&parseNoteImagePlacements(article.body).some(marker=>article.sections?.some(section=>section.parts.some(part=>part.id===marker.partId&&part.kind==='image')))){
  let textIndex=0;for(const segment of noteImageSegments(article.body,(article.sections??[]).flatMap(section=>section.parts))){if(segment.kind==='text'){const text=noteMarkdownText(segment.source);if(text)mapped.push({sectionId:'__article',part:{id:'__body-'+textIndex,kind:'paragraph',text,joinBefore:'\n'}});textIndex++;}else{const section=article.sections!.find(section=>section.parts.some(part=>part.id===segment.part.id))!;mapped.push({sectionId:section.id,part:segment.part});placed.add(segment.part.id);}}
 }else if(article.body)mapped.push({sectionId:'__article',part:{id:'__body',kind:'paragraph',text:article.family==='note'&&article.bodyFormat==='markdown-v1'?noteMarkdownText(article.body):article.body,joinBefore:'\n'}});
 for(const section of article.sections??[]){const parts=section.parts.filter(part=>!placed.has(part.id));if(!parts.length&&section.parts.length)continue;mapped.push({sectionId:section.id,part:{id:'__heading',kind:'paragraph',text:section.title,joinBefore:'\n'}});for(const part of parts)mapped.push({sectionId:section.id,part});}
 if(article.activity)for(const block of article.activity.blocks){if(block.kind==='instruction'||block.kind==='prediction'||block.kind==='reflection')mapped.push({sectionId:'activity',part:{id:block.id,kind:'paragraph',text:block.text,joinBefore:'\n'}});if(block.kind==='practice')mapped.push({sectionId:'activity',part:{id:block.id,kind:'paragraph',text:block.exercise.prompt,joinBefore:'\n'}});if(block.kind==='character')mapped.push({sectionId:'activity',part:{id:block.id,kind:'paragraph',text:block.title+'\n'+block.data.character+'\n'+block.data.explanation,joinBefore:'\n'}});if(block.kind==='scenario')mapped.push({sectionId:'activity',part:{id:block.id,kind:'paragraph',text:block.scenario.title+'\n'+block.scenario.introduction,joinBefore:'\n'}});if(block.kind==='source-browser')block.bundle.files.forEach((file,i)=>mapped.push({sectionId:'activity',part:{id:`${block.id}-file-${i}`,kind:'code',text:file.text,language:block.bundle.runtime,joinBefore:'\n'}}));if(block.kind==='foundry')mapped.push({sectionId:'activity',part:{id:`${block.id}-source`,kind:'code',text:block.artefact.canonical.source,language:block.artefact.canonical.format,joinBefore:'\n'}});}
 if((article.family==='run'||article.family==='experiment')&&article.code)mapped.push({sectionId:'__article',part:{id:'__code',kind:'code',text:article.code,language:article.engine??'text',joinBefore:'\n'}});
 if(article.family==='run'&&article.output)mapped.push({sectionId:'__article',part:{id:'__output',kind:'code',text:article.output,language:'text',joinBefore:'\n'}});
 return mapped;
}
/** Compatibility alias for retained article readers. */
export const canonicalArticleParts=canonicalReadingParts;

/** Learning work is explicit checkpointed evidence, independent of canonical reading. */
export type LearningWorkTarget={kind:'investigation';investigationId:string}|{kind:'journey-stage';journeyId:string;stageId:string};
export type EvidenceRef={kind:'record';family:'note'|'source'|'run'|'article';id:string;rev:number;rendition?:string}|{kind:'repository';url:string;commit:string}|{kind:'owner-statement';text:string};
export type LearningFact={role:'prediction'|'attempt'|'reported-observation'|'misconception'|'correction'|'interpretation'|'open-question';text:string;basis:'learner-reported'|'supplied-artifact'|'minamo-observed'|'gpt-interpretation'|'provisional'|'illustrative';refs?:EvidenceRef[]};
export type LearningDecision={choice:string;reason:string;status:'provisional'|'established';basis:LearningFact['basis'];refs?:EvidenceRef[]};
export type LearningDevelopment={id:string;schemaVersion:1;primaryTarget:LearningWorkTarget;targetRenditionAtRecording:string;targetRevAtRecording:number;summary:string;kind:'learning-update'|'question'|'correction'|'interpretation';facts:LearningFact[];decisions?:LearningDecision[];nextAction?:string;relatedContexts?:{target:LearningWorkTarget|{kind:'library';articleId:string;sectionId?:string};relevance:'explicit'|'accepted-relation';reason?:string}[];noteRefs?:{id:string;rev:number;purpose:string}[];nextQuestions:string[];supersedesId?:string;author:Actor;createdAt:string;revisedAt?:string;revision:number;operationId:string;withdrawn?:boolean;synthetic:boolean;evidenceUnavailable?:boolean;detailsDeferred?:boolean;noteEvidence?:{id:string;rev:number;purpose:string;rendition:string;destination:string}[]};
export type LearningPerspective={revision:number;summary:string;dependencies:{id:string;revision:number}[];updatedAt:string;stale?:boolean;detailsDeferred?:boolean};
