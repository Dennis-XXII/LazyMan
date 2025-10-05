import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listRewards, createReward, redeemToday, deleteReward } from '../lib/api'
import { useState } from 'react'

export default function Rewards({ userId }) {
  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['rewards', userId],
    queryFn: () => listRewards(userId)
  })

  const [newR, setNewR] = useState({ title: '', cost: 50 })

  const addReward = useMutation({
    mutationFn: () => createReward({ userId, title: newR.title, cost: newR.cost }),
    onSuccess: () => {
      setNewR({ title: '', cost: 50 })
      qc.invalidateQueries({ queryKey: ['rewards', userId] })
    }
  })

  const redeem = useMutation({
    mutationFn: (rewardId) => redeemToday({ userId, rewardId }),
    onSuccess: () => {
      alert('Redeem successful!')
      qc.invalidateQueries({ queryKey: ['today', userId] })
    },
    onError: async (e) => {
      try { alert(JSON.parse(e.message)?.message ?? 'Redeem failed') } catch { alert('Redeem failed') }
    }
  })

  const del = useMutation({
    mutationFn: (rewardId) => deleteReward(rewardId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rewards', userId] })
    }
  })

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow">
        <p className="text-lg text-[#00ADB5] font-medium">Create Reward</p>
        <form className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3" onSubmit={(e)=>{e.preventDefault(); addReward.mutate()}}>
          <input className="rounded-xl border p-3 focus:outline-[#222831] focus:outline-2" placeholder="Reward title"
                 value={newR.title} onChange={e=>setNewR(r=>({...r, title: e.target.value}))} required />
          <input className="rounded-xl border p-3 focus:outline-[#222831] focus:outline-2" type="number" min={1}
                 value={newR.cost} onChange={e=>setNewR(r=>({...r, cost: parseInt(e.target.value||'1',10)}))} />
          <button className="rounded-xl bg-[#00ADB5] p-3 text-white text-sm">Add</button>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow">
        <p className="text-lg text-[#00ADB5] font-medium mb-2">Your Rewards</p>
        {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
        {error && <p className="text-sm text-red-600">Failed to load rewards: {String(error.message)}</p>}
        <ul className="space-y-3">
          {(data ?? []).map((r) => (
            <li key={r.id} className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{r.title}</p>
                  <p className="text-sm text-gray-600">{r.cost} pts (today)</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="border border-[#00ADB5] text-[#00ADB5] shadow-md shadow-[#00ADB5]-500/30 px-4 py-2 rounded-xl text-sm"
                    onClick={()=>redeem.mutate(r.id)}
                  >
                    Redeem
                  </button>
                  <button
                    className="rounded-xl px-3 py-2 text-sm border text-red-600 shadow-md shadow-red-600/30"
                    onClick={()=>{ if (confirm('Delete this reward?')) del.mutate(r.id) }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
          {(data?.length ?? 0) === 0 && !isLoading && <li className="text-sm text-gray-500">No rewards yet.</li>}
        </ul>
      </div>
    </div>
  )
}