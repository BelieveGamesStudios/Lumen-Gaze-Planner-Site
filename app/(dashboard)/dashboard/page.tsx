import { createClient } from "@/lib/supabase/server"
import { getCurrentWeek } from "@/lib/utils/date"
import { WeeklyPlannerClient } from "@/components/dashboard/weekly-planner-client"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { week: currentWeek, year: currentYear } = getCurrentWeek()

  // Fetch tasks for the current year
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      *,
      tags:task_tags(tag:tags(*))
    `)
    .eq("user_id", user.id)
    .eq("year", currentYear)
    .order("sort_order", { ascending: true })

  // Fetch tags
  const { data: tags } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true })

  // Transform tasks to include tags array
  const transformedTasks =
    tasks?.map((task) => ({
      ...task,
      tags: task.tags?.map((t: { tag: unknown }) => t.tag) || [],
    })) || []

  // Calculate weekly completions for heatmap
  const weeklyCompletions = Array.from({ length: 52 }, (_, i) => {
    const weekTasks = transformedTasks.filter((t) => t.week_number === i + 1)
    return {
      week: i + 1,
      completed: weekTasks.filter((t) => t.completed).length,
      total: weekTasks.length,
    }
  })

  return (
    <WeeklyPlannerClient
      initialTasks={transformedTasks}
      initialTags={tags || []}
      weeklyCompletions={weeklyCompletions}
      currentWeek={currentWeek}
      currentYear={currentYear}
      userId={user.id}
    />
  )
}
