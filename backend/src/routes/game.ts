import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { Router } from 'express'

const prisma = new PrismaClient()
const router = Router()

function getTelegramIdFromAuth(req: any): string | null {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  if (!token) return null

  const SESSION_SECRET = process.env.SESSION_SECRET || process.env.TELEGRAM_BOT_TOKEN
  if (!SESSION_SECRET) return null

  const [telegramId, signature] = token.split('.')
  if (!telegramId || !signature) return null
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(telegramId).digest('hex')
  return signature === expected ? telegramId : null
}

router.get('/rewards/balance', async (req, res) => {
  const telegramId = getTelegramIdFromAuth(req)
  if (!telegramId) return res.status(401).json({ error: 'Unauthorized' })

  const user = await prisma.user.findUnique({ where: { telegramId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const rewards = await prisma.reward.aggregate({
    where: { userId: user.id },
    _sum: { amount: true }
  })

  res.json({ balance: rewards._sum.amount ?? 0 })
})

router.post('/earn', async (req, res) => {
  const telegramId = getTelegramIdFromAuth(req)
  if (!telegramId) return res.status(401).json({ error: 'Unauthorized' })

  const { type, amount } = req.body
  if (!type || typeof type !== 'string') {
    return res.status(400).json({ error: 'type required' })
  }
  const amt = Number(amount)
  if (!Number.isFinite(amt) || amt <= 0) {
    return res.status(400).json({ error: 'amount must be positive number' })
  }

  const user = await prisma.user.findUnique({ where: { telegramId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  // TODO: validate server-authoritative logic
  await prisma.reward.create({
    data: { userId: user.id, type, amount: amt }
  })
  await prisma.user.update({
    where: { id: user.id },
    data: { coins: { increment: amt } }
  })

  res.json({ success: true })
})

export { router as gameRoutes }
