'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    setLoading(false)

    if (!res.ok) {
      setError('Invalid email or password.')
      return
    }

    const { token } = await res.json()
    localStorage.setItem('token', token)
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-sm border border-gray-200 rounded p-8"
      >
        <h1 className="text-lg font-semibold text-black">Sign in</h1>

        <label className="flex flex-col gap-1 text-sm text-black">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-black">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="border border-gray-300 rounded px-3 py-2 text-sm text-black hover:bg-gray-50 cursor-pointer active:bg-black active:text-white active:border-black disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
