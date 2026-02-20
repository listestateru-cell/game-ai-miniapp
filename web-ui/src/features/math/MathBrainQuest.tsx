import React, { useState } from 'react'
import { gameApi } from '../../lib/gameApi'
import { MathBlankTask } from './MathBlankTask'
import { MathChooseTask } from './MathChooseTask'
import { MathEnterTask } from './MathEnterTask'
import { MathPairTask } from './MathPairTask'
import { MathStoryTask } from './MathStoryTask'

interface MathBrainQuestProps {
  onBack: () => void
}

export const MathBrainQuest: React.FC<MathBrainQuestProps> = ({ onBack }) => {
  const [step, setStep] = useState(0)
  const steps = ['enter', 'choose', 'pair', 'blank', 'story']

  const handleStepFinish = () => {
    if (step < steps.length - 1) setStep(step + 1)
    else void handleQuestComplete()
  }

  const handleQuestComplete = async () => {
    const reward = 15
    await gameApi.addCoins(reward)
    alert(`✅ Квест пройден! +${reward} 🧠`)
    onBack()
  }

  const renderStep = () => {
    switch (steps[step]) {
      case 'enter':
        return <MathEnterTask questMode onFinish={handleStepFinish} onBack={onBack} />
      case 'choose':
        return <MathChooseTask questMode onFinish={handleStepFinish} onBack={onBack} />
      case 'pair':
        return <MathPairTask questMode onFinish={handleStepFinish} onBack={onBack} />
      case 'blank':
        return <MathBlankTask questMode onFinish={handleStepFinish} onBack={onBack} />
      case 'story':
        return <MathStoryTask questMode onFinish={handleStepFinish} onBack={onBack} />
      default:
        return null
    }
  }

  return (
    <div style={{ background: '#000', color: '#fff', padding: 12, minHeight: '100vh', boxSizing: 'border-box' }}>
      <h2 style={{ margin: '10px 0 12px' }}>Квест — шаг {step + 1}/{steps.length}</h2>
      {renderStep()}
    </div>
  )
}
