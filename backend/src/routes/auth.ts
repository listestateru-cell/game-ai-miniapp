import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { Router } from 'express'
import { validateTelegramInitData } from '../utils/telegram'

const prisma = new PrismaClient()
const router = Router()
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.TELEGRAM_BOT_TOKEN!

function createSessionToken(telegramId: string): string {
  const hmac = crypto.createHmac('sha256', SESSION_SECRET)
  hmac.update(telegramId)
  const signature = hmac.digest('hex')
  return `${telegramId}.${signature}`
}

function verifySessionToken(token: string): string | null {
  const [telegramId, signature] = token.split('.')
  if (!telegramId || !signature) return null
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(telegramId).digest('hex')
  if (signature === expected) return telegramId
  return null
}

router.post('/telegram', async (req, res) => {
  const { initData } = req.body
  if (!initData) {
    return res.status(400).json({ error: 'initData required' })
  }

  try {
    const tgUser = validateTelegramInitData(initData)

    // Get or create user
    const user = await prisma.user.upsert({
      where: { telegramId: tgUser.id.toString() },
      update: {
        username: tgUser.username,
        name: tgUser.first_name,
        avatar: tgUser.photo_url
      },
      create: {
        telegramId: tgUser.id.toString(),
        username: tgUser.username,
        name: tgUser.first_name,
        avatar: tgUser.photo_url
      }
    })

    // Compute entitlement
    const hasPaidOrder = await prisma.order.findFirst({
      where: { userId: user.id, status: 'PAID' }
    })
    const entitlement = hasPaidOrder ? 'PREMIUM' : 'FREE'

    const token = createSessionToken(tgUser.id.toString())
    res.json({ user: { id: user.id, username: user.username, name: user.name, entitlement, coins: user.coins }, token })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(401).json({ error: message })
  }
})

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const token = authHeader.slice(7)
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const telegramId = verifySessionToken(token)
  if (!telegramId) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId }
    })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Compute entitlement
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const paidOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        tier: 'premium_month',
        status: 'PAID',
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'desc' }
    })
    const entitlement = paidOrder ? 'PREMIUM' : 'FREE'

    res.json({
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        name: user.name
      },
      entitlement
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
})

export { router as authRoutes }
