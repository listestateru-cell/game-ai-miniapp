import { useState } from 'react'
import './index.css'
import AccountScreen from './screens/AccountScreen'
import GameScreen from './screens/GameScreen'

function App() {
  const [user, setUser] = useState<any>(null)
  const [screen, setScreen] = useState<'account' | 'game'>('account')

  return (
    <div className="App">
      {screen === 'account' && <AccountScreen user={user} onPlay={() => setScreen('game')} onUserUpdate={setUser} />}
      {screen === 'game' && <GameScreen onBack={() => setScreen('account')} />}
    </div>
  )
}

export default App