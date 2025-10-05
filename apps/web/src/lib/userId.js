// src/lib/userId.js
export async function ensureUserId(API_BASE) {
  const cached = localStorage.getItem('userId')
  if (cached) return cached

  const res = await fetch(`${API_BASE}/users/anon`, { method: 'POST' })
  if (!res.ok) throw new Error(await res.text())
  const { id } = await res.json()
  localStorage.setItem('userId', id)
  return id
}