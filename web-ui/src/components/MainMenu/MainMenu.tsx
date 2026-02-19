import React from 'react'
import { avatarImages, avatarNames, getAvatarIndex } from '../../lib/avatars'
import './MainMenu.css'

interface GameItem {
  key: string
  label: string
  icon: string
}

interface User {
  name?: string
  avatar?: number
}

interface MainMenuProps {
  games: GameItem[]
  onSelectGame: (key: string) => void
  selectedGame: string | null
  user: User
}

export const MainMenu: React.FC<MainMenuProps> = ({ games, onSelectGame, selectedGame, user }) => {
  const avatarIndex = getAvatarIndex(user.avatar)
  const avatarImg = avatarImages[avatarIndex]
  const avatarName = avatarNames[avatarIndex]

  return (
    <div className="main-menu">
      <div className="big-avatar">
        <img src={avatarImg} alt={avatarName} />
      </div>
      <div className="games-grid">
        {games.map(game => (
          <button
            key={game.key}
            className={`game-button ${selectedGame === game.key ? 'selected' : ''}`}
            onClick={() => onSelectGame(game.key)}
          >
            <span className="game-icon">{game.icon}</span>
            <span className="game-label">{game.label}</span>
          </button>
        ))}
      </div>
      <div className="bottom-row">
        <img src={avatarImg} alt={avatarName} className="small-avatar" />
        <span className="nickname">{user.name || 'DemoUser'}</span>
      </div>
    </div>
  )
}