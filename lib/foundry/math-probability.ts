import {fraction,type Fraction} from './math-linear';
/** Small fixed distribution engines. Synthetic inputs never become inferred learner or real-world evidence. */
export type ConfusionCounts={truePositive:number;falsePositive:number;falseNegative:number;trueNegative:number};
function count(x:number,max=1000000){if(!Number.isSafeInteger(x)||x<0||x>max)throw Error('Use bounded nonnegative integer counts.');return x;}
const ratio=(n:number,d:number):Fraction|null=>d?fraction(n,d):null;
export function inspectClassifierCounts(c:ConfusionCounts){
 if(!c||typeof c!=='object'||Array.isArray(c)||Object.keys(c).length!==4||Object.keys(c).some(k=>!['truePositive','falsePositive','falseNegative','trueNegative'].includes(k)))throw Error('Use exactly the four confusion-matrix counts.');
 const tp=count(c.truePositive),fp=count(c.falsePositive),fn=count(c.falseNegative),tn=count(c.trueNegative),total=tp+fp+fn+tn;
 return {total,positivePredictions:tp+fp,posteriorPositive:ratio(tp,tp+fp),sensitivity:ratio(tp,tp+fn),specificity:ratio(tn,tn+fp),baseRate:ratio(tp+fn,total),accuracy:ratio(tp+tn,total),qualification:'Calculated from supplied counts; illustrative inputs are not observed classifier performance.'};
}
export function binomialDistribution(trials:number,p:number){
 if(!Number.isInteger(trials)||trials<0||trials>100||!Number.isFinite(p)||p<0||p>1)throw Error('Use 0–100 trials and probability from zero to one.');
 const logFactorial=[0];for(let i=1;i<=trials;i++)logFactorial[i]=logFactorial[i-1]+Math.log(i);
 const values=Array.from({length:trials+1},(_,k)=>({k,probability:p===0?(k===0?1:0):p===1?(k===trials?1:0):Math.exp(logFactorial[trials]-logFactorial[k]-logFactorial[trials-k]+k*Math.log(p)+(trials-k)*Math.log1p(-p))}));
 const total=values.reduce((sum,v)=>sum+v.probability,0);return {values,mean:trials*p,variance:trials*p*(1-p),totalProbability:total,classification:'locally-computed-numeric-example' as const,qualification:'Binomial model assumes fixed independent trials with the same success probability.'};
}
export function exactCountDistribution(counts:number[]){if(!Array.isArray(counts)||counts.length<1||counts.length>100)throw Error('Use 1–100 outcome counts.');counts=counts.map(x=>count(x));const total=counts.reduce((a,b)=>a+b,0);if(!total)throw Error('At least one outcome must have positive count.');return counts.map((n,index)=>({index,count:n,probability:fraction(n,total)}));}
