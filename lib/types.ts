export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  theme: "light" | "dark" | "system"
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  is_personal: boolean
  created_at: string
}

export interface YearlyGoal {
  id: string
  user_id: string
  year: number
  title: string
  description: string | null
  target_value: number | null
  current_value: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  week_number: number
  year: number
  completed: boolean
  completed_at: string | null
  goal_id: string | null
  sort_order: number
  created_at: string
  updated_at: string
  tags?: Tag[]
  goal?: YearlyGoal
}

export interface RecurringTask {
  id: string
  user_id: string
  title: string
  description: string | null
  recurrence_type: "daily" | "weekly" | "biweekly" | "monthly"
  start_week: number
  start_year: number
  is_active: boolean
  created_at: string
  tags?: Tag[]
  completion_percentage?: number
}

export interface WeekData {
  weekNumber: number
  year: number
  startDate: Date
  endDate: Date
  tasks: Task[]
}

export interface MonthlyStats {
  month: number
  year: number
  totalTasks: number
  completedTasks: number
  tagUsage: { tag: Tag; count: number }[]
  mostActiveWeek: number
}

export interface WrappedData {
  year: number
  totalTasksCompleted: number
  totalTasksCreated: number
  completionRate: number
  longestStreak: number
  currentStreak: number
  topTags: { tag: Tag; count: number }[]
  weeklyCompletions: number[]
  badges: string[]
  goalsCompleted: number
  totalGoals: number
}

export interface Team {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: "admin" | "member"
  joined_at: string
}

export interface TeamInvitation {
  id: string
  team_id: string
  invited_by: string
  invited_email: string
  invited_display_name: string | null
  role: "admin" | "member"
  status: "pending" | "accepted" | "rejected" | "expired"
  created_at: string
  updated_at: string
  expires_at: string
}
