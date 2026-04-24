'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const passwordUpdated = searchParams.get('message') === 'password_updated'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong p-8 w-full max-w-md"
    >
      <h1 className="text-2xl font-semibold text-white mb-1">Welcome back</h1>
      <p className="text-white/50 text-sm mb-8">Sign in to your habit tracker</p>

      {passwordUpdated && (
        <p className="text-green-400 text-sm bg-green-400/10 rounded-lg px-3 py-2 mb-4">
          Password updated — sign in with your new password.
        </p>
      )}

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
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-white/70 text-sm">Password</label>
            <Link href="/forgot-password" className="text-indigo-400 hover:text-indigo-300 text-xs">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-white/40 text-sm mt-6">
        No account?{' '}
        <Link href="/register" className="text-indigo-400 hover:text-indigo-300">
          Create one
        </Link>
      </p>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
