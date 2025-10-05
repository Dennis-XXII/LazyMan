import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { makeRouter } from './routes'
import SignIn from './components/SignIn'
import { getUserId } from './lib/auth'

const queryClient = new QueryClient()
const root = ReactDOM.createRoot(document.getElementById('root'))

function Root() {
  const [userId, setUserId] = useState(getUserId())

  // optional: splash for a tick (keeps UX smooth)
  const [booted, setBooted] = useState(false)
  useEffect(() => { setBooted(true) }, [])

  if (!booted) {
    return <div className="min-h-dvh flex items-center justify-center text-gray-500">Booting LazyMan…</div>
  }

  if (!userId) {
    return <SignIn onSignedIn={setUserId} />
  }

  const router = makeRouter(userId)
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>
  )
}

root.render(<Root />)