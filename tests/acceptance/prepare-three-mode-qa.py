#!/usr/bin/env python3
"""Compose an explicitly synthetic QA checkout outside production source.

Usage: python tests/acceptance/prepare-three-mode-qa.py --research ../pr33 --output ../qa
--research is the unmodified PR33 working laboratory checkout. No network or Git writes.
"""
from pathlib import Path
import argparse, json, shutil, subprocess

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source',type=Path,default=Path(__file__).resolve().parents[2])
parser.add_argument('--research',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args(); source=args.source.resolve(); research=args.research.resolve(); output=args.output.resolve()
if source==output or source in output.parents or output in source.parents:
    parser.error('QA output and implementation source must be separate, disjoint checkouts.')
if research==output or research in output.parents or output in research.parents:
    parser.error('QA output and research source must be separate, disjoint checkouts.')
required=['app/layout-lab.tsx','app/api/layout-lab/[...path]/route.ts','lib/layout-lab-fixture.ts','lib/layout-lab-raw.d.ts']
for name in required:
    if not (research/name).is_file(): parser.error('Missing PR33 fixture source: '+name)
# Git includes tracked and new implementation files but excludes ignored environment,
# dependencies, local DBs and runtime profiles. Explicit guards reject secret files too.
result=subprocess.run(['git','ls-files','-co','--exclude-standard','-z'],cwd=source,check=True,capture_output=True)
paths=sorted(set(result.stdout.decode().split('\0'))-{''})
paths=[name for name in paths if not any(part.startswith(('.env','.dev.vars')) or part.endswith('.pem') for part in Path(name).parts)]
output.mkdir(parents=True,exist_ok=True)
manifest=output/'.acceptance-source-files.json'
prior=json.loads(manifest.read_text()) if manifest.exists() else []
for name in set(prior)-set(paths):
    path=(output/name).resolve()
    if output in path.parents and path.is_file():path.unlink()
for name in paths:
    original=source/name
    if not original.is_file():continue
    target=output/name;target.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(original,target)
if not (output/'node_modules').exists():
    if not (source/'node_modules').is_dir():parser.error('Install the implementation locked dependencies first.')
    # Read-only build inputs shared by hard link; source files are separate copies.
    subprocess.run(['cp','-al',str(source/'node_modules'),str(output/'node_modules')],check=True)
for name in required:
    target=output/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(research/name,target)
path=output/'app/layout-lab.tsx'
harness=path.read_text()
# The normal server entry forwards capture identity; preserve that same contract
# in the client-only synthetic bootstrap, including reload and multi-range links.
harness=harness.replace("initial.stage||initial.section||initial.part||initial.rendition?", "initial.stage||initial.section||initial.part||initial.rendition||initial.capture?")
harness=harness.replace("{stageId:initial.stage,sectionId:initial.section", "{captureId:initial.capture,captureFamily:initial.captureFamily==='flag'?'flag':initial.captureFamily==='annotation'?'annotation':undefined,stageId:initial.stage,sectionId:initial.section")
harness=harness.replace(" const [snapshot,setSnapshot]", " const [viewportSize,setViewportSize]=useState('390x844');const [viewportWidth,viewportHeight]=viewportSize.split('x').map(Number);\n const [snapshot,setSnapshot]")
harness=harness.replace('<small>Write attempts {count}.', '<label>QA viewport<select aria-label="Synthetic viewport" value={viewportSize} onChange={event=>setViewportSize(event.target.value)}><option value="390x844">390 × 844</option><option value="320x480">320 × 480</option><option value="390x420">390 × 420 reduced height</option><option value="960x640">960 × 640</option></select></label><small>Write attempts {count}.')
harness=harness.replace('width:392,height:\'min(846px,95dvh)\'', "width:viewportWidth+2,height:'min('+(viewportHeight+2)+'px,95dvh)'")
harness=harness.replace('title="Actual 390px viewport, independent local presentation state"', 'title="Synthetic viewport, independent local presentation state"').replace('width:390,maxWidth:', 'width:viewportWidth,maxWidth:')
source_action=""" async function sourceLifecycle(action:'revoke'|'trash'){
  if(!rawFetch.current)return;
  const family=action==='revoke'?'source':'article',id=action==='revoke'?'TEST-ONLY-ml-source':'TEST-ONLY-ml-excerpt';
  try{const response=await rawFetch.current('/api/layout-lab/context?'+new URLSearchParams({family,id}));const {record}=await response.json() as {record:WorkspaceRecord};
   if(!response.ok||!record)throw Error('QA target unavailable.');
   const result=await rawFetch.current('/api/layout-lab/commands',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operationId:'TEST-ONLY-layout-source-'+action+'-'+clientId(),action:action==='revoke'?'update':'trash',family,id,expectedRev:record.rev,...(action==='revoke'?{data:{source:{excerpt:{state:'revoked'}}}}:{})})});
   setStatus('Actual isolated '+action+' command: HTTP '+result.status+'. Check the open reading for current eligibility.');
  }catch(reason){setStatus(String(reason))}
 }
"""
harness=harness.replace(' return <div className=\"ml-lab-root\"', source_action+' return <div className=\"ml-lab-root\"').replace('<button onClick={advanceEdition}>Advance TCP edition · local</button>', '<button onClick={advanceEdition}>Advance TCP edition · local</button><button onClick={()=>sourceLifecycle(\"revoke\")}>Revoke original Source · local</button><button onClick={()=>sourceLifecycle(\"trash\")}>Trash excerpt Article · local</button>')
harness="import './acceptance-only.css';\n"+harness
(output/'app/acceptance-only.css').write_text('''
/* Synthetic QA frame only; excluded from implementation app source. */
.ml-lab-root{height:100dvh;display:flex;flex-direction:column;overflow:hidden}
.ml-lab-root>.v2-app{height:auto;flex:1;min-height:0}
.ml-lab-controls{flex:none;gap:7px!important;font-size:11px!important}
.ml-lab-controls label{display:flex;gap:6px;align-items:center;margin:0}
.ml-lab-controls select{margin:0;max-width:190px;padding:5px}
.ml-lab-controls button{padding:6px 9px;font-size:11px}
@media(max-width:700px){.ml-lab-controls{display:none!important}}
''')
path.write_text(harness.replace('<Workspace experimentalLayouts authenticated','<Workspace authenticated').replace('routeBase="/preview-layout"','routeBase="/"').replace("src={'/preview-layout?'","src={'/?'"))
(output/'app/page.tsx').write_text("""import {notFound} from 'next/navigation';
import LayoutLab from './layout-lab';
export const dynamic='force-dynamic';
export default async function AcceptancePage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 if(!import.meta.env.DEV)notFound();
 const params=await searchParams;const initial=Object.fromEntries(Object.entries(params).filter((entry):entry is [string,string]=>typeof entry[1]==='string'));
 return <LayoutLab initial={initial}/>;
}
""")
route=output/'app/api/layout-lab/[...path]/route.ts'
text=route.read_text().replace("import {env} from 'cloudflare:workers';","import {env} from 'cloudflare:workers';\nimport {seedSourceFixture} from '../../../../tests/acceptance/source-fixture';").replace('async function extendedFixtures(){await checkpointFixture();await imageFixture();}', 'async function extendedFixtures(){await checkpointFixture();await imageFixture();await seedSourceFixture(send);}')
text=text.replace('workspace|commands|bookmarks|query|context|operations|library|learning-context|learning-developments|learning-perspective','workspace|commands|bookmarks|query|context|operations|library|learning-context|learning-developments|learning-perspective|editorial-policy|preview|recovery')
text=text.replace("if(path!=='/api/bootstrap'&&!allowed.test(path))", "if(path==='/api/recovery'&&request.method!=='GET')return Response.json({error:'QA permits recovery discovery only; mutations are unavailable.'},{status:403});\n if(path!=='/api/bootstrap'&&!allowed.test(path))")
text=text.replace('learning-developments|',r'learning-developments(?:\/revise)?|')
route.write_text(text)
hosting=output/'.openai/hosting.json';config=json.loads(hosting.read_text());config.pop('project_id',None);hosting.write_text(json.dumps(config,indent=2)+'\n')
manifest.write_text(json.dumps(paths,indent=2)+'\n')
print(output)
