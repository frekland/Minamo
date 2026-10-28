import {z} from 'zod';
import {readUnifiedDiff,contrastRatio,parseHexColour} from './foundry/novel';
import {graphTrace,createMaze,sudokuTrace,lifeStep,type VisualGraph} from './foundry/visual';

/** Finite source grammars over the existing exact text adapter, never executable code. */
const graph=z.object({version:z.literal(1),graph:z.object({directed:z.boolean(),nodes:z.array(z.string().min(1).max(24)).min(1).max(64),edges:z.array(z.object({from:z.string(),to:z.string(),weight:z.number().finite().positive().max(1000)}).strict()).max(256)}).strict(),start:z.string(),algorithm:z.enum(['bfs','dijkstra'])}).strict();
const maze=z.object({version:z.literal(1),rows:z.array(z.string().min(3).max(24)).min(3).max(24)}).strict();
const sudoku=z.object({version:z.literal(1),board:z.array(z.number().int().min(0).max(9)).length(81),maxSteps:z.number().int().min(2).max(500).default(200)}).strict();
const contrast=z.object({version:z.literal(1),foreground:z.string().regex(/^#[0-9a-f]{6}$/i),background:z.string().regex(/^#[0-9a-f]{6}$/i)}).strict();
const life=z.object({version:z.literal(1),grid:z.array(z.array(z.union([z.literal(0),z.literal(1)])).min(1).max(32)).min(1).max(32)}).strict();
function json(source:string){if(source.length>16384)throw Error('Practical source is limited to 16384 UTF-16 units.');try{return JSON.parse(source);}catch{throw Error('Use the advertised exact JSON source; no expressions or code are evaluated.');}}
export function parseGraphSource(source:string){const input=graph.parse(json(source));return {...input,steps:graphTrace(input.graph as VisualGraph,input.start,input.algorithm)};}
export function parseMazeSource(source:string){const input=maze.parse(json(source));return createMaze(input.rows);}
export function parseSudokuSource(source:string){const input=sudoku.parse(json(source));return {input,steps:sudokuTrace(input.board,input.maxSteps)};}
export function parseContrastSource(source:string){const input=contrast.parse(json(source));return {...input,ratio:contrastRatio(parseHexColour(input.foreground),parseHexColour(input.background))};}
export function parseLifeSource(source:string){const input=life.parse(json(source));lifeStep(input.grid);return input.grid;}
/** Both publisher and lazy renderer call this; unrelated existing views stay unchanged. */
export function validatePracticalViewSource(viewId:string,source:string):void{
 switch(viewId){case 'source.diff-v1':readUnifiedDiff(source);break;case 'algorithm.graph-v1':parseGraphSource(source);break;case 'game.maze-v1':parseMazeSource(source);break;case 'game.sudoku-v1':parseSudokuSource(source);break;case 'math.contrast-v1':parseContrastSource(source);break;case 'systems.life-v1':parseLifeSource(source);break;}
}
export const PRACTICAL_VIEW_EXAMPLES=Object.freeze([
 {viewId:'source.diff-v1',label:'Inspect a Bash quoting correction',source:'--- a/greet.sh\n+++ b/greet.sh\n@@ -1,2 +1,2 @@\n #!/usr/bin/env bash\n-printf "%s\\n" $name\n+printf "%s\\n" "$name"\n',purpose:'Explain which token changes and why. Supplied original patch; it is never applied.'},
 {viewId:'algorithm.graph-v1',label:'Compare hops with weighted network cost',source:JSON.stringify({version:1,graph:{directed:false,nodes:['client','relay','server'],edges:[{from:'client',to:'relay',weight:1},{from:'relay',to:'server',weight:1},{from:'client',to:'server',weight:5}]},start:'client',algorithm:'dijkstra'}),purpose:'Step the deterministic illustrative search; weights are supplied, not measured network latency.'},
 {viewId:'game.maze-v1',label:'Plan a finite route',source:JSON.stringify({version:1,rows:['#######','#S...G#','#.###.#','#.....#','#######']}),purpose:'Predict a route, move deliberately and compare. Position and moves remain session-only.'},
 {viewId:'game.sudoku-v1',label:'Inspect constraint reasoning',source:JSON.stringify({version:1,board:'530070000600195000098000060800060003400803001700020006060000280000419005000080079'.split('').map(Number),maxSteps:200}),purpose:'Reveal bounded deterministic solver steps. A found completion never proves uniqueness or learner mastery.'},
 {viewId:'math.contrast-v1',label:'Compare text colour contrast',source:JSON.stringify({version:1,foreground:'#9dc9db',background:'#20272e'}),purpose:'Calculate relative luminance contrast; this single measure does not certify accessibility.'},
 {viewId:'systems.life-v1',label:'Predict a cellular-automaton oscillator',source:JSON.stringify({version:1,grid:[[0,0,0,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0]]}),purpose:'Predict the next two finite Conway Life generations, then step deliberately. Exterior cells are dead; local model state is not a learner accomplishment.'},
] as const);
