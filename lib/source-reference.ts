import type {SourceInfo} from './contracts';
/** A URL classification, not proof that a repository, commit or file was fetched. */
export type SourceReference={
 kind:'immutable-github-url'|'original-reference'|'invalid';
 href:string|null;
 reason:'pinned-url'|'declared-commit-mismatch'|'invalid-declared-commit'|'mutable-or-ambiguous-github-reference'|'non-code-reference'|'unsafe-url';
 urlCommit?:string;
 declaredCommit?:string;
 lines?:{start:number;end:number};
};
const fullCommit=/^[a-f0-9]{40}$/;
const repositorySegment=/^[A-Za-z0-9_.-]+$/;
/**
 * Keep the authored reference unchanged. Only an already-pinned GitHub blob URL
 * has an unambiguous commit/path boundary. A mutable `blob/main/path/file` URL
 * could refer to a slash-containing branch, so replacing `main` would guess a
 * source path. No branch-to-commit rewrite or remote-content claim is made here.
 */
export function resolveSourceReference(source:Pick<SourceInfo,'url'|'commit'>):SourceReference{
 let url:URL;
 try{url=new URL(source.url);}catch{return {kind:'invalid',href:null,reason:'unsafe-url'};}
 if(url.protocol!=='https:'||url.username||url.password)return {kind:'invalid',href:null,reason:'unsafe-url'};
 const declared=source.commit;
 const invalidDeclared=declared!==undefined&&!fullCommit.test(declared);
 const base={href:source.url,...(declared?{declaredCommit:declared}:{})};
 if(invalidDeclared)return {...base,kind:'original-reference',reason:'invalid-declared-commit'};
 const parts=url.pathname.split('/');
 const github=url.hostname.toLowerCase()==='github.com'&&!url.port;
 const blob=github&&parts.length>=6&&parts[0]===''&&repositorySegment.test(parts[1])&&repositorySegment.test(parts[2])&&!['.','..'].includes(parts[1])&&!['.','..'].includes(parts[2])&&parts[3]==='blob';
 const encodedSeparators=/%(?:2f|5c)/i.test(url.pathname);
 const pinned=blob&&!encodedSeparators&&fullCommit.test(parts[4])&&parts.slice(5).every(part=>part.length>0);
 if(pinned){
 const urlCommit=parts[4];
 if(declared&&declared!==urlCommit)return {...base,urlCommit,kind:'original-reference',reason:'declared-commit-mismatch'};
 const anchor=/^#L([1-9]\d*)(?:-L([1-9]\d*))?$/.exec(url.hash);
 let lines:SourceReference['lines'];if(anchor){const start=Number(anchor[1]),end=Number(anchor[2]??anchor[1]);if(Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&end>=start)lines={start,end};}
 return {...base,urlCommit,kind:'immutable-github-url',reason:'pinned-url',...(lines?{lines}:{})};
 }
 return {...base,kind:'original-reference',reason:blob||github&&parts[3]==='blob'?'mutable-or-ambiguous-github-reference':'non-code-reference'};
}
/** Readable identity from saved metadata only. Moving GitHub refs may contain
 * slashes, so their file boundary is never guessed from the URL. */
export function sourceReferencePresentation(source:Pick<SourceInfo,'url'|'commit'|'path'>){
 const reference=resolveSourceReference(source);let repository:string|undefined,path=source.path;
 if(reference.href)try{const url=new URL(reference.href),parts=url.pathname.split('/');if(url.hostname==='github.com'&&!url.port&&repositorySegment.test(parts[1]??'')&&repositorySegment.test(parts[2]??'')){repository=parts[1]+'/'+parts[2];if(!path&&reference.kind==='immutable-github-url')path=parts.slice(5).map(part=>{try{return decodeURIComponent(part)}catch{return part}}).join('/');}}catch{}
 return {reference,...(repository?{repository}:{}),...(path?{path}:{}),revision:reference.kind==='immutable-github-url'?'Pinned revision':reference.reason==='mutable-or-ambiguous-github-reference'?'Moving or ambiguous branch/tag':undefined};
}
