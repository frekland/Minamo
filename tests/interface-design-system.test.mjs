import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const theme=readFileSync(new URL('../app/theme.css',import.meta.url),'utf8');
const token=name=>{const value=theme.match(new RegExp('--mn-'+name+':\\s*(#[0-9a-fA-F]{6})\\s*;'))?.[1];assert.ok(value,'Missing canonical color '+name);return value;};
const linear=value=>{const n=value/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;};
const luminance=hex=>{const values=[1,3,5].map(i=>linear(parseInt(hex.slice(i,i+2),16)));return values[0]*.2126+values[1]*.7152+values[2]*.0722;};
const contrast=(a,b)=>{const values=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (values[0]+.05)/(values[1]+.05);};
test('shared canonical foreground and link colors remain readable on every workbench surface',()=>{
 for(const background of ['canvas','surface','surface-secondary','code-bg','selected'])for(const foreground of ['text','text-body','text-muted','interactive','accent','status-success','status-warning','status-danger']){
  const ratio=contrast(token(foreground),token(background));assert.ok(ratio>=4.5,`${foreground} on ${background}: ${ratio.toFixed(2)} requires 4.5:1 for ordinary text`);
 }
 assert.ok(contrast(token('on-accent'),token('accent'))>=4.5,'Primary action text contrast');
});
test('focus and control boundaries remain distinct from adjacent panel surfaces',()=>{
 for(const background of ['canvas','surface','surface-secondary','code-bg'])for(const foreground of ['focus','border-control']){
  const ratio=contrast(token(foreground),token(background));assert.ok(ratio>=3,`${foreground} on ${background}: ${ratio.toFixed(2)} requires 3:1`);
 }
});
