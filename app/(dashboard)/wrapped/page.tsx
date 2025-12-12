import { createClient } from "@/lib/supabase/server"
import { getCurrentWeek } from "@/lib/utils/date"
import { WrappedClient } from "@/components/wrapped/wrapped-client"
import type { WrappedData, Tag } from "@/lib/types"

export default async function WrappedPage({
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

  // Fetch all tasks for the year
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      *,
      tags:task_tags(tag:tags(*))
    `)
    .eq("user_id", user.id)
    .eq("year", selectedYear)
    .order("week_number", { ascending: true })

  // Fetch goals
  const { data: goals } = await supabase.from("yearly_goals").select("*").eq("user_id", user.id).eq("year", selectedYear)

  // Transform tasks
  const transformedTasks =
    tasks?.map((task) => ({
      ...task,
      tags: task.tags?.map((t: { tag: unknown }) => t.tag) || [],
    })) || []

  // Calculate stats
  const totalTasksCreated = transformedTasks.length
  const totalTasksCompleted = transformedTasks.filter((t) => t.completed).length
  const completionRate = totalTasksCreated > 0 ? Math.round((totalTasksCompleted / totalTasksCreated) * 100) : 0

  // Calculate weekly completions
  const weeklyCompletions = Array.from({ length: 52 }, (_, i) => {
    const weekTasks = transformedTasks.filter((t) => t.week_number === i + 1)
    return weekTasks.filter((t) => t.completed).length
  })

  // Calculate streaks
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  for (let i = 0; i < 52; i++) {
    if (weeklyCompletions[i] > 0) {
      tempStreak++
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
    } else {
      tempStreak = 0
    }
  }

  // Current streak (from the end)
  for (let i = 51; i >= 0; i--) {
    if (weeklyCompletions[i] > 0) {
      currentStreak++
    } else {
      break
    }
  }

  // Top tags
  const tagCounts: Record<string, { tag: Tag; count: number }> = {}
  transformedTasks
    .filter((t) => t.completed)
    .forEach((task) => {
      task.tags?.forEach((tag: Tag) => {
        if (!tagCounts[tag.id]) {
          tagCounts[tag.id] = { tag, count: 0 }
        }
        tagCounts[tag.id].count++
      })
    })

  const topTags = Object.values(tagCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Goals completed
  const linkedTasksByGoal: Record<string, { total: number; completed: number }> = {}
  transformedTasks.forEach((task) => {
    if (task.goal_id) {
      if (!linkedTasksByGoal[task.goal_id]) {
        linkedTasksByGoal[task.goal_id] = { total: 0, completed: 0 }
      }
      linkedTasksByGoal[task.goal_id].total++
      if (task.completed) {
        linkedTasksByGoal[task.goal_id].completed++
      }
    }
  })

  const goalsCompleted = Object.entries(linkedTasksByGoal).filter(
    ([, stats]) => stats.total > 0 && stats.completed === stats.total,
  ).length

  // Generate badges
  const badges: string[] = []
  if (totalTasksCompleted >= 100) badges.push("Century Club")
  if (totalTasksCompleted >= 500) badges.push("Task Master")
  if (longestStreak >= 10) badges.push("Streak Champion")
  if (longestStreak >= 52) badges.push("Year-Long Warrior")
  if (completionRate >= 80) badges.push("High Achiever")
  if (completionRate === 100 && totalTasksCreated > 0) badges.push("Perfectionist")
  if (goalsCompleted > 0) badges.push("Goal Getter")
  if (topTags.length >= 5) badges.push("Well Rounded")

  const wrappedData: WrappedData = {
    year: selectedYear,
    totalTasksCompleted,
    totalTasksCreated,
    completionRate,
    longestStreak,
    currentStreak,
    topTags,
    weeklyCompletions,
    badges,
    goalsCompleted,
    totalGoals: goals?.length || 0,
  }

  return <WrappedClient data={wrappedData} />
}
