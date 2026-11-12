import {ArtefactRegistry,type Adapter,type Artefact} from './platform';
import {plainTextAdapter,outputBundleAdapter,plainTextArtefact,outputBundleArtefact} from './core-adapters';
import {languageTextAdapter,parallelLanguageAdapter,languageTextArtefact,parallelLanguageArtefact} from './language-platform';
import {japaneseLanguageFixture,parallelLanguageFixture} from './language-fixtures';
import {mathTexAdapter,mathNativeAdapter,mathTexArtefact,mathNativeArtefact} from './math-platform';
import {MATH_EXAMPLES} from './math';
import {visualSceneAdapter,visualSceneArtefact} from './visual-platform';
import {dataTableAdapter,dataChartAdapter,dataNotebookAdapter,dataTraceAdapter,dataTableArtefact,dataChartArtefact,dataNotebookArtefact,dataTraceArtefact} from './data-platform';
import {audioAnalysisAdapter,audioAnalysisArtefact} from './audio-platform';
/** One real factory/validator/fallback per registered format. No module loads or executes here. */
export const foundryAdapters=[plainTextAdapter,outputBundleAdapter,languageTextAdapter,parallelLanguageAdapter,mathTexAdapter,mathNativeAdapter,visualSceneAdapter,dataTableAdapter,dataChartAdapter,dataNotebookAdapter,dataTraceAdapter,audioAnalysisAdapter] as Adapter[];
export function foundryRegistry(){const registry=new ArtefactRegistry();for(const adapter of foundryAdapters)registry.register(adapter);return registry;}
export async function foundrySpecimens():Promise<Artefact[]>{const csv='x,y\n0,0\n1,1\n2,4';return Promise.all([
 plainTextArtefact('TEST ONLY — original text 😀'),
 outputBundleArtefact({contract:'minamo.run-outputs.v1',inputDigest:'a'.repeat(64),status:'completed',outputs:[{kind:'stdout',text:'Supplied output, not an observed Run.'}]}),
 languageTextArtefact(japaneseLanguageFixture),parallelLanguageArtefact(parallelLanguageFixture),
 mathTexArtefact(MATH_EXAMPLES[0]),mathNativeArtefact({tag:'mfrac',children:[{tag:'mn',text:'1'},{tag:'mn',text:'3'}]}),
 visualSceneArtefact({version:1,title:'Synthetic bounded cube',meshes:[{shape:'box',position:[0,0,0],size:[1,1,1],color:'#54aabb'}]}),
 dataTableArtefact(csv),dataChartArtefact({title:'Supplied square values',sourceFormat:'csv',source:csv,xColumn:0,yColumn:1}),
 dataNotebookArtefact(JSON.stringify({nbformat:4,nbformat_minor:5,metadata:{},cells:[{cell_type:'code',metadata:{},source:['print(2)'],execution_count:null,outputs:[]}]})),
 dataTraceArtefact({format:'minamo.trace.v1',classification:'supplied-artifact',redacted:false,events:[{sequence:0,timeMs:null,kind:'stdout',text:'Supplied external output'}]}),
 audioAnalysisArtefact({format:'minamo.pcm.v1',sampleRate:8000,samples:new Float32Array(Array.from({length:256},(_,i)=>Math.sin(i*Math.PI/8)*.25)),origin:'synthetic-fixture'}),
 ]);}
