'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Habit } from '@/types'

interface Props {
  habit: Habit
  completed: boolean
  onToggle: () => void
  onDelete: () => void
  index: number
}

export default function HabitCard({ habit, completed, onToggle, onDelete, index }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="glass p-5 flex flex-col gap-3 hover:bg-white/8 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: habit.color }} />
        <Link href={`/habits/${habit.id}`} className="flex-1 min-w-0 group">
          <p className="font-medium text-white group-hover:text-indigo-300 transition-colors truncate">
            {habit.title}
          </p>
          {habit.description && (
            <p className="text-white/40 text-sm truncate mt-0.5">{habit.description}</p>
          )}
        </Link>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
        <button
          onClick={onToggle}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            completed
              ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
              : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
          }`}
        >
          {completed ? '✓ Done' : 'Mark done'}
        </button>

        {confirmDelete ? (
          <>
            <button
              onClick={onDelete}
              className="px-3 py-2 rounded-xl text-sm text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-3 py-2 rounded-xl text-sm text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  )
}
