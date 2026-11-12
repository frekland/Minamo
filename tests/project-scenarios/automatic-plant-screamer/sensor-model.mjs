/** TEST ONLY: deterministic ADC/audio state model. NOT ESP32 or DFPlayer execution. */
export const SYNTHETIC_TRACES=Object.freeze({
  noisy:[2750,2810,2780,2820,2750,2900,2210,2810],
  rearm:[2600,2850,2860,2200,2910],
  quiet:[2600,2850,2860,2200,2910]
});
function validate(samples,low,high){
  if(!Array.isArray(samples)||!Number.isFinite(low)||!Number.isFinite(high)||low>=high||
    !samples.every(v=>Number.isInteger(v)&&v>=0&&v<=4095))
    throw Error('Invalid synthetic ADC input or hysteresis');
}
export function naiveTriggers(samples,dryThreshold=2800){
  if(!Array.isArray(samples)||!samples.every(v=>Number.isInteger(v)&&v>=0&&v<=4095))
    throw Error('Invalid synthetic ADC input');
  return samples.flatMap((v,i)=>v>=dryThreshold?[i]:[]);
}
export function boundedTriggers(samples,{
  dryThreshold=2800,wetRearm=2400,minGap=3,mutedIndices=[]
}={}){
  validate(samples,wetRearm,dryThreshold);
  if(!Number.isSafeInteger(minGap)||minGap<0||!Array.isArray(mutedIndices)||
    !mutedIndices.every(i=>Number.isSafeInteger(i)&&i>=0&&i<samples.length))
    throw Error('Invalid synthetic alert policy');
  let armed=true,last=-Infinity;
  const events=[],muted=new Set(mutedIndices);
  for(let i=0;i<samples.length;i++){
    const count=samples[i];
    if(count<=wetRearm)armed=true;
    if(armed&&count>=dryThreshold&&i-last>=minGap){
      armed=false;
      if(!muted.has(i)){events.push(i);last=i;}
    }
  }
  return events;
}
