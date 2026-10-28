-- Synthetic-only staging. Never import real learner data into this schema.
CREATE TABLE IF NOT EXISTS notes (
  owner_key TEXT NOT NULL CHECK (length(owner_key) BETWEEN 1 AND 128),
  id TEXT NOT NULL CHECK (length(id) BETWEEN 1 AND 128),
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 160),
  body TEXT NOT NULL CHECK (length(body) <= 10000),
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  PRIMARY KEY (owner_key, id)
);

CREATE INDEX IF NOT EXISTS notes_owner_updated
  ON notes(owner_key, updated_at DESC, id);

INSERT OR IGNORE INTO notes (owner_key, id, title, body)
VALUES
  ('public-demo', 'sample-note-001', 'Predict → try → inspect → revise', 'A synthetic Minamo example: state a prediction, try a small step, inspect the outcome, and revise your explanation.'),
  ('public-demo', 'sample-note-002', 'A question worth investigating', 'A second synthetic example. Real learners own their notes; this database does not contain any private learner content.'),
  ('fixture-a', 'fixture-note-001', 'Fixture A only', 'Synthetic tenant A. Never exposed by public routes.'),
  ('fixture-b', 'fixture-note-001', 'Fixture B only', 'Synthetic tenant B. Never exposed by public routes.');
