import React, { useState } from 'react'
import { gameApi } from '../../lib/gameApi'
import { MathBlankTask } from './MathBlankTask'
import { MathChooseTask } from './MathChooseTask'
import { MathPairTask } from './MathPairTask'
import { MathStoryTask } from './MathStoryTask'

interface MathBrainQuestProps {
  onBack: () => void
}

export const MathBrainQuest: React.FC<MathBrainQuestProps> = ({ onBack }) => {
  const [step, setStep] = useState(0)
  const steps = ['enter', 'choose', 'pair', 'blank', 'story']

  const handleStepFinish = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleQuestComplete()
    }
  }

  const handleQuestComplete = async () => {
    await gameApi.addCoins(100)
    alert('Quest Complete! +100 🧠')
    onBack()
  }

  const renderStep = () => {
    switch (steps[step]) {
      case 'enter':
        return <div>Enter task placeholder</div> // simple placeholder
      case 'choose':
        return <MathChooseTask questMode onFinish={handleStepFinish} onBack={onBack} />
      case 'pair':
        return <MathPairTask questMode onFinish={handleStepFinish} onBack={onBack} />
      case 'blank':
        return <MathBlankTask onBack={onBack} />
      case 'story':
        return <MathStoryTask questMode onFinish={handleStepFinish} onBack={onBack} />
      default:
        return null
    }
  }

  return (
    <div>
      <h2>Brain Quest - Step {step + 1}</h2>
      {renderStep()}
    </div>
  )
}