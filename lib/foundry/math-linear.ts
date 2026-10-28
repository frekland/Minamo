/** Bounded exact rational row reduction; a worked algorithm trace, not a general theorem prover. */
export type Fraction={n:number;d:number};
const LIMIT=1e12;
function integer(n:number){if(!Number.isSafeInteger(n)||Math.abs(n)>LIMIT)throw Error('Exact arithmetic exceeded its integer budget.');return n;}
function gcd(a:number,b:number){a=Math.abs(a);b=Math.abs(b);while(b){const r=a%b;a=b;b=r;}return a||1;}
export function fraction(n:number,d=1):Fraction{integer(n);integer(d);if(!d)throw Error('Fraction denominator is zero.');const g=gcd(n,d),sign=d<0?-1:1;return {n:sign*n/g,d:Math.abs(d)/g};}
export function parseFraction(input:string|number):Fraction{if(typeof input==='number')return fraction(input);if(typeof input!=='string'||input.length>40||! /^-?\d+(?:\/[1-9]\d*)?$/.test(input))throw Error('Use an exact integer or numerator/positive-denominator fraction.');const [n,d]=input.split('/');return fraction(Number(n),d===undefined?1:Number(d));}
export function fractionLabel(f:Fraction){const q=fraction(f.n,f.d);return q.d===1?String(q.n):q.n+'/'+q.d;}
function fromBig(n:bigint,d:bigint):Fraction{if(d===BigInt(0))throw Error('Fraction denominator is zero.');let a=n<BigInt(0)?-n:n,b=d<BigInt(0)?-d:d;while(b!==BigInt(0)){const r=a%b;a=b;b=r;}const g=a||BigInt(1);n/=g;d/=g;if(d<BigInt(0)){n=-n;d=-d;}if(n>BigInt(LIMIT)||n<-BigInt(LIMIT)||d>BigInt(LIMIT))throw Error('Exact arithmetic exceeded its integer budget.');return {n:Number(n),d:Number(d)};}
const add=(a:Fraction,b:Fraction)=>fromBig(BigInt(a.n)*BigInt(b.d)+BigInt(a.d)*BigInt(b.n),BigInt(a.d)*BigInt(b.d));
const mul=(a:Fraction,b:Fraction)=>fromBig(BigInt(a.n)*BigInt(b.n),BigInt(a.d)*BigInt(b.d));
const div=(a:Fraction,b:Fraction)=>{if(!b.n)throw Error('Division by zero.');return fromBig(BigInt(a.n)*BigInt(b.d),BigInt(a.d)*BigInt(b.n));};
export type RowStep={rule:'swap'|'scale'|'eliminate';description:string;matrix:string[][]};
export type LinearReduction={contract:'minamo.linear-trace.v1';input:string[][];reduced:string[][];steps:RowStep[];rank:number;status:'unique'|'underdetermined'|'inconsistent';solution?:string[];classification:'locally-computed-algorithm-example';execution:'not-a-saved-minamo-run'};
export function reduceLinearSystem(input:(string|number)[][]):LinearReduction{
 if(!Array.isArray(input)||input.length<1||input.length>8||input.some(row=>!Array.isArray(row)||row.length<2||row.length>9||row.length!==input[0].length))throw Error('Use a rectangular augmented matrix with 1–8 equations and 1–8 variables.');
 const a=input.map(row=>row.map(parseFraction)),rows=a.length,cols=a[0].length,variables=cols-1,steps:RowStep[]=[],snapshot=()=>a.map(row=>row.map(fractionLabel)),original=snapshot();let pivotRow=0;
 for(let col=0;col<variables&&pivotRow<rows;col++){
  const found=a.findIndex((row,i)=>i>=pivotRow&&row[col].n!==0);if(found<0)continue;
  if(found!==pivotRow){[a[found],a[pivotRow]]=[a[pivotRow],a[found]];steps.push({rule:'swap',description:'Swap row '+(found+1)+' with row '+(pivotRow+1)+'.',matrix:snapshot()});}
  const pivot=a[pivotRow][col];
  if(pivot.n!==pivot.d){a[pivotRow]=a[pivotRow].map(v=>div(v,pivot));steps.push({rule:'scale',description:'Divide row '+(pivotRow+1)+' by '+fractionLabel(pivot)+'.',matrix:snapshot()});}
  for(let row=0;row<rows;row++)if(row!==pivotRow&&a[row][col].n!==0){const factor=a[row][col];a[row]=a[row].map((v,j)=>add(v,mul(fraction(-factor.n,factor.d),a[pivotRow][j])));steps.push({rule:'eliminate',description:'Subtract '+fractionLabel(factor)+' × row '+(pivotRow+1)+' from row '+(row+1)+'.',matrix:snapshot()});}
  pivotRow++;
 }
 const inconsistent=a.some(row=>row.slice(0,variables).every(v=>v.n===0)&&row[variables].n!==0),status=inconsistent?'inconsistent':pivotRow===variables?'unique':'underdetermined';
 const result:LinearReduction={contract:'minamo.linear-trace.v1',input:original,reduced:snapshot(),steps,rank:pivotRow,status,classification:'locally-computed-algorithm-example',execution:'not-a-saved-minamo-run'};
 if(status==='unique')result.solution=Array.from({length:variables},(_,col)=>fractionLabel(a.find(row=>row[col].n===row[col].d&&row.slice(0,col).every(v=>v.n===0))![variables]));
 return result;
}
