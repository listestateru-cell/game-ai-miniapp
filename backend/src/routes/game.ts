import { PrismaClient } from '@prisma/client'
import { Router } from 'express'

const prisma = new PrismaClient()
const router = Router()

router.post('/earn', async (req, res) => {
  const { userId, type, amount } = req.body
  // TODO: Validate server-authoritative logic
  // For now, add reward
  await prisma.reward.create({
    data: { userId, type, amount }
  })
  await prisma.user.update({
    where: { id: userId },
    data: { coins: { increment: amount } }
  })
  res.json({ success: true })
})

export { router as gameRoutes }
