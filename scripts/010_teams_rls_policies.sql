-- Enable Row Level Security on teams tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policies for teams table
-- Allow anyone to read teams
CREATE POLICY "Anyone can read teams"
  ON teams
  FOR SELECT
  USING (true);

-- Allow authenticated users to create teams
CREATE POLICY "Authenticated users can create teams"
  ON teams
  FOR INSERT
  WITH CHECK (true);

-- Allow team creators to update their teams
CREATE POLICY "Team creators can update their teams"
  ON teams
  FOR UPDATE
  USING (creator_id = auth.uid());

-- Allow team creators to delete their teams
CREATE POLICY "Team creators can delete their teams"
  ON teams
  FOR DELETE
  USING (creator_id = auth.uid());

-- Policies for team_members table
-- Allow anyone to read team members
CREATE POLICY "Anyone can read team members"
  ON team_members
  FOR SELECT
  USING (true);

-- Allow anyone to join a team (insert themselves)
CREATE POLICY "Anyone can join teams"
  ON team_members
  FOR INSERT
  WITH CHECK (true);

-- Allow users to remove themselves from teams
CREATE POLICY "Users can leave teams"
  ON team_members
  FOR DELETE
  USING (user_id = auth.uid());

-- Allow team creators to manage members
CREATE POLICY "Team creators can manage members"
  ON team_members
  FOR DELETE
  USING (
    team_id IN (
      SELECT id FROM teams WHERE creator_id = auth.uid()
    )
  );
