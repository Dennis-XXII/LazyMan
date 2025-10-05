import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { makeRouter } from './routes'           // 🟢 use factory
import { API_BASE } from './lib/api'
import { ensureUserId } from './lib/userId'

const queryClient = new QueryClient()

// 🟢 Render a minimal fallback immediately so it's not just a blank page
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <div className="min-h-dvh flex items-center justify-center text-gray-500">
    Booting LazyMan…
  </div>
)

async function boot() {
  try {
    const id = await ensureUserId(API_BASE)     // 🟢 create or load anon user
    const router = makeRouter(id)               // 🟢 build router with real id

    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </React.StrictMode>
    )
  } catch (e) {
    // Optional: show a friendly error screen
    root.render(
      <div className="min-h-dvh flex flex-col items-center justify-center text-center text-red-600 p-6">
        <p className="font-semibold mb-2">Failed to start</p>
        <pre className="text-xs whitespace-pre-wrap">{String(e.message)}</pre>
      </div>
    )
    console.error('Boot error:', e)
  }
}

boot()