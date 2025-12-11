import { createClient } from "@/lib/supabase/server"
import { getCurrentWeek } from "@/lib/utils/date"
import { SearchResultsClient } from "@/components/search/search-results-client"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const query = params.q || ""

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { year: currentYear } = getCurrentWeek()

  // Fetch tags for filtering
  const { data: tags } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true })

  // Search tasks if query exists
  let tasks: Array<{
    id: string
    title: string
    description: string | null
    week_number: number
    year: number
    completed: boolean
    tags?: Array<{ id: string; name: string; color: string }>
  }> = []

  if (query) {
    const { data: searchResults } = await supabase
      .from("tasks")
      .select(`
        *,
        tags:task_tags(tag:tags(*))
      `)
      .eq("user_id", user.id)
      .ilike("title", `%${query}%`)
      .order("week_number", { ascending: true })

    tasks =
      searchResults?.map((task) => ({
        ...task,
        tags: task.tags?.map((t: { tag: unknown }) => t.tag) || [],
      })) || []
  }

  return <SearchResultsClient query={query} tasks={tasks} tags={tags || []} currentYear={currentYear} />
}
