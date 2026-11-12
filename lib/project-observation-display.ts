import type {PassagePart} from './contracts';

/** A saved canvas result has ordinary, recoverable Project parts. Its generated
 * technical JSON remains inspectable but is not a learner code exercise. */
export function isProjectObservationEvidencePart(part:Pick<PassagePart,'id'|'kind'|'language'>):boolean{
 return part.kind==='code'&&part.language==='json'&&/^observation-[a-f0-9]{32}-inputs$/.test(part.id);
}
