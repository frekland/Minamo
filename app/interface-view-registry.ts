import type {ArtefactRegistry} from '../lib/foundry/platform';
import {validateInterfaceViewRegistrations,type InterfaceViewRegistration,type InterfaceViewCatalogueEntry} from '../lib/interface-extension';

/** Build-time code seam. Activity data may choose an admitted metadata ID, never a loader/component. */
export const interfaceViews:readonly InterfaceViewRegistration[]=Object.freeze([
  Object.freeze({id:'source.bytes-v1',sourceKind:'text/plain-v1' as const,enabled:true,load:()=>import('./interface-view-bytes')}),
  Object.freeze({id:'trace.signal-ledger-v1',sourceKind:'trace/external-v1' as const,enabled:true,load:()=>import('./interface-view-trace-signal-ledger-v1')}),
  Object.freeze({id:'source.diff-v1',sourceKind:'text/plain-v1' as const,enabled:true,load:()=>import('./interface-view-diff')}),
  Object.freeze({id:'algorithm.graph-v1',sourceKind:'text/plain-v1' as const,enabled:true,load:()=>import('./interface-view-graph')}),
  Object.freeze({id:'game.maze-v1',sourceKind:'text/plain-v1' as const,enabled:true,load:()=>import('./interface-view-maze')}),
  Object.freeze({id:'game.sudoku-v1',sourceKind:'text/plain-v1' as const,enabled:true,load:()=>import('./interface-view-sudoku')}),
  Object.freeze({id:'math.contrast-v1',sourceKind:'text/plain-v1' as const,enabled:true,load:()=>import('./interface-view-contrast')}),
  Object.freeze({id:'systems.life-v1',sourceKind:'text/plain-v1' as const,enabled:true,load:()=>import('./interface-view-life')}),
]);

export function interfaceViewCatalogue():InterfaceViewCatalogueEntry[]{return interfaceViews.map(({id,sourceKind,enabled})=>({id,sourceKind,enabled}));}

/** Call only from ActivityArtefact's explicit, current-rights-checked activation path. */
export async function interfaceActivityRegistry(viewId?:string,registrations:readonly InterfaceViewRegistration[]=interfaceViews):Promise<ArtefactRegistry>{
  const [{ArtefactRegistry},{foundryAdapters}]=await Promise.all([import('../lib/foundry/platform'),import('../lib/foundry/specimens')]);
  validateInterfaceViewRegistrations(registrations,foundryAdapters.map(adapter=>adapter.kind));
  // Omitted IDs preserve the original view, even when other views of that source kind are enabled.
  const replacements=new Map(registrations.filter(registration=>registration.enabled&&registration.id===viewId).map(registration=>[registration.sourceKind,registration]));
  const registry=new ArtefactRegistry();
  for(const adapter of foundryAdapters){const view=replacements.get(adapter.kind as InterfaceViewRegistration['sourceKind']);
    registry.register(view?{...adapter,load:view.load}:adapter);
  }
  return registry;
}
