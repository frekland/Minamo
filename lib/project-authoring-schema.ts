/** Public routine-content contract. Concrete alternatives avoid conditional
 * intersections that some MCP clients erase when generating argument types.
 * Canonical domain validation remains authoritative for content and rights.
 */
export function routineContentSchema(canonical:any){
 const fields=canonical.properties;
 const variant=(kind:string,keys:string[],required:string[])=>({
  type:'object',properties:Object.fromEntries(['id','kind',...keys].map(key=>[key,key==='kind'?{type:'string',enum:[kind]}:structuredClone(fields[key])])),
  required:['kind',...required],additionalProperties:false
 });
 const prose=['text','inline','semantic','joinBefore'];
 return {anyOf:[
  variant('paragraph',prose,['text']),
  variant('code',['text','language','joinBefore'],['text']),
  variant('table',['text','table','semantic','joinBefore'],['table']),
  variant('callout',[...prose,'callout'],['text','callout']),
  variant('reference',['text','reference','joinBefore'],['text','reference']),
  variant('image',['text','image','joinBefore'],['image']),
  variant('media',['text','media','joinBefore'],['media']),
  variant('excerpt',['text','excerpt','joinBefore'],['text','excerpt']),
  variant('interactive',['text','interactive','joinBefore'],['text','interactive']),
  variant('diagram',['text','diagram','joinBefore'],['diagram']),
  // Preserve legacy authored text diagrams without requiring structured nodes.
  variant('diagram',['text','joinBefore'],['text'])
 ]};
}
