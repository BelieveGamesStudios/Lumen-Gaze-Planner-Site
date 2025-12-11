-- Enable Row Level Security on team tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Simplified teams policies - only owner can access their own teams
CREATE POLICY "teams_select_own" ON teams FOR SELECT 
  USING (auth.uid() = owner_id);

CREATE POLICY "teams_insert_own" ON teams FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "teams_update_own" ON teams FOR UPDATE 
  USING (auth.uid() = owner_id);

CREATE POLICY "teams_delete_own" ON teams FOR DELETE 
  USING (auth.uid() = owner_id);

-- Simplified team members policies - only the user themselves can view/modify
CREATE POLICY "team_members_select_self" ON team_members FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "team_members_insert_self" ON team_members FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "team_members_update_self" ON team_members FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "team_members_delete_self" ON team_members FOR DELETE 
  USING (auth.uid() = user_id);

-- Simplified team invitations policies - only inviter can manage
CREATE POLICY "team_invitations_select_own" ON team_invitations FOR SELECT 
  USING (auth.uid() = invited_by);

CREATE POLICY "team_invitations_insert_own" ON team_invitations FOR INSERT 
  WITH CHECK (auth.uid() = invited_by);

CREATE POLICY "team_invitations_update_own" ON team_invitations FOR UPDATE 
  USING (auth.uid() = invited_by);

-- Keep task policies unchanged - they work with user_id only (no team lookup)
-- This prevents recursion issues with team_members table
