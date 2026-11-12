'use client';
import {tokenizeJapanese} from '../lib/japanese-tokenizer-client';
import {tokenReadingRuns} from '../lib/japanese-token-readings';
import {useGlobalFurigana} from './furigana-preference';
import {Fragment,useEffect,useState} from 'react';
import {japaneseFuriganaRuns} from '../lib/japanese-furigana';
/** Display-only markup: reading text does not alter the authored part or its anchors. */
export function JapaneseFuriganaText({text}:{text:string}){
 const enabled=useGlobalFurigana();
 const [analysed,setAnalysed]=useState<{text:string;runs:ReturnType<typeof tokenReadingRuns>}|null>(null);
 useEffect(()=>{let active=true;if(enabled&&/\p{Script=Han}/u.test(text))void tokenizeJapanese(text).then(tokens=>{if(active)setAnalysed({text,runs:tokenReadingRuns(text,tokens)});}).catch(()=>{});return()=>{active=false;};},[text,enabled]);
 const runs=analysed?.text===text?analysed.runs:japaneseFuriganaRuns(text);
 return <>{runs.map((run,index)=>run.reading?<ruby key={index} className="minamo-japanese-reading" title={run.text+' · '+run.reading}>{run.text}<rp>(</rp><rt>{run.reading}</rt><rp>)</rp></ruby>:<Fragment key={index}>{run.text}</Fragment>)}</>;
}
