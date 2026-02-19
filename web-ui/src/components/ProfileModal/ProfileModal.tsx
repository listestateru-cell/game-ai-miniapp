import React from 'react'
import { avatarImages, avatarNames, getAvatarIndex } from '../../lib/avatars'
import './ProfileModal.css'

interface User {
  name?: string
  avatar?: number
  coins?: number
  id?: string
}

interface ProfileModalProps {
  user: User
  onClose: () => void
  onLogout?: () => void
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onLogout }) => {
  const avatarIndex = getAvatarIndex(user.avatar)
  const avatarImg = avatarImages[avatarIndex]
  const avatarName = avatarNames[avatarIndex]

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        <div className="profile-avatar">
          <img src={avatarImg} alt={avatarName} />
        </div>
        <div className="profile-info">
          <div className="profile-name">{user.name || 'DemoUser'}</div>
          <div className="profile-coins">Coins: {user.coins || 0}</div>
          {user.id && <div className="profile-id">ID: {user.id}</div>}
        </div>
        <div className="profile-buttons">
          <button className="profile-button" onClick={onClose}>Close</button>
          {onLogout && <button className="profile-button" onClick={onLogout}>Logout</button>}
        </div>
      </div>
    </div>
  )
}