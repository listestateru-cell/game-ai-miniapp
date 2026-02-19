import { useEffect, useState } from 'react'

const COINS_KEY = 'game_coins'

export function useCoins() {
  const [coins, setCoinsState] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem(COINS_KEY)
    if (stored) {
      setCoinsState(parseInt(stored, 10))
    }
  }, [])

  const addCoins = (amount) => {
    setCoinsState(prev => {
      const newCoins = prev + amount
      localStorage.setItem(COINS_KEY, newCoins.toString())
      return newCoins
    })
  }

  const setCoinsDirect = (amount) => {
    setCoinsState(amount)
    localStorage.setItem(COINS_KEY, amount.toString())
  }

  const fetchCoinsFromServer = async () => {
    // TODO: fetch from backend and update
  }

  return { coins, addCoins, setCoinsDirect, fetchCoinsFromServer }
}