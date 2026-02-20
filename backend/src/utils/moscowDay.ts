// Helpers to compute "day key" in Europe/Moscow without needing TZ on server.
// Moscow is fixed UTC+3 (no DST).

export function getMoscowDayKey(d = new Date()): string {
  const ms = d.getTime() + 3 * 60 * 60 * 1000
  const md = new Date(ms)
  const y = md.getUTCFullYear()
  const m = String(md.getUTCMonth() + 1).padStart(2, '0')
  const day = String(md.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
