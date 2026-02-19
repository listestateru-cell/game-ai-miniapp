export function isTelegramEnv(): boolean {
  return Boolean((window as any)?.Telegram?.WebApp?.initData && (window as any).Telegram.WebApp.initData.length > 0)
}

export function isDemoEnv(): boolean {
  return !isTelegramEnv()
}