"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Calendar } from "lucide-react"
import type { Tag } from "@/lib/types"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { TagFilter } from "@/components/dashboard/tag-filter"
import { getWeekDates } from "@/lib/utils/date"

interface SearchTask {
  id: string
  title: string
  description: string | null
  week_number: number
  year: number
  completed: boolean
  tags?: Tag[]
}

interface SearchResultsClientProps {
  query: string
  tasks: SearchTask[]
  tags: Tag[]
  currentYear: number
}

export function SearchResultsClient({ query, tasks, tags, currentYear }: SearchResultsClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(query)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleToggleTag = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  // Filter by selected tags
  const filteredTasks =
    selectedTags.length > 0 ? tasks.filter((task) => task.tags?.some((tag) => selectedTags.includes(tag.id))) : tasks

  // Group by year
  const groupedByYear = filteredTasks.reduce(
    (acc, task) => {
      const year = task.year
      if (!acc[year]) acc[year] = []
      acc[year].push(task)
      return acc
    },
    {} as Record<number, SearchTask[]>,
  )

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Search Tasks</h1>
        <p className="text-muted-foreground">Find tasks across all weeks and years</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by task title..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      {/* Tag Filter */}
      {tags.length > 0 && query && (
        <div className="p-4 border border-border rounded-lg bg-card">
          <h3 className="text-sm font-medium mb-3">Filter by Tags</h3>
          <TagFilter tags={tags} selectedTags={selectedTags} onToggleTag={handleToggleTag} />
        </div>
      )}

      {/* Results */}
      {query ? (
        filteredTasks.length > 0 ? (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Found {filteredTasks.length} result{filteredTasks.length !== 1 ? "s" : ""} for &quot;{query}&quot;
            </p>

            {Object.entries(groupedByYear)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([year, yearTasks]) => (
                <div key={year} className="space-y-3">
                  <h3 className="font-medium text-muted-foreground">{year}</h3>
                  <div className="space-y-2">
                    {yearTasks.map((task) => {
                      const { formatted } = getWeekDates(task.week_number, task.year)
                      return (
                        <Card key={task.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Checkbox checked={task.completed} disabled className="mt-1" />
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
                                >
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Week {task.week_number} · {formatted}
                                  </span>
                                  {task.tags?.map((tag) => (
                                    <Badge
                                      key={tag.id}
                                      variant="outline"
                                      className="text-xs"
                                      style={{ borderColor: tag.color, color: tag.color }}
                                    >
                                      {tag.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No results found</h3>
              <p className="text-sm text-muted-foreground">Try a different search term or filter.</p>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Search your tasks</h3>
            <p className="text-sm text-muted-foreground">Enter a search term to find tasks across all weeks.</p>
          </CardContent>
        </Card>
      )}

      <MobileNav />
    </div>
  )
}
