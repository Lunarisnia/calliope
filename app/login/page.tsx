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

    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-0 w-full max-w-sm"
      >
        <h1 className="text-4xl font-black uppercase text-[#ff2255] tracking-tight leading-none mb-8">
          Sign In
        </h1>

        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-black text-[#ff2255] placeholder-[#ff225566] border-2 border-[#ff2255] px-4 py-3 text-sm font-medium outline-none w-full [&:-webkit-autofill]:![box-shadow:0_0_0_1000px_black_inset] [&:-webkit-autofill]:![-webkit-text-fill-color:#ff2255]"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-black text-[#ff2255] placeholder-[#ff225566] border-2 border-t-0 border-[#ff2255] px-4 py-3 text-sm font-medium outline-none w-full [&:-webkit-autofill]:![box-shadow:0_0_0_1000px_black_inset] [&:-webkit-autofill]:![-webkit-text-fill-color:#ff2255]"
        />

        {error && (
          <p className="text-[#ff2255] text-xs font-bold uppercase mt-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 border-2 border-[#ff2255] text-[#ff2255] font-black uppercase text-sm px-4 py-3 hover:bg-[#ff2255] hover:text-black transition-colors cursor-pointer disabled:opacity-40"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
