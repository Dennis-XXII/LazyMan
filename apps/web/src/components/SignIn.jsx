import { useState } from 'react'
import { API_BASE } from '../lib/api'
import { setUserSession } from '../lib/auth'

export default function SignIn({ onSignedIn }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined })
      })
      if (!res.ok) throw new Error(await res.text())
      const user = await res.json() // { id, email, name }
      setUserSession({ id: user.id, email: user.email, name: user.name })
      onSignedIn(user.id)
    } catch (err) {
      setError(err?.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#EEEEEE] px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow">
        <h1 className="text-xl font-semibold text-[#222831] mb-2">Welcome to LazyMan</h1>
        <p className="text-sm text-gray-600 mb-4">
          Sign in with your email. No password needed — we keep it simple.
        </p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-xl border p-3 focus:outline-[#222831] focus:outline-2"
            placeholder="Your name (optional)"
            value={name}
            onChange={e=>setName(e.target.value)}
          />
          <input
            className="w-full rounded-xl border p-3 focus:outline-[#222831] focus:outline-2"
            placeholder="you@example.com"
            type="email"
            required
            value={email}
            onChange={e=>setEmail(e.target.value)}
          />
          <button
            className="w-full rounded-xl bg-[#00ADB5] p-3 text-white text-sm disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Continue'}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        <p className="text-[12px] text-gray-500 mt-4">
          We’ll create your account if it doesn’t exist. Returning? Use the same email to load your data.
        </p>
      </div>
    </div>
  )
}