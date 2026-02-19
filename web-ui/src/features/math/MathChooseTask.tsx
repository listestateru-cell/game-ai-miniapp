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
      setFeedback('✅ Верно! +3 🧠')
      await gameApi.addCoins(3)
      setTimeout(() => {
        if (questMode && onFinish) {
          onFinish()
        } else {
          setQuestion(generateQuestion())
          setFeedback('')
        }
      }, 1500)
    } else {
      setFeedback('❌ Неверно!')
      setTimeout(() => setFeedback(''), 1500)
    }
  }

  return (
    <div style={{ background: '#000', color: '#fff', padding: '20px', minHeight: '100vh' }}>
      <button onClick={onBack}>Back</button>
      <h2>Choose the Correct Answer</h2>
      <p>{question.a} + {question.b} = ?</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {question.options.map((opt, i) => (
          <button key={i} onClick={() => handleChoose(opt)} style={{ padding: '10px', background: '#18181f', color: '#fff', border: 'none' }}>
            {opt}
          </button>
        ))}
      </div>
      <p>{feedback}</p>
    </div>
  )
}