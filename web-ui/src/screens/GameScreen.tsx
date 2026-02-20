import { useEffect, useState } from 'react'
import { MainMenu } from '../components/MainMenu/MainMenu'
import { ProfileModal } from '../components/ProfileModal/ProfileModal'
import { MathBlankTask } from '../features/math/MathBlankTask'
import { MathBrainQuest } from '../features/math/MathBrainQuest'
import { MathChooseTask } from '../features/math/MathChooseTask'
import { MathPairTask } from '../features/math/MathPairTask'
import { MathStoryTask } from '../features/math/MathStoryTask'
import { avatarImages, getAvatarIndex } from '../lib/avatars'
import { gameApi } from '../lib/gameApi'
import { mathGames, russianGames } from '../lib/gameCatalog'
import './GameScreen.css'

interface User {
  id?: string
  name?: string
  avatar?: number
  coins?: number
}

interface GameScreenProps {
  onBack: () => void
  user: User | null
}

export default function GameScreen({ onBack, user: userProp }: GameScreenProps) {
  const [user, setUser] = useState<User>({ name: 'DemoUser', avatar: 0, coins: 0 })
  const [category, setCategory] = useState<'math' | 'russian' | 'battles'>('math')
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  useEffect(() => {
    // Prefer authenticated user from Account screen.
    if (userProp) {
      setUser({
        id: userProp.id,
        name: userProp.name || userProp.username,
        avatar: userProp.avatar,
        coins: userProp.coins ?? 0,
      })
      return
    }

    // Fallback: demo/local storage
    const loadUser = async () => {
      const profile = await gameApi.getProfile()
      const coins = await gameApi.getCoins()
      setUser({ ...profile, coins })
    }
    void loadUser()
  }, [userProp])

  const handleSelectGame = (key: string) => {
    setSelectedGame(key)
  }

  const handleBackToMenu = () => {
    setSelectedGame(null)
  }

  const avatarIndex = getAvatarIndex(user.avatar)
  const avatarImg = avatarImages[avatarIndex]

  return (
    <div className="screen">
      <div className="top-bar">
        <div className="coins">Coins: {user.coins}</div>
        <img src={avatarImg} alt="avatar" className="top-avatar" onClick={() => setShowProfileModal(true)} />
      </div>
      <div className="category-buttons">
        <button className={category === 'math' ? 'selected' : ''} onClick={() => setCategory('math')}>Math</button>
        <button className={category === 'russian' ? 'selected' : ''} onClick={() => setCategory('russian')}>Russian</button>
        <button className={category === 'battles' ? 'selected' : ''} onClick={() => setCategory('battles')}>Battles</button>
      </div>
      {selectedGame ? (
        <div className="game-panel">
          {selectedGame === 'pair' && <MathPairTask onBack={handleBackToMenu} />}
          {selectedGame === 'blank' && <MathBlankTask onBack={handleBackToMenu} />}
          {selectedGame === 'choose' && <MathChooseTask onBack={handleBackToMenu} />}
          {selectedGame === 'story' && <MathStoryTask onBack={handleBackToMenu} />}
          {selectedGame === 'brainquest' && <MathBrainQuest onBack={handleBackToMenu} />}
        </div>
      ) : (
        <>
          {category === 'math' && <MainMenu games={mathGames} onSelectGame={handleSelectGame} selectedGame={selectedGame} user={user} />}
          {category === 'russian' && <MainMenu games={russianGames} onSelectGame={handleSelectGame} selectedGame={selectedGame} user={user} />}
          {category === 'battles' && (
            <div className="battles-placeholder">
              <h2>Battles coming soon...</h2>
            </div>
          )}
        </>
      )}
      <button onClick={onBack}>Back to Account</button>
      {showProfileModal && <ProfileModal user={user} onClose={() => setShowProfileModal(false)} />}
    </div>
  )
}