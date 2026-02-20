import { generatePairs } from '@game/core'
import React, { useEffect, useRef, useState } from 'react'
import { gameApi } from '../../lib/gameApi'

interface MathPairTaskProps {
  questMode?: boolean
  onFinish?: () => void
  onBack: () => void
}

export const MathPairTask: React.FC<MathPairTaskProps> = ({ questMode, onFinish, onBack }) => {
  const [pairs] = useState(() => generatePairs(3))
  const [connections, setConnections] = useState<{ left: number; right: number }[]>([])
  const [dragging, setDragging] = useState<{ left: number; startX: number; startY: number } | null>(null)
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      setPointerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])

  const handlePointerDown = (leftIndex: number, e: React.PointerEvent) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    setDragging({ left: leftIndex, startX: e.clientX - rect.left, startY: e.clientY - rect.top })
  }

  const handlePointerUp = (rightIndex: number) => {
    if (dragging) {
      const newConnections = [...connections, { left: dragging.left, right: rightIndex }]
      setConnections(newConnections)
      if (newConnections.length === pairs.length) {
        void handleComplete()
      }
    }
    setDragging(null)
  }

  const handleComplete = async () => {
    // Difficulty-based reward: pairs is harder than choose/enter
    const reward = 5
    await gameApi.addCoins(reward)
    alert(`✅ Всё верно! +${reward} 🧠`)
    if (questMode && onFinish) {
      setTimeout(onFinish, 800)
    } else {
      setConnections([])
    }
  }

  const leftPos = (i: number) => ({ x: 40, y: 70 + i * 80 })
  const rightPos = (i: number) => ({ x: 290, y: 70 + i * 80 })

  return (
    <div style={{ background: '#000', color: '#fff', padding: '12px', minHeight: '100vh', boxSizing: 'border-box' }}>
      <button onClick={onBack} style={{ margin: 0 }}>Back</button>
      <h2 style={{ margin: '10px 0 12px' }}>Пары</h2>

      <div style={{ width: '100%', maxWidth: 520, margin: '0 auto' }}>
        <svg
          ref={svgRef}
          viewBox="0 0 360 360"
          style={{ width: '100%', height: 'auto', border: '1px solid #fff', touchAction: 'none' }}
        >
          {pairs.map((pair, i) => (
            <g key={i}>
              {/* Left target */}
              <circle
                cx={leftPos(i).x + 24}
                cy={leftPos(i).y - 8}
                r={20}
                fill="#23232b"
                stroke="#ffe066"
                strokeWidth={2}
                onPointerDown={(e) => handlePointerDown(i, e)}
              />
              <text
                x={leftPos(i).x}
                y={leftPos(i).y}
                fill="#ffe066"
                fontSize="20"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {pair.left}
              </text>

              {/* Right target */}
              <circle
                cx={rightPos(i).x - 14}
                cy={rightPos(i).y - 8}
                r={20}
                fill="#23232b"
                stroke="#fff"
                strokeWidth={2}
                onPointerUp={() => handlePointerUp(i)}
              />
              <text
                x={rightPos(i).x}
                y={rightPos(i).y}
                fill="#fff"
                fontSize="20"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {pair.right}
              </text>
            </g>
          ))}

          {connections.map((conn, i) => {
            const l = leftPos(conn.left)
            const r = rightPos(conn.right)
            return (
              <line
                key={i}
                x1={l.x + 44}
                y1={l.y - 14}
                x2={r.x - 26}
                y2={r.y - 14}
                stroke="#fff"
                strokeWidth="3"
              />
            )
          })}

          {dragging && (
            <line
              x1={dragging.startX}
              y1={dragging.startY}
              x2={pointerPos.x}
              y2={pointerPos.y}
              stroke="#fff"
              strokeWidth="3"
              strokeDasharray="6,6"
            />
          )}
        </svg>
      </div>

      <div style={{ marginTop: 12, opacity: 0.8, fontSize: 14 }}>
        Соедини пример слева с правильным ответом справа.
      </div>
    </div>
  )
}
