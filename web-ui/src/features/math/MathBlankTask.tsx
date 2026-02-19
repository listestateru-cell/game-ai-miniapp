import React, { useEffect, useState } from 'react'
import { gameApi } from '../../lib/gameApi'

interface MathBlankTaskProps {
  questMode?: boolean
  onFinish?: () => void
  onBack: () => void
}

export const MathBlankTask: React.FC<MathBlankTaskProps> = ({ questMode, onFinish, onBack }) => {
  const [level, setLevel] = useState(1)
  const [equations, setEquations] = useState<{ a: number; b: number; op: string; result: number }[]>([])
  const [pool, setPool] = useState<number[]>([])
  const [slots, setSlots] = useState<{ a: number | null; b: number | null }[]>([])

  useEffect(() => {
    generateLevel()
  }, [level])

  const generateLevel = () => {
    const ops = ['+', '-', '*']
    const eqs = []
    const nums = new Set<number>()
    for (let i = 0; i < 3; i++) {
      let a, b, res, op
      do {
        a = Math.floor(Math.random() * 10) + 1
        b = Math.floor(Math.random() * 10) + 1
        op = ops[Math.floor(Math.random() * ops.length)]
        if (op === '+') res = a + b
        else if (op === '-') res = a - b
        else res = a * b
      } while (nums.has(res))
      nums.add(res)
      eqs.push({ a, b, op, result: res })
    }
    setEquations(eqs)
    const allNums = [...eqs.flatMap(e => [e.a, e.b])]
    setPool(shuffle(allNums))
    setSlots(eqs.map(() => ({ a: null, b: null })))
  }

  const shuffle = (arr: number[]) => arr.sort(() => Math.random() - 0.5)

  const handleDrop = (slotIndex: number, part: 'a' | 'b', num: number) => {
    const newSlots = [...slots]
    newSlots[slotIndex][part] = num
    setSlots(newSlots)
    setPool(pool.filter(n => n !== num))
    checkComplete()
  }

  const handleDragFromSlot = (slotIndex: number, part: 'a' | 'b') => {
    const num = slots[slotIndex][part]
    if (num !== null) {
      const newSlots = [...slots]
      newSlots[slotIndex][part] = null
      setSlots(newSlots)
      setPool([...pool, num])
    }
  }

  const checkComplete = () => {
    const complete = slots.every((slot, i) => slot.a === equations[i].a && slot.b === equations[i].b)
    if (complete) {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    await gameApi.addCoins(20)
    alert('✅ Всё верно! +20 🧠')
    if (questMode && onFinish) {
      setTimeout(onFinish, 1300)
    } else {
      setTimeout(() => {
        setLevel(level + 1)
      }, 1300)
    }
  }

  return (
    <div style={{ background: '#000', color: '#fff', padding: '20px', minHeight: '100vh' }}>
      <button onClick={onBack}>Back</button>
      <h2>Blank Squares - Level {level}</h2>
      <div>
        {equations.map((eq, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
            <div
              style={{ width: '40px', height: '40px', border: '2px solid #ffe066', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}
              onClick={() => handleDragFromSlot(i, 'a')}
            >
              {slots[i].a}
            </div>
            {eq.op}
            <div
              style={{ width: '40px', height: '40px', border: '2px solid #ffe066', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 10px' }}
              onClick={() => handleDragFromSlot(i, 'b')}
            >
              {slots[i].b}
            </div>
            = {eq.result}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '20px' }}>
        {pool.map((num, i) => (
          <div
            key={i}
            style={{ width: '40px', height: '40px', border: '1px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '5px', cursor: 'pointer' }}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('num', num.toString())}
          >
            {num}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {equations.map((_, i) => (
          <div key={i} style={{ position: 'relative', pointerEvents: 'auto' }}>
            <div
              style={{ position: 'absolute', left: '10px', top: `${60 + i * 50}px`, width: '40px', height: '40px' }}
              onDrop={(e) => {
                const num = parseInt(e.dataTransfer.getData('num'))
                handleDrop(i, 'a', num)
              }}
              onDragOver={(e) => e.preventDefault()}
            />
            <div
              style={{ position: 'absolute', left: '70px', top: `${60 + i * 50}px`, width: '40px', height: '40px' }}
              onDrop={(e) => {
                const num = parseInt(e.dataTransfer.getData('num'))
                handleDrop(i, 'b', num)
              }}
              onDragOver={(e) => e.preventDefault()}
            />
          </div>
        ))}
      </div>
    </div>
  )
}