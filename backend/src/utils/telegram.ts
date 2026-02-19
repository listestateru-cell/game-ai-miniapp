import crypto from 'crypto'

export function validateTelegramInitData(initData: string): any {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) throw new Error('Bot token not set')

  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) throw new Error('No hash in initData')

  const authDate = params.get('auth_date')
  if (!authDate) throw new Error('No auth_date')
  const authTimestamp = parseInt(authDate)
  const now = Math.floor(Date.now() / 1000)
  if (now - authTimestamp > 86400) throw new Error('initData expired')

  params.delete('hash')

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = crypto.createHash('sha256').update(botToken).digest()
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  if (hmac !== hash) throw new Error('Invalid hash')

  const userStr = params.get('user')
  if (!userStr) throw new Error('No user in initData')

  return JSON.parse(userStr)
}