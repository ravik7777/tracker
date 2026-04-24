import type { HabitLog, HabitWithLogs } from '@/types'

export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function today(): string {
  return toDateString(new Date())
}

export function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return toDateString(d)
  })
}

export function getLast30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return toDateString(d)
  })
}

export function shortDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

export function calculateStreak(logs: HabitLog[]): number {
  const logSet = new Set(logs.map(l => l.completed_date))
  let streak = 0
  const cursor = new Date()

  if (!logSet.has(toDateString(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (logSet.has(toDateString(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export function weeklyCompletionPercent(habits: HabitWithLogs[]): number {
  if (habits.length === 0) return 0
  const days = getLast7Days()
  const total = habits.length * days.length
  const completed = habits.reduce((sum, h) => {
    const logDates = new Set(h.habit_logs.map(l => l.completed_date))
    return sum + days.filter(d => logDates.has(d)).length
  }, 0)
  return Math.round((completed / total) * 100)
}

export function bestHabit(habits: HabitWithLogs[]): string | null {
  if (habits.length === 0) return null
  const days = getLast30Days()
  const scored = habits.map(h => {
    const logDates = new Set(h.habit_logs.map(l => l.completed_date))
    return { title: h.title, score: days.filter(d => logDates.has(d)).length }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored[0].score > 0 ? scored[0].title : null
}
