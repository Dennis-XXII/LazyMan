const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@user.dev' },
    update: {},
    create: { email: 'demo@user.dev', name: 'Demo User' }
  })

  const rewards = [
    { title: 'Coffee break', cost: 50 },
    { title: 'Movie night', cost: 200 },
    { title: 'Day trip', cost: 600 }
  ]

  for (const r of rewards) {
    const exists = await prisma.reward.findFirst({ where: { userId: user.id, title: r.title } })
    if (!exists) await prisma.reward.create({ data: { ...r, userId: user.id } })
  }

  console.log('Seed complete. Demo user id:', user.id)
}
main().finally(()=>prisma.$disconnect())