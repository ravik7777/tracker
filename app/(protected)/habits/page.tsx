'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import HabitCard from '@/components/HabitCard'
import HabitForm from '@/components/HabitForm'
import { today } from '@/lib/utils'
import type { Habit, HabitLog } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  async function load() {
    const supabase = createClient()
    const [{ data: habitsData }, { data: logsData }] = await Promise.all([
      supabase.from('habits').select('*').order('created_at'),
      supabase.from('habit_logs').select('*').eq('completed_date', today()),
    ])
    setHabits(habitsData ?? [])
    setTodayLogs(logsData ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleHabit(habitId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const isCompleted = todayLogs.some(l => l.habit_id === habitId)

    if (isCompleted) {
      await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('completed_date', today())
      setTodayLogs(prev => prev.filter(l => l.habit_id !== habitId))
    } else {
      const { data } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: user.id, completed_date: today() })
        .select()
        .single()
      if (data) setTodayLogs(prev => [...prev, data])
    }
  }

  async function deleteHabit(habitId: string) {
    const supabase = createClient()
    await supabase.from('habits').delete().eq('id', habitId)
    setHabits(prev => prev.filter(h => h.id !== habitId))
    setTodayLogs(prev => prev.filter(l => l.habit_id !== habitId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Habits</h1>
          <p className="text-white/50 mt-1">
            {todayLogs.length}/{habits.length} completed today
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Add habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="glass p-16 text-center">
          <p className="text-4xl mb-4">🌱</p>
          <p className="text-white/50">No habits yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence>
            {habits.map((habit, i) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completed={todayLogs.some(l => l.habit_id === habit.id)}
                onToggle={() => toggleHabit(habit.id)}
                onDelete={() => deleteHabit(habit.id)}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <HabitForm
            onClose={() => setShowForm(false)}
            onCreated={() => { setShowForm(false); load() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
