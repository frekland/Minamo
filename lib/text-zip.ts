/** Deterministic store-only UTF-8 ZIP. Only previously validated paths/content
 * may enter here. No symlinks, timestamps, compression, scripts or execution. */
const table=Uint32Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(bytes:Uint8Array){let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
export function deterministicTextZip(entries:ReadonlyArray<{path:string;text:string}>):Uint8Array<ArrayBuffer>{
 if(entries.length>25)throw Error('Too many source files.');
 const utf8=new TextEncoder(),locals:Uint8Array[]=[],central:Uint8Array[]=[];let offset=0;
 for(const entry of [...entries].sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0)){
  const name=utf8.encode(entry.path),body=utf8.encode(entry.text),crc=crc32(body);
  const head=new Uint8Array(30+name.length),dv=new DataView(head.buffer);
  dv.setUint32(0,0x04034b50,true);dv.setUint16(4,20,true);dv.setUint16(6,0x0800,true);
  // The earliest valid DOS date is 1980-01-01. A zero date produces an
  // ambiguous 1980-00-00 listing in common unzip clients.
  dv.setUint16(12,0x0021,true);dv.setUint32(14,crc,true);dv.setUint32(18,body.length,true);dv.setUint32(22,body.length,true);dv.setUint16(26,name.length,true);head.set(name,30);
  const directory=new Uint8Array(46+name.length),cv=new DataView(directory.buffer);
  cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x0800,true);
  cv.setUint16(14,0x0021,true);cv.setUint32(16,crc,true);cv.setUint32(20,body.length,true);cv.setUint32(24,body.length,true);cv.setUint16(28,name.length,true);cv.setUint32(38,0x81a40000,true);cv.setUint32(42,offset,true);directory.set(name,46);
  locals.push(head,body);central.push(directory);offset+=head.length+body.length;
 }
 const directoryBytes=central.reduce((sum,chunk)=>sum+chunk.length,0),end=new Uint8Array(22),dv=new DataView(end.buffer);
 dv.setUint32(0,0x06054b50,true);dv.setUint16(8,entries.length,true);dv.setUint16(10,entries.length,true);dv.setUint32(12,directoryBytes,true);dv.setUint32(16,offset,true);
 const archive=new Uint8Array(offset+directoryBytes+end.length);let pos=0;
 for(const chunk of [...locals,...central,end]){archive.set(chunk,pos);pos+=chunk.length;}
 return archive;
}
