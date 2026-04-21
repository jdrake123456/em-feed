'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const res = await fetch('/api/refresh', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Feed refreshed — ${data.newCount} new articles`)
      } else {
        toast.error('Refresh failed')
      }
    } catch {
      toast.error('Refresh failed')
    } finally {
      setRefreshing(false)
    }
  }

  const navLinks = [
    { href: '/', label: 'Feed' },
    { href: '/saved', label: 'Saved' },
    { href: '/archived', label: 'Archived' },
    { href: '/sources', label: 'Sources' },
  ]

  return (
    <nav
      style={{ backgroundColor: '#1a1d27', borderBottom: '1px solid #2a2d3a' }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-white mr-4 text-sm tracking-wide">EM Feed</span>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname === link.href
                  ? 'text-white bg-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Sign out"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
