'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#3b82f6',
]

interface Props {
  onClose: () => void
  onCreated: () => void
}

export default function HabitForm({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('habits').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      color,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    onCreated()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-strong p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">New habit</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-1.5">Name <span className="text-indigo-400">*</span></label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Morning run"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1.5">Description</label>
            <input
              type="text"
              className="input"
              placeholder="Optional"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110' : 'opacity-70 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Adding…' : 'Add habit'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
