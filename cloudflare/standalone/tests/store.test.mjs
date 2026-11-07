import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import assert from "node:assert/strict";
import { test } from "node:test";
import { createNote, listNotes, readNote, updateNote, PUBLIC_DEMO_OWNER } from "../src/store.ts";

function fixture() {
  const sqlite = new DatabaseSync(":memory:");
  const schema = readFileSync(new URL("../migrations/0001_init.sql", import.meta.url), "utf8");
  sqlite.exec(schema);
  const db = {
    prepare(query) {
      const statement = sqlite.prepare(query);
      return {
        bind(...params) {
          return {
            async all() { return { results: statement.all(...params) }; },
            async first() { return statement.get(...params) ?? null; },
            async run() { return { meta: { changes: statement.run(...params).changes } }; },
          };
        },
      };
    },
  };
  return { db, sqlite };
}

test("public samples are persistent and strictly scoped", async () => {
  const { db, sqlite } = fixture();
  try {
    const notes = await listNotes(db, PUBLIC_DEMO_OWNER);
    assert.equal(notes.length, 2);
    assert.equal(notes.every((n) => n.owner_key === PUBLIC_DEMO_OWNER), true);
    assert.equal((await readNote(db, PUBLIC_DEMO_OWNER, "fixture-note-001")), null);
    assert.equal((await readNote(db, "fixture-a", "fixture-note-001")).body.includes("tenant A"), true);
    assert.equal((await readNote(db, "fixture-b", "fixture-note-001")).body.includes("tenant B"), true);
  } finally { sqlite.close(); }
});

test("owner-scoped updates reject cross-principal IDs and stale revisions", async () => {
  const { db, sqlite } = fixture();
  try {
    const a = await createNote(db, "fixture-a", { title: "A", body: "Version one" });
    assert.equal((await readNote(db, "fixture-b", a.id)), null);
    const denied = await updateNote(db, "fixture-b", a.id, 1, { title: "Intrusion", body: "No" });
    assert.deepEqual(denied, { status: "unavailable" });
    const updated = await updateNote(db, "fixture-a", a.id, 1, { title: "A revised", body: "Version two" });
    assert.equal(updated.status, "updated");
    assert.equal(updated.note.revision, 2);
    assert.deepEqual(await updateNote(db, "fixture-a", a.id, 1, { title: "Stale", body: "No" }), { status: "conflict" });
    assert.equal((await readNote(db, "fixture-a", a.id)).title, "A revised");
  } finally { sqlite.close(); }
});

test("validation prevents malformed owner keys and unbounded input", async () => {
  const { db, sqlite } = fixture();
  try {
    await assert.rejects(listNotes(db, "a' OR 1=1"), TypeError);
    await assert.rejects(readNote(db, "fixture-a", "../traversal"), TypeError);
    await assert.rejects(createNote(db, "fixture-a", { title: " ", body: "" }), TypeError);
    await assert.rejects(createNote(db, "fixture-a", { title: "OK", body: "x".repeat(10001) }), TypeError);
    await assert.rejects(listNotes(db, "fixture-a", 5000), TypeError);
  } finally { sqlite.close(); }
});
