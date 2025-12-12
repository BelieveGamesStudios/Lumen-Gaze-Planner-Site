import { createClient } from "@/lib/supabase/server"
import { getCurrentWeek } from "@/lib/utils/date"
import { WeeklyPlannerClient } from "@/components/dashboard/weekly-planner-client"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { week: currentWeek, year: currentYear } = getCurrentWeek()
  const params = await searchParams
  const requestedYear = params.year ? parseInt(params.year, 10) : NaN
  const selectedYear = Number.isFinite(requestedYear) ? requestedYear : currentYear
  const activeWeek = selectedYear === currentYear ? currentWeek : 1

  // Fetch tasks for the selected year
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      *,
      tags:task_tags(tag:tags(*))
    `)
    .eq("user_id", user.id)
    .eq("year", selectedYear)
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
      key={selectedYear}
      initialTasks={transformedTasks}
      initialTags={tags || []}
      weeklyCompletions={weeklyCompletions}
      currentWeek={activeWeek}
      currentYear={selectedYear}
      userId={user.id}
    />
  )
}
