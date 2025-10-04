import { useQuery } from '@tanstack/react-query'
import { getAnalytics } from '../lib/api'
import CalendarHeatmap from '../components/CalendarHeatmap'

export default function Analytics({ userId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', userId],
    queryFn: () => getAnalytics(userId)
  })

  if (isLoading) return <div className="rounded-2xl bg-white p-4 shadow">Loading…</div>
  if (error) return <div className="text-red-600 text-sm">Failed to load analytics.</div>

  const streak = data?.streak ?? 0
  const calendar = data?.calendar ?? []

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-[#00ADB5] text-[#EEEEEE] p-4 shadow">
        <p className="text-sm text-[#EEEEEE}">You are on a streak for</p>
        <p className="text-[60px] font-bold">{streak} Days!</p>
      </div>
      <CalendarHeatmap data={calendar} days={98} />
    </div>
  )
}