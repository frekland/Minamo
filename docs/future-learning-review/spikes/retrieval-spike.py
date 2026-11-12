#!/usr/bin/env python3
"""Synthetic-only SQL experiment. Does not access Minamo, GitHub, credentials or disk DBs.

python retrieval-spike.py [--output retrieval-results.json]
Optional D1 compatibility probe: node retrieval-d1-probe.mjs --checkout /absolute/checkout
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import re
import sqlite3
import statistics
import time

ROOT = Path(__file__).resolve().parent
OWNER = 'synthetic-owner'
GENERATION = 'synthetic-generation'
# Fixed before inspecting outcomes. No synonym expansion, model, stemming or corpus tuning.
STOP = set('a an the in on of to for from with is are was were be been being do does did how what why can could would should i me my we our you your it its this that as and or not then than currently'.split())

SCHEMA = '''
CREATE TABLE heads(id TEXT PRIMARY KEY, owner TEXT, generation TEXT, eligible INTEGER, revision INTEGER);
CREATE TABLE passages(id TEXT PRIMARY KEY, owner TEXT, generation TEXT, revision INTEGER, title TEXT, text TEXT);
CREATE TABLE aliases(term TEXT COLLATE BINARY, id TEXT, case_sensitive INTEGER);
CREATE VIRTUAL TABLE search_fts USING fts5(id UNINDEXED, owner UNINDEXED, generation UNINDEXED, revision UNINDEXED, title, text, tokenize='unicode61');
'''

LITERAL = '''SELECT p.id,p.title,p.text FROM passages p JOIN heads h ON h.id=p.id
 WHERE p.owner=? AND p.generation=? AND h.owner=p.owner AND h.generation=p.generation
 AND h.eligible=1 AND h.revision=p.revision
 AND instr(lower(p.title || ' ' || p.text),lower(?))>0 ORDER BY p.id LIMIT 5'''

EXACT = '''SELECT DISTINCT p.id,p.title,p.text FROM aliases a JOIN passages p ON p.id=a.id
 JOIN heads h ON h.id=p.id WHERE p.owner=? AND p.generation=? AND h.owner=p.owner
 AND h.generation=p.generation AND h.eligible=1 AND h.revision=p.revision
 AND ((a.case_sensitive=1 AND a.term=? COLLATE BINARY)
 OR (a.case_sensitive=0 AND lower(a.term)=lower(?))) ORDER BY p.id LIMIT 5'''

FTS = '''SELECT p.id,p.title,p.text FROM search_fts JOIN passages p ON p.id=search_fts.id
 JOIN heads h ON h.id=p.id WHERE search_fts MATCH ? AND p.owner=? AND p.generation=?
 AND h.owner=p.owner AND h.generation=p.generation AND h.eligible=1
 AND h.revision=p.revision AND CAST(search_fts.revision AS INTEGER)=p.revision
 ORDER BY bm25(search_fts,0,0,0,0,4,1),p.id LIMIT 5'''

# Small-fixture experiment fetches the entire eligible matching set before ranking.
# A production bounded candidate window can miss the best local-score result.
FTS_CANDIDATES = FTS[:FTS.index(' ORDER BY')]

def tokens(query):
    return list(dict.fromkeys(t.casefold() for t in re.findall(r'\w+', query, flags=re.UNICODE)
                              if t.casefold() not in STOP))[:12]

def expression(query, mode):
    # Never accept caller FTS operators. Quoted derived tokens are data.
    ts = tokens(query)
    return (' AND ' if mode == 'and' else ' OR ').join('"' + t.replace('"','""') + '"' for t in ts)

def local_score(row, query):
    """Fixed corpus-independent score, specified once; no IDF or global statistics."""
    ts=tokens(query)
    title=tokens(row['title']);body=tokens(row['text'])
    coverage=sum(term in title or term in body for term in ts)
    title_hits=sum(term in title for term in ts)
    def contiguous(words):
        return bool(ts) and any(words[i:i+len(ts)]==ts for i in range(len(words)-len(ts)+1))
    # Coverage dominates, then title support, then an exact derived-token phrase.
    # This is a transparent heuristic, not a probability or educational judgement.
    return 100*coverage+10*title_hits+5*int(contiguous(title))+2*int(contiguous(body))

def install(db, passages):
    db.executescript(SCHEMA)
    for p in passages:
        owner,gen=p.get('owner',OWNER),p.get('generation',GENERATION)
        db.execute('INSERT INTO heads VALUES(?,?,?,?,1)',(p['id'],owner,gen,int(p.get('eligible',True))))
        db.execute('INSERT INTO passages VALUES(?,?,?,1,?,?)',(p['id'],owner,gen,p['title'],p['text']))
        # Include deliberately stale/forbidden canaries to exercise outward filtering.
        # Production should avoid indexing restricted projections in the first place.
        db.execute('INSERT INTO search_fts VALUES(?,?,?,1,?,?)',(p['id'],owner,gen,p['title'],p['text']))
        for alias in p.get('exact',[]):
            for term in [alias['term'],*alias.get('aliases',[])]:
                db.execute('INSERT INTO aliases VALUES(?,?,?)',(term,p['id'],int(alias.get('caseSensitive',True))))
    db.commit()

def retrieve(db, query, strategy):
    exact=db.execute(EXACT,(OWNER,GENERATION,query,query)).fetchall()
    if exact:
        return exact,'exact'
    if strategy=='literal':
        return db.execute(LITERAL,(OWNER,GENERATION,query)).fetchall(),'literal'
    terms=expression(query,'and' if strategy in ['fts-and','fts-and-local'] else 'or')
    if not terms:
        return [],'no-lexical-terms'
    if strategy=='fts-and-local':
        candidates=db.execute(FTS_CANDIDATES,(terms,OWNER,GENERATION)).fetchall()
        return sorted(candidates,key=lambda row:(-local_score(row,query),row['id']))[:5],strategy
    return db.execute(FTS,(terms,OWNER,GENERATION)).fetchall(),strategy

def dto(rows):
    return [{'id':r['id'],'title':r['title'],'preview':r['text'][:220]} for r in rows]

def percentile(values, fraction):
    return sorted(values)[max(0, min(len(values)-1, int(len(values)*fraction)-1))]

def evaluate(db, queries):
    results={}
    for strategy in ['literal','fts-and','fts-or','fts-and-local']:
        cases=[];timings=[]
        # One unmeasured warmup per case, then 20 timing samples of precisely the same query.
        for case in queries:
            rows,path=retrieve(db,case['query'],strategy)
            elapsed=[]
            for _ in range(20):
                start=time.perf_counter_ns();again,_=retrieve(db,case['query'],strategy)
                elapsed.append((time.perf_counter_ns()-start)/1_000_000)
                assert [r['id'] for r in again]==[r['id'] for r in rows]
            timings.extend(elapsed)
            ids=[r['id'] for r in rows];expected=case['expected']
            cases.append({**case,'path':path,'results':ids,
                          'hitAt5':bool(set(ids)&set(expected)) if expected else None,
                          'top1Correct':ids[0] in expected if ids and expected else False if expected else None,
                          'falsePositiveNoAnswer':bool(ids) if not expected else None,
                          'serializedUtf8Bytes':len(json.dumps(dto(rows),ensure_ascii=False,separators=(',',':')).encode()),
                          'medianSqlMs':round(statistics.median(elapsed),5)})
        positives=[c for c in cases if c['expected']];negatives=[c for c in cases if not c['expected']]
        categories={}
        for category in dict.fromkeys(c['category'] for c in cases):
            cs=[c for c in cases if c['category']==category]
            categories[category]={'cases':len(cs),'hitAt5':sum(c['hitAt5'] is True for c in cs),
                                  'falsePositiveNoAnswer':sum(c['falsePositiveNoAnswer'] is True for c in cs)}
        results[strategy]={'positiveCases':len(positives),'hitAt5':sum(c['hitAt5'] for c in positives),
                           'top1Correct':sum(c['top1Correct'] for c in positives),
                           'noAnswerCases':len(negatives),'falsePositiveNoAnswer':sum(c['falsePositiveNoAnswer'] for c in negatives),
                           'medianSqlMs':round(statistics.median(timings),5),'p95SqlMs':round(percentile(timings,.95),5),
                           'meanSerializedUtf8Bytes':round(statistics.mean(c['serializedUtf8Bytes'] for c in cases),1),
                           'categories':categories,'cases':cases}
    return results

def safety_checks(db):
    results={}
    for marker in ['GHOSTCANARY','ALIENCANARY','OLDCANARY']:
        rows,_=retrieve(db,marker,'fts-or');assert rows==[];results[marker]='excluded'
    # Existing FTS bytes remain after eligibility changes: current head must dominate.
    db.execute('UPDATE heads SET eligible=0 WHERE id=?',('02-node',))
    rows,_=retrieve(db,'document undefined','fts-and');assert not rows
    results['post-revocation-head-filter']='excluded without index refresh'
    db.execute('UPDATE heads SET eligible=1,revision=2 WHERE id=?',('02-node',))
    rows,_=retrieve(db,'document undefined','fts-and');assert not rows
    results['stale-passage-revision']='excluded'
    db.execute('UPDATE passages SET revision=2 WHERE id=?',('02-node',))
    rows,_=retrieve(db,'document undefined','fts-and');assert not rows
    results['stale-fts-revision']='excluded'
    # Reconstruct derived table from eligible authoritative rows.
    db.execute('DELETE FROM search_fts')
    db.execute('''INSERT INTO search_fts SELECT p.id,p.owner,p.generation,p.revision,p.title,p.text
      FROM passages p JOIN heads h ON h.id=p.id WHERE h.eligible=1 AND h.revision=p.revision
      AND h.owner=p.owner AND h.generation=p.generation''')
    rows,_=retrieve(db,'document undefined','fts-and');assert [r['id'] for r in rows]==['02-node']
    results['derived-index-rebuild']='restored current eligible destination'
    for q,id in [('curl -i','21-curl-lower'),('curl -I','22-curl-upper'),('Map','23-map-object'),('map','24-map-function'),('??','25-nullish'),('||','26-or')]:
        rows,path=retrieve(db,q,'fts-or');assert [r['id'] for r in rows]==[id] and path=='exact'
    results['case-punctuation-exact-path']='preserved'
    return results

def corpus_statistics_check():
    # Distinct in-memory database, outside measured corpus. Eligibility predicates do
    # not isolate FTS global document frequencies, even when every outward row is scoped.
    db=sqlite3.connect(':memory:')
    db.execute('CREATE VIRTUAL TABLE f USING fts5(owner UNINDEXED,id UNINDEXED,text)')
    db.executemany('INSERT INTO f VALUES(?,?,?)',[('one','A','alpha alpha alpha'),('one','B','beta beta beta')])
    query=lambda: [r[0] for r in db.execute("SELECT id FROM f WHERE f MATCH ? AND owner='one' ORDER BY bm25(f),id",('alpha OR beta',))]
    before=query()
    db.executemany('INSERT INTO f VALUES(?,?,?)',[('other',str(i),'alpha') for i in range(100)])
    after=query();assert before==['A','B'] and after==['B','A'];db.close()
    return {'beforeOtherOwnerRows':before,'afterOtherOwnerRows':after,
            'conclusion':'Global BM25 corpus statistics change eligible result order despite WHERE owner filter. Production scoring/index partition must address owner/generation/rights noninterference; hiding raw scores alone is insufficient.'}

def local_score_invariance_check():
    db=sqlite3.connect(':memory:');db.row_factory=sqlite3.Row
    # Both candidates contain alpha, so the AND path includes both. Title support
    # intentionally favours A independently of other documents in the table.
    install(db,[{'id':'A','title':'Alpha explanation','text':'alpha beta'},
                {'id':'B','title':'A second explanation','text':'alpha beta beta'}])
    before=[row['id'] for row in retrieve(db,'alpha','fts-and-local')[0]]
    other=[('other-owner','x'+str(i),'alpha') for i in range(100)]
    for owner,ident,text in other:
        db.execute('INSERT INTO heads VALUES(?,?,?,?,1)',(ident,owner,GENERATION,1))
        db.execute('INSERT INTO passages VALUES(?,?,?,1,?,?)',(ident,owner,GENERATION,text,text))
        db.execute('INSERT INTO search_fts VALUES(?,?,?,1,?,?)',(ident,owner,GENERATION,text,text))
    after_owner=[row['id'] for row in retrieve(db,'alpha','fts-and-local')[0]]
    # Stale generation rows are equally irrelevant to the local score and matching set.
    for i in range(100):
        ident='old'+str(i)
        db.execute('INSERT INTO heads VALUES(?,?,?,?,1)',(ident,OWNER,'old-generation',1))
        db.execute('INSERT INTO passages VALUES(?,?,?,1,?,?)',(ident,OWNER,'old-generation','alpha','alpha'))
        db.execute('INSERT INTO search_fts VALUES(?,?,?,1,?,?)',(ident,OWNER,'old-generation','alpha','alpha'))
    after_generation=[row['id'] for row in retrieve(db,'alpha','fts-and-local')[0]]
    assert before==after_owner==after_generation==['A','B'];db.close()
    return {'before':before,'after100OtherOwnerRows':after_owner,'after100OldGenerationRows':after_generation,
            'conclusion':'Unchanged order using the complete eligible candidate set and per-passage local scoring. Does not establish scalable bounded-window completeness.'}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',type=Path,default=ROOT/'retrieval-results.json');args=p.parse_args()
    fixture=json.loads((ROOT/'retrieval-fixture.json').read_text());assert fixture['synthetic'] is True
    db=sqlite3.connect(':memory:');db.row_factory=sqlite3.Row
    install(db,fixture['passages']);results=evaluate(db,fixture['queries']);checks=safety_checks(db)
    out={'synthetic':True,'backend':'Python stdlib SQLite in-memory; NOT hosted D1',
         'sqliteVersion':sqlite3.sqlite_version,'passages':len(fixture['passages']),'queryCases':len(fixture['queries']),
         'methodology':'Fixed synthetic fixture, 20 warm SQL samples per case per strategy. Same exact alias path first. No model/synonym expansion. Literal is simplified query-shape comparator, not execution of production domain code.',
         'strategies':results,'safetyChecks':checks,'globalCorpusStatistics':corpus_statistics_check(),
         'localScoreInvariance':local_score_invariance_check(),
         'limitations':['Tiny authored corpus and hand-labelled cases, not representative production recall or latency.',
                        'No HTTP/connector/network/hosted-D1 timing or database concurrency measured.',
                        'Eligibility is a simplified head model, not Minamo source-rights/restore/domain integration proof.',
                        'FTS corpus statistics can influence rank across excluded rows; production must isolate scoring or avoid exposing rank statistics. Head filters alone are insufficient proof of noninterference.',
                        'Record-per-passage fixture does not evaluate aggregating multiple passages in the same article.',
                        'fts-and-local fetches the entire small eligible matching set; a production candidate cap can change completeness and needs a separate design/benchmark.',
                        'Full-query literal recall is intentionally measured; GPT can already reformulate queries today.',
                        'A return of lexical candidates is not a claim that any candidate answers the question.']}
    args.output.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'backend':out['backend'],'sqliteVersion':out['sqliteVersion'],'passages':out['passages'],'queryCases':out['queryCases'],
                      'strategies':{k:{kk:vv for kk,vv in v.items() if kk not in ['cases','categories']} for k,v in results.items()},'safetyChecks':checks},indent=2))
    db.close()

if __name__=='__main__':main()
