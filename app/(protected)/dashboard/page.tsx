'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import StatsCard from '@/components/StatsCard'
import { weeklyCompletionPercent, bestHabit, calculateStreak, getLast30Days } from '@/lib/utils'
import type { HabitLog, HabitWithLogs } from '@/types'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function DashboardPage() {
  const [habits, setHabits] = useState<HabitWithLogs[]>([])
  const [allLogs, setAllLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const last30 = getLast30Days()

      const [{ data: habitsData }, { data: logsData }] = await Promise.all([
        supabase.from('habits').select('*').order('created_at'),
        supabase
          .from('habit_logs')
          .select('*')
          .gte('completed_date', last30[0]),
      ])

      const habitsWithLogs: HabitWithLogs[] = (habitsData ?? []).map(h => ({
        ...h,
        habit_logs: (logsData ?? []).filter(l => l.habit_id === h.id),
      }))

      setHabits(habitsWithLogs)
      setAllLogs(logsData ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const completionPct = weeklyCompletionPercent(habits)
  const best = bestHabit(habits)
  const streak = calculateStreak(allLogs)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-white/50 mt-1">Your habit progress at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          label="This week"
          value={`${completionPct}%`}
          sub="completion rate"
          icon="📈"
          index={0}
        />
        <StatsCard
          label="Best habit"
          value={best ?? '—'}
          sub="last 30 days"
          icon="🏆"
          index={1}
        />
        <StatsCard
          label="Current streak"
          value={`${streak}d`}
          sub="consecutive days"
          icon="🔥"
          index={2}
        />
      </div>

      {habits.length === 0 ? (
        <div className="glass p-12 text-center">
          <p className="text-white/50 mb-4">No habits yet.</p>
          <Link href="/habits" className="btn-primary inline-block">
            Add your first habit
          </Link>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-white/80 mb-4">Your habits</h2>
          <div className="grid gap-3">
            {habits.map((habit, i) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/habits/${habit.id}`}>
                  <div className="glass p-4 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{habit.title}</p>
                      {habit.description && (
                        <p className="text-white/40 text-sm truncate">{habit.description}</p>
                      )}
                    </div>
                    <span className="text-white/30 text-sm flex-shrink-0">
                      {habit.habit_logs.filter(l => {
                        const d = new Date()
                        d.setDate(d.getDate() - 6)
                        return l.completed_date >= d.toISOString().split('T')[0]
                      }).length}/7 days
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
