import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Dashboard from './pages/Dashboard'
import Rewards from './pages/Rewards'
import Analytics from './pages/Analytics'

function RouteError() {
  return (
    <div className="p-4 text-red-600">
      <p className="font-semibold">Something went wrong while loading this page.</p>
      <p className="text-sm">Check the console for details.</p>
    </div>
  )
}

export function makeRouter(USER_ID) {
  return createBrowserRouter([
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
}