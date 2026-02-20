import React from 'react'
import { avatarImages, avatarNames } from '../../lib/avatars'
import './PetPickerModal.css'

export interface PetPickerModalProps {
  open: boolean
  onSelect: (petAvatar: number) => void
}

export const PetPickerModal: React.FC<PetPickerModalProps> = ({ open, onSelect }) => {
  if (!open) return null

  return (
    <div className="pet-picker-overlay">
      <div className="pet-picker">
        <h2>Выбери персонажа</h2>
        <div className="pet-grid">
          {avatarImages.map((src, i) => (
            <button key={i} className="pet-card" onClick={() => onSelect(i)}>
              <img src={src} alt={avatarNames[i] || `pet-${i}`} />
              <div className="pet-name">{avatarNames[i]}</div>
            </button>
          ))}
        </div>
        <div className="pet-note">
          Без персонажа нельзя участвовать в Battles.
        </div>
      </div>
    </div>
  )
}
