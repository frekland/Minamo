/** The pure controller mirrors the v3/v4 React state transition and permits deterministic testing. */
export function createRequestController({guarded=false,onChange=()=>{}}={}){
  let token=0,state={mood:null,status:'idle',tracks:[],error:null};
  const publish=next=>{state=next;onChange(state);};
  return {
    get state(){return state;},
    async select(mood,pending){
      const mine=++token;
      publish({mood,status:'loading',tracks:[],error:null});
      try{
        const tracks=await pending;
        if(!guarded||mine===token)publish({...state,status:tracks.length?'ready':'empty',tracks,error:null});
      }catch(error){
        if(!guarded||mine===token)publish({...state,status:'error',tracks:[],error:String(error.message??error)});
      }
    }
  };
}
