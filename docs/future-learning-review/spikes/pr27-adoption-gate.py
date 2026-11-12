#!/usr/bin/env python3
"""PR27 conditional adoption evidence. Synthetic, local in-memory SQLite only.

No Minamo HTTP/MCP, credentials or production database access. Existing labelled
fixture reused; reformulations below are fixed teaching-mechanism judgements,
not an online model or an evaluation on an unknown production corpus.
"""
from __future__ import annotations
import importlib.util,json,sqlite3,statistics,time,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('prior',ROOT/'retrieval-spike.py')
prior=importlib.util.module_from_spec(spec);spec.loader.exec_module(prior)
fixture=json.loads((ROOT/'retrieval-fixture.json').read_text())
# Written before this script's first execution. At most two mechanism-focused
# requests, chosen from the question, not from returned identifiers or hit labels.
REFORM={
'why is document undefined in node':['document','browser environment'],
'why does console.log return undefined':['console.log','returned value'],
'does const freeze object properties':['const','object mutation'],
'why does sort change the original array':['sort mutates','copying before sorting'],
'does a commit prove successful execution':['commit','execution'],
'how can stale response update current state':['stale response','effect cleanup'],
'why did a join multiply rows':['join','duplicate matching keys'],
'what does conflict retain':['conflict','draft'],
'KeyError missing key default':['KeyError','dict.get'],
'404 exit nonzero curl':['curl','HTTP failure'],
'IndexError missing position':['IndexError','list'],
'grapheme code points bytes':['grapheme','Unicode'],
'shell cannot find file':['working directory','relative path'],
'folder I am currently inside':['working directory','pwd'],
'screen message versus function answer':['console.log','returned value'],
'old download overwrites newest result':['stale response','AbortController'],
'keep local writing after racing saves':['revision','conflict'],
# Negative questions stay qualified; reducing a parcel question to "return"
# or a secret request to "client" would erase the meaning rather than reformulate.
'how do I return a parcel':['return parcel','parcel'],
'what is the secret token in a client':['secret token','client secret token'],
}
# Three selected workflow entry points, each with its own context and query set.
STORIES={
'find-and-use-reference':['why is document undefined in node','why does console.log return undefined','why does sort change the original array'],
'practical-work-and-evidence':['404 exit nonzero curl','how can stale response update current state','does a commit prove successful execution'],
'create-revise-and-reuse':['what does conflict retain','UTF-16 offsets','server acknowledgement'],
}

def article(pid):
    # Several passages genuinely belong to one broad Article; grouping is applied
    # before the five-Article limit, so many hits cannot consume every result slot.
    return {'03-return':'values','04-sort':'values','23-map-object':'values','24-map-function':'values',
            '14-effect':'react','15-state':'react','12-commit':'git','13-diff':'git',
            '05-http-status':'http','06-curl-exit':'http','21-curl-lower':'http','22-curl-upper':'http'}.get(pid,pid)

def scaled_passages(size):
    rows=[dict(p) for p in fixture['passages']]
    topics=['binary search trees','file permission ownership','routing table entries','integer division',
            'CSS grid tracks','terminal font configuration','archive container formats','network address prefixes',
            'text file encodings','database transaction boundaries']
    for i in range(size-len(rows)):
        topic=topics[i%len(topics)]
        rows.append({'id':'scale-'+hashlib.sha256(str(i).encode()).hexdigest()[:16],
                     'title':f'Synthetic reference {i}: {topic}',
                     'text':f'TEST ONLY original scale filler about {topic}. Inspect a small example, state its assumptions, compare the input with its declared representation, and check the relevant boundary before changing a larger system.'})
    return rows

def measured(db,q,kind):
    count=[0]
    # A SQLite VM-op progress callback estimates instruction work, not D1 rows_read.
    db.set_progress_handler(lambda: count.__setitem__(0,count[0]+100) or 0,100)
    start=time.perf_counter_ns()
    exact=db.execute(prior.EXACT,(prior.OWNER,prior.GENERATION,q,q)).fetchall()
    if exact:rows=exact;path='exact';candidates=len(rows)
    elif kind=='literal':
        # All matching eligible passages are read before grouping Articles. The
        # prior spike used LIMIT 5 at passage level; that can crowd an Article list.
        sql=prior.LITERAL.replace(' LIMIT 5','')
        rows=db.execute(sql,(prior.OWNER,prior.GENERATION,q)).fetchall();path='literal';candidates=len(rows)
    else:
        terms=prior.expression(q,'and')
        rows=db.execute(prior.FTS_CANDIDATES,(terms,prior.OWNER,prior.GENERATION)).fetchall() if terms else []
        rows=sorted(rows,key=lambda r:(-prior.local_score(r,q),r['id']));path='fts-and-local';candidates=len(rows)
    seen=set();grouped=[]
    for row in rows:
        a=article(row['id'])
        if a not in seen:grouped.append(row);seen.add(a)
        if len(grouped)==5:break
    elapsed=(time.perf_counter_ns()-start)/1e6;db.set_progress_handler(None,0)
    return grouped,{'ms':elapsed,'vmInstructionsApprox':count[0],'matchedPassages':candidates,'path':path}

def query_sequence(case,kind,reform):
    return list(dict.fromkeys(REFORM.get(case['query'],[case['query']]))) if reform else [case['query']]

def evaluate(db):
    strategies={}
    for name,kind,reform in [('literal-original','literal',False),('fts-original','fts',False),
                             ('literal-fixed-reformulation','literal',True),('fts-fixed-reformulation','fts',True)]:
        cases=[];times=[];work=[]
        for case in fixture['queries']:
            queries=query_sequence(case,kind,reform);destinations=[];payload=0;vm=0;matched=0
            for q in queries:
                rows,metric=measured(db,q,kind)
                for row in rows:
                    dest=article(row['id'])
                    if dest not in destinations:destinations.append(dest)
                payload+=len(json.dumps(prior.dto(rows),separators=(',',':')).encode());vm+=metric['vmInstructionsApprox'];matched+=metric['matchedPassages']
            # Warm measurements include both prescribed requests, without oracle
            # early exit or adapting a reformulation after seeing an expected ID.
            samples=[]
            for _ in range(5):
                start=time.perf_counter_ns()
                for q in queries:measured(db,q,kind)
                samples.append((time.perf_counter_ns()-start)/1e6)
            times.extend(samples);work.append(vm)
            expected={article(x) for x in case['expected']}
            cases.append({'query':case['query'],'requests':queries,'returnedArticleIds':destinations,
                          'positive':bool(expected),'hitWithinFixedBudget':bool(expected&set(destinations)) if expected else None,
                          'falsePositiveNoAnswer':bool(destinations) if not expected else None,
                          'requestCount':len(queries),'returnedArticles':len(destinations),'serializedBytes':payload,
                          'matchedPassagesAcrossRequests':matched,'vmInstructionsApprox':vm,
                          'medianWarmSqlMs':round(statistics.median(samples),4)})
        strategies[name]={'positiveCases':sum(c['positive'] for c in cases),
                          'usefulDestinations':sum(c['hitWithinFixedBudget'] is True for c in cases),
                          'noAnswerCases':sum(not c['positive'] for c in cases),
                          'noAnswerCandidates':sum(c['falsePositiveNoAnswer'] is True for c in cases),
                          'meanRequests':statistics.mean(c['requestCount'] for c in cases),
                          'meanReturnedArticleCandidates':statistics.mean(c['returnedArticles'] for c in cases),
                          'meanUtf8Bytes':statistics.mean(c['serializedBytes'] for c in cases),
                          'medianWarmSqlMs':round(statistics.median(times),4),
                          'p95WarmSqlMs':round(prior.percentile(times,.95),4),
                          'meanVmInstructionsApprox':round(statistics.mean(work)),
                          'stories':{story:{'cases':len(qs),'hits':sum(c['hitWithinFixedBudget'] is True for c in cases if c['query'] in qs)} for story,qs in STORIES.items()},
                          'cases':cases}
    return strategies

def checks(db):
    before={q:[article(r['id']) for r in measured(db,q,'fts')[0]] for q in ['returned value','stale response','working directory']}
    for i in range(300):
        owner,gen=('other-owner',prior.GENERATION) if i<150 else (prior.OWNER,'old-generation')
        p={'id':'excluded-'+str(i),'owner':owner,'generation':gen,'title':'returned value stale response working directory','text':'returned value stale response working directory'}
        db.execute('INSERT INTO heads VALUES(?,?,?,?,1)',(p['id'],owner,gen,1));db.execute('INSERT INTO passages VALUES(?,?,?,1,?,?)',(p['id'],owner,gen,p['title'],p['text']));db.execute('INSERT INTO search_fts VALUES(?,?,?,1,?,?)',(p['id'],owner,gen,p['title'],p['text']))
    after={q:[article(r['id']) for r in measured(db,q,'fts')[0]] for q in before}
    assert before==after
    exact={}
    for q in ['curl -i','curl -I','Map','map','??','||','dict.get()','dict.get']:
        a,ma=measured(db,q,'literal');b,mb=measured(db,q,'fts');assert [r['id'] for r in a]==[r['id'] for r in b] and ma['path']==mb['path']=='exact';exact[q]=[r['id'] for r in a]
    assert not measured(db,'GHOSTCANARY','fts')[0];assert not measured(db,'ALIENCANARY','fts')[0];assert not measured(db,'OLDCANARY','fts')[0]
    return {'noninterferenceBefore':before,'noninterferenceAfter300ExcludedRows':after,'exactAliases':exact,'eligibilityCanaries':'excluded','multiPassageArticleGrouping':'grouped before five-Article result limit'}

def main():
    out={'syntheticOnly':True,'backend':'Python SQLite in-memory, NOT hosted D1 or production domain','sqlite':sqlite3.sqlite_version,
         'method':'Existing fixed 40-case fixture, preset at-most-two mechanism reformulations; equal-budget literal vs FTS reformulated comparison. Five warm repetitions. Full eligible matching set before Article grouping. No model requests or per-result oracle.',
         'limitations':['Known small labelled corpus and authored reformulations; not independent learner query distribution.',
                        'Unrelated scale filler tests scan work, not semantic diversity or realistic corpus recall.',
                        'VM instruction samples approximate SQLite work, not D1 billing rows_read or network latency.',
                        'Exact alias lookup and eligibility here are simplified seam models, not current Minamo rights/recovery integration.',
                        'Reformulated strategies issue up to two requests and can inspect up to ten Article candidates; compare them to each other, not as equal-budget to the one-request original strategies.',
                        'No hosted latency, derived-index readiness, publication/restore concurrency or operational export verified.'],
         'scales':{}}
    for n in [1000,10000]:
        db=sqlite3.connect(':memory:');db.row_factory=sqlite3.Row;prior.install(db,scaled_passages(n))
        out['scales'][str(n)]={'passages':n,'strategies':evaluate(db),'checks':checks(db)};db.close()
    path=ROOT/'pr27-adoption-results.json';path.write_text(json.dumps(out,indent=2)+'\n')
    print(json.dumps({'backend':out['backend'],'scales':{n:{k:{key:v for key,v in data.items() if key!='cases'} for k,data in x['strategies'].items()} for n,x in out['scales'].items()}},indent=2))
if __name__=='__main__':main()
