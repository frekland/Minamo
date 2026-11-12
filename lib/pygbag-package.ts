export const PYGBAG_MIME='application/vnd.minamo.pygbag+html' as const;
export const PYGBAG_RUNTIME='pygame-web/archives/0.9/cpython312';
export const PYGBAG_LOADER='https://pygame-web.github.io/archives/0.9/pythons.js';
// Verified 2026-11-12 against pygame-web/archives Git blob 16084cc83602fe61d31b5958892b3757a2a9712a.
export const PYGBAG_LOADER_INTEGRITY='sha256-4RvpTdFsKcy7A4dzXfWIjgBQdmssWOrmNpESWekVdl8=';
export const PYGBAG_CSP="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://pygame-web.github.io/archives/0.9/; connect-src https://pygame-web.github.io/archives/0.9/ https://pygame-web.github.io/archives/repo/; worker-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; media-src blob:; frame-src 'none'; form-action 'none'; base-uri 'none'";
/** One exact upstream --html envelope. Original bytes remain download-only. */
export function standalonePygbag(html:string){
 if(new TextEncoder().encode(html).byteLength>16*1024*1024)throw Error('Standalone Pygbag package exceeds 16 MiB.');
 const m=/^\s*<html><head><meta charset="utf-8"><\/head><script ([^>]+)>#<!--\r?\n([\s\S]*)\r?\n# --><\/script><\/html>\s*$/i.exec(html);if(!m||/<\/script|<meta|<base|<iframe/i.test(m[2]))throw Error('Use the supported standalone Pygbag --html envelope; directory/ZIP/custom HTML profiles are not supported.');
 const attrs=m[1],seen=new Set<string>();let p=0;const rx=/([a-z-]+)(?:="([^"]*)"|=([A-Za-z0-9_,.-]+))?\s*/g;let a;while((a=rx.exec(attrs))){if(a.index!==p||seen.has(a[1]))throw Error('Unsupported Pygbag loader attributes.');p=rx.lastIndex;seen.add(a[1]);const expected:Record<string,string|undefined>={src:PYGBAG_LOADER,'data-python':'python3.12','data-os':'stdout,gui',type:'module',id:'__main__',async:undefined,defer:undefined};if(!Object.hasOwn(expected,a[1])||(a[2]??a[3])!==expected[a[1]])throw Error('Use pinned archive 0.9, python3.12, data-os stdout,gui and the upstream module loader.');}if(p!==attrs.length||!['src','data-python','data-os','type','id'].every(k=>seen.has(k))||!/^PYGBAG_FS=([1-9][0-9]{0,2})\r?\n/.test(m[2])||Number(/^PYGBAG_FS=(\d+)/.exec(m[2])?.[1])>128)throw Error('Standalone Pygbag loader profile is incomplete.');
 return html;
}
/** Runtime messages are diagnostics from the untrusted frame, never execution evidence. */
export function pygbagDiagnostics(token:string){
 return `(function(){const token=${JSON.stringify(token)},send=(phase,detail='')=>parent.postMessage({minamoPygbag:token,phase,detail:String(detail).slice(0,1000)},'*');
 addEventListener('error',event=>{const source=event.target;if(source&&source.tagName==='SCRIPT')send('error','The pinned game runtime could not load. Its download, cross-origin policy or integrity check failed.');else send('error',event.message||'The game runtime reported an error.');},true);
 addEventListener('unhandledrejection',event=>send('error',event.reason?.message||String(event.reason)));
 let surfaced=false;const observer=new MutationObserver(()=>{if(!surfaced&&document.querySelector('canvas')){surfaced=true;observer.disconnect();send('surface');}});observer.observe(document.documentElement,{childList:true,subtree:true});
 addEventListener('load',event=>{if(event.target?.tagName==='SCRIPT'&&event.target.src)send('loader');},true);
 window.custom_onload=()=>{if(window.Module?.config)window.Module.config.quiet=true;};send('controller');})();`;
}
export function isolatedPygbagDocument(html:string,token?:string){standalonePygbag(html);const controller=token?pygbagDiagnostics(token):'window.custom_onload=()=>{if(window.Module?.config)window.Module.config.quiet=true};';return '<meta http-equiv="Content-Security-Policy" content="'+PYGBAG_CSP.replaceAll('"','&quot;')+'"><script>'+controller.replace(/<\/script/gi,'<\\/script')+'</script>'+html.replace('<script ', '<script crossorigin="anonymous" integrity="'+PYGBAG_LOADER_INTEGRITY+'" ');}
