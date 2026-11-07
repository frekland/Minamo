export const PUBLIC_DEMO_OWNER = "public-demo";

export interface Note {
  owner_key: string;
  id: string;
  title: string;
  body: string;
  revision: number;
  updated_at: string;
}

export interface NoteInput {
  title: string;
  body: string;
}

function validateOwner(ownerKey: string): void {
  if (!/^[a-zA-Z0-9:_-]{1,128}$/.test(ownerKey)) {
    throw new TypeError("Invalid trusted owner key");
  }
}

function validateId(id: string): void {
  if (!/^[a-zA-Z0-9:_-]{1,128}$/.test(id)) {
    throw new TypeError("Invalid note ID");
  }
}

function validateInput(input: NoteInput): void {
  if (input.title.trim().length < 1 || input.title.length > 160 || input.body.length > 10000) {
    throw new TypeError("Invalid note payload");
  }
}

export async function listNotes(db: D1Database, trustedOwner: string, limit = 20): Promise<Note[]> {
  validateOwner(trustedOwner);
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new TypeError("Invalid list limit");
  }
  const result = await db.prepare(
    "SELECT owner_key, id, title, body, revision, updated_at FROM notes WHERE owner_key = ? AND deleted_at IS NULL ORDER BY updated_at DESC, id ASC LIMIT ?",
  ).bind(trustedOwner, limit).all<Note>();
  return result.results ?? [];
}

export async function readNote(db: D1Database, trustedOwner: string, id: string): Promise<Note | null> {
  validateOwner(trustedOwner);
  validateId(id);
  return await db.prepare(
    "SELECT owner_key, id, title, body, revision, updated_at FROM notes WHERE owner_key = ? AND id = ? AND deleted_at IS NULL",
  ).bind(trustedOwner, id).first<Note>();
}

// Not routed over HTTP/MCP until real, server-verified identity exists.
export async function createNote(db: D1Database, trustedOwner: string, input: NoteInput): Promise<Note> {
  validateOwner(trustedOwner);
  validateInput(input);
  const id = crypto.randomUUID();
  await db.prepare(
    "INSERT INTO notes (owner_key, id, title, body) VALUES (?, ?, ?, ?)",
  ).bind(trustedOwner, id, input.title.trim(), input.body).run();
  const note = await readNote(db, trustedOwner, id);
  if (!note) throw new Error("Note not available after insert");
  return note;
}

export type UpdateResult =
  | { status: "updated"; note: Note }
  | { status: "conflict" | "unavailable" };

export async function updateNote(
  db: D1Database,
  trustedOwner: string,
  id: string,
  expectedRevision: number,
  input: NoteInput,
): Promise<UpdateResult> {
  validateOwner(trustedOwner);
  validateId(id);
  validateInput(input);
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 1) {
    throw new TypeError("Invalid revision");
  }
  const result = await db.prepare(
    "UPDATE notes SET title = ?, body = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP WHERE owner_key = ? AND id = ? AND revision = ? AND deleted_at IS NULL",
  ).bind(input.title.trim(), input.body, trustedOwner, id, expectedRevision).run();
  if ((result.meta.changes ?? 0) === 0) {
    return (await readNote(db, trustedOwner, id)) ? { status: "conflict" } : { status: "unavailable" };
  }
  const note = await readNote(db, trustedOwner, id);
  if (!note) throw new Error("Note not available after update");
  return { status: "updated", note };
}
