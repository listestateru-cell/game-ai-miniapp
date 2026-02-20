import React, { useMemo, useState } from 'react'
import { gameApi } from '../../lib/gameApi'

interface MathEnterTaskProps {
  questMode?: boolean
  onFinish?: () => void
  onBack: () => void
}

function gen() {
  const a = Math.floor(Math.random() * 20) + 1
  const b = Math.floor(Math.random() * 20) + 1
  const op = Math.random() < 0.7 ? '+' : '-'
  const correct = op === '+' ? a + b : a - b
  return { a, b, op, correct }
}

export const MathEnterTask: React.FC<MathEnterTaskProps> = ({ questMode, onFinish, onBack }) => {
  const [q, setQ] = useState(() => gen())
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState('')

  const placeholder = useMemo(() => 'Введи ответ…', [])

  const submit = async () => {
    const num = Number(value.trim())
    if (!Number.isFinite(num)) return

    if (num === q.correct) {
      const reward = 2
      setFeedback(`✅ Верно! +${reward} 🧠`)
      await gameApi.addCoins(reward)
      setTimeout(() => {
        if (questMode && onFinish) onFinish()
        else setQ(gen())
        setValue('')
        setFeedback('')
      }, 700)
    } else {
      setFeedback('❌ Неверно!')
      setTimeout(() => setFeedback(''), 700)
    }
  }

  return (
    <div style={{ background: '#000', color: '#fff', padding: 12, minHeight: '100vh', boxSizing: 'border-box' }}>
      <button onClick={onBack} style={{ margin: 0 }}>Back</button>
      <h2 style={{ margin: '10px 0 12px' }}>Ввести ответ</h2>

      <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 14 }}>
        {q.a} {q.op} {q.b} = ?
      </div>

      <input
        inputMode="numeric"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #2a2a35', background: '#18181f', color: '#fff', fontSize: 18, boxSizing: 'border-box' }}
      />

      <button onClick={submit} style={{ marginTop: 10, width: '100%', background: '#4685ff', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800 }}>
        Проверить
      </button>

      <div style={{ marginTop: 10, minHeight: 22 }}>{feedback}</div>
    </div>
  )
}
