import React, { useState } from 'react'
import { gameApi } from '../../lib/gameApi'

interface MathChooseTaskProps {
  questMode?: boolean
  onFinish?: () => void
  onBack: () => void
}

export const MathChooseTask: React.FC<MathChooseTaskProps> = ({ questMode, onFinish, onBack }) => {
  const [question, setQuestion] = useState(() => generateQuestion())
  const [feedback, setFeedback] = useState('')

  function generateQuestion() {
    const a = Math.floor(Math.random() * 20) + 10
    const b = Math.floor(Math.random() * 20) + 10
    const correct = a + b
    const options = [correct]
    while (options.length < 4) {
      const wrong = correct + Math.floor(Math.random() * 20) - 10
      if (!options.includes(wrong) && wrong > 0) options.push(wrong)
    }
    return { a, b, correct, options: options.sort(() => Math.random() - 0.5) }
  }

  const handleChoose = async (choice: number) => {
    if (choice === question.correct) {
      const reward = 3
      setFeedback(`✅ Верно! +${reward} 🧠`)
      await gameApi.addCoins(reward)
      setTimeout(() => {
        if (questMode && onFinish) onFinish()
        else setQuestion(generateQuestion())
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
      <h2 style={{ margin: '10px 0 12px' }}>Выбрать ответ</h2>

      <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>
        {question.a} + {question.b} = ?
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleChoose(opt)}
            style={{ padding: 12, background: '#18181f', color: '#fff', border: '1px solid #2a2a35', borderRadius: 12, margin: 0, fontWeight: 700 }}
          >
            {opt}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 10, minHeight: 22 }}>{feedback}</div>
    </div>
  )
}
