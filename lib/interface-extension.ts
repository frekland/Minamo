import type {Adapter} from './foundry/platform';
import type {PRESENTATION_FOUNDRY_KINDS} from './interface-foundry';
import {presentationViewMetadata} from './interface-extension-catalogue';

export type InterfaceSourceKind=typeof PRESENTATION_FOUNDRY_KINDS[number];
export type InterfaceViewModule=Awaited<ReturnType<Adapter['load']>>;
/** Trusted application code only. This descriptor is never accepted from Activity/MCP data. */
export type InterfaceViewRegistration={
  readonly id:string;
  readonly sourceKind:InterfaceSourceKind;
  readonly enabled:boolean;
  readonly load:()=>Promise<InterfaceViewModule>;
};
export type InterfaceViewCatalogueEntry={id:string;sourceKind:InterfaceSourceKind;enabled:boolean};

/** Fail closed on ambiguous build-time wiring; source/schema/fallback remain the original adapter's. */
export function validateInterfaceViewRegistrations(registrations:readonly InterfaceViewRegistration[],knownKinds:readonly string[]):void{
  const ids=new Set<string>();
  for(const registration of registrations){
    if(!registration||Object.keys(registration).sort().join()!==['id','sourceKind','enabled','load'].sort().join()||
      typeof registration.id!=='string'||!/^[a-z][a-z0-9.-]{0,79}$/.test(registration.id)||
      !knownKinds.includes(registration.sourceKind)||typeof registration.enabled!=='boolean'||typeof registration.load!=='function')
      throw Error('Invalid trusted Interface view registration. Use a known source kind and a static application loader.');
    if(ids.has(registration.id))throw Error('Duplicate Interface view ID: '+registration.id);
    const metadata=presentationViewMetadata(registration.id);
    if(!metadata||metadata.sourceKind!==registration.sourceKind)throw Error('Trusted view registration must match server-owned ID/source-kind metadata.');
    ids.add(registration.id);
  }
}

/** Shared native-DOM controls. Source text only ever enters textContent, never HTML or selectors. */
export function viewElement<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string,className?:string):HTMLElementTagNameMap[K]{
  const element=document.createElement(tag);if(text!==undefined)element.textContent=text;if(className)element.className=className;return element;
}
export function viewAppend(parent:Node,...children:Node[]):void{for(const child of children)parent.appendChild(child);}
