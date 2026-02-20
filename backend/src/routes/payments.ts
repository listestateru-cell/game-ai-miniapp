import { PrismaClient } from '@prisma/client'
import { Router } from 'express'

const prisma = new PrismaClient()
const router = Router()

type TgApiOk<T> = { ok: true; result: T }
type TgApiErr = { ok: false; description?: string }

router.post('/invoice', async (req, res) => {
  const { tierId, userId } = req.body
  if (!tierId || !userId) {
    return res.status(400).json({ error: 'tierId and userId required' })
  }

  // Define tiers
  const tiers = {
    premium_month: {
      title: 'Premium Subscription',
      description: 'Unlock all features',
      prices: [{ label: 'Premium', amount: 10 }], // 10 Stars
      payload: 'premium'
    }
  }

  const tier = tiers[tierId as keyof typeof tiers]
  if (!tier) {
    return res.status(400).json({ error: 'Invalid tier' })
  }

  try {
    // Create order
    const order = await prisma.order.create({
      data: {
        telegramPaymentId: `pending_${Date.now()}`,
        tier: 'premium_month',
        amount: tier.prices[0].amount,
        status: 'PENDING',
        user: { connect: { id: userId } }
      }
    })

    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: tier.title,
        description: tier.description,
        payload: order.id, // Use order id as payload
        provider_token: 'XTR', // For Stars
        currency: 'XTR',
        prices: tier.prices
      })
    })

    const data = (await response.json()) as TgApiOk<string> | TgApiErr
    if (!('ok' in data) || data.ok !== true) {
      throw new Error(data.description ?? 'Telegram API error')
    }

    res.json({ invoiceLink: data.result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
})

router.post('/telegram/webhook', async (req, res) => {
  const update = req.body

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not set' })
  }

  try {
    if (update.pre_checkout_query) {
      // Answer pre_checkout_query
      const queryId = update.pre_checkout_query.id
      const answerResp = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: queryId,
          ok: true
        })
      })
      const answerData = (await answerResp.json()) as TgApiOk<null> | TgApiErr
      if (!('ok' in answerData) || answerData.ok !== true) {
        throw new Error(answerData.description ?? 'Failed to answer pre_checkout_query')
      }
    } else if (update.message?.successful_payment) {
      const payment = update.message.successful_payment
      const orderId = payment.invoice_payload // This is the order id

      // Update order
      await prisma.order.update({
        where: { id: orderId },
        data: {
          telegramPaymentId: payment.telegram_payment_charge_id,
          status: 'PAID'
        }
      })

      // Grant entitlement
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true }
      })
      if (order) {
        await prisma.user.update({
          where: { id: order.userId },
          data: { entitlement: 'PREMIUM' }
        })
      }
    }
    res.sendStatus(200)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error'
    console.error(message, err)
    res.sendStatus(500)
  }
})

export { router as paymentRoutes }
