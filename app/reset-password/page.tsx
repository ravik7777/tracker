'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    router.push('/login?message=password_updated')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-semibold text-white mb-1">Set new password</h1>
        <p className="text-white/50 text-sm mb-8">Choose a strong password for your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-1.5">New password</label>
            <input
              type="password"
              className="input"
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1.5">Confirm password</label>
            <input
              type="password"
              className="input"
              placeholder="Repeat your new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
