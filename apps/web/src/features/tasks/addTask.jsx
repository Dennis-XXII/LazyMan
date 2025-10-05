import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'

export default function AddTask({ userId }) {
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [points, setPoints] = useState(10)

  const addTask = useMutation({
    mutationFn: () => api('/tasks', {
      method: 'POST',
      body: JSON.stringify({ userId, title, points })
    }),
    onSuccess: () => {
      setTitle('')
      setPoints(10)
      qc.invalidateQueries({ queryKey: ['analytics', userId] })
    }
  })

  return (
    <form className="space-y-2" onSubmit={(e)=>{ e.preventDefault(); addTask.mutate() }}>
      <input
        className="w-full rounded-xl border p-3"
        placeholder="Task title"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
        required
      />
      <input
        className="w-full rounded-xl border p-3"
        type="number"
        min={1}
        value={points}
        onChange={(e)=>setPoints(parseInt(e.target.value || '1', 10))}
      />
      <button className="w-full rounded-xl bg-blue-600 p-3 text-white font-medium active:scale-[.99]">
        Add Task (+{points})
      </button>
    </form>
  )
}