-- Table para guardar OAuth tokens por usuario
CREATE TABLE IF NOT EXISTS google_oauth_tokens (
  id SERIAL PRIMARY KEY,
  business_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(business_id, user_email)
);

CREATE INDEX IF NOT EXISTS idx_oauth_tokens_email ON google_oauth_tokens(user_email);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_business ON google_oauth_tokens(business_id);
