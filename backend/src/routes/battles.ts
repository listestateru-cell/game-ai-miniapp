import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { Router } from 'express'

const prisma = new PrismaClient()
const router = Router()

const STAKES = new Set([100, 500, 1000])
const INSPECT_COST = 1000
const DISCONNECT_MS = 7_000

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

function now() {
  return new Date()
}

function msSince(d?: Date | null) {
  if (!d) return Number.POSITIVE_INFINITY
  return Date.now() - d.getTime()
}

function makeTask() {
  const a = Math.floor(Math.random() * 20) + 1
  const b = Math.floor(Math.random() * 20) + 1
  const op = Math.random() < 0.7 ? '+' : '-'
  const correct = op === '+' ? a + b : a - b
  return { a, b, op, correct }
}

// In-memory task state by matchId+userId (MVP). For production we would persist per answer.
const TASKS = new Map<string, { task: any; taskId: string }>()

function taskKey(matchId: string, userId: string) {
  return `${matchId}:${userId}`
}

router.post('/queue/join', async (req, res) => {
  const telegramId = getTelegramIdFromAuth(req)
  if (!telegramId) return res.status(401).json({ error: 'Unauthorized' })

  const { stake } = req.body || {}
  const st = Number(stake)
  if (!STAKES.has(st)) return res.status(400).json({ error: 'invalid stake' })

  const user = await prisma.user.findUnique({ where: { telegramId } })
  if (!user) return res.status(404).json({ error: 'User not found' })
  if (user.coins < st) return res.status(400).json({ error: 'not enough coins' })

  // Try to find waiting match with same stake that doesn't already contain this user.
  const waiting = await prisma.battleMatch.findFirst({
    where: { status: 'WAITING', stake: st },
    orderBy: { createdAt: 'asc' },
    include: { participants: true },
  })

  if (!waiting) {
    // create new match and join
    const match = await prisma.battleMatch.create({
      data: {
        stake: st,
        status: 'WAITING',
        participants: {
          create: [{ userId: user.id }]
        }
      },
      include: { participants: true }
    })
    return res.json({ ok: true, matchId: match.id, status: match.status })
  }

  const alreadyIn = waiting.participants.some(p => p.userId === user.id)
  if (alreadyIn) {
    return res.json({ ok: true, matchId: waiting.id, status: waiting.status })
  }

  if (waiting.participants.length >= 2) {
    return res.status(409).json({ error: 'match full' })
  }

  // Join match, activate it, and take stakes
  const startedAt = now()
  const endsAt = new Date(startedAt.getTime() + 60_000)

  await prisma.$transaction(async (tx) => {
    // Re-check balance and deduct stake
    const u1 = await tx.user.findUnique({ where: { id: waiting.participants[0].userId } })
    const u2 = await tx.user.findUnique({ where: { id: user.id } })
    if (!u1 || !u2) throw new Error('User missing')
    if (u1.coins < st || u2.coins < st) throw new Error('Not enough coins')

    await tx.user.update({ where: { id: u1.id }, data: { coins: { decrement: st } } })
    await tx.user.update({ where: { id: u2.id }, data: { coins: { decrement: st } } })

    await tx.battleParticipant.create({ data: { matchId: waiting.id, userId: user.id, lastPingAt: startedAt } })
    await tx.battleMatch.update({
      where: { id: waiting.id },
      data: { status: 'ACTIVE', startedAt, endsAt }
    })
  })

  return res.json({ ok: true, matchId: waiting.id, status: 'ACTIVE' })
})

router.post('/match/:id/ping', async (req, res) => {
  const telegramId = getTelegramIdFromAuth(req)
  if (!telegramId) return res.status(401).json({ error: 'Unauthorized' })

  const matchId = req.params.id
  const user = await prisma.user.findUnique({ where: { telegramId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const part = await prisma.battleParticipant.findFirst({ where: { matchId, userId: user.id } })
  if (!part) return res.status(404).json({ error: 'Not in match' })

  await prisma.battleParticipant.update({ where: { id: part.id }, data: { lastPingAt: now() } })
  res.json({ ok: true })
})

router.get('/match/:id/state', async (req, res) => {
  const telegramId = getTelegramIdFromAuth(req)
  if (!telegramId) return res.status(401).json({ error: 'Unauthorized' })

  const matchId = req.params.id
  const user = await prisma.user.findUnique({ where: { telegramId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const match = await prisma.battleMatch.findUnique({
    where: { id: matchId },
    include: { participants: { include: { user: true } } }
  })
  if (!match) return res.status(404).json({ error: 'Match not found' })

  const me = match.participants.find(p => p.userId === user.id)
  if (!me) return res.status(404).json({ error: 'Not in match' })

  // Best-effort auto-finish by time/disconnect on read
  await maybeAutoFinish(matchId)

  const refreshed = await prisma.battleMatch.findUnique({
    where: { id: matchId },
    include: { participants: { include: { user: true } } }
  })
  if (!refreshed) return res.status(404).json({ error: 'Match not found' })

  res.json({
    ok: true,
    match: {
      id: refreshed.id,
      stake: refreshed.stake,
      status: refreshed.status,
      startedAt: refreshed.startedAt,
      endsAt: refreshed.endsAt,
      reason: refreshed.reason,
      winnerUserId: refreshed.winnerUserId,
      systemFee: refreshed.systemFee,
      participants: refreshed.participants.map(p => ({
        userId: p.userId,
        username: p.user.username,
        score: p.score,
        leftAt: p.leftAt,
      }))
    }
  })
})

router.get('/match/:id/task', async (req, res) => {
  const telegramId = getTelegramIdFromAuth(req)
  if (!telegramId) return res.status(401).json({ error: 'Unauthorized' })

  const matchId = req.params.id
  const user = await prisma.user.findUnique({ where: { telegramId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const match = await prisma.battleMatch.findUnique({ where: { id: matchId } })
  if (!match) return res.status(404).json({ error: 'Match not found' })
  if (match.status !== 'ACTIVE') return res.status(400).json({ error: 'Match not active' })
  if (match.endsAt && now() > match.endsAt) return res.status(400).json({ error: 'Match ended' })

  const part = await prisma.battleParticipant.findFirst({ where: { matchId, userId: user.id } })
  if (!part) return res.status(404).json({ error: 'Not in match' })

  const key = taskKey(matchId, user.id)
  let entry = TASKS.get(key)
  if (!entry) {
    const t = makeTask()
    const taskId = crypto.randomUUID()
    entry = { task: t, taskId }
    TASKS.set(key, entry)
  }

  res.json({ ok: true, taskId: entry.taskId, a: entry.task.a, b: entry.task.b, op: entry.task.op })
})

router.post('/match/:id/answer', async (req, res) => {
  const telegramId = getTelegramIdFromAuth(req)
  if (!telegramId) return res.status(401).json({ error: 'Unauthorized' })

  const matchId = req.params.id
  const { taskId, answer } = req.body || {}
  if (!taskId) return res.status(400).json({ error: 'taskId required' })

  const user = await prisma.user.findUnique({ where: { telegramId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const match = await prisma.battleMatch.findUnique({ where: { id: matchId } })
  if (!match) return res.status(404).json({ error: 'Match not found' })
  if (match.status !== 'ACTIVE') return res.status(400).json({ error: 'Match not active' })

  const key = taskKey(matchId, user.id)
  const entry = TASKS.get(key)
  if (!entry || entry.taskId !== taskId) {
    return res.status(400).json({ error: 'invalid task' })
  }

  const ans = Number(answer)
  const correct = Number.isFinite(ans) && ans === entry.task.correct
  if (correct) {
    await prisma.battleParticipant.updateMany({
      where: { matchId, userId: user.id },
      data: { score: { increment: 1 }, lastPingAt: now() }
    })
    // new task
    TASKS.delete(key)
  }

  res.json({ ok: true, correct })
})

async function finishMatch(matchId: string, reason: string) {
  const match = await prisma.battleMatch.findUnique({ where: { id: matchId }, include: { participants: true } })
  if (!match) return
  if (match.status === 'FINISHED') return

  const stake = match.stake
  const bank = stake * 2

  // Load participant rows again
  const parts = await prisma.battleParticipant.findMany({ where: { matchId } })
  if (parts.length < 2) return

  // Determine leaver
  const leaver = parts.find(p => !!p.leftAt)

  // Determine scores
  const [p1, p2] = parts

  let winnerUserId: string | null = null
  let systemFee = 0

  if (reason === 'LEAVE' || reason === 'DISCONNECT') {
    const winner = parts.find(p => !p.leftAt) || p1
    winnerUserId = winner.userId
    // winner gets 50% of bank, system gets 50%
    const winnerPrize = Math.floor(bank * 0.5)
    systemFee = bank - winnerPrize

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: winnerUserId! }, data: { coins: { increment: winnerPrize }, battleWins: { increment: 1 } } })
      if (leaver) await tx.user.update({ where: { id: leaver.userId }, data: { battleLosses: { increment: 1 }, battleSystemFeesPaid: { increment: stake } } })
      await tx.user.update({ where: { id: winnerUserId! }, data: { battleEarnings: { increment: Math.max(0, winnerPrize - stake) } } })

      await tx.battleParticipant.updateMany({ where: { matchId, userId: winnerUserId! }, data: { isWinner: true } })
      await tx.battleMatch.update({ where: { id: matchId }, data: { status: 'FINISHED', reason, winnerUserId: winnerUserId!, systemFee } })
    })
    return
  }

  // TIME / TIE
  if (p1.score > p2.score) winnerUserId = p1.userId
  else if (p2.score > p1.score) winnerUserId = p2.userId

  if (winnerUserId) {
    systemFee = 0
    const winnerPrize = bank

    const loserUserId = winnerUserId === p1.userId ? p2.userId : p1.userId

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: winnerUserId! }, data: { coins: { increment: winnerPrize }, battleWins: { increment: 1 }, battleEarnings: { increment: stake } } })
      await tx.user.update({ where: { id: loserUserId }, data: { battleLosses: { increment: 1 } } })
      await tx.battleParticipant.updateMany({ where: { matchId, userId: winnerUserId! }, data: { isWinner: true } })
      await tx.battleMatch.update({ where: { id: matchId }, data: { status: 'FINISHED', reason: 'TIME', winnerUserId: winnerUserId!, systemFee } })
    })
  } else {
    // Tie: return 50% stake to each, system takes stake
    const refund = Math.floor(stake * 0.5)
    systemFee = bank - refund * 2

    await prisma.$transaction(async (tx) => {
      for (const p of parts) {
        await tx.user.update({ where: { id: p.userId }, data: { coins: { increment: refund }, battleSystemFeesPaid: { increment: stake - refund } } })
      }
      await tx.battleMatch.update({ where: { id: matchId }, data: { status: 'FINISHED', reason: 'TIE', systemFee } })
    })
  }
}



async function maybeAutoFinish(matchId: string) {
  const match = await prisma.battleMatch.findUnique({
    where: { id: matchId },
    include: { participants: true }
  })
  if (!match) return
  if (match.status !== 'ACTIVE') return

  if (match.endsAt && now() > match.endsAt) {
    await finishMatch(matchId, 'TIME')
    return
  }

  const parts = match.participants
  if (parts.length < 2) return

  if (parts.some(p => !!p.leftAt)) {
    await finishMatch(matchId, 'LEAVE')
    return
  }

  const stale = parts.find(p => msSince(p.lastPingAt) > DISCONNECT_MS)
  if (stale) {
    await prisma.battleParticipant.updateMany({
      where: { matchId, userId: stale.userId, leftAt: null },
      data: { leftAt: now() }
    })
    await finishMatch(matchId, 'DISCONNECT')
  }
}

router.get('/leaderboard', async (req, res) => {
  const telegramId = getTelegramIdFromAuth(req)
  if (!telegramId) return res.status(401).json({ error: 'Unauthorized' })

  const top = await prisma.user.findMany({
    orderBy: [{ battleEarnings: 'desc' }, { updatedAt: 'desc' }],
    take: 10,
    select: {
      id: true,
      username: true,
      name: true,
      petAvatar: true,
      battleWins: true,
      battleLosses: true,
    }
  })

  res.json({
    ok: true,
    top: top.map((u, idx) => ({
      rank: idx + 1,
      userId: u.id,
      username: u.username,
      name: u.name,
      petAvatar: u.petAvatar,
      wins: u.battleWins,
      losses: u.battleLosses,
    }))
  })
})

router.post('/inspect', async (req, res) => {
  const telegramId = getTelegramIdFromAuth(req)
  if (!telegramId) return res.status(401).json({ error: 'Unauthorized' })

  const { targetUserId } = req.body || {}
  if (!targetUserId) return res.status(400).json({ error: 'targetUserId required' })

  const viewer = await prisma.user.findUnique({ where: { telegramId } })
  if (!viewer) return res.status(404).json({ error: 'User not found' })
  if (viewer.coins < INSPECT_COST) return res.status(400).json({ error: 'not enough coins' })

  const target = await prisma.user.findUnique({ where: { id: targetUserId } })
  if (!target) return res.status(404).json({ error: 'Target not found' })

  await prisma.user.update({ where: { id: viewer.id }, data: { coins: { decrement: INSPECT_COST } } })

  res.json({
    ok: true,
    cost: INSPECT_COST,
    target: {
      userId: target.id,
      username: target.username,
      name: target.name,
      battleEarnings: target.battleEarnings,
      wins: target.battleWins,
      losses: target.battleLosses,
    }
  })
})

router.post('/match/:id/leave', async (req, res) => {
  const telegramId = getTelegramIdFromAuth(req)
  if (!telegramId) return res.status(401).json({ error: 'Unauthorized' })

  const matchId = req.params.id
  const user = await prisma.user.findUnique({ where: { telegramId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  await prisma.battleParticipant.updateMany({
    where: { matchId, userId: user.id },
    data: { leftAt: now() }
  })

  await finishMatch(matchId, 'LEAVE')
  res.json({ ok: true })
})

router.post('/match/:id/finish', async (req, res) => {
  const telegramId = getTelegramIdFromAuth(req)
  if (!telegramId) return res.status(401).json({ error: 'Unauthorized' })

  const matchId = req.params.id
  await finishMatch(matchId, 'TIME')
  res.json({ ok: true })
})

export { router as battlesRoutes }
