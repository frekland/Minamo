import {validateLearningScope} from './learning-spaces';
import {admitSemanticContent,semanticCanonicalText} from './semantic-content';
import {compileReadingCues,ReadingCueError} from './reading-cue-compiler';
import {compileMermaidSubset} from './diagram-notation';
import {externalVideoDeclaration} from './external-media';
import {preserveManuscriptIdentity} from './manuscript-identity';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import {inspectManuscriptSubmission,ManuscriptIntakeError} from './manuscript-intake';
import {DomainError,authoringDomain,readRecord,queryRecords} from './domain';
import {generationContext,requireGeneration} from './generations';
import {applyAuthoringPackage,previewAuthoringPackage,type AuthoringPackage} from './authoring-package';
import {EDITORIAL_POLICY_VERSION} from './editorial-policy';
import {diagramError,diagramCanonicalText} from './diagrams';
import {buildRecordLink,MINAMO_SITE_ORIGIN} from './reading-links';
import type {Actor,ArticleSection,PassagePart,RecordLink,WorkspaceRecord} from './contracts';

type Warning={code:string;documentKey:string;message:string;start?:number;end?:number;severity?:'advisory';path?:string;remediation?:string};
type Span={start:number;end:number;kind:'strong'|'emphasis'|'code'|'link';url?:string};
type Node={type:string;value?:string;url?:string;lang?:string;depth?:number;ordered?:boolean;start?:number;checked?:boolean|null;identifier?:string;children?:Node[];position?:{start:{offset?:number};end:{offset?:number}}};
const parser=unified().use(remarkParse).use(remarkGfm);
const object=(x:unknown):x is Record<string,any>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const identity=(x:unknown)=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(x);
function unknownFields(value:Record<string,unknown>,allowed:string[],path:string){
 const unknown=Object.keys(value).find(key=>!allowed.includes(key));
 if(unknown!==undefined)throw new DomainError(400,'invalid_manuscript_shape',
  'Unsupported field '+path+'.'+unknown+'. Allowed fields: '+allowed.join(', ')+'. Keep the original input, remove or move only this unsupported field, and retry the same immutable operation ID only if no operation committed. No content was discarded.',path+'.'+unknown);
}
function admit(input:unknown){
 if(!object(input))throw new DomainError(400,'invalid_manuscript_request','Use an object with purpose, operationId, expectedGeneration and manuscript.','request');
 unknownFields(input,['purpose','operationId','expectedGeneration','manuscript','existing','synthetic','detail'],'request');
 if(!identity(input.operationId)||typeof input.expectedGeneration!=='string'||!input.expectedGeneration||typeof input.purpose!=='string'||!input.purpose.trim()||input.purpose.length>500||input.synthetic!==undefined&&typeof input.synthetic!=='boolean'||input.detail!==undefined&&typeof input.detail!=='boolean')throw new DomainError(400,'invalid_manuscript_request','Use purpose (1–500 characters), an immutable operationId (1–160 safe ID characters), exact expectedGeneration and complete manuscript. Optional synthetic/detail are booleans. No write occurred.');
 if(!object(input.manuscript))throw new DomainError(400,'invalid_manuscript_shape','manuscript must contain version:1, brief and documents. No write occurred.','manuscript');
 unknownFields(input.manuscript,['version','brief','documents'],'manuscript');
 if(Array.isArray(input.manuscript.documents))for(const [i,d] of input.manuscript.documents.entries()){
  if(!object(d))throw new DomainError(400,'invalid_manuscript_shape','Each manuscript document is an object with role and markdown. No write occurred.','manuscript.documents['+i+']');
  unknownFields(d,['key','role','title','markdown','target','catalogue','learningScope'],'manuscript.documents['+i+']');
  if(d.learningScope!==undefined)try{validateLearningScope(d.learningScope)}catch(error){if(error instanceof DomainError)error.path='manuscript.documents['+i+'].learningScope'+(error.code==='invalid_learning_language'?'.languages':'');throw error;}
 }
 let inspected;try{inspected=inspectManuscriptSubmission(input.manuscript)}catch(e){if(e instanceof ManuscriptIntakeError)throw new DomainError(400,e.code,e.message,e.path);throw e;}
 if(inspected.documents.length>16)throw new DomainError(413,'manuscript_document_budget','One atomic publication supports at most 16 documents. Keep the full source; split into deliberate related publications rather than truncating.');
 if(new TextEncoder().encode(JSON.stringify(input)).length>220000)throw new DomainError(413,'payload_too_large','The complete request exceeds 220 KB; nothing was truncated.');
 if(input.existing!==undefined&&(!Array.isArray(input.existing)||input.existing.length>40))throw new DomainError(400,'invalid_existing','Use at most 40 exact existing references.');
 for(const e of input.existing??[])if(!object(e)||Object.keys(e).some(k=>!['family','id','rev','purpose'].includes(k))||!['article','journey','area','investigation'].includes(e.family)||!identity(e.id)||!Number.isSafeInteger(e.rev)||e.rev<1||!['reuse','targeted-update'].includes(e.purpose))throw new DomainError(400,'invalid_existing','Existing coverage needs an exact family, ID, revision and purpose.');
 for(const [i,doc] of input.manuscript.documents.entries())if(doc.target!==undefined){const t=doc.target;if(!object(t)||Object.keys(t).some(k=>!['family','id','rev'].includes(k))||t.family!==doc.role||!identity(t.id)||!Number.isSafeInteger(t.rev)||t.rev<1||!input.existing?.some((e:any)=>e.family===t.family&&e.id===t.id&&e.rev===t.rev&&e.purpose==='targeted-update'))throw new DomainError(400,'explicit_update_required','A replacement manuscript needs an exact same-role target and matching targeted-update existing revision. No title matching is performed.','manuscript.documents['+i+'].target');}
 for(const e of input.existing??[])if(e.purpose==='targeted-update'&&!input.manuscript.documents.some((d:any)=>d.target?.family===e.family&&d.target?.id===e.id&&d.target?.rev===e.rev))throw new DomainError(400,'explicit_update_required','Declare the exact document target for a targeted update.','existing');
 return {input,inspected};
}
function safeURL(value:string){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!/[\u0000-\u0020\u007f]/.test(value)&&value.length<=2048}catch{return false}}
export async function compileManuscript(input:unknown,previousByKey:Map<string,WorkspaceRecord>=new Map()){
 const admitted=admit(input),{inspected}=admitted,request=admitted.input,warnings:Warning[]=[];
 const refs=new Map<string,{family:any;id:string}>();
 for(const [i,doc] of inspected.documents.entries())refs.set(doc.key,{family:doc.role,id:request.manuscript.documents[i].target?.id??('ms-'+(await authoringDomain.hash({operationId:request.operationId,key:doc.key})).slice(0,40))});
 const records:AuthoringPackage['records']=[];const sourceMap:Record<string,unknown[]>={};const explanatoryParts=new WeakSet<PassagePart>();
 for(const doc of inspected.documents){
  const ast=parser.parse(doc.source) as Node,definitions=new Map<string,Node>();
  for(const node of ast.children??[])if(node.type==='definition'&&node.identifier)definitions.set(node.identifier.toLowerCase(),node);
  const warn=(code:string,message:string,node?:Node)=>warnings.push({code,documentKey:doc.key,message,...(node?.position?{start:node.position.start.offset,end:node.position.end.offset}:{})});
  for(const w of doc.diagnostics)warn(w.code,w.message);
  const raw=(node:Node)=>doc.source.slice(node.position?.start.offset??0,node.position?.end.offset??doc.source.length);
  let section:ArticleSection|undefined;const sections:ArticleSection[]=[],authoredSections=new Set<ArticleSection>(),links:RecordLink[]=[],maps:unknown[]=[];let partNumber=0;
  type StageField='intent'|'outcome'|'checkpoint';
  const declarations=new Map<ArticleSection,Map<StageField,{value:string;node:Node}[]>>();
  let pendingDeclaration:{section:ArticleSection;field:StageField;node:Node}|undefined;let metadataSuppressed=false;
  const declare=(field:StageField,value:string,node:Node)=>{const s=ensure(),fields=declarations.get(s)??new Map();fields.set(field,[...(fields.get(field)??[]),{value:value.trim(),node}]);declarations.set(s,fields);};
  // Only explicit author labels are projected. Code and quotations never declare stage metadata.
  const paragraphDeclarations=(node:Node,value:string)=>{
   if(doc.role!=='journey'||metadataSuppressed)return;
   const labels=[...value.matchAll(/(?:^|\n)\s*(?:(?:•|[0-9]+\.)\s+)?(Intent|Outcome|Checkpoint):[ \t]*/gi)];
   if(labels.length)pendingDeclaration=undefined;
   if(pendingDeclaration){const pending=pendingDeclaration;pendingDeclaration=undefined;if(pending.section===ensure()){declare(pending.field,value,pending.node);return;}}
   for(const [i,label] of labels.entries()){const field=label[1].toLowerCase() as StageField,body=value.slice((label.index??0)+label[0].length,labels[i+1]?.index??value.length).trim();if(body)declare(field,body,node);else pendingDeclaration={section:ensure(),field,node};}
  };
  const ensure=()=>section??(section={id:'s'+(sections.length+1),title:'Introduction',parts:[]},sections.push(section),section);
  const inline=(nodes:Node[],prefix='',context=true):{text:string;inline:Span[]}=>{
   let text=prefix;const spans:Span[]=[];
   const visit=(node:Node)=>{
    const start=text.length;
    if(node.type==='text'||node.type==='inlineCode')text+=node.value??'';
    else if(node.type==='break')text+='\n';
    else if(['strong','emphasis','link','linkReference'].includes(node.type)){
     const target=node.type==='linkReference'?definitions.get(String(node.identifier).toLowerCase())?.url:node.url;
     for(const c of node.children??[])visit(c);
     if(node.type==='link'||node.type==='linkReference'){
      if(target?.startsWith('minamo:')){
       const key=target.slice(7),ref=refs.get(key)??(request.existing??[]).find((e:any)=>key===e.family+':'+e.id);
       if(!ref)throw new DomainError(400,'manuscript_link_unresolved','Use an exact local document key or declared family:id; no title matching is performed.',doc.key);
       const current=context?ensure():undefined,url=MINAMO_SITE_ORIGIN+buildRecordLink(ref);spans.push({start,end:text.length,kind:'link',url});
       if(!links.some(l=>l.id===ref.id&&l.family===ref.family&&l.sourceContext?.sectionId===current?.id))links.push({family:ref.family,id:ref.id,relationId:'link'+(links.length+1),...(current?{sourceContext:{sectionId:current.id,...(doc.role==='journey'?{stageId:'stage-'+current.id}:{})}}:{}),relation:'related',reason:text.slice(start)});
      }else if(target&&safeURL(target))spans.push({start,end:text.length,kind:'link',url:target});
      else{ text= text.slice(0,start)+raw(node);for(let i=spans.length-1;i>=0;i--)if(spans[i].start>=start)spans.splice(i,1);warn('unsafe_or_unresolved_link','This link is retained literally without navigation.',node); }
     }else spans.push({start,end:text.length,kind:node.type as 'strong'|'emphasis'});
    }else{ text+=raw(node);warn('unsupported_inline','Unsupported inline source is retained visibly and safely.',node); }
    if(node.type==='inlineCode'&&text.length>start)spans.push({start,end:text.length,kind:'code'});
   };
   for(const node of nodes)visit(node);
   return {text,inline:spans.filter(s=>s.end>s.start)};
  };
  const add=(node:Node,part:Omit<PassagePart,'id'>)=>{const s=ensure();if(part.text.trim()){const id='p'+(++partNumber);const authored={id,...part};s.parts.push(authored);if(node.type==='paragraph')explanatoryParts.add(authored);maps.push({sectionId:s.id,partId:id,start:node.position?.start.offset,end:node.position?.end.offset});}};
  const paragraph=(node:Node,prefix='')=>{const value=inline(node.children??[],prefix);add(node,{kind:'paragraph',...value,...(!value.inline.length?{inline:undefined}:{})});paragraphDeclarations(node,value.text);};
  const firstHeading=(ast.children??[]).find(n=>n.type==='heading'&&n.depth===1);
  const explicitTitle=request.manuscript.documents[inspected.documents.indexOf(doc)].title;
  const title=explicitTitle??(firstHeading?inline(firstHeading.children??[],'',false).text:null)??doc.key;
  // Title text is a projection, never an inferred educational outcome.
  const displayTitle=title;
  // Only root paragraphs in the introduction can declare an Investigation question.
  // Walking the root (rather than rendered blocks) excludes nested examples by construction.
  const questions:{value:string;node:Node}[]=[];
  if(doc.role==='investigation')for(const node of ast.children??[]){
   if(node.type==='heading'){if(node===firstHeading)continue;break;}
   if(node.type!=='paragraph'||node.children?.[0]?.type!=='text'||!/^Question:/i.test(node.children[0].value??''))continue;
   const visible=(n:Node):string=>n.type==='text'||n.type==='inlineCode'?n.value??'':n.type==='break'?'\n':n.children?.map(visible).join('')??raw(n);
   questions.push({value:visible(node).replace(/^Question:[ \t]*/i,'').trim(),node});
  }
  const questionWarning=(code:string,message:string,node:Node,remediation:string)=>warnings.push({code,documentKey:doc.key,message,severity:'advisory',path:'manuscript.documents['+inspected.documents.indexOf(doc)+'].markdown',remediation,...(node.position?{start:node.position.start.offset,end:node.position.end.offset}:{})});
  let explicitQuestion:string|undefined;
  if(questions.length){
   const invalid=questions.find(q=>!q.value||q.value.length>1000),unique=[...new Set(questions.map(q=>q.value))];
   if(invalid)questionWarning('invalid_investigation_question','An explicit Question declaration is empty or exceeds 1000 UTF-16 characters. The title is used as the safe fallback; the complete source remains retained.',invalid.node,'Use one dedicated Question: paragraph containing 1–1000 characters in the introduction before any section heading. Do not put its value in the next paragraph.');
   else if(unique.length!==1)questionWarning('conflicting_investigation_question','Introduction Question declarations conflict. The title is used as the safe fallback; no declaration wins and all source remains retained.',questions[0].node,'Review the introduction Question: paragraphs and retain one intended question, or make repeated declarations identical.');
   else{explicitQuestion=unique[0];if(questions.length>1)questionWarning('repeated_investigation_question','Identical introduction Question declarations project one question; all source remains retained.',questions[1].node,'Keep one Question: paragraph when the repetition is unnecessary.');}
  }
  const block=(node:Node,prefix='')=>{
   if(node.type==='heading'){
    pendingDeclaration=undefined;
    if(node===firstHeading)return;
    const value=inline(node.children??[],'',false);
    if(node.depth===2){section={id:'s'+(sections.length+1),title:value.text,parts:[]};sections.push(section);authoredSections.add(section);return;}
    if(doc.role==='journey'&&!metadataSuppressed){const label=/^(Intent|Outcome|Checkpoint):?$/i.exec(value.text.trim());if(label)pendingDeclaration={section:ensure(),field:label[1].toLowerCase() as StageField,node};}
    add(node,{kind:'paragraph',text:value.text,inline:[...value.inline,...(value.inline.some(s=>s.kind==='strong'&&s.start===0&&s.end===value.text.length)?[]:[{start:0,end:value.text.length,kind:'strong' as const}])]});
   }else if(node.type==='paragraph')paragraph(node,prefix);
   else if(node.type==='code'){
    pendingDeclaration=undefined;
    if(['minamo-semantic','minamo-math','minamo-language'].includes(node.lang??'')){
     try{const decoded=JSON.parse(node.value??'');const input=node.lang==='minamo-semantic'?decoded:node.lang==='minamo-math'?{contract:'minamo.semantic.v1',kind:'math',expression:decoded}:{contract:'minamo.semantic.v1',kind:'ruby',language:decoded};if(input.kind==='ruby')input.language=compileReadingCues(input.language).language;const semantic=admitSemanticContent(input);add(node,{kind:semantic.kind==='math'?'code':'paragraph',text:semanticCanonicalText(semantic),semantic,...(semantic.kind==='math'?{language:'tex'}:{language:semantic.language.language})});return;}catch(error){if(error instanceof ReadingCueError)for(const d of error.diagnostics)warn(d.code,d.path+': '+d.message+' Candidates: '+JSON.stringify(d.candidates),node);warn('semantic_fallback','Invalid explicit semantic declaration remains literal code. '+(error instanceof Error?error.message:'Use valid semantic JSON.'),node);}
    }
    if(node.lang==='minamo-video'){
     try{const video=externalVideoDeclaration(JSON.parse(node.value??''));add(node,{kind:'reference',...video});return;}catch{warn('video_fallback','Unsupported external video declaration remains exact code. Use an explicit provider, exact ID, embed:true, label and description.',node);}
    }
    if(['graph-v1','flow-v1','state-v1','grid-v1','minamo-diagram'].includes(node.lang??'')){
     try{const diagram=JSON.parse(node.value??'');const error=diagramError(diagram);if(error){if(diagram.presentation!==undefined)throw new DomainError(400,'invalid_diagram',error);throw Error(error);}add(node,{kind:'diagram',diagram,text:diagramCanonicalText(diagram)});return;}catch(error){if(error instanceof DomainError)throw error;warn('diagram_fallback','Unsupported or invalid diagram remains original code. '+(error instanceof Error?error.message:'Use valid bounded diagram JSON.'),node);}
    }else if(node.lang==='mermaid'){const diagram=compileMermaidSubset(node.value??'');if(diagram){add(node,{kind:'diagram',diagram,text:diagramCanonicalText(diagram)});return;}warn('diagram_fallback','Unsupported Mermaid source is retained exactly as code; use the documented safe subset or explicit native diagrams.',node);}
    add(node,{kind:'code',language:(node.lang??'text').slice(0,40),text:node.value??''});
   }else if(node.type==='list'){
    let i=node.start??1;for(const item of node.children??[]){let first=true;for(const child of item.children??[]){block(child,first?prefix+(node.ordered?String(i++)+'. ':'• ')+(item.checked===true?'[x] ':item.checked===false?'[ ] ':''):prefix+'  ');first=false;}}
   }else if(node.type==='blockquote'){
    pendingDeclaration=undefined;const wasSuppressed=metadataSuppressed;metadataSuppressed=true;
    for(const child of node.children??[])if(child.type==='paragraph'){const value=inline(child.children??[]);add(child,{kind:'callout',callout:{tone:'note'},...value});}else block(child);
    metadataSuppressed=wasSuppressed;pendingDeclaration=undefined;
   }else if(node.type==='table'){
    pendingDeclaration=undefined;
    const cells=(node.children??[]).map(row=>(row.children??[]).map(cell=>inline(cell.children??[])));
    const table={headers:cells[0]?.map(c=>c.text)??[],rows:cells.slice(1).map(row=>row.map(c=>c.text))};
    let offset=0;const spans:Span[]=[];for(let ri=0;ri<cells.length;ri++){for(let ci=0;ci<cells[ri].length;ci++){const c=cells[ri][ci];spans.push(...c.inline.map(s=>({...s,start:s.start+offset,end:s.end+offset})));offset+=c.text.length+(ci<cells[ri].length-1?1:0);}if(ri<cells.length-1)offset++;}
    add(node,{kind:'table',table,text:[table.headers.join('\t'),...table.rows.map(r=>r.join('\t'))].join('\n'),...(spans.length?{inline:spans}:{})});
   }else if(node.type==='definition'){
    // A reference definition's URL is preserved in its resolved inline link; raw source remains archived.
   }else{add(node,{kind:'paragraph',text:raw(node)});warn('unsupported_block','Unsupported source remains visible as literal text.',node);}
  };
  for(const node of ast.children??[])block(node);
  if(!sections.length)sections.push({id:'s1',title:'Reading',parts:[{id:'p1',kind:'paragraph',text:doc.source}]});
  for(const s of sections)if(!s.parts.length)warn('empty_section','A heading has no explanation; check the saved content.');
  const scope=request.manuscript.documents[inspected.documents.indexOf(doc)].learningScope;
  const data:any={title:displayTitle,body:'',sections,links,...(scope!==undefined?{learningScope:validateLearningScope(scope)}:{}),...(request.synthetic?{synthetic:true}:{})};
  if(doc.role==='journey')data.learningShape={version:1,kind:'journey',stages:(authoredSections.size?sections.filter(s=>authoredSections.has(s)):sections).map(s=>{
   const stage:any={id:'stage-'+s.id,sectionId:s.id,title:s.title};
   for(const [field,values] of declarations.get(s)??[]){
    const unique=[...new Set(values.map(v=>v.value))];
    if(unique.length!==1){warn('conflicting_stage_metadata','The stage has conflicting explicit '+field+' declarations; this field is omitted rather than choosing a winner.',values[0].node);continue;}
    if(!unique[0]||unique[0].length>1000){warn('invalid_stage_metadata','The explicit '+field+' declaration must contain 1–1000 characters; its exact content is retained.',values[0].node);continue;}
    stage[field]=unique[0];if(field==='outcome'&&/\?\s*$/.test(unique[0]))warn('outcome_is_question','The declared outcome is a question. Review it as an intended result rather than claiming semantic validation.',values[0].node);
   }
   const missing=['intent','outcome','checkpoint'].filter(field=>!stage[field]);if(missing.length)warn('missing_stage_metadata','Stage "'+s.title+'" has no unambiguous explicit '+missing.join(', ')+'. Content remains exact; instructional meaning is not inferred.');
   return stage;
  })};
  if(doc.role==='investigation')data.learningShape={version:2,kind:'investigation',question:explicitQuestion??displayTitle};
  if(doc.role==='article')data.learningShape={version:1,kind:'library-topic',subject:displayTitle,reusableBeyondProject:true};
  if(doc.role==='area')data.learningShape={version:1,kind:'area',subject:displayTitle,categoryPurpose:displayTitle};
  const target=request.manuscript.documents[inspected.documents.indexOf(doc)].target;
  const previous=previousByKey.get(doc.key);
  // A wording-only revision need not repeat separately authored question metadata.
  // An explicit (even invalid) declaration is an intentional replacement attempt.
  if(doc.role==='investigation'&&!questions.length&&previous?.learningShape?.kind==='investigation'&&previous.learningShape.question!==previous.title)data.learningShape.question=previous.learningShape.question;
  if(previous){preserveManuscriptIdentity(previous,data,maps);if(previous.learningShape?.kind==='library-topic'&&doc.role==='article')data.learningShape=previous.learningShape;}
  if(doc.role==='journey'){
   // New authored H2 headings define the route. Rich preamble remains canonical
   // overview reading, while a previously stored intro-stage keeps its identity.
   if(previous?.learningShape?.kind==='journey'&&authoredSections.size){const prospective=data.learningShape.stages;data.learningShape.stages=sections.flatMap(s=>{const authored=prospective.find((stage:any)=>stage.sectionId===s.id);if(authored)return [authored];const legacy=!authoredSections.has(s)&&previous.learningShape?.kind==='journey'?previous.learningShape.stages.find(stage=>stage.sectionId===s.id):undefined;return legacy?[structuredClone(legacy)]:[];});}
   for(const link of links)if(link.sourceContext?.sectionId){const stage=data.learningShape.stages.find((s:any)=>s.sectionId===link.sourceContext!.sectionId);if(stage)link.sourceContext.stageId=stage.id;else delete link.sourceContext.stageId;}
  }
  const intent=request.manuscript.documents[inspected.documents.indexOf(doc)].catalogue;
  let catalogue:any;
  if(intent!==undefined){
   if(doc.role!=='article'||!object(intent)||Object.keys(intent).some(k=>!['summary','areas','references','expectedRev'].includes(k))||intent.summary!==undefined&&(typeof intent.summary!=='string'||intent.summary.length>1000)||intent.areas!==undefined&&(!Array.isArray(intent.areas)||intent.areas.length>30)||intent.references!==undefined&&(!Array.isArray(intent.references)||intent.references.length>40)||intent.expectedRev!==undefined&&(!Number.isSafeInteger(intent.expectedRev)||intent.expectedRev<0))throw new DomainError(400,'invalid_catalogue_intent','Catalogue intentions belong to Articles and contain bounded summary, areas and reference declarations.',doc.key);
   catalogue={...(intent.summary!==undefined?{summary:intent.summary}:{}),...(intent.expectedRev!==undefined?{expectedRev:intent.expectedRev}:{})};
   if(intent.references!==undefined)catalogue.references=intent.references.map((entry:any,i:number)=>{
    if(!object(entry)||Object.keys(entry).some(k=>!['id','term','kind','aliases','definition','signature','usage','environment','caseSensitive','targetHeading','targetPartId','exampleCodeLabel'].includes(k)))throw new DomainError(400,'invalid_catalogue_reference','Use a bounded technical reference declaration.',doc.key);
    const matches=entry.targetHeading===undefined?[sections[0]]:sections.filter(s=>s.title===entry.targetHeading);if(matches.length!==1)throw new DomainError(409,'catalogue_target_ambiguous','Reference heading must identify one exact compiled section.',doc.key);
    const section=matches[0],part=entry.targetPartId?section.parts.find(p=>p.id===entry.targetPartId):undefined;
    if(entry.targetPartId&&!part)throw new DomainError(409,'catalogue_target_unavailable','The declared target part does not exist.',doc.key);
    const examples=entry.exampleCodeLabel?section.parts.filter(p=>p.kind==='code'&&(p.language===entry.exampleCodeLabel||p.text.startsWith(entry.exampleCodeLabel))):[];if(entry.exampleCodeLabel&&examples.length!==1)throw new DomainError(409,'catalogue_target_ambiguous','The example label must identify exactly one code block.',doc.key);
    const {targetHeading,targetPartId,exampleCodeLabel,...fields}=entry;
    return {...fields,id:entry.id??'reference-'+(i+1),aliases:entry.aliases??[],caseSensitive:entry.caseSensitive!==false,sectionId:section.id,...(part?{partId:part.id}:{}),...(examples[0]?{examplePartId:examples[0].id}:{})};
   });
   for(const [i,area] of (intent.areas??[]).entries()){
    if(!object(area)||Object.keys(area).some(k=>!['ref','reason'].includes(k))||typeof area.ref!=='string'||typeof area.reason!=='string'||!area.reason.trim()||area.reason.length>1000)throw new DomainError(400,'invalid_catalogue_area','Declare an exact area reference and reason.',doc.key);
    const ref=refs.get(area.ref)??(request.existing??[]).find((e:any)=>area.ref==='area:'+e.id&&e.family==='area');if(!ref||ref.family!=='area'){
     const declared=(request.existing??[]).find((e:any)=>e.family==='area'&&e.id===area.ref);
     const suggestion=declared?'Use catalogue.areas['+i+'].ref '+JSON.stringify('area:'+declared.id)+'; that exact Area revision is already declared.':'For an existing Area, first read its exact current ID/revision, then use catalogue.areas['+i+'].ref:"area:<exact-id>" AND request.existing:[{family:"area",id:"<exact-id>",rev:<current-revision>,purpose:"reuse"}]. A bare ID or prior search alone is insufficient. For an Area in this publication use its exact document key.';
     throw new DomainError(400,'catalogue_area_unresolved',suggestion,'manuscript.documents['+inspected.documents.indexOf(doc)+'].catalogue.areas['+i+'].ref');
    }
    links.push({family:'area',id:ref.id,relationId:'catalogue-area-'+i,relation:'related',reason:area.reason});
   }
  }
  records.push({key:doc.key,family:doc.role,id:refs.get(doc.key)!.id,action:target?'update':'create',expectedRev:target?.rev??0,data,...(catalogue?{catalogue}:{})});sourceMap[doc.key]=maps;
 }
 const bodies=records.map(r=>r.data.sections.map((s:any)=>s.parts.map((p:any)=>p.text).join('\n')).join('\n'));
 bodies.forEach((body,i)=>{for(let j=0;j<i;j++)if(body===bodies[j])warnings.push({code:'repeated_document',documentKey:records[i].key,message:'This document repeats another body verbatim. Reuse its exact link or explain the distinct learning purpose.'});});
 // Structural risk signals, not a substitute for educational judgement or a length/media quota.
 const prose=(p:PassagePart)=>explanatoryParts.has(p)&&['paragraph','callout'].includes(p.kind)&&!!p.text.trim();
 const administrative=/^(?:Discuss with GPT(?:[.:?!]|$)|Ask GPT\b|Checkpoint(?: this)?[.:]|Save (?:this|your) (?:checkpoint|progress|note)\b|Return to (?:the )?(?:Journey|stage)\b|Capture (?:this|a) [Nn]ote\b|Flag (?:this|the) passage\b)/i;
 const contentKey=(parts:PassagePart[])=>parts.map(p=>p.text.trim()).filter(Boolean).join('\n');
 const journeySections=records.filter(r=>r.family==='journey').flatMap(r=>r.data.sections.map((s:ArticleSection)=>({recordKey:r.key,section:s,key:contentKey(s.parts)})));
 for(const [recordIndex,r] of records.entries()){
  const sections=r.data.sections as ArticleSection[],parts=sections.flatMap(s=>s.parts),add=(code:string,message:string,remediation:string,path='records['+recordIndex+'].data.sections')=>warnings.push({code,documentKey:r.key,message,remediation,path,severity:'advisory'});
  const repeated=new Set<string>();for(const p of parts){if(administrative.test(p.text.trim())){const key=p.text.trim();if(repeated.has(key)){add('repeated_tutoring_scaffold','The same administrative tutoring prompt is repeated verbatim.','Keep guidance where it helps the next task and use reusable explanations elsewhere.');break;}repeated.add(key);}}
  if(r.family!=='article')continue;
  const explanation=parts.filter(prose);
  if(!explanation.length)add('reference_without_explanation','This Library reference has no explanatory prose outside headings.','Explain the mechanism and interpretation of examples, or use a precise link to existing coverage. Short references remain allowed.');
  else if(explanation.every(p=>administrative.test(p.text.trim())))add('reference_only_tutoring_scaffold','Every prose block in this Library reference is a recognised tutoring/administration prompt.','Add an independent mechanism explanation or keep these directions in the Journey.');
  for(const [sectionIndex,s] of sections.entries())if(s.parts.some(p=>p.kind==='code')&&!s.parts.some(prose))add('code_without_explanation','Section "'+s.title+'" contains code without an explanatory paragraph.','Explain relevant inputs, behaviour, limits and what to inspect; do not label predicted output as observed.','records['+recordIndex+'].data.sections['+sectionIndex+'].parts');
  const key=contentKey(parts),match=key&&journeySections.find(s=>s.key===key);if(match)add('reference_repeats_journey_section','This Library body exactly repeats section "'+match.section.title+'" in Journey '+match.recordKey+'.','Prefer reusing a genuine independent explanation rather than cloning project directions.');
 }

 const roles:any={journey:'route',investigation:'open-question',article:'canonical-reference',area:'subject-area'};
 const pkg:AuthoringPackage={operationId:request.operationId,expectedGeneration:request.expectedGeneration,records,editorial:{policyVersion:EDITORIAL_POLICY_VERSION,requestPurpose:request.purpose,coverage:{examined:(request.existing??[]).map(({family,id,rev}:any)=>({family,id,rev}))},decisions:records.map(r=>({recordKey:r.key,role:roles[r.family],action:r.action==='update'?'targeted-improve':r.family==='investigation'?'suggest-investigation':'create-distinct',whyNotDuplicate:'Compiler structural role only; this is not a semantic uniqueness certification. Review actual candidate coverage.',distinctEducationalValue:'Author-supplied manuscript; semantic teaching quality remains a separate editorial review.'})),sourcePlan:'link-only-references'}};
 return {...admitted,pkg,warnings,sourceMap};
}
async function existingCandidates(env:Cloudflare.Env,owner:string,compiled:Awaited<ReturnType<typeof compileManuscript>>){
 const results=[];for(const doc of compiled.inspected.documents.slice(0,4)){const query=String(doc.suggestedTitle??'').slice(0,200);if(query){const r=await queryRecords(env,owner,{query,limit:4});results.push({documentKey:doc.key,query,scope:'title-derived-literal-query',notice:'The proposed title supplies this literal query over eligible content. These bounded matches are candidates, not a complete semantic coverage review. Search a relevant topic or exact alias and read promising current sections before deciding whether to reuse, deepen or create.',records:r.records.map(v=>{const prose=v.body||v.sections?.flatMap(s=>s.parts).find(p=>['paragraph','callout'].includes(p.kind)&&!p.unavailable&&!p.excerpt)?.text||'';return {family:v.family,id:v.id,rev:v.rev,title:v.title,rendition:v.rendition,...(prose?{summary:prose.length>280?prose.slice(0,280).trimEnd()+'…':prose,summaryOrigin:'canonical-excerpt'}:{})};}),truncated:r.truncated});}}return results;
}
async function compileForOwner(env:Cloudflare.Env,owner:string,input:unknown,publication=false){
 const admitted=admit(input),previous=new Map<string,WorkspaceRecord>();
 for(const [index,doc] of admitted.input.manuscript.documents.entries())if(doc.target){const record=await authoringDomain.rawReadRecord(env,owner,doc.target.family,doc.target.id);if(!record||record.rev!==doc.target.rev)throw new DomainError(409,'coverage_changed','A targeted manuscript changed or is unavailable. Read its current eligible source before replacing it.');previous.set(admitted.inspected.documents[index].key,record);}
 const {detail,...authored}=admitted.input;return compileManuscript(publication?authored:input,previous);
}
export async function previewManuscript(env:Cloudflare.Env,owner:string,input:unknown,actor:Actor='gpt'){
 const c=await compileForOwner(env,owner,input),detail=c.input.detail===true;const preview=await previewAuthoringPackage(env,owner,{...c.pkg,detail},actor,{manuscript:c.input,warnings:c.warnings,sourceMap:c.sourceMap});return {...preview,kind:'manuscript-v1',warnings:c.warnings,...(detail?{sourceMap:c.sourceMap}:{}),coverageCandidates:await existingCandidates(env,owner,c),detailAvailable:!detail,sourceArchive:'Preview only; source and records are persisted together only on publish. Use detail:true only when inspecting the full proposed canonical content and source map.'};
}
export async function publishManuscript(env:Cloudflare.Env,owner:string,input:unknown,actor:Actor='gpt'){
 // A replacement's expected revision is necessarily old after it commits. Resolve the
 // immutable operation before revalidating current targets, just like the shared writer.
 // detail is a preview preference and never part of the publication identity.
 const admitted=admit(input),{detail,...immutable}=admitted.input,ctx=generationContext(env);
 if(ctx)requireGeneration(ctx,immutable.expectedGeneration);
 const digest=await authoringDomain.hash({kind:'manuscript-v1',request:immutable});
 const replay=async()=>{
  const previous=await authoringDomain.db(env).prepare('SELECT hash,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,immutable.operationId).first<{hash:string;response:string}>();
  if(!previous)return null;
  if(previous.hash!==digest)throw new DomainError(409,'idempotency_mismatch','This manuscript operation ID belongs to a different immutable request. Keep the original payload and inspect read_minamo_operation; do not reuse this ID for new work.');
  return {...JSON.parse(previous.response),replayed:true};
 };
 const previous=await replay();if(previous)return previous;
 try{const c=await compileForOwner(env,owner,immutable,true);return await applyAuthoringPackage(env,owner,c.pkg,actor,{manuscript:c.input,warnings:c.warnings,sourceMap:c.sourceMap});}
 catch(error){const committed=await replay();if(committed)return committed;throw error;}
}
export async function readManuscriptEdition(env:Cloudflare.Env,owner:string,operationId:string){
 if(!identity(operationId))throw new DomainError(400,'invalid_operation','Use the exact manuscript operation ID.');
 const row=await authoringDomain.db(env).prepare('SELECT digest,source,refs,created_at FROM v2_manuscript_editions WHERE owner=? AND id=?').bind(owner,operationId).first<{digest:string;source:string;refs:string;created_at:string}>();
 if(!row)throw new DomainError(404,'manuscript_source_unavailable','This owner-scoped source edition is unavailable.');
 const refs=JSON.parse(row.refs),states=[];
 for(const ref of refs){const record=await readRecord(env,owner,ref.family,ref.id);if(record)states.push({...ref,currentRev:record.rev,stillCurrent:record.rev===ref.rev&&record.rendition===ref.rendition});}
 if(!states.length)throw new DomainError(404,'manuscript_source_unavailable','No member of this owner-scoped source edition is currently available.');
 const original=JSON.parse(row.source),partial=states.length!==refs.length;
 // A shared brief can contain unavailable siblings' text. Project only surviving
 // documents, and retain their original normalized keys when their positions move.
 const keys=new Set(states.map(ref=>ref.key));
 const manuscript=partial?{version:original.version,brief:'Partial source edition: shared brief withheld because one or more publication members are unavailable.',documents:original.documents.flatMap((doc:any,index:number)=>{const key=doc.key??'document-'+(index+1);return keys.has(key)?[{...doc,key}]:[];})}:original;
 return {operationId,kind:'manuscript-v1',digest:row.digest,createdAt:row.created_at,manuscript,recordRefs:states,sourceProjection:{partial,omittedDocumentCount:refs.length-states.length,digestScope:'complete-immutable-edition',sharedBriefWithheld:partial},label:partial?'Partial original authored source for currently eligible members. The digest identifies the complete retained edition, not this projection.':'Immutable original authored source, not a claim that later canonical edits are reflected here.'};
}
