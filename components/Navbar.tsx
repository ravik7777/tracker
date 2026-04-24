'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/habits', label: 'Habits' },
  ]

  return (
    <nav className="border-b border-white/10 bg-white/5 backdrop-blur-md">
      <div className="container mx-auto px-4 max-w-5xl h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-white">✦ Tracker</span>
          <div className="flex gap-1">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  pathname.startsWith(l.href)
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} className="text-white/40 hover:text-white/70 text-sm transition-colors">
          Sign out
        </button>
      </div>
    </nav>
  )
}
