import {notFound} from 'next/navigation';
import BetaCenter from '../beta-center';
import {principalScope} from '../../lib/beta-access';
export default async function PreviewBeta(){if(!import.meta.env.DEV)notFound();return <main style={{maxWidth:900,margin:'40px auto',padding:20}}><h1>Private beta · local synthetic preview</h1><BetaCenter scope={'v2-'+await principalScope('TEST-ONLY-beta-browser')} generation="legacy@0" empty apiBase="/preview-beta/api?path="/></main>;}
