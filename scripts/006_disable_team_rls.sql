-- Disable RLS on team tables to prevent infinite recursion
-- Team access control will be handled at the application level instead
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations DISABLE ROW LEVEL SECURITY;

-- Drop all team-related RLS policies that were causing recursion
DROP POLICY IF EXISTS "teams_select_own" ON teams;
DROP POLICY IF EXISTS "teams_insert_own" ON teams;
DROP POLICY IF EXISTS "teams_update_own" ON teams;
DROP POLICY IF EXISTS "teams_delete_own" ON teams;

DROP POLICY IF EXISTS "team_members_select_self" ON team_members;
DROP POLICY IF EXISTS "team_members_insert_self" ON team_members;
DROP POLICY IF EXISTS "team_members_update_self" ON team_members;
DROP POLICY IF EXISTS "team_members_delete_self" ON team_members;

DROP POLICY IF EXISTS "team_invitations_select_own" ON team_invitations;
DROP POLICY IF EXISTS "team_invitations_insert_own" ON team_invitations;
DROP POLICY IF EXISTS "team_invitations_update_own" ON team_invitations;
