-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_task_instances ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE USING (auth.uid() = id);

-- Tags policies
CREATE POLICY "tags_select_own" ON tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tags_insert_own" ON tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tags_update_own" ON tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tags_delete_own" ON tags FOR DELETE USING (auth.uid() = user_id);

-- Yearly goals policies
CREATE POLICY "yearly_goals_select_own" ON yearly_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "yearly_goals_insert_own" ON yearly_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "yearly_goals_update_own" ON yearly_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "yearly_goals_delete_own" ON yearly_goals FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "tasks_select_own" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert_own" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update_own" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete_own" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Task tags policies (based on task ownership)
CREATE POLICY "task_tags_select_own" ON task_tags FOR SELECT 
  USING (EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_tags.task_id AND tasks.user_id = auth.uid()));
CREATE POLICY "task_tags_insert_own" ON task_tags FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_tags.task_id AND tasks.user_id = auth.uid()));
CREATE POLICY "task_tags_delete_own" ON task_tags FOR DELETE 
  USING (EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_tags.task_id AND tasks.user_id = auth.uid()));

-- Recurring tasks policies
CREATE POLICY "recurring_tasks_select_own" ON recurring_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "recurring_tasks_insert_own" ON recurring_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recurring_tasks_update_own" ON recurring_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "recurring_tasks_delete_own" ON recurring_tasks FOR DELETE USING (auth.uid() = user_id);

-- Recurring task tags policies
CREATE POLICY "recurring_task_tags_select_own" ON recurring_task_tags FOR SELECT 
  USING (EXISTS (SELECT 1 FROM recurring_tasks WHERE recurring_tasks.id = recurring_task_tags.recurring_task_id AND recurring_tasks.user_id = auth.uid()));
CREATE POLICY "recurring_task_tags_insert_own" ON recurring_task_tags FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM recurring_tasks WHERE recurring_tasks.id = recurring_task_tags.recurring_task_id AND recurring_tasks.user_id = auth.uid()));
CREATE POLICY "recurring_task_tags_delete_own" ON recurring_task_tags FOR DELETE 
  USING (EXISTS (SELECT 1 FROM recurring_tasks WHERE recurring_tasks.id = recurring_task_tags.recurring_task_id AND recurring_tasks.user_id = auth.uid()));

-- Recurring task instances policies
CREATE POLICY "recurring_task_instances_select_own" ON recurring_task_instances FOR SELECT 
  USING (EXISTS (SELECT 1 FROM recurring_tasks WHERE recurring_tasks.id = recurring_task_instances.recurring_task_id AND recurring_tasks.user_id = auth.uid()));
CREATE POLICY "recurring_task_instances_insert_own" ON recurring_task_instances FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM recurring_tasks WHERE recurring_tasks.id = recurring_task_instances.recurring_task_id AND recurring_tasks.user_id = auth.uid()));
CREATE POLICY "recurring_task_instances_delete_own" ON recurring_task_instances FOR DELETE 
  USING (EXISTS (SELECT 1 FROM recurring_tasks WHERE recurring_tasks.id = recurring_task_instances.recurring_task_id AND recurring_tasks.user_id = auth.uid()));
