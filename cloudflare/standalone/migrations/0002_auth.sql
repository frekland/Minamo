-- Independent synthetic staging authentication state. No learner records or credentials.
CREATE TABLE IF NOT EXISTS auth_transactions (
  state_hash TEXT PRIMARY KEY CHECK (length(state_hash) = 64),
  nonce TEXT NOT NULL CHECK (length(nonce) BETWEEN 32 AND 64),
  verifier TEXT NOT NULL CHECK (length(verifier) BETWEEN 43 AND 128),
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS auth_transactions_expiry ON auth_transactions(expires_at);

CREATE TABLE IF NOT EXISTS web_sessions (
  session_hash TEXT PRIMARY KEY CHECK (length(session_hash) = 64),
  issuer TEXT NOT NULL CHECK (length(issuer) BETWEEN 1 AND 512),
  subject TEXT NOT NULL CHECK (length(subject) BETWEEN 1 AND 255),
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS web_sessions_expiry ON web_sessions(expires_at);
