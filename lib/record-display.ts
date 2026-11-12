/**
 * Lab examples retain exact canonical titles, revisions and source provenance.
 * Only explicit acceptance labels are suppressed in the visual navigation,
 * and only for records whose saved metadata actually says synthetic.
 */
export function recordDisplayTitle(title:string,synthetic?:boolean):string{
 if(!synthetic)return title;
 const calm=title
  .replace(/^\s*TEST(?:\s+ONLY)?\s*[·—–:-]\s*/i,'')
  .replace(/\s*[·—–:-]\s*TEST ONLY(?=\s*\))/gi,'')
  .replace(/\s*\(\s*TEST ONLY\s*\)/gi,'')
  .trim();
 return calm||title;
}

/** Reading hint only: preserve the substantive wording and its authority. */
export function savedConnectionPreview(source:string,limit=180):string{
 const prose=source.replace(/\r\n/g,'\n').split(/\n\s*\n/)
  .map(value=>value.trim()).filter(Boolean)
  .find(value=>!/^#{1,6}\s/.test(value))??'';
 const plain=prose.replace(/\*\*(.*?)\*\*/g,'$1').replace(/\*(.*?)\*/g,'$1')
  .replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/`([^`]+)`/g,'$1')
  .replace(/\s+/g,' ').trim();
 return plain.length>limit?plain.slice(0,limit).trimEnd()+'…':plain;
}

/** A specifically authored Lab disclaimer, never a reason to alter the saved edition. */
export function syntheticPresentationIntro(record:{synthetic?:boolean;body:string}):boolean{
 return !!record.synthetic&&/^TEST(?: ONLY)?\s*[·—–:-]\s*/i.test(record.body.trimStart());
}

/** A short, substantive list excerpt; the exact Markdown and provenance remain in the Note. */
export function savedWorkCardPreview(source:string,synthetic?:boolean,limit=220):string{
 const blocks=source.replace(/\r\n/g,'\n').split(/\n\s*\n/).map(block=>block.trim()).filter(Boolean);
 while(blocks.length&&/^#{1,6}\s/.test(blocks[0]))blocks.shift();
 if(synthetic&&/^\*\*Provenance\.\*\*/i.test(blocks[0]??''))blocks.shift();
 return savedConnectionPreview(blocks.join('\n\n'),limit);
}
