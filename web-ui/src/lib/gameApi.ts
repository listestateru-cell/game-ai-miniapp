interface Profile {
  user: { name: string; avatar: number }
  entitlement: 'FREE' | 'PREMIUM'
  coins: number
  rewards: number
}

const STORAGE_KEYS = {
  profile: 'demo_profile_v1',
  coins: 'demo_coins_v1',
  entitlement: 'demo_entitlement_v1'
}

function safeParse<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function safeStringify(value: any): string {
  try {
    return JSON.stringify(value)
  } catch {
    return '{}'
  }
}

export const gameApi = {
  async getProfile(): Promise<Profile> {
    const user = safeParse(STORAGE_KEYS.profile, { name: 'TestUser', avatar: 0 })
    const entitlement = safeParse(STORAGE_KEYS.entitlement, 'FREE')
    const coins = safeParse(STORAGE_KEYS.coins, 0)
    return {
      user,
      entitlement,
      coins,
      rewards: 0 // placeholder
    }
  },

  async saveProfile(profile: Profile): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.profile, safeStringify(profile.user))
    localStorage.setItem(STORAGE_KEYS.entitlement, safeStringify(profile.entitlement))
    localStorage.setItem(STORAGE_KEYS.coins, safeStringify(profile.coins))
  },

  async getCoins(): Promise<number> {
    return safeParse(STORAGE_KEYS.coins, 0)
  },

  async setCoins(value: number): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.coins, safeStringify(Math.max(0, value)))
  },

  async addCoins(delta: number): Promise<number> {
    const current = await this.getCoins()
    const newValue = Math.max(0, current + delta)
    await this.setCoins(newValue)
    return newValue
  },

  async spendCoins(delta: number): Promise<number> {
    const current = await this.getCoins()
    const newValue = Math.max(0, current - delta)
    await this.setCoins(newValue)
    return newValue
  },

  async getEntitlement(): Promise<'FREE' | 'PREMIUM'> {
    return safeParse(STORAGE_KEYS.entitlement, 'FREE')
  }
}