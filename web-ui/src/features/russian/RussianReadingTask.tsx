import React, { useMemo, useState } from 'react'
import { gameApi } from '../../lib/gameApi'

interface Props {
  questMode?: boolean
  onFinish?: () => void
  onBack: () => void
}

const TEXTS = [
  {
    text: 'Лиса нашла в лесу корзину. В корзине были яблоки и орехи. Лиса решила поделиться с ёжиком.',
    q: 'Что было в корзине?'
    , a: 'яблоки и орехи'
    , options: ['конфеты', 'яблоки и орехи', 'книги', 'камни']
  },
  {
    text: 'Ёжик любил считать звёзды. Каждый вечер он выходил на поляну и смотрел в небо.',
    q: 'Что делал ёжик каждый вечер?'
    , a: 'смотрел в небо'
    , options: ['играл в мяч', 'смотрел в небо', 'спал', 'гулял по городу']
  }
]

function pick() {
  return TEXTS[Math.floor(Math.random() * TEXTS.length)]
}

export const RussianReadingTask: React.FC<Props> = ({ questMode, onFinish, onBack }) => {
  const [t, setT] = useState(() => pick())
  const [feedback, setFeedback] = useState('')

  const title = useMemo(() => 'Чтение', [])

  const choose = async (opt: string) => {
    if (opt === t.a) {
      const reward = 5
      setFeedback(`✅ Верно! +${reward} 🧠`)
      await gameApi.addCoins(reward)
      setTimeout(() => {
        if (questMode && onFinish) onFinish()
        else setT(pick())
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

      <div style={{ background: '#18181f', border: '1px solid #2a2a35', borderRadius: 12, padding: 12, textAlign: 'left' }}>
        {t.text}
      </div>

      <div style={{ marginTop: 12, opacity: 0.85 }}>{t.q}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
        {t.options.map((o) => (
          <button key={o} onClick={() => choose(o)} style={{ margin: 0, fontWeight: 800 }}>
            {o}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 10, minHeight: 22 }}>{feedback}</div>
    </div>
  )
}
