import {Fragment} from 'react';
import {japaneseFuriganaRuns} from '../lib/japanese-furigana';
/** Display-only markup: reading text does not alter the authored part or its anchors. */
export function JapaneseFuriganaText({text}:{text:string}){
 return <>{japaneseFuriganaRuns(text).map((run,index)=>run.reading?<ruby key={index} className="minamo-japanese-reading" title={run.text+' · '+run.reading}>{run.text}<rp>(</rp><rt>{run.reading}</rt><rp>)</rp></ruby>:<Fragment key={index}>{run.text}</Fragment>)}</>;
}
