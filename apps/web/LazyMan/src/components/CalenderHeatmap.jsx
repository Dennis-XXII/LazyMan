import { format, parseISO } from 'date-fns'


export default function CalendarHeatmap({ data = [], days = 98 }) {
  // normalize to map for O(1) lookup
  const map = new Map(data.map(d => [d.date, d.points]))

  const cells = []
  const today = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    d.setHours(0,0,0,0)
    const key = d.toISOString().slice(0,10)
    const points = map.get(key) || 0
    const level = points === 0 ? 0 : points < 20 ? 1 : points < 50 ? 2 : 3 // tune as you like
    cells.push({ key, date: key, level })
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <p className="text-sm font-medium mb-2">Last {days} days</p>
      <div className="grid grid-cols-14 gap-1">
        {cells.reverse().map(c => (
          <div
            key={c.key}
            title={`${c.date} • ${c.level} lvl`}
            className={squareClass(c.level)}
            aria-label={`${c.date}: level ${c.level}`}
          />
        ))}
      </div>
      <Legend />
    </div>
  )
}

function squareClass(level) {
  const base = 'h-3 w-3 rounded-sm'
  if (level === 0) return `${base} bg-gray-200`
  if (level === 1) return `${base} bg-green-200`
  if (level === 2) return `${base} bg-green-400`
  return `${base} bg-green-600`
}

function Legend() {
  return (
    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
      <span>Less</span>
      <span className="h-3 w-3 rounded-sm bg-gray-200" />
      <span className="h-3 w-3 rounded-sm bg-green-200" />
      <span className="h-3 w-3 rounded-sm bg-green-400" />
      <span className="h-3 w-3 rounded-sm bg-green-600" />
      <span>More</span>
    </div>
  )
}