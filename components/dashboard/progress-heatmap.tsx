"use client"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface WeekCompletion {
  week: number
  completed: number
  total: number
}

interface ProgressHeatmapProps {
  data: WeekCompletion[]
  currentWeek: number
}

export function ProgressHeatmap({ data, currentWeek }: ProgressHeatmapProps) {
  const getIntensity = (completed: number, total: number) => {
    if (total === 0) return 0
    const percentage = (completed / total) * 100
    if (percentage === 0) return 0
    if (percentage <= 25) return 1
    if (percentage <= 50) return 2
    if (percentage <= 75) return 3
    return 4
  }

  const getIntensityClass = (intensity: number) => {
    switch (intensity) {
      case 0:
        return "bg-heatmap-0"
      case 1:
        return "bg-heatmap-1"
      case 2:
        return "bg-heatmap-2"
      case 3:
        return "bg-heatmap-3"
      case 4:
        return "bg-heatmap-4"
      default:
        return "bg-heatmap-0"
    }
  }

  // Create 52 weeks with data or empty
  const weeks = Array.from({ length: 52 }, (_, i) => {
    const weekData = data.find((d) => d.week === i + 1)
    return {
      week: i + 1,
      completed: weekData?.completed || 0,
      total: weekData?.total || 0,
    }
  })

  // Split into 4 rows of 13 weeks each
  const rows = [weeks.slice(0, 13), weeks.slice(13, 26), weeks.slice(26, 39), weeks.slice(39, 52)]

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Progress Heatmap</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={cn("w-3 h-3 rounded-sm", getIntensityClass(i))} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
        <div className="space-y-1">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {row.map((week) => {
                const intensity = getIntensity(week.completed, week.total)
                const isCurrent = week.week === currentWeek
                return (
                  <Tooltip key={week.week}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-sm transition-transform hover:scale-110 cursor-pointer",
                          getIntensityClass(intensity),
                          isCurrent && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Week {week.week}: {week.completed}/{week.total} tasks
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
