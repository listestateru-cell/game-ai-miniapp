import React, { useEffect, useMemo, useRef, useState } from 'react'

interface Props {
  onBack: () => void
}

const apiBase = (import.meta as any).env?.VITE_API_BASE || 'https://game-ai-miniapp.onrender.com'

function getToken(): string | null {
  return localStorage.getItem('sessionToken')
}

function normalizeRu(s: string): string {
  return s.trim().toLowerCase().replace(/ё/g, 'е')
}

export const AbracadabraTask: React.FC<Props> = ({ onBack }) => {
  const [source, setSource] = useState<string>('')
  const [secondsLeft, setSecondsLeft] = useState<number>(60)
  const [input, setInput] = useState<string>('')
  const [used, setUsed] = useState<string[]>([])
  const [score, setScore] = useState<number>(0)
  const [msg, setMsg] = useState<string>('')
  const timerRef = useRef<any>(null)

  const title = useMemo(() => 'Абракадабра', [])

  const load = async () => {
    const token = getToken()
    if (!token) {
      setMsg('Нет токена. Открой Account и авторизуйся заново.')
      return
    }
    const res = await fetch(`${apiBase}/api/russian/abracadabra/new`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setSource(data.source)
    setSecondsLeft(60)
    setUsed([])
    setScore(0)
    setMsg('')
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!source) return
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [source])

  const submit = async () => {
    if (secondsLeft <= 0) return
    const w = normalizeRu(input)
    if (w.length < 3) {
      setMsg('Минимум 3 символа')
      return
    }
    if (used.map(normalizeRu).includes(w)) {
      setMsg('Уже было')
      return
    }

    const token = getToken()
    if (!token) return

    try {
      const res = await fetch(`${apiBase}/api/russian/abracadabra/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ source, word: w, used })
      })
      const ct = res.headers.get('content-type') || ''
      const data = ct.includes('application/json') ? await res.json() : await res.text()
      if (!res.ok) {
        const err = typeof data === 'string' ? data : data?.error
        setMsg(String(err || 'Ошибка'))
        return
      }
      const earned = (data as any)?.earned ?? w.length
      setUsed((u) => [w, ...u])
      setScore((s) => s + earned)
      setMsg(`+${earned} 🧠`) 
      setInput('')
      setTimeout(() => setMsg(''), 700)
    } catch (e: any) {
      setMsg(e?.message || 'Ошибка сети')
    }
  }

  const ended = secondsLeft <= 0

  return (
    <div style={{ background: '#000', color: '#fff', padding: 12, minHeight: '100vh', boxSizing: 'border-box' }}>
      <button onClick={onBack} style={{ margin: 0 }}>Back</button>
      <h2 style={{ margin: '10px 0 6px' }}>{title}</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <div style={{ opacity: 0.85 }}>⏱ {secondsLeft}s</div>
        <div style={{ color: '#ffe066', fontWeight: 900 }}>Счёт: {score} 🧠</div>
      </div>

      <div style={{ marginTop: 10, background: '#18181f', border: '1px solid #2a2a35', borderRadius: 14, padding: 14 }}>
        <div style={{ opacity: 0.75, fontSize: 13 }}>Составь слова из букв:</div>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 1, marginTop: 6 }}>{source}</div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="введи слово"
          style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #2a2a35', background: '#18181f', color: '#fff' }}
          disabled={ended}
        />
        <button onClick={submit} disabled={ended} style={{ margin: 0, fontWeight: 900 }}>
          OK
        </button>
      </div>

      {msg && <div style={{ marginTop: 8, minHeight: 20, opacity: 0.9 }}>{msg}</div>}

      {ended && (
        <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
          <button onClick={() => void load()} style={{ margin: 0, fontWeight: 900 }}>Ещё раз</button>
        </div>
      )}

      <div style={{ marginTop: 12, opacity: 0.8, fontSize: 13 }}>
        Правила: минимум 3 символа, повторять нельзя, 1 символ = 1 🧠. Мата нет.
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ opacity: 0.7, fontSize: 13, marginBottom: 6 }}>Слова:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {used.slice(0, 20).map((w, i) => (
            <div key={`${w}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', background: '#0f0f12', border: '1px solid #2a2a35', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontWeight: 800 }}>{w}</div>
              <div style={{ color: '#ffe066', fontWeight: 900 }}>+{w.length}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
