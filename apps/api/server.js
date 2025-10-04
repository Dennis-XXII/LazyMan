require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { z } = require('zod')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const app = express()
app.use(cors())
app.use(express.json())

const PORT = Number(process.env.PORT || 4000)

const APP_TZ = process.env.APP_TZ || undefined

const dayKey = (d = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)


app.get('/', (_req, res) => {
  res.json({
    name: 'Task Rewards API',
    ok: true,
    endpoints: [
      'GET  /health',
      'POST /users {email,name?}',
      'GET  /templates/:userId',
      'POST /templates',
      'DELETE /templates/:id',
      'POST /templates/reorder/move {userId,id,direction}',
      'POST /templates/reorder {userId, order:[{id,position}]}',
      'GET  /today/:userId',
      'POST /complete/toggle',
      'GET  /rewards/:userId',
      'POST /rewards',
      'DELETE /rewards/:id',
      'POST /rewards/reorder/move {userId,id,direction}',
      'POST /rewards/reorder {userId, order:[{id,position}]}',
      'POST /redeem/today',
      'GET  /analytics/:userId'
    ]
  })
})

app.get('/health', (_req, res) => res.json({ ok: true }))

/* ---------------- USERS ---------------- */
app.post('/users', async (req, res) => {
  const parsed = z.object({
    email: z.string().email(),
    name: z.string().optional()
  }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

  const user = await prisma.user.upsert({
    where: { email: parsed.data.email },
    update: { name: parsed.data.name },
    create: { email: parsed.data.email, name: parsed.data.name }
  })
  res.json(user)
})

/* ---------------- TEMPLATES (list, create w/position, delete, reorder) ---------------- */

// List active templates in user-defined order
app.get('/templates/:userId', async (req, res) => {
  const { userId } = req.params
  const templates = await prisma.taskTemplate.findMany({
    where: { userId, active: true },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }]
  })
  res.json(templates)
})

// Create template and append to end of list
app.post('/templates', async (req, res) => {
  const parsed = z.object({
    userId: z.string().min(1),
    title: z.string().min(1),
    points: z.number().int().positive(),
    active: z.boolean().optional().default(true)
  }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

  const maxPos = await prisma.taskTemplate.aggregate({
    where: { userId: parsed.data.userId },
    _max: { position: true }
  })
  const nextPos = (maxPos._max.position ?? -1) + 1

  const t = await prisma.taskTemplate.create({
    data: { ...parsed.data, position: nextPos }
  })
  res.status(201).json(t)
})

// Delete template
app.delete('/templates/:id', async (req, res) => {
  const id = req.params.id
  await prisma.taskTemplate.delete({ where: { id } })
  res.json({ ok: true })
})

// Move one (up/down)
app.post('/templates/reorder/move', async (req, res) => {
  const parsed = z.object({
    userId: z.string().min(1),
    id: z.string().min(1),
    direction: z.enum(['up', 'down'])
  }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

  const { userId, id, direction } = parsed.data
  const items = await prisma.taskTemplate.findMany({
    where: { userId, active: true },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }]
  })
  const idx = items.findIndex(i => i.id === id)
  if (idx === -1) return res.status(404).json({ message: 'Not found' })

  const swapWith = direction === 'up' ? idx - 1 : idx + 1
  if (swapWith < 0 || swapWith >= items.length) return res.json({ ok: true })

  const a = items[idx], b = items[swapWith]
  await prisma.$transaction([
    prisma.taskTemplate.update({ where: { id: a.id }, data: { position: b.position } }),
    prisma.taskTemplate.update({ where: { id: b.id }, data: { position: a.position } })
  ])
  res.json({ ok: true })
})

// Bulk reorder
app.post('/templates/reorder', async (req, res) => {
  const parsed = z.object({
    userId: z.string().min(1),
    order: z.array(z.object({ id: z.string().min(1), position: z.number().int().min(0) })).min(1)
  }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

  const ops = parsed.data.order.map(row =>
    prisma.taskTemplate.update({ where: { id: row.id }, data: { position: row.position } })
  )
  await prisma.$transaction(ops)
  res.json({ ok: true })
})

/* ---------------- TODAY ---------------- */

// Today: show ordered templates, completion state, and remaining points for today only
app.get('/today/:userId', async (req, res) => {
  const userId = req.params.userId
  const date = dayKey()

  const templates = await prisma.taskTemplate.findMany({
    where: { userId, active: true },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] // ✅ correct Prisma syntax
  })

  const comps = await prisma.taskCompletion.findMany({
    where: { userId, date }
  })
  const completedSet = new Set(comps.map(c => c.templateId))

  const tasks = templates.map(t => ({
    templateId: t.id,
    title: t.title,
    points: t.points,
    completed: completedSet.has(t.id)
  }))

  const totalPossiblePoints = templates.reduce((s, t) => s + t.points, 0)
  const earnedPoints = tasks.filter(x => x.completed).reduce((s, t) => s + t.points, 0)

  const redemptions = await prisma.redemption.findMany({
    where: { userId, date },
    include: { reward: true }
  })
  const spentToday = redemptions.reduce((s, r) => s + (r.reward?.cost ?? 0), 0)
  const remainingPoints = Math.max(0, earnedPoints - spentToday)

  res.json({
    date,
    totalTemplates: templates.length,
    completedCount: tasks.filter(t => t.completed).length,
    earnedPoints,
    totalPossiblePoints,
    remainingPoints,
    tasks
  })
})

/* ---------------- COMPLETE TOGGLE ---------------- */

app.post('/complete/toggle', async (req, res) => {
  const parsed = z.object({
    userId: z.string().min(1),
    templateId: z.string().min(1),
    date: z.string().optional() // YYYY-MM-DD
  }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

  const date = parsed.data.date ?? dayKey()

  const existing = await prisma.taskCompletion.findUnique({
    where: { userId_templateId_date: { userId: parsed.data.userId, templateId: parsed.data.templateId, date } }
  })

  if (existing) {
    await prisma.taskCompletion.delete({ where: { id: existing.id } })
    return res.json({ completed: false })
  } else {
    await prisma.taskCompletion.create({
      data: { userId: parsed.data.userId, templateId: parsed.data.templateId, date }
    })
    return res.json({ completed: true })
  }
})

/* ---------------- REWARDS (list, create w/position, delete, reorder) ---------------- */

// List rewards ordered
app.get('/rewards/:userId', async (req, res) => {
  const { userId } = req.params
  const rewards = await prisma.reward.findMany({
    where: { userId, active: true },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }]
  })
  res.json(rewards)
})

// Create reward and append to end
app.post('/rewards', async (req, res) => {
  const parsed = z.object({
    userId: z.string().min(1),
    title: z.string().min(1),
    cost: z.number().int().positive(),
    active: z.boolean().optional().default(true)
  }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

  const maxPos = await prisma.reward.aggregate({
    where: { userId: parsed.data.userId },
    _max: { position: true }
  })
  const nextPos = (maxPos._max.position ?? -1) + 1

  const reward = await prisma.reward.create({
    data: { ...parsed.data, position: nextPos }
  })
  res.status(201).json(reward)
})

// Delete reward
app.delete('/rewards/:id', async (req, res) => {
  const id = req.params.id
  await prisma.reward.delete({ where: { id } })
  res.json({ ok: true })
})

// Move reward (up/down)
app.post('/rewards/reorder/move', async (req, res) => {
  const parsed = z.object({
    userId: z.string().min(1),
    id: z.string().min(1),
    direction: z.enum(['up', 'down'])
  }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

  const { userId, id, direction } = parsed.data
  const items = await prisma.reward.findMany({
    where: { userId, active: true },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }]
  })
  const idx = items.findIndex(i => i.id === id)
  if (idx === -1) return res.status(404).json({ message: 'Not found' })

  const swapWith = direction === 'up' ? idx - 1 : idx + 1
  if (swapWith < 0 || swapWith >= items.length) return res.json({ ok: true })

  const a = items[idx], b = items[swapWith]
  await prisma.$transaction([
    prisma.reward.update({ where: { id: a.id }, data: { position: b.position } }),
    prisma.reward.update({ where: { id: b.id }, data: { position: a.position } })
  ])
  res.json({ ok: true })
})

// Bulk reorder rewards
app.post('/rewards/reorder', async (req, res) => {
  const parsed = z.object({
    userId: z.string().min(1),
    order: z.array(z.object({ id: z.string().min(1), position: z.number().int().min(0) })).min(1)
  }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

  const ops = parsed.data.order.map(row =>
    prisma.reward.update({ where: { id: row.id }, data: { position: row.position } })
  )
  await prisma.$transaction(ops)
  res.json({ ok: true })
})

/* ---------------- REDEEM TODAY ---------------- */

app.post('/redeem/today', async (req, res) => {
  const parsed = z.object({
    userId: z.string().min(1),
    rewardId: z.string().min(1),
    date: z.string().optional()
  }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

  const date = parsed.data.date ?? dayKey()

  const [reward, todayData] = await Promise.all([
    prisma.reward.findUnique({ where: { id: parsed.data.rewardId } }),
    (async () => {
      const templates = await prisma.taskTemplate.findMany({ where: { userId: parsed.data.userId, active: true } })
      const comps = await prisma.taskCompletion.findMany({ where: { userId: parsed.data.userId, date } })
      const completedSet = new Set(comps.map(c => c.templateId))
      const earned = templates.filter(t => completedSet.has(t.id)).reduce((s, t) => s + t.points, 0)
      const redemptions = await prisma.redemption.findMany({ where: { userId: parsed.data.userId, date }, include: { reward: true } })
      const spent = redemptions.reduce((s, r) => s + (r.reward?.cost ?? 0), 0)
      return { earned, spent, remaining: Math.max(0, earned - spent) }
    })()
  ])

  if (!reward) return res.status(404).json({ message: 'Reward not found' })
  if (todayData.remaining < reward.cost) return res.status(400).json({ message: 'Not enough points today' })

  const redemption = await prisma.redemption.create({
    data: { userId: parsed.data.userId, rewardId: reward.id, date }
  })
  res.status(201).json(redemption)
})

/* ---------------- ANALYTICS ---------------- */

app.get('/analytics/:userId', async (req, res) => {
  const userId = req.params.userId

  const comps = await prisma.taskCompletion.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
    include: { template: true }
  })

  const activeTemplates = await prisma.taskTemplate.findMany({ where: { userId, active: true } })
  const totalCount = activeTemplates.length || 0

  const map = new Map()
  for (const c of comps) {
    const day = c.date
    const m = map.get(day) ?? { doneCount: 0 }
    m.doneCount += 1
    map.set(day, m)
  }

  const calendar = Array.from(map.entries())
    .map(([date, m]) => {
      const percent = totalCount === 0 ? 0 : Math.round((m.doneCount / totalCount) * 100)
      return { date, percent }
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  // streak = consecutive days ending today with percent > 0
  const today = dayKey()
  let streak = 0
  for (let d = new Date(); ; d.setDate(d.getDate() - 1)) {
    const key = dayKey(d)
    const entry = calendar.find(x => x.date === key)
    const percent = entry?.percent ?? 0
    if (percent > 0) streak++
    else break
    if (dayKey(d) === today) continue
  }

  res.json({ streak, calendar })
})

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})