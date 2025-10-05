export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export async function api(path, init) {
  const url = `${API_BASE}${path}`
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      ...init
    })
    if (!res.ok) {
      let body = await res.text().catch(() => '')
      const err = new Error(body || `HTTP ${res.status} ${res.statusText}`)
      err.status = res.status
      err.url = url
      throw err
    }
    return res.json()
  } catch (e) {
    console.error('API error:', { url, init, message: e.message, status: e.status })
    throw e
  }
}

// Templates
export const createTemplate = (payload) =>
  api('/templates', { method: 'POST', body: JSON.stringify(payload) })
export const listTemplates = (userId) => api(`/templates/${userId}`)
export const deleteTemplate = (id) =>
  api(`/templates/${id}`, { method: 'DELETE' })

// Today view
export const getToday = (userId) => api(`/today/${userId}`)
export const toggleComplete = (payload) =>
  api('/complete/toggle', { method: 'POST', body: JSON.stringify(payload) })

// Rewards (user-defined)
export const listRewards = (userId) => api(`/rewards/${userId}`)
export const createReward = (payload) =>
  api('/rewards', { method: 'POST', body: JSON.stringify(payload) })
export const deleteReward = (id) =>
  api(`/rewards/${id}`, { method: 'DELETE' })
export const redeemToday = (payload) =>
  api('/redeem/today', { method: 'POST', body: JSON.stringify(payload) })

// Analytics (percent/day)
export const getAnalytics = (userId) => api(`/analytics/${userId}`)