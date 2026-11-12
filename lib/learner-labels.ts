/** Learner-facing nouns only. Stored families, tool enums and URLs stay canonical. */
export const LEARNER_LABELS={project:'Project',projects:'Projects',step:'Step',steps:'Steps',question:'Question',questions:'Questions',checkpoint:'Saved checkpoint'} as const;
const families:Record<string,readonly [string,string]>={journey:['Project','Projects'],investigation:['Question','Questions'],article:['Article','Articles'],area:['Library topic','Library topics'],note:['Note','Notes'],annotation:['Annotation','Annotations'],flag:['Flag','Flags'],source:['Source','Sources'],experiment:['Tool','Tools'],run:['Saved run','Saved runs']};
export function learnerFamilyLabel(family:string,{plural=false,lowercase=false}:{plural?:boolean;lowercase?:boolean}={}){
 const label=families[family]?.[plural?1:0]??'Material';return lowercase?label.toLocaleLowerCase('en-GB'):label;
}
/** Markdown role codes are wire values, never a second learner vocabulary. */
export const learnerRoleLabel=(role:string)=>learnerFamilyLabel(role);
