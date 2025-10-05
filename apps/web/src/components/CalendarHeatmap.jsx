/**
 * props: { data: [{date:'YYYY-MM-DD', percent:number}], days?: number }
 * Missing days are treated as 0%.
 */
export default function CalendarHeatmap({ data = [], days = 98 }) {
  const map = new Map(data.map(d => [d.date, d.percent]))

  const cells = []
  const today = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    d.setHours(0,0,0,0)
    const key = d.toISOString().slice(0,10)
    const percent = map.get(key) ?? 0
    cells.push({ key, date: key, percent })
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow border-[#00ADB5] border-8">
      <p className="text-sm font-medium mb-2">Last {days} days</p>
      <div className="grid grid-cols-14 gap-1">
        {cells.reverse().map(c => (
          <div
            key={c.key}
            title={`${c.date} • ${c.percent}%`}
            className={`h-3 w-3 rounded-sm ${colorForPercent(c.percent)}`}
            aria-label={`${c.date}: ${c.percent}%`}
          />
        ))}
      </div>
      <Legend />
    </div>
  )
}

function colorForPercent(p) {
  if (p <= 20) return 'bg-red-500'
  if (p <= 50) return 'bg-yellow-400'
  if (p >= 80) return 'bg-green-600'
  return 'bg-orange-500'
}

function Legend() {
  return (
    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
      <span>0–20%</span><span className="h-3 w-3 rounded-sm bg-red-500" />
      <span>21–50%</span><span className="h-3 w-3 rounded-sm bg-yellow-400" />
      <span>51–79%</span><span className="h-3 w-3 rounded-sm bg-orange-500" />
      <span>80–100%</span><span className="h-3 w-3 rounded-sm bg-green-600" />
    </div>
  )
}