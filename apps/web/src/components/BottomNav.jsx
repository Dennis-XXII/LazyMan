// src/components/BottomNav.jsx
import { NavLink } from 'react-router-dom'
import { Home2, Tag, PieChart3 } from '../assets/icons'

const tabs = [
  { to: '/', label: 'Home', icon: <Home2 />, end: true },
  { to: '/rewards', label: 'Rewards', icon: <Tag /> },
  { to: '/analytics', label: 'Stats', icon: <PieChart3 /> }
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 font-sans">
      <div className="mx-auto max-w-md">
        <div className="m-3 rounded-4xl bg-gray-50 shadow-lg/30 shadow-gray">
          <ul className="grid grid-cols-3 text-sm">
            {tabs.map(t => (
              <li key={t.to}>
                <NavLink
                  to={t.to}
                  end={t.end}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-2 ${
                      isActive ? 'text-white bg-[#00ADB5] rounded-4xl' : 'text-[#393E46]'
                    }`
                  }
                >
                  <span className="text-xl leading-none z-10">{t.icon}</span>
                  <span className="mt-0.5">{t.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* render-proof */}
      <div className="sr-only">bottom-nav-mounted</div>
    </nav>
  )
}