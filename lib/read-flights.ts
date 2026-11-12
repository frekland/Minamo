/** Only concurrent work is shared. Settled private values are never cached.
 * The caller's key must include owner/generation, selection and invalidation epoch. */
export function createReadFlights(){
 const pending=new Map<string,Promise<unknown>>();
 return {run<T>(key:string,read:()=>Promise<T>):Promise<T>{
  const existing=pending.get(key);if(existing)return existing as Promise<T>;
  const result=Promise.resolve().then(read);pending.set(key,result);
  const clear=()=>{if(pending.get(key)===result)pending.delete(key)};
  void result.then(clear,clear);return result;
 }};
}
