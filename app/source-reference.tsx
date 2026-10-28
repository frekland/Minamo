"use client";
import type {SourceInfo} from '../lib/contracts';
import {sourceReferencePresentation} from '../lib/source-reference';
export type SourceReferenceProps={source:SourceInfo;showAttribution?:boolean;className?:string};
/** Render link provenance honestly; source rights remain the caller's separate concern. */
export default function SourceReference({source,showAttribution=true,className}:SourceReferenceProps){
 const {reference,repository,path,revision}=sourceReferencePresentation(source);
 const excerptUnavailable=source.excerpt?.state==='revoked'||source.excerpt?.unavailable===true;
 let publisher='External publisher';try{publisher=new URL(source.url).hostname.replace(/^www\./,'')}catch{}
 const lineLabel=reference.lines?reference.lines.start===reference.lines.end?` · line ${reference.lines.start}`:` · lines ${reference.lines.start}–${reference.lines.end}`:'';
 return <div className={className??'source-reference'}>
 {showAttribution&&<p>{source.attribution}</p>}
 {repository&&<p><strong>{repository}</strong>{path&&<> · <code style={{overflowWrap:'anywhere'}}>{path}</code></>}{revision&&<small> · {revision}</small>}</p>}
 <small>{publisher} · {source.rights==='link-only'?'Link only · unverified':source.rights==='original'?'Original authored material':excerptUnavailable?'Excerpt unavailable · independent reference retained':'Permitted excerpt'}</small>
 {reference.kind==='immutable-github-url'?<>
 <a href={reference.href!} target="_blank" rel="noopener noreferrer">View on GitHub{lineLabel} ↗</a>
 <details><summary>Pinned revision · {reference.urlCommit!.slice(0,8)}</summary><small>Exact commit in source URL: <code style={{overflowWrap:'anywhere'}}>{reference.urlCommit}</code>. Referenced content and access have not been independently checked.</small></details>
 </>:<>
 {reference.href?<a href={reference.href} target="_blank" rel="noopener noreferrer">{repository?'View on GitHub':'Original source'} ↗</a>:<p>Source URL is unavailable or unsafe to open.</p>}
 {reference.reason==='mutable-or-ambiguous-github-reference'&&<small>This reference may follow a branch or tag. It does not identify an exact committed file.</small>}
 {reference.reason==='declared-commit-mismatch'&&<small>Commit mismatch: the URL contains <code style={{overflowWrap:'anywhere'}}>{reference.urlCommit}</code>. It does not match the declared commit below.</small>}
 {reference.reason==='invalid-declared-commit'&&<small>The saved commit reference is invalid. Check the original source.</small>}
 {reference.declaredCommit&&<small>Declared commit metadata: <code style={{overflowWrap:'anywhere'}}>{reference.declaredCommit}</code>{reference.reason==='non-code-reference'||reference.reason==='mutable-or-ambiguous-github-reference'?'. This reference has not been established as an exact committed code link.':'.'}</small>}
 </>}
 </div>;
}
