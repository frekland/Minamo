import {notFound} from 'next/navigation';
import LearningContinuityFixture from '../learning-continuity-fixture';
export const dynamic='force-dynamic';
/** Visual acceptance only; never supplies identity or acknowledges a write. */
export default function PreviewLearning(){if(!import.meta.env.DEV)notFound();return <LearningContinuityFixture/>;}
