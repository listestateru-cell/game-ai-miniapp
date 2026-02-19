// In Telegram Mini Apps, the `Telegram.WebApp` object is injected.
// `initData` can be empty/late in some cases, so:
// - isTelegramEnv(): detects whether we're running inside Telegram WebView
// - hasInitData(): detects whether we received signed initData
export function isTelegramEnv(): boolean {
  return Boolean((window as any)?.Telegram?.WebApp)
}

export function hasInitData(): boolean {
  const initData = (window as any)?.Telegram?.WebApp?.initData
  return Boolean(initData && typeof initData === 'string' && initData.length > 0)
}

export function isDemoEnv(): boolean {
  // Demo mode when we can't authenticate a Telegram user.
  return !hasInitData()
}
