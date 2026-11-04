import {test} from 'node:test';
import assert from 'node:assert/strict';
import {drawingDocument} from '../lib/drawing-document.ts';

const user={id:'user:author',typeName:'user',name:'Learner',color:'#4d6bd8',imageUrl:'',meta:{}};
const page={id:'page:page1',typeName:'page',name:'Page 1',index:'a1',meta:{}};
const rectangle={id:'shape:rect1',typeName:'shape',type:'geo',parentId:'page:page1',x:24,y:36,rotation:0,index:'a1',props:{geo:'rectangle',w:240,h:120},meta:{}};
const document={schema:{schemaVersion:2,sequences:{}},store:{[page.id]:page,[user.id]:user,[rectangle.id]:rectangle}};

test('a populated tldraw document preserves shape attribution',()=>{
  const saved=drawingDocument(document);
  assert.deepEqual(Object.keys(saved.store).sort(),[page.id,user.id,rectangle.id].sort());
  assert.equal(saved.store[user.id].name,'Learner');
});

test('tldraw session records and malformed attribution are still rejected',()=>{
  assert.throws(()=>drawingDocument({...document,store:{...document.store,'camera:page1':{id:'camera:page1',typeName:'camera'}}}),/Unsupported drawing record/);
  assert.throws(()=>drawingDocument({...document,store:{...document.store,[user.id]:{...user,imageUrl:42}}}),/Unsupported drawing attribution/);
});

test('drawing media controls remain enforced',()=>{
  assert.throws(()=>drawingDocument({...document,store:{...document.store,'asset:remote':{id:'asset:remote',typeName:'asset',type:'image',props:{src:'https://example.test/remote.png'}}}}),/admitted Minamo raster images/);
  assert.throws(()=>drawingDocument({...document,store:{...document.store,[rectangle.id]:{...rectangle,type:'embed'}}}),/Unsupported drawing shape/);
});
