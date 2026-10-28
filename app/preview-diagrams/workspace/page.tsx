import {notFound} from 'next/navigation';
import DiagramReview from '../../diagram-review';
export default function DiagramWorkspacePage(){if(!import.meta.env.DEV)notFound();return <DiagramReview embedded/>;}
