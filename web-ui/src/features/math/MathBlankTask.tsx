import React, { useEffect, useMemo, useState } from 'react'
import { gameApi } from '../../lib/gameApi'

interface MathBlankTaskProps {
  questMode?: boolean
  onFinish?: () => void
  onBack: () => void
}

type Equation = { a: number; b: number; op: string; result: number }

export const MathBlankTask: React.FC<MathBlankTaskProps> = ({ questMode, onFinish, onBack }) => {
  const [level, setLevel] = useState(1)
  const [equations, setEquations] = useState<Equation[]>([])
  const [pool, setPool] = useState<number[]>([])
  const [slots, setSlots] = useState<{ a: number | null; b: number | null }[]>([])
  const [dragNum, setDragNum] = useState<number | null>(null)

  useEffect(() => {
    generateLevel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level])

  const shuffle = (arr: number[]) => [...arr].sort(() => Math.random() - 0.5)

  const generateLevel = () => {
    const ops = ['+', '-', '*']
    const eqs: Equation[] = []
    const usedResults = new Set<number>()

    for (let i = 0; i < 3; i++) {
      let a = 1
      let b = 1
      let res = 2
      let op = '+'
      do {
        a = Math.floor(Math.random() * 10) + 1
        b = Math.floor(Math.random() * 10) + 1
        op = ops[Math.floor(Math.random() * ops.length)]
        if (op === '+') res = a + b
        else if (op === '-') res = a - b
        else res = a * b
      } while (usedResults.has(res))

      usedResults.add(res)
      eqs.push({ a, b, op, result: res })
    }

    setEquations(eqs)
    const allNums = eqs.flatMap(e => [e.a, e.b])
    setPool(shuffle(allNums))
    setSlots(eqs.map(() => ({ a: null, b: null })))
    setDragNum(null)
  }

  const place = (slotIndex: number, part: 'a' | 'b', num: number) => {
    const newSlots = slots.map(s => ({ ...s }))
    newSlots[slotIndex][part] = num
    setSlots(newSlots)
    setPool(pool.filter(n => n !== num))
    setDragNum(null)

    const complete = newSlots.every((slot, i) => slot.a === equations[i].a && slot.b === equations[i].b)
    if (complete) {
      void handleComplete()
    }
  }

  const removeFromSlot = (slotIndex: number, part: 'a' | 'b') => {
    const num = slots[slotIndex]?.[part]
    if (num === null || num === undefined) return
    const newSlots = slots.map(s => ({ ...s }))
    newSlots[slotIndex][part] = null
    setSlots(newSlots)
    setPool([...pool, num])
  }

  const handleComplete = async () => {
    // Harder puzzle: reward more
    const reward = 8
    await gameApi.addCoins(reward)
    alert(`✅ Всё верно! +${reward} 🧠`)
    if (questMode && onFinish) {
      setTimeout(onFinish, 800)
    } else {
      setTimeout(() => setLevel(l => l + 1), 800)
    }
  }

  const hasDrag = useMemo(() => dragNum !== null, [dragNum])

  return (
    <div style={{ background: '#000', color: '#fff', padding: 12, minHeight: '100vh', boxSizing: 'border-box' }}>
      <button onClick={onBack} style={{ margin: 0 }}>Back</button>
      <h2 style={{ margin: '10px 0 12px' }}>Квадратики — Уровень {level}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {equations.map((eq, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => removeFromSlot(i, 'a')}
              style={{ width: 54, height: 54, borderRadius: 12, border: '2px solid #ffe066', background: '#18181f', color: '#fff', fontSize: 18, margin: 0 }}
            >
              {slots[i]?.a ?? ''}
            </button>

            <span style={{ fontSize: 22 }}>{eq.op}</span>

            <button
              onClick={() => removeFromSlot(i, 'b')}
              style={{ width: 54, height: 54, borderRadius: 12, border: '2px solid #ffe066', background: '#18181f', color: '#fff', fontSize: 18, margin: 0 }}
            >
              {slots[i]?.b ?? ''}
            </button>

            <span style={{ fontSize: 22 }}>=</span>
            <span style={{ fontSize: 22, fontWeight: 800 }}>{eq.result}</span>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                disabled={!hasDrag || slots[i].a !== null}
                onClick={() => { if (dragNum !== null) place(i, 'a', dragNum) }}
                style={{ margin: 0, opacity: !hasDrag || slots[i].a !== null ? 0.5 : 1 }}
              >
                сюда A
              </button>
              <button
                disabled={!hasDrag || slots[i].b !== null}
                onClick={() => { if (dragNum !== null) place(i, 'b', dragNum) }}
                style={{ margin: 0, opacity: !hasDrag || slots[i].b !== null ? 0.5 : 1 }}
              >
                сюда B
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, textAlign: 'left', opacity: 0.85, fontSize: 14 }}>
        Нажми на число снизу. Оно подсветится. Затем нажми "сюда A" или "сюда B".
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12, paddingBottom: 32 }}>
        {pool.map((num, i) => (
          <button
            key={`${num}-${i}`}
            onClick={() => setDragNum(num)}
            style={{
              width: 54,
              height: 54,
              borderRadius: 12,
              border: dragNum === num ? '2px solid #ffe066' : '1px solid #fff',
              background: '#23232b',
              color: '#fff',
              fontSize: 18,
              margin: 0,
              touchAction: 'manipulation',
              WebkitUserSelect: 'none',
              userSelect: 'none',
            }}
          >
            {num}
          </button>
        ))}
      </div>

      {dragNum !== null && (
        <div style={{ marginTop: 12, fontSize: 14, opacity: 0.9 }}>
          Выбрано число: <b style={{ color: '#ffe066' }}>{dragNum}</b>
        </div>
      )}
    </div>
  )
}
