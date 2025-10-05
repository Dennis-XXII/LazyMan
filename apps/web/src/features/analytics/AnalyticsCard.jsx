import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'

export default function AnalyticsCard({ userId }) {
  const { data } = useQuery({
    queryKey: ['analytics', userId],
    queryFn: () => api(`/analytics/${userId}`)
  })

  const streak = data?.streak ?? 0
  const recent = (data?.calendar ?? []).slice(-14).reverse()

  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <p className="text-sm text-gray-600">Current streak</p>
      <p className="text-3xl font-bold">{streak} 🔥</p>
      <div className="mt-3">
        <p className="text-sm font-medium">Recent days</p>
        <ul className="mt-1 max-h-40 overflow-auto text-sm">
          {recent.map(d => (
            <li key={d.date} className="flex justify-between border-b py-1">
              <span>{d.date}</span>
              <span className="font-medium">+{d.points}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}