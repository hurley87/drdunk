-- Create dunks table
CREATE TABLE IF NOT EXISTS dunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cast_url TEXT NOT NULL,
  dunk_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_dunks_created_at ON dunks(created_at DESC);

-- Enable Row Level Security (optional, for future auth)
ALTER TABLE dunks ENABLE ROW LEVEL SECURITY;

-- Policy to allow all inserts (since submissions are anonymous)
CREATE POLICY "Allow anonymous inserts" ON dunks
  FOR INSERT
  TO anon
  WITH CHECK (true);

