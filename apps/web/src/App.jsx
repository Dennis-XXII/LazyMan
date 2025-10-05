import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import ScreenHeader from './components/ScreenHeader'

export default function App() {
  const { pathname } = useLocation()
  const titles = { '/': 'Daily Tasks', '/rewards': 'Rewards', '/analytics': 'Analytics' }
  const title = titles[pathname] || 'Daily Tasks'

  return (
    <div className="min-h-dvh bg-[#EEEEEE] text-gray-900">
      <div className="mx-auto max-w-md">
        <ScreenHeader title={title} />
        <main className="px-4 pb-24 pt-2">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}