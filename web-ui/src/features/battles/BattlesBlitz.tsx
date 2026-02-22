import React, { useEffect, useRef, useState } from 'react'

const apiBase = (import.meta as any).env?.VITE_API_BASE || 'https://game-ai-miniapp.onrender.com'

function getToken(): string | null {
  return localStorage.getItem('sessionToken')
}

async function fetchMe(token: string) {
  const res = await fetch(`${apiBase}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'auth/me error')
  return data
}

export const BattlesBlitz: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [stake, setStake] = useState<number | null>(null)
  const [matchId, setMatchId] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'waiting' | 'active' | 'finished'>('idle')
  const [task, setTask] = useState<any>(null)
  const [answer, setAnswer] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(60)
  const [scoreMe, setScoreMe] = useState(0)
  const [scoreOp, setScoreOp] = useState(0)
  const [msg, setMsg] = useState('')

  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [finishedInfo, setFinishedInfo] = useState<any>(null)
  const [top10, setTop10] = useState<any[] | null>(null)
  const [inspectTarget, setInspectTarget] = useState<any | null>(null)
  const timerRef = useRef<any>(null)

  const join = async (s: number) => {
    setStake(s)
    setMsg('')
    setStatus('waiting')

    const token = getToken()
    if (!token) {
      setMsg('Нет токена. Открой Account и авторизуйся заново.')
      setStatus('idle')
      return
    }

    try {
      const me = await fetchMe(token)
      setMyUserId(me?.user?.id || null)
    } catch {
      // ignore
    }

    const res = await fetch(`${apiBase}/api/battles/queue/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ stake: s })
    })
    const data = await res.json()
    if (!res.ok) {
      setMsg(data?.error || 'Ошибка')
      setStatus('idle')
      return
    }

    setMatchId(data.matchId)
    setStatus(data.status === 'ACTIVE' ? 'active' : 'waiting')
  }

  const loadState = async () => {
    if (!matchId) return
    const token = getToken()
    if (!token) return
    const res = await fetch(`${apiBase}/api/battles/match/${matchId}/state`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (!res.ok) return

    const parts = data.match.participants
    if (myUserId) {
      const me = parts.find((p: any) => p.userId === myUserId)
      const op = parts.find((p: any) => p.userId !== myUserId)
      setScoreMe(me?.score ?? 0)
      setScoreOp(op?.score ?? 0)
    } else {
      const scores = parts.map((p: any) => p.score).sort((a: number, b: number) => b - a)
      setScoreMe(scores[0] ?? 0)
      setScoreOp(scores[1] ?? 0)
    }

    if (data.match.status === 'FINISHED') {
      setFinishedInfo(data.match)
      setStatus('finished')
      clearInterval(timerRef.current)
      return
    }

    if (data.match.status === 'ACTIVE') {
      setStatus('active')
      if (data.match.endsAt) {
        const end = new Date(data.match.endsAt).getTime()
        const left = Math.max(0, Math.floor((end - Date.now()) / 1000))
        setSecondsLeft(left)
        if (left <= 0) {
          setStatus('finished')
        }
      }
    }
  }

  const loadTask = async () => {
    if (!matchId) return
    const token = getToken()
    if (!token) return
    const res = await fetch(`${apiBase}/api/battles/match/${matchId}/task`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (!res.ok) return
    setTask(data)
  }

  const submit = async () => {
    if (!matchId || !task) return
    const token = getToken()
    if (!token) return
    const res = await fetch(`${apiBase}/api/battles/match/${matchId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ taskId: task.taskId, answer })
    })
    const data = await res.json()
    if (!res.ok) {
      setMsg(data?.error || 'Ошибка')
      return
    }
    if (data.correct) {
      setMsg('+1')
      setAnswer('')
      setTask(null)
      setTimeout(() => setMsg(''), 400)
      await loadState()
      await loadTask()
    } else {
      setMsg('❌')
      setTimeout(() => setMsg(''), 400)
    }
  }

  const leave = async () => {
    if (!matchId) {
      onBack()
      return
    }
    const token = getToken()
    if (token) {
      await fetch(`${apiBase}/api/battles/match/${matchId}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
    }
    onBack()
  }

  useEffect(() => {
    if (!matchId) return

    const ping = async () => {
      const token = getToken()
      if (!token || !matchId) return
      try {
        await fetch(`${apiBase}/api/battles/match/${matchId}/ping`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      } catch {
        // ignore
      }
    }

    const loop = async () => {
      if (status === 'active') await ping()
      await loadState()
      if (status === 'active' && !task) await loadTask()
    }
    void loop()

    timerRef.current = setInterval(() => {
      void loop()
    }, 1000)

    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, status])

  return (
    <div style={{ background: '#000', color: '#fff', padding: 12, minHeight: '100vh', boxSizing: 'border-box' }}>
      <button onClick={leave} style={{ margin: 0 }}>Back</button>
      <h2 style={{ margin: '10px 0 10px' }}>Схватки — Блиц 1v1</h2>

      {status === 'idle' && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[100, 500, 1000].map(s => (
            <button key={s} onClick={() => void join(s)} style={{ margin: 0, fontWeight: 900 }}>{s} 🧠</button>
          ))}
        </div>
      )}

      {status === 'waiting' && (
        <div style={{ marginTop: 12 }}>
          Ищем соперника… ставка {stake} 🧠
        </div>
      )}

      {status === 'active' && (
        <>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>⏱ {secondsLeft}s</div>
            <div style={{ color: '#ffe066', fontWeight: 900 }}>Счёт: {scoreMe}:{scoreOp}</div>
          </div>

          <div style={{ marginTop: 12, background: '#18181f', border: '1px solid #2a2a35', borderRadius: 14, padding: 14 }}>
            {task ? (
              <div style={{ fontSize: 28, fontWeight: 900 }}>
                {task.a} {task.op} {task.b} = ?
              </div>
            ) : (
              <div>Загрузка задания…</div>
            )}
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              inputMode="numeric"
              placeholder="ответ"
              style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #2a2a35', background: '#18181f', color: '#fff' }}
            />
            <button onClick={() => void submit()} style={{ margin: 0, fontWeight: 900 }}>OK</button>
          </div>

          {msg && <div style={{ marginTop: 8, minHeight: 20 }}>{msg}</div>}
        </>
      )}

      {status === 'finished' && (
        <div style={{ marginTop: 12, background: '#18181f', border: '1px solid #2a2a35', borderRadius: 14, padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Матч завершён</div>
          {finishedInfo ? (
            <>
              <div style={{ opacity: 0.9 }}>Ставка: {finishedInfo.stake} 🧠</div>
              <div style={{ opacity: 0.9 }}>Счёт: {scoreMe}:{scoreOp}</div>
              {myUserId && finishedInfo.winnerUserId ? (
                <div style={{ marginTop: 6, fontWeight: 900, color: finishedInfo.winnerUserId === myUserId ? '#51cf66' : '#ff6b6b' }}>
                  {finishedInfo.winnerUserId === myUserId ? 'Ты победил' : 'Ты проиграл'}
                </div>
              ) : finishedInfo.reason === 'TIE' ? (
                <div style={{ marginTop: 6, fontWeight: 900, color: '#ffe066' }}>Ничья</div>
              ) : null}
              {typeof finishedInfo.systemFee === 'number' && (
                <div style={{ marginTop: 6, opacity: 0.85 }}>Система забрала: {finishedInfo.systemFee} 🧠</div>
              )}
            </>
          ) : (
            <div>Матч завершён. Вернись назад и зайди снова.</div>
          )}
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => { setTop10(null); setInspectTarget(null); setFinishedInfo(null); setMatchId(null); setStatus('idle'); }} style={{ margin: 0, fontWeight: 900 }}>Играть снова</button>
            <button onClick={() => void (async () => {
              const token = getToken();
              if (!token) return;
              const r = await fetch(`${apiBase}/api/battles/leaderboard`, { headers: { Authorization: `Bearer ${token}` } });
              const d = await r.json();
              if (r.ok) setTop10(d.top || []);
            })()} style={{ margin: 0 }}>Топ-10</button>
            <button onClick={leave} style={{ margin: 0 }}>Back</button>
          </div>

          {top10 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Топ-10 (без цифр)</div>
              <div style={{ display: 'grid', gap: 6 }}>
                {top10.map((u: any) => (
                  <div key={u.userId} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', border: '1px solid #2a2a35', borderRadius: 10, padding: '8px 10px' }}>
                    <div>#{u.rank} {u.username || u.name || 'player'}</div>
                    <button onClick={() => void (async () => {
                      const token = getToken();
                      if (!token) return;
                      const r = await fetch(`${apiBase}/api/battles/inspect`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ targetUserId: u.userId })
                      });
                      const d = await r.json();
                      if (r.ok) setInspectTarget(d.target);
                      else setMsg(d?.error || 'Ошибка');
                    })()} style={{ margin: 0, fontWeight: 900 }}>Посмотреть (1000)</button>
                  </div>
                ))}
              </div>

              {inspectTarget && (
                <div style={{ marginTop: 10, padding: 10, borderRadius: 10, border: '1px solid #2a2a35', background: '#101015' }}>
                  <div style={{ fontWeight: 900 }}>Заработок в схватках:</div>
                  <div>{inspectTarget.username || inspectTarget.name || inspectTarget.userId}: {inspectTarget.battleEarnings} 🧠</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {msg && status !== 'active' && <div style={{ marginTop: 10 }}>{msg}</div>}
    </div>
  )
}
