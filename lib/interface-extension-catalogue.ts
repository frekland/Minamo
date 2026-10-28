/** Server-owned inert metadata. A view ID chooses prebuilt code; it can never supply a component or loader. */
export const PRESENTATION_VIEWS=[
  {id:'source.bytes-v1',version:1,label:'Exact source bytes',sourceKind:'text/plain-v1',slots:['source','explore'],activation:'explicit-user-action'},
  {id:'trace.signal-ledger-v1',version:1,label:'Supplied signal ledger',sourceKind:'trace/external-v1',slots:['evidence','explore'],activation:'explicit-user-action'},
  {id:'source.diff-v1',version:1,label:'Supplied unified diff',sourceKind:'text/plain-v1',slots:['source','explore'],activation:'explicit-user-action'},
  {id:'algorithm.graph-v1',version:1,label:'Graph algorithm steps',sourceKind:'text/plain-v1',slots:['source','explore'],activation:'explicit-user-action'},
  {id:'game.maze-v1',version:1,label:'Finite route planner',sourceKind:'text/plain-v1',slots:['source','explore'],activation:'explicit-user-action'},
  {id:'game.sudoku-v1',version:1,label:'Sudoku constraint steps',sourceKind:'text/plain-v1',slots:['source','explore'],activation:'explicit-user-action'},
  {id:'math.contrast-v1',version:1,label:'Colour contrast laboratory',sourceKind:'text/plain-v1',slots:['source','explore'],activation:'explicit-user-action'},
  {id:'systems.life-v1',version:1,label:'Finite cellular-automaton steps',sourceKind:'text/plain-v1',slots:['source','explore'],activation:'explicit-user-action'},
] as const;
export type PresentationViewId=typeof PRESENTATION_VIEWS[number]['id'];
export function presentationViewMetadata(id:string){return PRESENTATION_VIEWS.find(view=>view.id===id);}
