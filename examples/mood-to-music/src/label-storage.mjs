/** TEST ONLY local browser storage adapter; never calls Spotify or Minamo. */
export const STORAGE_KEY='TEST-ONLY-m2m-personal-labels-v1';
export const CONSENT_KEY='TEST-ONLY-m2m-remember-labels-v1';
export function browserStorage(){try{return window.localStorage}catch{return null;}}
export function readConsent(storage){try{return storage?.getItem(CONSENT_KEY)==='yes'}catch{return false;}}
export function setConsent(storage,enabled){
  try{if(enabled)storage?.setItem(CONSENT_KEY,'yes');else storage?.removeItem(CONSENT_KEY);return true;}catch{return false;}
}

export function readSavedLabels(storage){
  try{
    const value=JSON.parse(storage?.getItem(STORAGE_KEY)??'null');
    if(!value||typeof value!=='object'||Array.isArray(value))return {};
    return Object.fromEntries(Object.entries(value).filter(([key,labels])=>
      /^[a-z][0-9]{2}$/.test(key)&&Array.isArray(labels)&&labels.length<=20&&
      labels.every(label=>typeof label==='string'&&label.length<=80)
    ));
  }catch{return {};}
}
export function saveLabels(storage,tracks){
  const labels=Object.fromEntries(tracks.filter(track=>track.personalLabels.length).map(track=>[track.id,track.personalLabels]));
  try{storage?.setItem(STORAGE_KEY,JSON.stringify(labels));return true;}catch{return false;}
}
export function clearSavedLabels(storage){try{storage?.removeItem(STORAGE_KEY);return true;}catch{return false;}}
export function applySavedLabels(tracks,saved){return tracks.map(track=>({...track,personalLabels:[...(saved[track.id]??[])]}));}
