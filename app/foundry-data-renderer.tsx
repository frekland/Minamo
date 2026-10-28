'use client';
import {createRoot} from 'react-dom/client';
import {FoundryTable,FoundryNotebook,FoundryTrace} from './foundry-data-demo';
import type {DataTable,Notebook,SuppliedTrace} from '../lib/foundry/data-core';
// The lazy application module owns static React imports. Dynamic CommonJS
// namespace shapes differ between supported bundlers; its mount API does not.
function ownedRoot(host:HTMLElement,render:(root:ReturnType<typeof createRoot>)=>void){const root=createRoot(host);render(root);let disposed=false;return()=>{if(disposed)return;disposed=true;root.unmount();};}
export function mountFoundryTable(host:HTMLElement,table:DataTable,initialX?:number,initialY?:number){return ownedRoot(host,root=>root.render(<FoundryTable table={table} initialX={initialX} initialY={initialY}/>));}
export function mountFoundryNotebook(host:HTMLElement,notebook:Notebook){return ownedRoot(host,root=>root.render(<FoundryNotebook notebook={notebook}/>));}
export function mountFoundryTrace(host:HTMLElement,trace:SuppliedTrace){return ownedRoot(host,root=>root.render(<FoundryTrace trace={trace}/>));}
