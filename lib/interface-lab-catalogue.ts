/** Browser-safe story names and viewport controls only. No source, hint or generator imports. */
export const INTERFACE_LAB_CASES=[
 {id:'read',label:'Read and annotate',pattern:'read-and-annotate',template:'walkthrough'},
 {id:'local',label:'Start a local project',pattern:'activity-overview',template:'diagnostic'},
 {id:'debug',label:'Python fragmented-message bug hunt',pattern:'debug-and-repair',template:'debugging'},
 {id:'build',label:'Build and iterate',pattern:'build-and-iterate',template:'fill-gap'},
 {id:'predict',label:'Predict and compare',pattern:'predict-explore-compare',template:'predict-compare'},
 {id:'math',label:'Mathematics and science board',pattern:'mathematics-science',template:'mathematics'},
 {id:'language',label:'Japanese Article and source',pattern:'language-reading',template:'language'},
 {id:'data',label:'Data detective: check the denominator',pattern:'data-detective',template:'data'},
 {id:'game',label:'Game and algorithm: inspect the state',pattern:'algorithm-game',template:'game'},
 {id:'walkthrough',label:'Code walkthrough with exact editions',pattern:'code-walkthrough',template:'code-archaeology'},
 {id:'sound',label:'Sound lab: inspect before playing',pattern:'sound-lab',template:'music'},
] as const;
export type InterfaceLabCaseId=typeof INTERFACE_LAB_CASES[number]['id'];
export const INTERFACE_LAB_VIEWPORTS=[320,360,390,430,700,768,1024,1280,1440] as const;
export const INTERFACE_LAB_LAYOUTS=['context-first','artefact-first','sequence','power'] as const;
export const INTERFACE_LAB_STATES=['ready','missing-source','retained-edition','no-attempt','supplied-attempt'] as const;
