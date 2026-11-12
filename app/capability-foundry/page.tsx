import {notFound} from 'next/navigation';
import FoundryGallery from '../foundry-gallery';
export const dynamic='force-dynamic';
/** Deliberately unavailable in production, regardless of sign-in or query parameters. */
export default function CapabilityFoundry(){if(!import.meta.env.DEV)notFound();return <FoundryGallery/>;}
