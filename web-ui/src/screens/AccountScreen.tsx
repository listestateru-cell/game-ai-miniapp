import { useEffect, useState } from 'react'
import { avatarImages, getAvatarIndex } from '../lib/avatars'
import { isDemoEnv, isTelegramEnv } from '../lib/env'
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
  const [rewardsBalance, setRewardsBalance] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    if (isTelegramEnv()) {
      const tg = (window as any)?.Telegram?.WebApp
      tg.ready?.()
      tg.expand?.()
      fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData })
      }).then(res => res.json()).then(data => {
        localStorage.setItem('sessionToken', data.token)
        onUserUpdate(data.user)
      }).catch(error => {
        console.error(error)
        // fallback to demo
        gameApi.getProfile().then(profile => {
          onUserUpdate({ id: 'demo', username: 'DemoUser', name: profile.user.name, avatar: profile.user.avatar, entitlement: profile.entitlement, coins: profile.coins })
        })
      })
    } else {
      // demo mode
      gameApi.getProfile().then(profile => {
        onUserUpdate({ id: 'demo', username: 'DemoUser', name: profile.user.name, avatar: profile.user.avatar, entitlement: profile.entitlement, coins: profile.coins })
      })
    }
    setLoading(false)
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
        const res = await fetch('/api/rewards/balance', {
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
    fetch('/api/payments/invoice', {
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
          fetch('/api/auth/me', {
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
    <div className="screen">
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
      {isDemoEnv() && (
        <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '20px' }}>
          <h3>Debug Panel (Demo Mode)</h3>
          <p>Mode: DEMO</p>
          <p>InitData: {isTelegramEnv() ? 'true' : 'false'}</p>
          <p>Coins: {user?.coins || 0}</p>
          <button onClick={() => {
            localStorage.removeItem('demo_profile_v1')
            localStorage.removeItem('demo_coins_v1')
            localStorage.removeItem('demo_entitlement_v1')
            window.location.reload()
          }}>Reset Demo Storage</button>
        </div>
      )}
    </div>
  )
}