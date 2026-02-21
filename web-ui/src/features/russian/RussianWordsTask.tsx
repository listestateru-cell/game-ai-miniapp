import React, { useMemo, useState } from 'react'
import { gameApi } from '../../lib/gameApi'

interface Props {
  questMode?: boolean
  onFinish?: () => void
  onBack: () => void
}

const WORDS = [
  { word: 'молоко', missing: 'о', display: 'м_локо' },
  { word: 'собака', missing: 'о', display: 'с_бака' },
  { word: 'берёза', missing: 'ё', display: 'бер_за' },
  { word: 'трава', missing: 'а', display: 'тр_ва' },
  { word: 'машина', missing: 'а', display: 'м_шина' },
]

function pick() {
  const t = WORDS[Math.floor(Math.random() * WORDS.length)]
  const options = Array.from(new Set([t.missing, 'а', 'о', 'е', 'и', 'ё', 'у', 'я'].filter(x => x)))
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
  if (!options.includes(t.missing)) options[0] = t.missing
  return { ...t, options: options.sort(() => Math.random() - 0.5) }
}

export const RussianWordsTask: React.FC<Props> = ({ questMode, onFinish, onBack }) => {
  const [q, setQ] = useState(() => pick())
  const [feedback, setFeedback] = useState('')

  const title = useMemo(() => 'Слова', [])

  const choose = async (ch: string) => {
    if (ch === q.missing) {
      const reward = 3
      setFeedback(`✅ Верно! +${reward} 🧠`)
      await gameApi.addCoins(reward)
      setTimeout(() => {
        if (questMode && onFinish) onFinish()
        else setQ(pick())
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
      <h2 style={{ margin: '10px 0 12px' }}>{title}</h2>

      <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 2, marginBottom: 12 }}>
        {q.display}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {q.options.map((o) => (
          <button key={o} onClick={() => choose(o)} style={{ margin: 0, minWidth: 72, fontWeight: 800 }}>
            {o}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 10, minHeight: 22 }}>{feedback}</div>
    </div>
  )
}
