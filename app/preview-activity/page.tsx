import {notFound} from 'next/navigation';
import ActivityPreview from '../activity-preview';
export const dynamic='force-dynamic';
export default function PreviewActivity(){if(!import.meta.env.DEV)notFound();return <ActivityPreview/>;}
