import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {drawingAssetId,drawingAssetUrl,drawingDocument,drawingImageIds} from '../lib/drawing-document.ts';
import {shouldReencodeDrawingJpeg} from '../lib/drawing-image-upload.ts';
const require=createRequire(import.meta.url);
// Use the exact installed tldraw 5.5.2 srcUrl validator that rejected V109 in Chrome.
const {T}=require(require.resolve('@tldraw/validate',{paths:[require.resolve('tldraw')]}));

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

test('an admitted image stays a canonical drawing reference',()=>{
  const id='image-'+'a'.repeat(64);
  const image={id:'asset:test',typeName:'asset',type:'image',props:{src:drawingAssetUrl(id)}};
  const saved=drawingDocument({...document,store:{...document.store,[image.id]:image}});
  assert.equal(new URL(image.props.src).protocol,'asset:');
  assert.equal(T.srcUrl.isValid(image.props.src),true);
  assert.equal(T.srcUrl.isValid('minamo-image:'+id),false);
  assert.equal(drawingAssetId(image.props.src),id);
  assert.deepEqual(drawingImageIds(saved),[id]);
  assert.equal(saved.store[image.id].props.src,image.props.src);
  for(const src of ['https://example.test/'+id,'asset:minamo-image:'+id+'?extra=1','asset:minamo-image:'+id+'/more','asset:minamo-image:image-'+ 'z'.repeat(64),'blob:https://example.test/123']){
    assert.equal(drawingAssetId(src),null);
    assert.throws(()=>drawingDocument({...document,store:{...document.store,[image.id]:{...image,props:{src}}}}),/admitted Minamo raster images/);
  }
});

test('historical internal image marker is normalized without modifying retained input',()=>{
  const id='image-'+'b'.repeat(64),image={id:'asset:legacy',typeName:'asset',type:'image',props:{src:'minamo-image:'+id}};
  const original={...document,store:{...document.store,[image.id]:image}};
  const saved=drawingDocument(original);
  assert.equal(saved.store[image.id].props.src,drawingAssetUrl(id));
  assert.equal(original.store[image.id].props.src,'minamo-image:'+id);
  assert.deepEqual(drawingImageIds(saved),[id]);
});

test('JPEG fallback is restricted to explicit server container rejection',()=>{
  const jpeg={type:'image/jpeg'},png={type:'image/png'};
  const ImageStageError=class extends Error{constructor(message,status,code){super(message);this.name='ImageStageError';this.status=status;this.code=code;}};
  assert.equal(shouldReencodeDrawingJpeg(jpeg,new ImageStageError('JPEG marker rejected',400,'invalid_image')),true);
  assert.equal(shouldReencodeDrawingJpeg(png,new ImageStageError('PNG rejected',400,'invalid_image')),false);
  for(const failure of [new Error('network failed'),new ImageStageError('unauthorized',401,'authentication_required'),new ImageStageError('quota',413,'image_size'),new ImageStageError('generation conflict',409,'workspace_generation_conflict'),new ImageStageError('storage down',503,'asset_storage_unavailable'),new ImageStageError('bad mime',400,'image_mime_mismatch')]){
    assert.equal(shouldReencodeDrawingJpeg(jpeg,failure),false);
  }
});
