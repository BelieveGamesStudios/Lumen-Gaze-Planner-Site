import { createClient } from "@/lib/supabase/server"
import { getCurrentWeek } from "@/lib/utils/date"
import { GoalsClient } from "@/components/goals/goals-client"

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { year: currentYear } = getCurrentWeek()
  const params = await searchParams
  const requestedYear = params.year ? parseInt(params.year, 10) : NaN
  const selectedYear = Number.isFinite(requestedYear) ? requestedYear : currentYear

  // Fetch yearly goals
  const { data: goals } = await supabase
    .from("yearly_goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("year", selectedYear)
    .order("created_at", { ascending: true })

  // Fetch tasks linked to goals
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("year", selectedYear)
    .not("goal_id", "is", null)

  // Fetch decade goals (10-year plan), not filtered by selected year
  const { data: decadeGoals } = await supabase
    .from("decade_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  // Calculate progress for each goal
  const goalsWithProgress =
    goals?.map((goal) => {
      const linkedTasks = tasks?.filter((t) => t.goal_id === goal.id) || []
      const completedTasks = linkedTasks.filter((t) => t.completed).length
      return {
        ...goal,
        linked_tasks: linkedTasks.length,
        completed_tasks: completedTasks,
        progress: linkedTasks.length > 0 ? Math.round((completedTasks / linkedTasks.length) * 100) : 0,
      }
    }) || []

  return (
    <GoalsClient
      initialGoals={goalsWithProgress}
      initialDecadeGoals={decadeGoals || []}
      currentYear={selectedYear}
      userId={user.id}
    />
  )
}
