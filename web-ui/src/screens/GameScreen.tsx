import { useEffect, useState } from 'react'
import { MainMenu } from '../components/MainMenu/MainMenu'
import { PetPickerModal } from '../components/PetPickerModal/PetPickerModal'
import { ProfileModal } from '../components/ProfileModal/ProfileModal'
import { MathBlankTask } from '../features/math/MathBlankTask'
import { MathBrainQuest } from '../features/math/MathBrainQuest'
import { MathChooseTask } from '../features/math/MathChooseTask'
import { MathEnterTask } from '../features/math/MathEnterTask'
import { MathPairTask } from '../features/math/MathPairTask'
import { MathStoryTask } from '../features/math/MathStoryTask'
import { RussianGrammarTask } from '../features/russian/RussianGrammarTask'
import { RussianReadingTask } from '../features/russian/RussianReadingTask'
import { RussianSpellingTask } from '../features/russian/RussianSpellingTask'
import { AbracadabraTask } from '../features/russian/AbracadabraTask'
import { RussianWordsTask } from '../features/russian/RussianWordsTask'
import { avatarImages, getAvatarIndex } from '../lib/avatars'
import { gameApi } from '../lib/gameApi'
import { mathGames, russianGames } from '../lib/gameCatalog'
import { petApi, PetState } from '../lib/petApi'
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
  const [pet, setPet] = useState<PetState | null>(null)
  const [petLoading, setPetLoading] = useState(true)

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

  useEffect(() => {
    const loadPet = async () => {
      setPetLoading(true)
      const p = await petApi.getPet()
      setPet(p)
      setPetLoading(false)
    }
    void loadPet()
  }, [])

  const avatarIndex = getAvatarIndex(user.avatar)
  const avatarImg = avatarImages[avatarIndex]

  const petAvatarIndex = pet?.petAvatar ?? 0
  const petImg = avatarImages[getAvatarIndex(petAvatarIndex)]

  const canBattle = !!pet && pet.petAvatar !== null && pet.petAvatar !== undefined

  const maxTaps = 50
  const tapLabel = petLoading ? '...' : `${Math.min(pet?.petTapsToday ?? 0, maxTaps)}/${maxTaps}`

  const handlePetTap = async () => {
    const updated = await petApi.tapPet()
    if (updated) setPet(updated)
  }

  return (
    <div className="screen">
      <PetPickerModal
        open={!petLoading && (!pet || pet.petAvatar === null || pet.petAvatar === undefined)}
        onSelect={async (idx) => {
          const ok = await petApi.selectPet(idx)
          if (ok) {
            const p = await petApi.getPet()
            setPet(p)
          }
        }}
      />

      <div className="top-bar">
        <div>
          <div className="coins">Coins: {user.coins}</div>
          <div style={{ fontSize: 12, opacity: 0.85, color: '#fff' }}>
            Косточки: {tapLabel}
          </div>
        </div>
        <img src={avatarImg} alt="avatar" className="top-avatar" onClick={() => setShowProfileModal(true)} />
      </div>

      <div className="pet-bar">
        <div className="pet-hunger">
          <div className="pet-hunger-fill" style={{ width: `${Math.max(0, Math.min(100, pet?.petHunger ?? 0))}%` }} />
        </div>
        <button className="pet-tap" onClick={handlePetTap} disabled={!canBattle}>
          🦴 дать косточку
        </button>
      </div>

      <div className="category-buttons">
        <button className={category === 'math' ? 'selected' : ''} onClick={() => setCategory('math')}>Math</button>
        <button className={category === 'russian' ? 'selected' : ''} onClick={() => setCategory('russian')}>Russian</button>
        <button className={category === 'battles' ? 'selected' : ''} onClick={() => setCategory('battles')} disabled={!canBattle}>Battles</button>
      </div>
      {selectedGame ? (
        <div className="game-panel">
          {/* Math */}
          {selectedGame === 'enter' && <MathEnterTask onBack={handleBackToMenu} />}
          {selectedGame === 'choose' && <MathChooseTask onBack={handleBackToMenu} />}
          {selectedGame === 'pair' && <MathPairTask onBack={handleBackToMenu} />}
          {selectedGame === 'blank' && <MathBlankTask onBack={handleBackToMenu} />}
          {selectedGame === 'story' && <MathStoryTask onBack={handleBackToMenu} />}
          {selectedGame === 'brainquest' && <MathBrainQuest onBack={handleBackToMenu} />}

          {/* Russian */}
          {selectedGame === 'words' && <RussianWordsTask onBack={handleBackToMenu} />}
          {selectedGame === 'spelling' && <RussianSpellingTask onBack={handleBackToMenu} />}
          {selectedGame === 'grammar' && <RussianGrammarTask onBack={handleBackToMenu} />}
          {selectedGame === 'reading' && <RussianReadingTask onBack={handleBackToMenu} />}
          {selectedGame === 'abracadabra' && <AbracadabraTask onBack={handleBackToMenu} />}
        </div>
      ) : (
        <>
          {category === 'math' && <MainMenu games={mathGames} onSelectGame={handleSelectGame} selectedGame={selectedGame} user={user} />}
          {category === 'russian' && <MainMenu games={russianGames} onSelectGame={handleSelectGame} selectedGame={selectedGame} user={user} />}
          {category === 'battles' && (
            <div className="battles-placeholder">
              {!canBattle ? (
                <>
                  <h2>Нужен питомец</h2>
                  <p>Выбери персонажа, чтобы участвовать в Battles.</p>
                </>
              ) : (
                <h2>Battles coming soon...</h2>
              )}
            </div>
          )}
        </>
      )}
      <button onClick={onBack}>Back to Account</button>
      {showProfileModal && <ProfileModal user={user} onClose={() => setShowProfileModal(false)} />}
      {/* Big pet on main menu */}
      {!selectedGame && pet && (
        <div style={{ position: 'fixed', right: 8, top: 64, opacity: 0.95, pointerEvents: 'none' }}>
          <img src={petImg} alt="pet" style={{ width: 48, height: 48, objectFit: 'contain' }} />
        </div>
      )}
    </div>
  )
}