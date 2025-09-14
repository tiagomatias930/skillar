-- Create users table (simple username-based system)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create competitions table
CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(competition_id, user_id)
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blacklist table
CREATE TABLE IF NOT EXISTS blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  blacklisted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create competition history table
CREATE TABLE IF NOT EXISTS competition_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  winner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  final_points INTEGER NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simplified RLS setup - disable RLS for now to avoid policy issues
-- Enable Row Level Security
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE competition_history ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_competitions_active ON competitions(is_active, end_date);
CREATE INDEX IF NOT EXISTS idx_participants_competition ON participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_participants_points ON participants(competition_id, points DESC);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
