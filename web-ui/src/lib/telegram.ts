declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        initDataUnsafe?: {
          user?: {
            id: number
            username?: string
            first_name?: string
            last_name?: string
            photo_url?: string
          }
        }
        ready: () => void
        expand: () => void
        openInvoice: (url: string, cb?: (status: string) => void) => void
        close: () => void
      }
    }
  }
}

export function isTelegram(): boolean {
  return !!window.Telegram?.WebApp
}

export function getInitData(): string {
  return window.Telegram?.WebApp?.initData || ''
}

export function ready(): void {
  window.Telegram?.WebApp?.ready()
}

export function expand(): void {
  window.Telegram?.WebApp?.expand()
}

export function openInvoice(url: string, cb?: (status: string) => void): void {
  window.Telegram?.WebApp?.openInvoice(url, cb)
}

export function close(): void {
  window.Telegram?.WebApp?.close()
}