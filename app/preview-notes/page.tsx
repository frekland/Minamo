import {notFound} from 'next/navigation';
import NoteLifecycleFixture from '../note-lifecycle-fixture';
export const dynamic='force-dynamic';
export default function PreviewNotes(){if(!import.meta.env.DEV)notFound();return <NoteLifecycleFixture/>;}
