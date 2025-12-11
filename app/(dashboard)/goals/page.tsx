import { createClient } from "@/lib/supabase/server"
import { getCurrentWeek } from "@/lib/utils/date"
import { GoalsClient } from "@/components/goals/goals-client"

export default async function GoalsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { year: currentYear } = getCurrentWeek()

  // Fetch yearly goals
  const { data: goals } = await supabase
    .from("yearly_goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("year", currentYear)
    .order("created_at", { ascending: true })

  // Fetch tasks linked to goals
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("year", currentYear)
    .not("goal_id", "is", null)

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

  return <GoalsClient initialGoals={goalsWithProgress} currentYear={currentYear} userId={user.id} />
}
