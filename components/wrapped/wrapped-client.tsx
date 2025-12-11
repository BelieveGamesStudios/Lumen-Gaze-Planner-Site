"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Share2, Sparkles, Trophy, Flame, Target, CheckCircle2, TrendingUp } from "lucide-react"
import type { WrappedData } from "@/lib/types"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { cn } from "@/lib/utils"
import { toPng } from "html-to-image"

interface WrappedClientProps {
  data: WrappedData
}

export function WrappedClient({ data }: WrappedClientProps) {
  const wrappedRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!wrappedRef.current) return

    setIsExporting(true)
    try {
      const dataUrl = await toPng(wrappedRef.current, {
        backgroundColor: "#0f172a",
        pixelRatio: 2,
      })

      const link = document.createElement("a")
      link.download = `${data.year}-wrapped.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    if (!wrappedRef.current) return

    try {
      const dataUrl = await toPng(wrappedRef.current, {
        backgroundColor: "#0f172a",
        pixelRatio: 2,
      })

      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `${data.year}-wrapped.png`, { type: "image/png" })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `My ${data.year} Wrapped`,
          text: `I completed ${data.totalTasksCompleted} tasks this year!`,
        })
      } else {
        handleExport()
      }
    } catch (error) {
      console.error("Share failed:", error)
      handleExport()
    }
  }

  const getHeatmapColor = (value: number, max: number) => {
    if (value === 0) return "bg-slate-800"
    const intensity = value / max
    if (intensity <= 0.25) return "bg-emerald-900"
    if (intensity <= 0.5) return "bg-emerald-700"
    if (intensity <= 0.75) return "bg-emerald-500"
    return "bg-emerald-400"
  }

  const maxWeeklyCompletion = Math.max(...data.weeklyCompletions, 1)

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            {data.year} Wrapped
          </h1>
          <p className="text-muted-foreground">Your year in review</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleShare} disabled={isExporting}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Download"}
          </Button>
        </div>
      </div>

      {/* Wrapped Card (Exportable) */}
      <div
        ref={wrappedRef}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 md:p-8 text-white"
      >
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">{data.year} Wrapped</h2>
          <p className="text-slate-400">52-Week Planner</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<CheckCircle2 className="h-5 w-5" />} value={data.totalTasksCompleted} label="Tasks Done" />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} value={`${data.completionRate}%`} label="Completion" />
          <StatCard icon={<Flame className="h-5 w-5" />} value={data.longestStreak} label="Longest Streak" />
          <StatCard icon={<Target className="h-5 w-5" />} value={data.goalsCompleted} label="Goals Achieved" />
        </div>

        {/* Heatmap Preview */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Activity Heatmap</h3>
          <div className="flex flex-wrap gap-1">
            {data.weeklyCompletions.map((count, i) => (
              <div
                key={i}
                className={cn("w-3 h-3 rounded-sm", getHeatmapColor(count, maxWeeklyCompletion))}
                title={`Week ${i + 1}: ${count} tasks`}
              />
            ))}
          </div>
        </div>

        {/* Top Categories */}
        {data.topTags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Top Categories</h3>
            <div className="flex flex-wrap gap-2">
              {data.topTags.map(({ tag, count }) => (
                <div key={tag.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700/50">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                  <span className="text-sm">{tag.name}</span>
                  <span className="text-xs text-slate-400">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {data.badges.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-3">Badges Earned</h3>
            <div className="flex flex-wrap gap-2">
              {data.badges.map((badge) => (
                <div key={badge} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-amber-200">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Yearly Summary</h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tasks Created</dt>
                <dd className="font-medium">{data.totalTasksCreated}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tasks Completed</dt>
                <dd className="font-medium">{data.totalTasksCompleted}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Completion Rate</dt>
                <dd className="font-medium">{data.completionRate}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Goals Set</dt>
                <dd className="font-medium">{data.totalGoals}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Goals Achieved</dt>
                <dd className="font-medium">{data.goalsCompleted}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Streaks</h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Current Streak</dt>
                <dd className="font-medium flex items-center gap-2">
                  {data.currentStreak} weeks
                  {data.currentStreak > 0 && <Flame className="h-4 w-4 text-orange-500" />}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Longest Streak</dt>
                <dd className="font-medium flex items-center gap-2">
                  {data.longestStreak} weeks
                  {data.longestStreak >= 10 && <Trophy className="h-4 w-4 text-amber-500" />}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Active Weeks</dt>
                <dd className="font-medium">{data.weeklyCompletions.filter((w) => w > 0).length} / 52</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Best Week</dt>
                <dd className="font-medium">
                  Week {data.weeklyCompletions.indexOf(maxWeeklyCompletion) + 1} ({maxWeeklyCompletion} tasks)
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* All Badges */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">All Available Badges</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <BadgeItem
              name="Century Club"
              description="Complete 100 tasks"
              earned={data.badges.includes("Century Club")}
            />
            <BadgeItem
              name="Task Master"
              description="Complete 500 tasks"
              earned={data.badges.includes("Task Master")}
            />
            <BadgeItem
              name="Streak Champion"
              description="10+ week streak"
              earned={data.badges.includes("Streak Champion")}
            />
            <BadgeItem
              name="Year-Long Warrior"
              description="52 week streak"
              earned={data.badges.includes("Year-Long Warrior")}
            />
            <BadgeItem
              name="High Achiever"
              description="80%+ completion rate"
              earned={data.badges.includes("High Achiever")}
            />
            <BadgeItem
              name="Perfectionist"
              description="100% completion rate"
              earned={data.badges.includes("Perfectionist")}
            />
            <BadgeItem name="Goal Getter" description="Complete a goal" earned={data.badges.includes("Goal Getter")} />
            <BadgeItem
              name="Well Rounded"
              description="Use 5+ categories"
              earned={data.badges.includes("Well Rounded")}
            />
          </div>
        </CardContent>
      </Card>

      <MobileNav />
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string | number
  label: string
}) {
  return (
    <div className="bg-slate-700/30 rounded-lg p-4 text-center">
      <div className="flex justify-center mb-2 text-emerald-400">{icon}</div>
      <p className="text-2xl md:text-3xl font-bold">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}

function BadgeItem({
  name,
  description,
  earned,
}: {
  name: string
  description: string
  earned: boolean
}) {
  return (
    <div className={cn("p-3 rounded-lg border", earned ? "border-amber-500/50 bg-amber-500/10" : "border-border")}>
      <div className="flex items-center gap-2 mb-1">
        <Trophy className={cn("h-4 w-4", earned ? "text-amber-500" : "text-muted-foreground")} />
        <span className={cn("text-sm font-medium", !earned && "text-muted-foreground")}>{name}</span>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {earned && <Badge className="mt-2 text-xs bg-amber-500/20 text-amber-500 hover:bg-amber-500/30">Earned</Badge>}
    </div>
  )
}
