'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push(searchParams.get('from') || '/')
        router.refresh()
      } else {
        setError('Incorrect password')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
        className="w-full rounded-md px-3 py-2.5 text-sm outline-none"
        style={{ backgroundColor: '#0f1117', border: '1px solid #2a2d3a', color: '#e5e7eb' }}
      />
      {error && <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>}
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full py-2.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        style={{ backgroundColor: '#4f8ef7', color: '#fff' }}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#0f1117' }}
    >
      <div
        className="w-full max-w-sm p-6 rounded-xl"
        style={{ backgroundColor: '#1a1d27', border: '1px solid #2a2d3a' }}
      >
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-white">EM Feed</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Enter your password to continue</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
