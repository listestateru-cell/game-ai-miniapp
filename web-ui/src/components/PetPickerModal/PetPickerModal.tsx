import React, { useMemo, useRef, useState } from 'react'
import { avatarImages, avatarNames } from '../../lib/avatars'
import './PetPickerModal.css'

export interface PetPickerModalProps {
  open: boolean
  onSelect: (petAvatar: number) => void
}

export const PetPickerModal: React.FC<PetPickerModalProps> = ({ open, onSelect }) => {
  const [index, setIndex] = useState(0)
  const startX = useRef<number | null>(null)

  const total = avatarImages.length
  const safeIndex = useMemo(() => {
    if (total <= 0) return 0
    return ((index % total) + total) % total
  }, [index, total])

  if (!open) return null

  const go = (delta: number) => {
    setIndex((i) => i + delta)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches?.[0]?.clientX ?? null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const sx = startX.current
    startX.current = null
    if (sx === null) return
    const ex = e.changedTouches?.[0]?.clientX
    if (typeof ex !== 'number') return
    const dx = ex - sx
    if (Math.abs(dx) < 40) return
    if (dx < 0) go(1)
    else go(-1)
  }

  const src = avatarImages[safeIndex]
  const name = avatarNames[safeIndex]

  return (
    <div className="pet-picker-overlay">
      <div className="pet-picker">
        <h2>Выбери персонажа</h2>

        <div
          className="pet-fighter"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button className="pet-arrow" onClick={() => go(-1)} aria-label="Prev">
            ‹
          </button>

          <div className="pet-stage">
            <img src={src} alt={name} draggable={false} />
            <div className="pet-name">{name}</div>
            <div className="pet-hint">Свайпни влево/вправо</div>
          </div>

          <button className="pet-arrow" onClick={() => go(1)} aria-label="Next">
            ›
          </button>
        </div>

        <button className="pet-pick" onClick={() => onSelect(safeIndex)}>
          Выбрать
        </button>

        <div className="pet-note">
          Без персонажа нельзя участвовать в Battles.
        </div>
      </div>
    </div>
  )
}
