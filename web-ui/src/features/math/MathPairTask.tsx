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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect()
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleMouseDown = (leftIndex: number, e: React.MouseEvent) => {
    const rect = svgRef.current!.getBoundingClientRect()
    setDragging({ left: leftIndex, startX: e.clientX - rect.left, startY: e.clientY - rect.top })
  }

  const handleMouseUp = (rightIndex: number) => {
    if (dragging) {
      const newConnections = [...connections, { left: dragging.left, right: rightIndex }]
      setConnections(newConnections)
      if (newConnections.length === pairs.length) {
        handleComplete()
      }
    }
    setDragging(null)
  }

  const handleComplete = async () => {
    await gameApi.addCoins(10)
    alert('✅ Всё верно! +10 🧠')
    if (questMode && onFinish) {
      setTimeout(onFinish, 1500)
    } else {
      // reset
      setConnections([])
    }
  }

  const leftPos = (i: number) => ({ x: 50, y: 50 + i * 60 })
  const rightPos = (i: number) => ({ x: 300, y: 50 + i * 60 })

  return (
    <div style={{ background: '#000', color: '#fff', padding: '20px', minHeight: '100vh' }}>
      <button onClick={onBack}>Back</button>
      <h2>Pairs Game</h2>
      <svg ref={svgRef} width="400" height="300" style={{ border: '1px solid #fff' }}>
        {pairs.map((pair, i) => (
          <g key={i}>
            <text x={leftPos(i).x} y={leftPos(i).y} fill="#ffe066" fontSize="16" onMouseDown={(e) => handleMouseDown(i, e)} style={{ cursor: 'pointer' }}>
              {pair.left}
            </text>
            <text x={rightPos(i).x} y={rightPos(i).y} fill="#fff" fontSize="16" onMouseUp={() => handleMouseUp(i)} style={{ cursor: 'pointer' }}>
              {pair.right}
            </text>
          </g>
        ))}
        {connections.map((conn, i) => {
          const l = leftPos(conn.left)
          const r = rightPos(conn.right)
          return <line key={i} x1={l.x + 30} y1={l.y - 5} x2={r.x - 10} y2={r.y - 5} stroke="#fff" strokeWidth="2" />
        })}
        {dragging && (
          <line x1={dragging.startX} y1={dragging.startY} x2={mousePos.x} y2={mousePos.y} stroke="#fff" strokeWidth="2" strokeDasharray="5,5" />
        )}
      </svg>
    </div>
  )
}