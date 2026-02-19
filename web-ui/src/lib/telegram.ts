declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        ready: () => void
        expand: () => void
        openInvoice: (url: string) => void
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

export function openInvoice(url: string): void {
  window.Telegram?.WebApp?.openInvoice(url)
}

export function close(): void {
  window.Telegram?.WebApp?.close()
}