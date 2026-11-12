import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function PreviewInterface(){if(import.meta.env.DEV){const {default:InterfaceLab}=await import('../interface-lab');return <InterfaceLab/>;}notFound();}
