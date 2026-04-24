'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import WeeklyChart from '@/components/WeeklyChart'
import { getLast7Days, shortDayLabel, today } from '@/lib/utils'
import type { Habit, HabitLog } from '@/types'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function HabitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [habit, setHabit] = useState<Habit | null>(null)
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const last7 = getLast7Days()

      const [{ data: habitData }, { data: logsData }] = await Promise.all([
        supabase.from('habits').select('*').eq('id', id).single(),
        supabase
          .from('habit_logs')
          .select('*')
          .eq('habit_id', id)
          .gte('completed_date', last7[0]),
      ])

      if (!habitData) { router.push('/habits'); return }
      setHabit(habitData)
      setLogs(logsData ?? [])
      setLoading(false)
    }
    load()
  }, [id, router])

  async function toggleToday() {
    if (!habit) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const todayStr = today()
    const existing = logs.find(l => l.completed_date === todayStr)

    if (existing) {
      await supabase.from('habit_logs').delete().eq('id', existing.id)
      setLogs(prev => prev.filter(l => l.id !== existing.id))
    } else {
      const { data } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habit.id, user_id: user.id, completed_date: todayStr })
        .select()
        .single()
      if (data) setLogs(prev => [...prev, data])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!habit) return null

  const days = getLast7Days()
  const logDates = new Set(logs.map(l => l.completed_date))
  const completedToday = logDates.has(today())
  const completedThisWeek = days.filter(d => logDates.has(d)).length

  const chartData = days.map(d => ({
    day: shortDayLabel(d),
    completed: logDates.has(d) ? 1 : 0,
  }))

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/habits" className="text-white/40 hover:text-white/70 transition-colors text-sm">
          ← Habits
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-4 h-4 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: habit.color }} />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{habit.title}</h1>
            {habit.description && (
              <p className="text-white/50 mt-1">{habit.description}</p>
            )}
          </div>
          <button
            onClick={toggleToday}
            className={completedToday
              ? 'px-4 py-2 rounded-xl font-medium text-sm transition-all bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
              : 'btn-primary text-sm'}
          >
            {completedToday ? '✓ Done today' : 'Mark today'}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Last 7 days</h2>
          <span className="text-white/40 text-sm">{completedThisWeek}/7 days</span>
        </div>
        <WeeklyChart data={chartData} color={habit.color} />
      </motion.div>
    </div>
  )
}
