import { storyTasks } from '@game/core'
import React, { useMemo, useState } from 'react'
import { gameApi } from '../../lib/gameApi'

interface MathStoryTaskProps {
  questMode?: boolean
  onFinish?: () => void
  onBack: () => void
}

export const MathStoryTask: React.FC<MathStoryTaskProps> = ({ questMode, onFinish, onBack }) => {
  const [level, setLevel] = useState(0)
  const [taskIndex, setTaskIndex] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('')

  const currentTask = storyTasks[level]?.tasks[taskIndex]

  const title = useMemo(() => `Текст — Уровень ${level + 1}`, [level])

  const handleSubmit = async () => {
    if (!currentTask) return

    const normalizedInput = input.replace(/[.,]/g, '').trim()
    const normalizedAnswer = currentTask.answer.replace(/[.,]/g, '').trim()
    if (normalizedInput === normalizedAnswer) {
      const reward = 4
      setFeedback(`✅ Верно! +${reward} 🧠`)
      await gameApi.addCoins(reward)
      setTimeout(() => {
        nextTask()
      }, 700)
    } else {
      setFeedback('❌ Неверно!')
      setTimeout(() => setFeedback(''), 700)
    }
  }

  const nextTask = () => {
    if (!currentTask) return

    if (taskIndex < storyTasks[level].tasks.length - 1) {
      setTaskIndex(taskIndex + 1)
    } else if (level < storyTasks.length - 1) {
      setLevel(level + 1)
      setTaskIndex(0)
    } else {
      if (questMode && onFinish) onFinish()
    }
    setInput('')
    setFeedback('')
  }

  if (!currentTask) {
    return (
      <div style={{ background: '#000', color: '#fff', padding: 12, minHeight: '100vh', boxSizing: 'border-box' }}>
        <button onClick={onBack} style={{ margin: 0 }}>Back</button>
        <h2 style={{ margin: '10px 0 12px' }}>Текст</h2>
        <div>Нет заданий</div>
      </div>
    )
  }

  return (
    <div style={{ background: '#000', color: '#fff', padding: 12, minHeight: '100vh', boxSizing: 'border-box' }}>
      <button onClick={onBack} style={{ margin: 0 }}>Back</button>
      <h2 style={{ margin: '10px 0 12px' }}>{title}</h2>

      <div style={{ background: '#18181f', border: '1px solid #2a2a35', borderRadius: 12, padding: 12, textAlign: 'left' }}>
        {currentTask.text}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ marginTop: 12, padding: 12, width: '100%', background: '#18181f', color: '#fff', border: '1px solid #2a2a35', borderRadius: 12, boxSizing: 'border-box' }}
      />

      <button
        onClick={handleSubmit}
        style={{ marginTop: 10, padding: 12, width: '100%', background: '#4685ff', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800 }}
      >
        Проверить
      </button>

      <div style={{ marginTop: 10, minHeight: 22 }}>{feedback}</div>
    </div>
  )
}
