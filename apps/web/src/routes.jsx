import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Dashboard from './pages/Dashboard'
import Rewards from './pages/Rewards'
import Analytics from './pages/Analytics'

// set your user id once (or put it in localStorage via DevTools)
export const USER_ID = localStorage.getItem('userId') || 'cmgcgnbia000011u1aawjavca'
if (!localStorage.getItem('userId') && USER_ID !== 'cmgcgnbia000011u1aawjavca') {
  localStorage.setItem('userId', USER_ID)
}

// simple error element so router shows errors instead of blank page
function RouteError() {
  return (
    <div className="p-4 text-red-600">
      <p className="font-semibold">Something went wrong while loading this page.</p>
      <p className="text-sm">Check the console for details.</p>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Dashboard userId={USER_ID} /> },
      { path: 'rewards', element: <Rewards userId={USER_ID} /> },
      { path: 'analytics', element: <Analytics userId={USER_ID} /> }
    ]
  }
])