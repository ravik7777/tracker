export interface Habit {
  id: string
  user_id: string
  title: string
  description: string | null
  color: string
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_date: string
  created_at: string
}

export interface HabitWithLogs extends Habit {
  habit_logs: HabitLog[]
}

export interface UserStats {
  completionPercentage: number
  bestHabit: string | null
  currentStreak: number
}
