"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, CheckCircle2, ListTodo, TrendingUp } from "lucide-react"
import type { Tag } from "@/lib/types"
import { MobileNav } from "@/components/dashboard/mobile-nav"

interface MonthStat {
  month: number
  name: string
  totalTasks: number
  completedTasks: number
  completionRate: number
  tagUsage: { tag: Tag | undefined; count: number }[]
  mostActiveWeek: number | null
}

interface MonthlyOverviewClientProps {
  monthlyStats: MonthStat[]
  currentYear: number
}

export function MonthlyOverviewClient({ monthlyStats, currentYear }: MonthlyOverviewClientProps) {
  const currentMonth = new Date().getMonth()

  const yearTotalTasks = monthlyStats.reduce((acc, m) => acc + m.totalTasks, 0)
  const yearCompletedTasks = monthlyStats.reduce((acc, m) => acc + m.completedTasks, 0)
  const yearCompletionRate = yearTotalTasks > 0 ? Math.round((yearCompletedTasks / yearTotalTasks) * 100) : 0

  const bestMonth = [...monthlyStats].sort((a, b) => b.completionRate - a.completionRate)[0]
  const mostProductiveMonth = [...monthlyStats].sort((a, b) => b.completedTasks - a.completedTasks)[0]

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Monthly Overview</h1>
        <p className="text-muted-foreground">{currentYear} progress by month</p>
      </div>

      {/* Year Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{yearTotalTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{yearCompletedTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{yearCompletionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Best Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bestMonth?.name || "-"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {monthlyStats.map((month) => (
          <Card
            key={month.month}
            className={
              month.month === currentMonth
                ? "border-primary/50 bg-primary/5"
                : month.month > currentMonth
                  ? "opacity-60"
                  : ""
            }
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{month.name}</CardTitle>
                {month.month === currentMonth && (
                  <Badge variant="default" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {month.completedTasks} / {month.totalTasks} tasks
                  </span>
                  <span className="font-medium">{month.completionRate}%</span>
                </div>
                <Progress value={month.completionRate} className="h-2" />
              </div>

              {/* Most Active Week */}
              {month.mostActiveWeek && (
                <p className="text-xs text-muted-foreground">Most active: Week {month.mostActiveWeek}</p>
              )}

              {/* Top Tags */}
              {month.tagUsage.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Top categories:</p>
                  <div className="flex flex-wrap gap-1">
                    {month.tagUsage.map(({ tag, count }) =>
                      tag ? (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: tag.color, color: tag.color }}
                        >
                          {tag.name} ({count})
                        </Badge>
                      ) : null,
                    )}
                  </div>
                </div>
              )}

              {month.totalTasks === 0 && <p className="text-xs text-muted-foreground italic">No tasks this month</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <MobileNav />
    </div>
  )
}
