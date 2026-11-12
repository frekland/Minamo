"""SQLite specimen preserving raw timestamps; demonstrates a wrong text order."""
import sqlite3
from computing_lab import utc_instant
import json


def experiment():
    with sqlite3.connect(":memory:") as db:
        db.execute("CREATE TABLE readings (id TEXT PRIMARY KEY, sensor TEXT NOT NULL, source_time TEXT NOT NULL, utc TEXT NOT NULL, celsius REAL, source_unit TEXT NOT NULL, source_value REAL)")
        inputs=[("later","a","2026-03-29T01:55:00Z",20),("earlier","b","2026-03-29T02:05:00+01:00",None)]
        db.executemany("INSERT INTO readings VALUES (?, ?, ?, ?, ?, ?, ?)",
            [(id,sensor,time,utc_instant(time).isoformat(),value,"C",value) for id,sensor,time,value in inputs])
        text_order=[row[0] for row in db.execute("SELECT id FROM readings ORDER BY source_time")]
        utc_order=[row[0] for row in db.execute("SELECT id FROM readings ORDER BY utc")]
        mean,total,observed=db.execute("SELECT AVG(celsius), COUNT(*), COUNT(celsius) FROM readings").fetchone()
    assert text_order == ["later","earlier"]
    assert utc_order == ["earlier","later"]
    assert (mean,total,observed) == (20.0,2,1)
    return dict(synthetic=True,environment="SQLite in-memory lab runner",text_order=text_order,utc_order=utc_order,mean=mean,total=total,observed=observed,qualification="SQL AVG ignores NULL: correct execution still needs coverage and missingness interpretation")


if __name__ == "__main__":
    print(json.dumps(experiment(),indent=2))
