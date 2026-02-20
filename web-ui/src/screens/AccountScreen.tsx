import { useEffect, useState } from 'react'
import { avatarImages, getAvatarIndex } from '../lib/avatars'
import { hasInitData, isDemoEnv, isTelegramEnv } from '../lib/env'
import { gameApi } from '../lib/gameApi'

interface User {
  id: string
  username?: string
  name?: string
  avatar?: number
  entitlement: string
  coins: number
}

interface AccountScreenProps {
  user: User | null
  onPlay: () => void
  onUserUpdate: (user: User) => void
}

export default function AccountScreen({ user, onPlay, onUserUpdate }: AccountScreenProps) {
  const [loading, setLoading] = useState(true)
  const [tgUserDebug, setTgUserDebug] = useState<string>('')
  const [rewardsBalance, setRewardsBalance] = useState<number | null>(null)
  const [authDebug, setAuthDebug] = useState<string>('')

  const apiBase = (import.meta as any).env?.VITE_API_BASE || 'https://game-ai-miniapp.onrender.com'

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)

      // Best effort: initialize Telegram WebApp if present.
      if (isTelegramEnv()) {
        const tg = (window as any)?.Telegram?.WebApp
        const u = tg?.initDataUnsafe?.user
        if (u) {
          const name = [u.first_name, u.last_name].filter(Boolean).join(' ')
          setTgUserDebug(`${name || ''}${u.username ? ' @' + u.username : ''} (id: ${u.id})`)
        } else {
          setTgUserDebug('')
        }
        try {
          tg?.ready?.()
          tg?.expand?.()
        } catch (e) {
          console.warn('Telegram WebApp init failed', e)
        }

        // If we have initData, try to authenticate via backend.
        // If backend isn't deployed yet, fall back to demo profile.
        if (hasInitData()) {
          try {
            setAuthDebug(`auth: POST ${apiBase}/api/auth/telegram ...`)
            const res = await fetch(`${apiBase}/api/auth/telegram`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData: tg.initData })
            })
            const ct = res.headers.get('content-type') || ''
            const data = ct.includes('application/json') ? await res.json() : await res.text()
            const bodyPreview = typeof data === 'string'
              ? data.slice(0, 200)
              : JSON.stringify(data).slice(0, 200)
            setAuthDebug(`auth: status=${res.status} ok=${res.ok} ct=${ct} body=${bodyPreview}`)
            if (!cancelled && (data as any)?.token && (data as any)?.user) {
              localStorage.setItem('sessionToken', (data as any).token)
              onUserUpdate((data as any).user)
              setLoading(false)
              return
            }
          } catch (error) {
            console.error('Telegram auth failed; falling back to demo', error)
            setAuthDebug(`auth: FAILED ${(error as any)?.message || String(error)}`)
          }
        }
      }

      // Demo mode / fallback
      try {
        const profile = await gameApi.getProfile()
        if (!cancelled) {
          onUserUpdate({ id: 'demo', username: 'DemoUser', name: profile.user.name, avatar: profile.user.avatar, entitlement: profile.entitlement, coins: profile.coins })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [onUserUpdate])

  useEffect(() => {
    const loadRewards = async () => {
      if (isDemoEnv()) {
        const profile = await gameApi.getProfile()
        setRewardsBalance(profile.rewards)
        return
      }

      const token = localStorage.getItem('sessionToken')
      if (!token) {
        setRewardsBalance(0)
        return
      }

      try {
        const res = await fetch(`${apiBase}/api/game/rewards/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          setRewardsBalance(0)
          return
        }
        const ct = res.headers.get('content-type') || ''
        if (ct.includes('application/json')) {
          const data = await res.json()
          setRewardsBalance(data.balance ?? 0)
        } else {
          setRewardsBalance(0)
        }
      } catch {
        setRewardsBalance(0)
      }
    }

    loadRewards()
  }, [])

  const handleSubscribe = () => {
    if (isDemoEnv()) {
      alert('Demo mode: payments disabled')
      return
    }
    if (!user) return
    const token = localStorage.getItem('sessionToken')
    fetch(`${apiBase}/api/payments/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId: user.id, tierId: 'premium_month' })
    }).then(res => res.json()).then(data => {
      const tg = (window as any)?.Telegram?.WebApp
      tg.openInvoice(data.invoiceLink, (status: string) => {
        if (status === 'paid') {
          // Refresh user entitlement
          fetch(`${apiBase}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => res.json()).then(data => {
            onUserUpdate(data.user)
          }).catch(console.error)
        }
      })
    }).catch(() => alert('Failed to create invoice'))
  }

  if (loading || !user) return <div>Loading...</div>

  return (
    <div className="screen" style={{ background: '#000', color: '#fff' }}>
      <h1>Account</h1>
      {user.avatar !== undefined && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src={avatarImages[getAvatarIndex(user.avatar)]} alt="avatar" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
        </div>
      )}
      <p>User: {user.username || user.name}</p>
      <p>Entitlement: {user.entitlement}</p>
      <p>Rewards Balance: {rewardsBalance !== null ? rewardsBalance : 'Loading...'}</p>
      <button onClick={handleSubscribe}>Subscribe (Stars)</button>
      <button onClick={onPlay}>Play Game</button>
      <div style={{ border: '1px solid #2a2a35', background: '#18181f', padding: '10px', marginTop: '20px', borderRadius: 12 }}>
        <h3>Debug Panel</h3>
        <p>Mode: {isDemoEnv() ? 'DEMO' : 'TELEGRAM'}</p>
        <p>Telegram WebApp present: {isTelegramEnv() ? 'true' : 'false'}</p>
        <p>InitData present: {hasInitData() ? 'true' : 'false'}</p>
        <p>initDataUnsafe.user: {tgUserDebug || 'none'}</p>
        <p>API base: {apiBase}</p>
        <p>Auth debug: {authDebug || 'n/a'}</p>
        <p>Coins: {user?.coins || 0}</p>
        {isDemoEnv() && (
          <button onClick={() => {
            localStorage.removeItem('demo_profile_v1')
            localStorage.removeItem('demo_coins_v1')
            localStorage.removeItem('demo_entitlement_v1')
            window.location.reload()
          }}>Reset Demo Storage</button>
        )}
      </div>
    </div>
  )
}