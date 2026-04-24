'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-semibold text-white mb-1">Reset password</h1>
        <p className="text-white/50 text-sm mb-8">
          Enter your email and we&apos;ll send a reset link valid for 15 minutes.
        </p>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-3xl">📬</p>
            <p className="text-white/80">Check your inbox for the reset link.</p>
            <p className="text-white/40 text-sm">The link expires in 15 minutes and can only be used once.</p>
            <Link href="/login" className="btn-ghost inline-block mt-2 w-full text-center">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-1.5">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>

            <Link href="/login" className="block text-center text-white/40 hover:text-white/70 text-sm transition-colors">
              Back to sign in
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  )
}
