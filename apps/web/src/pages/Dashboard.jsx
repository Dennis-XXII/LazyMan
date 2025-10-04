import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getToday, toggleComplete, createTemplate, deleteTemplate } from '../lib/api'
import { useState } from 'react'
import { CheckSquare } from '../assets/icons'

export default function Dashboard({ userId }) {
  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['today', userId],
    queryFn: () => getToday(userId)
  })

  const toggle = useMutation({
    mutationFn: (templateId) => toggleComplete({ userId, templateId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['today', userId] })
      qc.invalidateQueries({ queryKey: ['analytics', userId] })
    }
  })

  const del = useMutation({
    mutationFn: (templateId) => deleteTemplate(templateId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['today', userId] })
      qc.invalidateQueries({ queryKey: ['analytics', userId] })
    }
  })

  return (
    <div className="space-y-4">
      <TodaySummary data={data} loading={isLoading} error={error} />

      <div className="rounded-2xl bg-white p-0 shadow">
        <p className="text-sm font-medium rounded-t-xl text-white bg-[#00ADB5] p-4 border border-[#00ADB5]">Today’s Tasks</p>
        {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
        {error && <p className="text-sm text-red-600">Failed to load tasks: {String(error.message)}</p>}
        <ul className="divide-y border border-[#00ADB5] bg-[#EEEEEE] rounded-b-xl pt-0">
          {(data?.tasks ?? []).map((t) => (
            <li key={t.templateId} className="py-3 p-3 flex items-center justify-between gap-2 bg-white border border-[#00ADB5] m-2 rounded-xl">
              <div className="min-w-0">
                <p className="font-xs text-[#222831] font-semibold truncate">{t.title}</p>
                <p className="text-[16px] text-[#222831]">{t.points} pts </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className={`rounded-xl px-2 py-2 text-xs border ${t.completed ? 'bg-green-600 text-white' : 'border-[#00ADB5] text-[#00ADB5] shadow-md shadow-white-500/30' } active:scale-[.99] flex items-center`}
                  onClick={() => toggle.mutate(t.templateId)}
                >
                  {t.completed ? "Completed" : "Mark Done"}
                </button>
                <button
                  className="rounded-xl px-2 py-2 text-xs text-red-600 shadow-md shadow-white-500/30 border border-red-600 ml-2"
                  onClick={() => { if (confirm('Delete this task template?')) del.mutate(t.templateId) }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {(!isLoading && (data?.tasks?.length ?? 0) === 0) && (
            <li className="py-2 text-sm text-gray-500">No templates yet. Add one below.</li>
          )}
        </ul>
      </div>

      <NewTemplateForm userId={userId} />
    </div>
  )
}

function TodaySummary({ data, loading, error }) {
  if (loading) return <div className="rounded-2xl bg-[#00ADB5] text-white p-4 shadow">Loading…</div>
  if (error) return <div className="rounded-2xl bg-[#00ADB5] text-white p-4 shadow text-red-600">
    Failed to load summary: {String(error.message)}
  </div>

  const earned = data?.earnedPoints ?? 0
  const total = data?.totalPossiblePoints ?? 0
  const remaining = data?.remainingPoints ?? 0
  const pct = total > 0 ? Math.round((earned / total) * 100) : 0

  return (
    <div className="rounded-2xl bg-[#00ADB5] p-4 shadow-md text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl text-[#FBF8EF] mb-2">Today</p>
          <p className="text-xs text-[#FBF8EF]">{data?.date}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[#FBF8EF]">Earned</p>
          <p className="text-xl font-semibold">{earned}/{total} pts</p>
          <p className="text-xs text-[#FBF8EF]">Remaining: {remaining} pts</p>
        </div>
      </div>
      <div className="mt-3 h-2 w-full rounded bg-[#FBF8EF] border border-[#FBF8EF] overflow-hidden">
        <div
          className={barColor(pct)}
          style={{
            height: '100%',
            width: `${pct}%`,
            transition: 'width 0.9s cubic-bezier(0.25, 1, 0.5, 1), willChange: width',
            
          }}
        />
      </div>
      <p className="mt-1 text-xs text-[#FBF8EF]">{pct}% completed</p>
    </div>
  )
}

function barColor(pct) {
  if (pct <= 20) return 'bg-red-500'
  if (pct <= 50) return 'bg-yellow-400'
  if (pct >= 80) return 'bg-green-600'
  return 'bg-orange-500'
}

function NewTemplateForm({ userId }) {
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [points, setPoints] = useState(10)

  const add = useMutation({
    mutationFn: () => createTemplate({ userId, title, points }),
    onSuccess: () => {
      setTitle(''); setPoints(10)
      qc.invalidateQueries({ queryKey: ['today', userId] })
      qc.invalidateQueries({ queryKey: ['analytics', userId] })
    }
  })

  return (
    <div className="rounded-2xl bg-[#00ADB5] p-4 shadow-lg">
      <p className="text-sm text-[#FBF8EF] font-bold font-medium mb-4">Add a Task you would like to complete</p>
      <form className="space-y-2" onSubmit={(e)=>{e.preventDefault(); add.mutate()}}>
        <input className="w-full bg-white rounded-xl p-3 focus:outline-[#222831] focus:outline-2" placeholder="e.g., Read 15 Minutes"
               value={title} onChange={e=>setTitle(e.target.value)} required />
        <input className="w-full bg-white rounded-xl p-3 focus:outline-[#222831] focus:outline-2" type="number" min={1}
               value={points} onChange={e=>setPoints(parseInt(e.target.value||'1',10))} />
        <button className="w-full rounded-xl bg-[#00ADB5] p-3 text-white text-sm border-2 border-white">Add Task (+{points} pts)</button>
      </form>
    </div>
  )
}