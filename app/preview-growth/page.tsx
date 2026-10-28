import {notFound} from 'next/navigation';
import GrowthPreview from '../growth-preview';
export const dynamic='force-dynamic';
export default function PreviewGrowth(){if(!import.meta.env.DEV)notFound();return <GrowthPreview/>;}
