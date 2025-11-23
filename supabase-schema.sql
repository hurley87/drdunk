-- Create dunks table
CREATE TABLE IF NOT EXISTS dunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fid INTEGER NOT NULL,
  cast_url TEXT NOT NULL,
  dunk_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_dunks_created_at ON dunks(created_at DESC);
-- Create index on fid for user lookups
CREATE INDEX IF NOT EXISTS idx_dunks_fid ON dunks(fid);

-- Enable Row Level Security (optional, for future auth)
ALTER TABLE dunks ENABLE ROW LEVEL SECURITY;

-- Policy to allow all inserts (since submissions are anonymous)
CREATE POLICY "Allow anonymous inserts" ON dunks
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create game_rounds table
CREATE TABLE IF NOT EXISTS game_rounds (
  id BIGINT PRIMARY KEY, -- UTC day (days since epoch)
  date DATE NOT NULL UNIQUE,
  pot_amount DECIMAL(20, 6) NOT NULL DEFAULT 0,
  winner_fid INTEGER,
  winner_cast_hash TEXT,
  winner_wallet_address TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finalized', 'claimed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finalized_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE
);

-- Create index on date for quick lookups
CREATE INDEX IF NOT EXISTS idx_game_rounds_date ON game_rounds(date DESC);
CREATE INDEX IF NOT EXISTS idx_game_rounds_status ON game_rounds(status);

-- Create function to atomically increment pot amount
-- This prevents race conditions when multiple entries are submitted concurrently
CREATE OR REPLACE FUNCTION increment_pot_amount(round_id BIGINT, amount DECIMAL)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE game_rounds
  SET pot_amount = pot_amount + amount
  WHERE id = round_id;
END;
$$;

-- Create game_entries table
CREATE TABLE IF NOT EXISTS game_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id BIGINT NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
  fid INTEGER NOT NULL,
  wallet_address TEXT NOT NULL,
  cast_hash TEXT NOT NULL,
  cast_url TEXT,
  dunk_text TEXT NOT NULL,
  payment_tx_hash TEXT,
  engagement_score DECIMAL(20, 6) NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  recasts INTEGER NOT NULL DEFAULT 0,
  replies INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(round_id, fid), -- One entry per user per round
  UNIQUE(round_id, cast_hash) -- One cast hash per round
);

-- Create indexes for game_entries
CREATE INDEX IF NOT EXISTS idx_game_entries_round_id ON game_entries(round_id);
CREATE INDEX IF NOT EXISTS idx_game_entries_fid ON game_entries(fid);
CREATE INDEX IF NOT EXISTS idx_game_entries_cast_hash ON game_entries(cast_hash);
CREATE INDEX IF NOT EXISTS idx_game_entries_engagement_score ON game_entries(round_id, engagement_score DESC);

-- Create engagement_snapshots table
CREATE TABLE IF NOT EXISTS engagement_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES game_entries(id) ON DELETE CASCADE,
  likes INTEGER NOT NULL DEFAULT 0,
  recasts INTEGER NOT NULL DEFAULT 0,
  replies INTEGER NOT NULL DEFAULT 0,
  weighted_score DECIMAL(20, 6) NOT NULL DEFAULT 0,
  snapshot_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for engagement_snapshots
CREATE INDEX IF NOT EXISTS idx_engagement_snapshots_entry_id ON engagement_snapshots(entry_id);
CREATE INDEX IF NOT EXISTS idx_engagement_snapshots_snapshot_time ON engagement_snapshots(snapshot_time DESC);

-- Enable Row Level Security
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies for game_rounds (public read, authenticated write)
CREATE POLICY "Allow public read on game_rounds" ON game_rounds
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert on game_rounds" ON game_rounds
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on game_rounds" ON game_rounds
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for game_entries (public read, authenticated write)
CREATE POLICY "Allow public read on game_entries" ON game_entries
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert on game_entries" ON game_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on game_entries" ON game_entries
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for engagement_snapshots (public read, authenticated write)
CREATE POLICY "Allow public read on engagement_snapshots" ON engagement_snapshots
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert on engagement_snapshots" ON engagement_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

