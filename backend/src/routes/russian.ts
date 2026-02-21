import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { Router } from 'express'
import fs from 'fs'
import path from 'path'

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

// Load OZHEGOV dictionary words into a Set for fast checks.
// This is a lightweight MVP parser: extract uppercase headwords at line start.
let OZHEGOV_WORDS: Set<string> | null = null

function normalizeRu(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
}

function isLikelyProfane(word: string): boolean {
  // Basic blocklist for Russian profanity/obscenity roots.
  // Not perfect, but reduces "мата" significantly.
  const w = normalizeRu(word)
  const bad = [
    'хуй', 'хуе', 'хуи', 'пизд', 'еба', 'ёба', 'ебл', 'ебн', 'бля', 'бляд', 'сука', 'сук', 'манда', 'гандон', 'пидор', 'пидр', 'залуп', 'дроч',
  ]
  return bad.some(r => w.includes(r.replace(/ё/g, 'е')))
}

function loadOzhegovWords() {
  if (OZHEGOV_WORDS) return OZHEGOV_WORDS

  // In this repo the file is under web-ui/OZHEGOV.TXT.
  // At runtime on Render, we keep repo structure: backend runs from backend/, but the file exists in ../web-ui.
  const filePath = path.resolve(process.cwd(), '..', 'web-ui', 'OZHEGOV.TXT')
  const txt = fs.readFileSync(filePath, 'utf-8')
  const set = new Set<string>()

  const lines = txt.split(/\r?\n/)
  for (const line of lines) {
    // Headword often starts with uppercase Cyrillic or Latin (АБАЖУР, А2, etc.)
    // We'll capture up to first comma/space.
    const m = line.match(/^([A-ZА-ЯЁ][A-ZА-ЯЁ0-9\-]*)[ ,]/)
    if (!m) continue
    // Headwords sometimes have suffix digits like ДОБРО1, А2.
    // Strip trailing digits for word validation.
    const headRaw = m[1]
    const head = headRaw.replace(/\d+$/g, '')
    if (head.length < 2) continue
    const n = normalizeRu(head)
    if (!n) continue
    set.add(n)
  }

  OZHEGOV_WORDS = set
  return set
}

function canBuildWord(source: string, word: string): boolean {
  const src = normalizeRu(source)
  const w = normalizeRu(word)
  const freq = new Map<string, number>()
  for (const ch of src) {
    if (!/[а-яa-z]/i.test(ch)) continue
    freq.set(ch, (freq.get(ch) ?? 0) + 1)
  }
  for (const ch of w) {
    if (!/[а-яa-z]/i.test(ch)) return false
    const left = (freq.get(ch) ?? 0) - 1
    if (left < 0) return false
    freq.set(ch, left)
  }
  return true
}

function randomSourceWord(): string {
  // MVP: pick from a curated list of long, literary-ish words.
  // Later we can auto-pick from OZHEGOV with filters.
  const candidates = [
    'достопримечательность',
    'противопоставление',
    'доброжелательность',
    'самосовершенствование',
    'последовательность',
    'предпринимательский',
    'непримечательность',
    'путешественник',
    'взаимопонимание',
    'благородство',
  ]
  return candidates[Math.floor(Math.random() * candidates.length)]
}

router.get('/abracadabra/new', async (req, res) => {
  const telegramId = getTelegramIdFromAuth(req)
  if (!telegramId) return res.status(401).json({ error: 'Unauthorized' })

  const source = randomSourceWord()
  res.json({ ok: true, source, seconds: 60, minLen: 3 })
})

router.post('/abracadabra/submit', async (req, res) => {
  const telegramId = getTelegramIdFromAuth(req)
  if (!telegramId) return res.status(401).json({ error: 'Unauthorized' })

  const { source, word, used } = req.body || {}
  if (!source || typeof source !== 'string') return res.status(400).json({ error: 'source required' })
  if (!word || typeof word !== 'string') return res.status(400).json({ error: 'word required' })

  const wNorm = normalizeRu(word)
  if (wNorm.length < 3) return res.status(400).json({ error: 'word too short' })
  if (isLikelyProfane(wNorm)) return res.status(400).json({ error: 'word not allowed' })

  // Prevent repeats (client also tracks; server validates best-effort)
  const usedArr: string[] = Array.isArray(used) ? used : []
  const usedSet = new Set(usedArr.map(normalizeRu))
  if (usedSet.has(wNorm)) return res.status(400).json({ error: 'word already used' })

  if (!canBuildWord(source, wNorm)) return res.status(400).json({ error: 'cannot build from source letters' })

  const dict = loadOzhegovWords()
  if (!dict.has(wNorm)) {
    return res.status(400).json({ error: 'not in dictionary' })
  }

  const user = await prisma.user.findUnique({ where: { telegramId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const earned = wNorm.length
  await prisma.user.update({
    where: { id: user.id },
    data: { coins: { increment: earned } }
  })
  await prisma.reward.create({
    data: { userId: user.id, type: 'ABRACADABRA_WORD', amount: earned }
  })

  res.json({ ok: true, earned })
})

export { router as russianRoutes }
