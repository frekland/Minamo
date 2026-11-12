import './search-match.css';
import {searchEvidenceLabel,type SearchEvidence} from '../lib/search-evidence';
/** Text-only rendering: retrieved bytes never become markup or instructions. */
export default function SearchMatch({match}:{match:SearchEvidence}){
 const from=match.matchStart-match.excerptStart+(match.excerptStart?1:0),to=from+match.matchedTerm.length;
 return <><small className="v2-search-match-label">{match.field==='concept-term'||match.field==='concept-alias'?'Reference':match.field==='title'?'Title':match.field==='captured-quote'?'Marked passage':match.field==='code'?'Code':'In this section'}</small><p className="v2-search-match-excerpt">{match.excerpt.slice(0,from)}<mark>{match.excerpt.slice(from,to)}</mark>{match.excerpt.slice(to)}</p>{match.projection&&<small className="v2-search-match-label">Activity passage</small>}</>;
}
