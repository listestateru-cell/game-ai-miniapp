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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})