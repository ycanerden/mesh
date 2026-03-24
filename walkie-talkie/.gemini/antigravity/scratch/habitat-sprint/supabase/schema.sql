-- HABITAT Sprint Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  invite_code TEXT DEFAULT upper(substr(md5(random()::text), 1, 6)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sprint phase enum
DO $$ BEGIN
  CREATE TYPE sprint_phase AS ENUM ('waiting', 'phase_1', 'phase_2', 'phase_3', 'phase_4', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Task progress table
CREATE TABLE IF NOT EXISTS task_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  phase sprint_phase NOT NULL DEFAULT 'phase_1',
  is_completed BOOLEAN DEFAULT FALSE,
  content TEXT,
  ai_generated_content JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, task_id)
);

-- Timer status enum
DO $$ BEGIN
  CREATE TYPE timer_status AS ENUM ('stopped', 'running', 'paused');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Sprint timer table (singleton)
CREATE TABLE IF NOT EXISTS sprint_timer (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  status timer_status DEFAULT 'stopped',
  duration_seconds INTEGER DEFAULT 14400, -- 4 hours
  remaining_seconds INTEGER DEFAULT 14400,
  started_at TIMESTAMP WITH TIME ZONE,
  current_phase sprint_phase DEFAULT 'waiting',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default timer if not exists
INSERT INTO sprint_timer (id, status, duration_seconds, remaining_seconds)
SELECT uuid_generate_v4(), 'stopped', 14400, 14400
WHERE NOT EXISTS (SELECT 1 FROM sprint_timer LIMIT 1);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_timer ENABLE ROW LEVEL SECURITY;

-- Policies for teams (allow all for now - simplified for hackathon use)
CREATE POLICY "Allow all access to teams" ON teams FOR ALL USING (true);
CREATE POLICY "Allow all access to team_members" ON team_members FOR ALL USING (true);
CREATE POLICY "Allow all access to task_progress" ON task_progress FOR ALL USING (true);
CREATE POLICY "Allow all access to sprint_timer" ON sprint_timer FOR ALL USING (true);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_progress_updated_at ON task_progress;
CREATE TRIGGER update_task_progress_updated_at
  BEFORE UPDATE ON task_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sprint_timer_updated_at ON sprint_timer;
CREATE TRIGGER update_sprint_timer_updated_at
  BEFORE UPDATE ON sprint_timer
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for task_progress and sprint_timer
ALTER PUBLICATION supabase_realtime ADD TABLE task_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE sprint_timer;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_progress_team_id ON task_progress(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
