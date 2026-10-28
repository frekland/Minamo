import {notFound} from 'next/navigation';
import DiagramReview from '../diagram-review';
export default function DiagramReviewPage(){if(!import.meta.env.DEV)notFound();return <DiagramReview/>;}
