import cors from 'cors'
import express from 'express'
import { authRoutes } from './routes/auth'
import { gameRoutes } from './routes/game'
import { paymentRoutes } from './routes/payments'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: true,
  credentials: true,
}))
app.use(express.json())

// API is served under /api/* so the frontend can call /api/... consistently.
app.use('/api/auth', authRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/game', gameRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() })
})

app.get('/api/debug/bot', async (_req, res) => {
  // Returns basic bot identity (safe) so we can verify TELEGRAM_BOT_TOKEN matches the bot.
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return res.status(500).json({ ok: false, error: 'TELEGRAM_BOT_TOKEN not set' })

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/getMe`)
    const data: any = await r.json()
    if (!data?.ok) {
      return res.status(500).json({ ok: false, error: data?.description || 'Telegram API error', data })
    }

    const me = data.result
    return res.json({
      ok: true,
      bot: {
        id: me.id,
        is_bot: me.is_bot,
        first_name: me.first_name,
        username: me.username,
      }
    })
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})