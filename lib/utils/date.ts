import { startOfWeek, endOfWeek, addWeeks, format, getWeek, getYear } from "date-fns"

export function getWeekDates(weekNumber: number, year: number) {
  const firstDayOfYear = new Date(year, 0, 1)
  const weekStart = startOfWeek(addWeeks(firstDayOfYear, weekNumber - 1), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

  return {
    start: weekStart,
    end: weekEnd,
    formatted: `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`,
  }
}

export function getCurrentWeek() {
  const now = new Date()
  return {
    week: getWeek(now, { weekStartsOn: 1 }),
    year: getYear(now),
  }
}

export function getWeeksForRecurrence(
  recurrenceType: "daily" | "weekly" | "biweekly" | "monthly",
  startWeek: number,
  startYear: number,
  endYear: number = startYear,
): { week: number; year: number }[] {
  const weeks: { week: number; year: number }[] = []
  let currentWeek = startWeek
  let currentYear = startYear

  while (currentYear <= endYear) {
    weeks.push({ week: currentWeek, year: currentYear })

    switch (recurrenceType) {
      case "daily":
      case "weekly":
        currentWeek++
        break
      case "biweekly":
        currentWeek += 2
        break
      case "monthly":
        currentWeek += 4
        break
    }

    if (currentWeek > 52) {
      currentWeek = currentWeek - 52
      currentYear++
    }
  }

  return weeks.filter((w) => w.year === startYear || w.year === endYear)
}

export function getMonthFromWeek(weekNumber: number, year: number): number {
  const { start } = getWeekDates(weekNumber, year)
  return start.getMonth()
}
