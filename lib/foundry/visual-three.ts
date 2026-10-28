import * as THREE from 'three';
import {validateVisualScene,type VisualScene,type VisualMesh} from './visual';
/** Trusted geometry/material construction only. Deliberately never uses GLTFLoader, textures or URLs. */
export function buildVisualGroup(input:unknown){
 const spec=validateVisualScene(input),group=new THREE.Group(),geometries:THREE.BufferGeometry[]=[],materials:THREE.MeshStandardMaterial[]=[];let disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;for(const g of geometries)g.dispose();for(const m of materials)m.dispose();group.clear();};
 try{for(const item of spec.meshes){const geometry=makeGeometry(item);geometries.push(geometry);const material=new THREE.MeshStandardMaterial({color:item.color,roughness:0.7,metalness:0,side:THREE.DoubleSide});materials.push(material);const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...item.position);mesh.scale.set(...item.size);group.add(mesh);}return {spec,group,geometries,materials,dispose};}catch(e){dispose();throw e;}
}
function makeGeometry(item:VisualMesh):THREE.BufferGeometry{
 if(item.shape==='triangles'){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(item.positions,3));g.setIndex(item.indices);g.computeVertexNormals();return g;}
 if(item.shape==='sphere')return new THREE.SphereGeometry(1,16,12);
 if(item.shape==='box')return new THREE.BoxGeometry(1,1,1);
 return new THREE.CylinderGeometry(0.5,0.5,1,16);
}

/** Presentation-only normalization keeps every bounded source scale within the camera frustum.
 * Canonical source and child geometry are unchanged; only this disposable group transform moves. */
export function fitVisualGroup(group:THREE.Group){
 const bounds=new THREE.Box3().setFromObject(group),center=bounds.getCenter(new THREE.Vector3()),extent=bounds.getSize(new THREE.Vector3()).length();
 const scale=extent>0?2/extent:1;group.position.copy(center).multiplyScalar(-scale);group.scale.setScalar(scale);group.updateMatrixWorld(true);
 return {sourceCenter:center.toArray() as [number,number,number],presentationScale:scale,radius:3,near:0.01,far:100,minRadius:0.1,maxRadius:20};
}
export type VisualController={rotate:(dx:number,dy:number)=>void;zoom:(factor:number)=>void;dispose:()=>void;metrics:()=>{geometries:number;triangles:number;programs:number;disposed:boolean}};
/** On-demand rendering: no requestAnimationFrame loop, network, asset fetches or storage. */
export function mountVisualScene(canvas:HTMLCanvasElement,input:VisualScene,onStatus:(status:string)=>void=()=>{}):VisualController{
 const built=buildVisualGroup(input),fit=fitVisualGroup(built.group),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(45,1,fit.near,fit.far);let renderer:THREE.WebGLRenderer|undefined,observer:ResizeObserver|undefined,disposed=false,lost=false,yaw=0.55,pitch=0.35,radius=fit.radius;const target=new THREE.Vector3();
 scene.background=new THREE.Color('#141e27');scene.add(built.group,new THREE.AmbientLight(0xffffff,1.8));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(5,7,8);scene.add(sun);
 const render=()=>{if(disposed||lost||!renderer)return;camera.position.set(target.x+radius*Math.cos(pitch)*Math.sin(yaw),target.y+radius*Math.sin(pitch),target.z+radius*Math.cos(pitch)*Math.cos(yaw));camera.lookAt(target);renderer.render(scene,camera);};
 const resize=()=>{if(!renderer||disposed)return;const w=Math.max(1,Math.min(1400,canvas.clientWidth||400)),h=Math.max(1,Math.min(1000,canvas.clientHeight||260));renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(45)/2)/Math.min(1,camera.aspect)));camera.updateProjectionMatrix();render();};
 const contextLost=(e:Event)=>{e.preventDefault();lost=true;onStatus('WebGL context lost. Close and reopen the viewer; static source remains available.');};
 const restored=()=>{lost=false;onStatus('WebGL context restored');resize();};
 const dispose=()=>{if(disposed)return;disposed=true;observer?.disconnect();canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',restored);built.dispose();scene.clear();if(renderer){renderer.setAnimationLoop(null);renderer.dispose();renderer.forceContextLoss();}};
 try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(2,globalThis.devicePixelRatio||1));canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',restored);if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(resize);observer.observe(canvas);}resize();onStatus('Three.js geometry rendered locally; no external resources.');return {rotate(dx,dy){if(!Number.isFinite(dx)||!Number.isFinite(dy))return;yaw+=Math.max(-1,Math.min(1,dx));pitch=Math.max(-1.4,Math.min(1.4,pitch+Math.max(-1,Math.min(1,dy))));render();},zoom(factor){if(!Number.isFinite(factor)||factor<=0)return;radius=Math.max(fit.minRadius,Math.min(fit.maxRadius,radius*factor));render();},dispose,metrics(){return {geometries:renderer?.info.memory.geometries??0,triangles:renderer?.info.render.triangles??0,programs:renderer?.info.programs?.length??0,disposed};}};}catch(error){dispose();throw error;}
}
