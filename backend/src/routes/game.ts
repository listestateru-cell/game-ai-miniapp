import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { Router } from 'express'
import { getMoscowDayKey } from '../utils/moscowDay'

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

// --- Pet / character ---
router.get('/pet', async (req, res) => {
  const telegramId = getTelegramIdFromAuth(req)
  if (!telegramId) return res.status(401).json({ error: 'Unauthorized' })

  const user = await prisma.user.findUnique({ where: { telegramId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  // Reset day counters if needed
  const dayKey = getMoscowDayKey()
  if (user.petDayKey !== dayKey) {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { petDayKey: dayKey, petTapsToday: 0 }
    })
    return res.json({
      ok: true,
      pet: {
        petAvatar: updated.petAvatar,
        petLives: updated.petLives,
        petHunger: updated.petHunger,
        petTapsToday: updated.petTapsToday,
        petDayKey: updated.petDayKey,
      }
    })
  }

  res.json({
    ok: true,
    pet: {
      petAvatar: user.petAvatar,
      petLives: user.petLives,
      petHunger: user.petHunger,
      petTapsToday: user.petTapsToday,
      petDayKey: user.petDayKey,
    }
  })
})

router.post('/pet/select', async (req, res) => {
  const telegramId = getTelegramIdFromAuth(req)
  if (!telegramId) return res.status(401).json({ error: 'Unauthorized' })

  const { petAvatar } = req.body
  const idx = Number(petAvatar)
  if (!Number.isFinite(idx) || idx < 0 || idx > 100) {
    return res.status(400).json({ error: 'petAvatar must be a number' })
  }

  const user = await prisma.user.findUnique({ where: { telegramId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { petAvatar: idx, petLives: user.petLives ?? 3 }
  })

  res.json({ ok: true, petAvatar: updated.petAvatar })
})

router.post('/pet/tap', async (req, res) => {
  const telegramId = getTelegramIdFromAuth(req)
  if (!telegramId) return res.status(401).json({ error: 'Unauthorized' })

  const user = await prisma.user.findUnique({ where: { telegramId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const dayKey = getMoscowDayKey()
  const tapsToday = user.petDayKey === dayKey ? user.petTapsToday : 0

  if ((user.petLives ?? 0) <= 0) {
    return res.status(400).json({ error: 'pet is dead' })
  }

  if ((tapsToday ?? 0) >= 50) {
    return res.status(400).json({ error: 'tap limit reached' })
  }

  const hunger = Math.min(100, (user.petHunger ?? 0) + 2)

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      petDayKey: dayKey,
      petTapsToday: (tapsToday ?? 0) + 1,
      petHunger: hunger,
    }
  })

  res.json({
    ok: true,
    pet: {
      petAvatar: updated.petAvatar,
      petLives: updated.petLives,
      petHunger: updated.petHunger,
      petTapsToday: updated.petTapsToday,
      petDayKey: updated.petDayKey,
    }
  })
})

export { router as gameRoutes }
