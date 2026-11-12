import type {WorkspaceRecord,PassageAnchor} from './contracts';
/** Original synthetic interaction examples, used only by the production-disabled preview route. */
export function interactionFixture(records:WorkspaceRecord[]):WorkspaceRecord[]{
 const reading=records.find(record=>record.id==='article-unicode'&&record.family==='article');
 if(!reading?.rendition)return records;
 const text=reading.sections?.find(section=>section.id==='representation')?.parts.find(part=>part.id==='unicode-text')?.text;if(!text)return records;
 const stamp='2026-10-21T00:00:00.000Z';
 const make=(family:WorkspaceRecord['family'],id:string,title:string,body:string,extra:Partial<WorkspaceRecord>={}):WorkspaceRecord=>({id,family,title,body,links:[],rev:1,createdAt:stamp,updatedAt:stamp,trashedAt:null,actor:'user',synthetic:true,...extra});
 const anchor=(start:number,end:number):PassageAnchor=>({recordFamily:'article',articleId:reading.id,rendition:reading.rendition!,sectionId:'representation',partId:'unicode-text',start,end,quote:text.slice(start,end)});
 const start=text.indexOf('UTF-16'),end=start+'UTF-16 code units'.length;
 return [...records,
  make('annotation','synthetic-mark-one','Synthetic annotation','A code unit belongs to a representation; it is not always a whole visible character.',{anchor:anchor(start,end),links:[{family:'article',id:reading.id}]}),
  make('annotation','synthetic-mark-two','Overlapping synthetic annotation','What changes when the same symbol is encoded as UTF-8?',{anchor:anchor(start,start+6),links:[{family:'article',id:reading.id}]}),
  make('flag','synthetic-mark-flag','Bookmarked passage','',{anchor:anchor(start,end),links:[{family:'article',id:reading.id}]}),
  make('note','synthetic-note-representation','Representations to revisit','My own synthetic note about representations. Keep the question open.',{rendition:'synthetic-note-edition-one',links:[{family:'article',id:reading.id},{family:'area',id:'area-computing'}]}),
  make('note','synthetic-note-unlinked','An independent thought','An independent synthetic note without a context link.',{rendition:'synthetic-note-edition-two'}),
  make('note','synthetic-note-trashed','A recoverable thought','A synthetic note in recoverable Trash.',{rendition:'synthetic-note-edition-three',trashedAt:stamp})
 ];
}
