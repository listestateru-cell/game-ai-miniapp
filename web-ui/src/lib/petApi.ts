const apiBase = (import.meta as any).env?.VITE_API_BASE || 'https://game-ai-miniapp.onrender.com'

function getToken(): string | null {
  return localStorage.getItem('sessionToken')
}

export type PetState = {
  petAvatar: number | null
  petLives: number
  petHunger: number
  petTapsToday: number
  petDayKey?: string | null
}

export const petApi = {
  async getPet(): Promise<PetState | null> {
    const token = getToken()
    if (!token) return null
    const res = await fetch(`${apiBase}/api/game/pet`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.pet ?? null
  },

  async selectPet(petAvatar: number): Promise<boolean> {
    const token = getToken()
    if (!token) return false
    const res = await fetch(`${apiBase}/api/game/pet/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ petAvatar })
    })
    return res.ok
  },

  async tapPet(): Promise<PetState | null> {
    const token = getToken()
    if (!token) return null
    const res = await fetch(`${apiBase}/api/game/pet/tap`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.pet ?? null
  }
}
