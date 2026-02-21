import React, { useMemo, useState } from 'react'
import { gameApi } from '../../lib/gameApi'

interface Props {
  questMode?: boolean
  onFinish?: () => void
  onBack: () => void
}

const QA = [
  { q: 'Как пишется правильно?', a: 'интересный', options: ['интиресный', 'интересный', 'интерессный', 'интэресный'] },
  { q: 'Как пишется правильно?', a: 'сегодня', options: ['севодня', 'сегодня', 'сигодня', 'севоня'] },
  { q: 'Как пишется правильно?', a: 'здравствуй', options: ['здраствуй', 'здравствуй', 'здарвствуй', 'здравствуйй'] },
  { q: 'Как пишется правильно?', a: 'пожалуйста', options: ['пожалуста', 'пажалуйста', 'пожалуйста', 'пожайлуста'] },
]

function pick() {
  return QA[Math.floor(Math.random() * QA.length)]
}

export const RussianSpellingTask: React.FC<Props> = ({ questMode, onFinish, onBack }) => {
  const [q, setQ] = useState(() => pick())
  const [feedback, setFeedback] = useState('')

  const title = useMemo(() => 'Орфография', [])

  const choose = async (opt: string) => {
    if (opt === q.a) {
      const reward = 4
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

      <div style={{ opacity: 0.85, marginBottom: 8 }}>{q.q}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map((o) => (
          <button key={o} onClick={() => choose(o)} style={{ margin: 0, fontWeight: 800 }}>
            {o}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 10, minHeight: 22 }}>{feedback}</div>
    </div>
  )
}
