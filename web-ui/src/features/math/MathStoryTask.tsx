import storyTasks from '@game/core'
import React, { useState } from 'react'
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

  const handleSubmit = async () => {
    const normalizedInput = input.replace(/[.,]/g, '').trim()
    const normalizedAnswer = currentTask.answer.replace(/[.,]/g, '').trim()
    if (normalizedInput === normalizedAnswer) {
      setFeedback('✅ Верно! +5 🧠')
      await gameApi.addCoins(5)
      setTimeout(() => {
        nextTask()
      }, 1500)
    } else {
      setFeedback('❌ Неверно!')
      setTimeout(() => setFeedback(''), 1500)
    }
  }

  const nextTask = () => {
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

  if (!currentTask) return <div>No tasks</div>

  return (
    <div style={{ background: '#000', color: '#fff', padding: '20px', minHeight: '100vh' }}>
      <button onClick={onBack}>Back</button>
      <h2>Story Task - Level {level + 1}</h2>
      <p>{currentTask.text}</p>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ padding: '10px', width: '100%', background: '#18181f', color: '#fff', border: 'none' }}
      />
      <button onClick={handleSubmit} style={{ marginTop: '10px', padding: '10px', background: '#4685ff', color: '#fff', border: 'none' }}>
        Submit
      </button>
      <p>{feedback}</p>
    </div>
  )
}