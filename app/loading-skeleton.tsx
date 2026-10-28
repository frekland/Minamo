import './loading-skeleton.css';

/** Structural loading only; no fake text, counts or saved state. */
export default function LoadingSkeleton({kind='reading',label='Loading…'}:{kind?:'reading'|'cards'|'outline';label?:string}){
 return <div className={'loading-skeleton loading-skeleton-'+kind} role="status" aria-label={label} aria-busy="true"><span className="v2-sr-only">{label}</span><div aria-hidden="true">{kind==='cards'?Array.from({length:4},(_,index)=><div className="loading-skeleton-card" key={index}><i/><i/></div>):<><i className="loading-skeleton-heading"/>{Array.from({length:kind==='outline'?3:5},(_,index)=><i key={index}/>)}</>}</div></div>;
}
