// src/App.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { AppState, Image, Modal, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useCoins } from "./hooks/useCoins";


// Импорт с защитой: если компонент не найден, используем заглушку
let BattleRoom, BattleStakeModal, MathBlankTask, MathBrainQuest, MathChooseTask, MathEnterTask, MathPairTask, MathstoryTask, Profile, Registration, RussianMenu, generatePairs;
let battleRoomErr, stakeModalErr, blankErr, brainErr, chooseErr, enterErr, pairErr, storyErr, profileErr, regErr, rusErr, genPairsErr;
try {
  BattleRoom = require("./Battles/BattleRoom").default;
} catch (e) { battleRoomErr = e; BattleRoom = (props) => <Text style={{color:"#fff"}}>Режим временно недоступен</Text>; }
try {
  BattleStakeModal = require("./Battles/BattleStakeModal").default;
} catch (e) { stakeModalErr = e; BattleStakeModal = (props) => <Text style={{color:"#fff"}}>Режим временно недоступен</Text>; }
try {
  MathBlankTask = require("./components/Math/MathBlankTask").default;
} catch (e) { blankErr = e; MathBlankTask = () => <Text style={{color:"#fff"}}>Режим временно недоступен</Text>; }
try {
  MathBrainQuest = require("./components/Math/MathBrainQuest").default;
} catch (e) { brainErr = e; MathBrainQuest = () => <Text style={{color:"#fff"}}>Режим временно недоступен</Text>; }
try {
  MathChooseTask = require("./components/Math/MathChooseTask").default;
} catch (e) { chooseErr = e; MathChooseTask = () => <Text style={{color:"#fff"}}>Режим временно недоступен</Text>; }
try {
  MathEnterTask = require("./components/Math/MathEnterTask").default;
} catch (e) { enterErr = e; MathEnterTask = () => <Text style={{color:"#fff"}}>Режим временно недоступен</Text>; }
try {
  MathPairTask = require("./components/Math/MathPairTask").default;
} catch (e) { pairErr = e; MathPairTask = () => <Text style={{color:"#fff"}}>Режим временно недоступен</Text>; }
try {
  MathstoryTask = require("./components/Math/MathstoryTask").default;
} catch (e) { storyErr = e; MathstoryTask = () => <Text style={{color:"#fff"}}>Режим временно недоступен</Text>; }
try {
  Profile = require("./Profile").default;
} catch (e) { profileErr = e; Profile = (props) => <Text style={{color:"#fff"}}>Профиль недоступен</Text>; }
try {
  // Попытка загрузить Registration из альтернативных путей
  let regModule = null;
  try {
    regModule = require("./Registr/Registration");
  } catch (e1) {
    try {
      regModule = require("./Registration/Registration");
    } catch (e2) {
      try {
        regModule = require("./Registr/registration");
      } catch (e3) {
        try {
          regModule = require("./Registration/registration");
        } catch (e4) {
          throw e4;
        }
      }
    }
  }
  Registration = regModule && regModule.default ? regModule.default : regModule;
  if (!Registration) throw new Error("Registration component not found");
} catch (e) {
  regErr = e;
  Registration = ({onRegister, onGoToLogin}) => (
    <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
      <Text style={{color:"#fff"}}>Регистрация недоступна</Text>
      {onGoToLogin &&
        <TouchableOpacity onPress={onGoToLogin} style={{marginTop:24}}>
          <Text style={{color:"#4685ff"}}>Войти</Text>
        </TouchableOpacity>
      }
    </View>
  );
}
try {
  RussianMenu = require("./Russian/RussianMenu").default;
} catch (e) { rusErr = e; RussianMenu = ({onBack}) => <Text style={{color:"#fff"}}>Режим временно недоступен</Text>; }
try {
  generatePairs = require("./utils/generatePairs").default;
} catch (e) { genPairsErr = e; generatePairs = () => []; }

// Импортируем Login с защитой
let Login, loginErr;
try {
  Login = require("./Registr/Login").default;
} catch (e) {
  loginErr = e;
  Login = ({onLogin, onGoToRegister}) => (
    <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
      <Text style={{color:"#fff"}}>Вход недоступен</Text>
      <TouchableOpacity onPress={onGoToRegister} style={{marginTop:24}}>
        <Text style={{color:"#4685ff"}}>Зарегистрироваться</Text>
      </TouchableOpacity>
    </View>
  );
}

const menu = [
  { key: "home", label: "Главная", icon: "🏠" },
  { key: "math", label: "Математика", icon: "➗" },
  { key: "russian", label: "Русский язык", icon: "🅰️" },
  { key: "battle", label: "Битвы", icon: "⚔️" }
];

const mathGames = [
  { key: "enter", label: "Ввести ответ", icon: "🔢" },
  { key: "choose", label: "Выбрать из вариантов", icon: "📚" },
  { key: "pair", label: "Соединить пары", icon: "🔗" },
  { key: "blank", label: "Пустые квадратики", icon: "⬜" },
  { key: "story", label: "Текстовые задачи", icon: "📖" },
  { key: "brainquest", label: "Мозговой квест", icon: "🧩" }
];

const ROOM_HOMES = [
  "Дупло", "Нора", "Берлога", "Логово", "Гнездо", "Улей", "Муравейник", "Пещера",
  "Бобровая хатка", "Лисья нора", "Барсучья нора", "Заячья нора", "Совиное дупло",
  "Беличье дупло", "Волчье логово", "Медвежья берлога", "Птичье гнездо", "Пчелиный улей", "Муравьиный муравейник"
];

const avatarImages = [
  require("./assets/images/fox.png"),
  require("./assets/images/hedgehog.png"),
  require("./assets/images/hare.png"),
  require("./assets/images/bear.png"),
  require("./assets/images/owl.png"),
  require("./assets/images/wolf.png"),
];
const avatarNames = ["лиса", "ёж", "заяц", "медведь", "сова", "волк"];


export default function App() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState("home");
  const [showProfile, setShowProfile] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [mathGame, setMathGame] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [battleType, setBattleType] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [battleRooms, setBattleRooms] = useState([]);

  // useCoins hook
  const { coins, addCoins, setCoinsDirect, fetchCoinsFromServer } = useCoins();

  // Загружаем пользователя и монеты с сервера при запуске
  useEffect(() => {
    async function loadUserData() {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Получаем актуальные данные с сервера
          const response = await fetch(`http://localhost:3030/user/${parsedUser.id}`);
          if (response.ok) {
            const serverUser = await response.json();
            setUser(serverUser);
            setCoinsDirect(serverUser.coins || 0);
            await AsyncStorage.setItem("user", JSON.stringify(serverUser));
          } else {
            setUser(parsedUser);
            setCoinsDirect(parsedUser.coins || 0);
          }
        } else {
          setUser(null);
          setCoinsDirect(0);
        }
      } catch (e) {
        setUser(null);
        setCoinsDirect(0);
      }
    }
    loadUserData();
    // eslint-disable-next-line
  }, []);

  // Функция для загрузки пользователя с сервера и обновления coins через setCoinsDirect
  async function syncUserFromServer() {
    if (user && user.id) {
      try {
        const response = await fetch(`http://localhost:3030/user/${user.id}`);
        if (response.ok) {
          const serverUser = await response.json();
          setUser(serverUser);
          setCoinsDirect(serverUser.coins || 0);
          await AsyncStorage.setItem("user", JSON.stringify(serverUser));
        }
      } catch (e) {
        console.error("Failed to sync user from server", e);
      }
    }
  }

  // Синхронизация при возврате приложения из фона
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        syncUserFromServer();
      }
    });
    return () => subscription.remove();
  }, [user]);

  // Синхронизация при переходе на главную вкладку
  useEffect(() => {
    if (selected === "home") {
      syncUserFromServer();
    }
  }, [selected]);

  // Загрузка списка комнат с battle-сервера
  useEffect(() => {
    if (selected === "battle") {
      fetchBattleRooms();
    }
  }, [selected]);

  async function fetchBattleRooms() {
    try {
      const resp = await fetch("http://localhost:3030/battles");
      if (resp.ok) {
        const data = await resp.json();
        setBattleRooms(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setBattleRooms([]);
    }
  }

  // Вычисление индекса аватара
  let avatarIdx = 0;
  if (user) {
    if (typeof user.avatar === "number") {
      avatarIdx = user.avatar;
    } else if (typeof user.avatar === "string") {
      avatarIdx = avatarNames.indexOf(user.avatar);
      if (avatarIdx < 0) avatarIdx = 0;
    }
  }

  // Если пользователь не зарегистрирован, показываем форму регистрации/логина
  if (!user) {
    return showLogin ? (
      <Login
        onLogin={async (newUser) => {
          setUser(newUser);
          setCoinsDirect(newUser.coins || 0);
          await AsyncStorage.setItem("user", JSON.stringify(newUser));
        }}
        onGoToRegister={() => setShowLogin(false)}
      />
    ) : (
      <Registration
        onRegister={async (newUser) => {
          setUser(newUser);
          setCoinsDirect(newUser.coins || 0);
          await AsyncStorage.setItem("user", JSON.stringify(newUser));
        }}
        onGoToLogin={() => setShowLogin(true)}
      />
    );
  }

  // ---- Обработчики битв ----
  const handleSelectBattleType = (type) => {
    setBattleType(type);
    setShowStakeModal(true);
  };

  const handleSelectStake = async (stake) => {
    if (!user || !battleType) return;
    try {
      const resp = await fetch("http://localhost:3030/battles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: battleType, stake, userId: user.id }),
      });
      if (resp.ok) {
        const room = await resp.json();
        setCurrentRoom(room);
        setShowStakeModal(false);
        setBattleType(null);
        fetchBattleRooms();
      }
    } catch (e) {}
  };

  const handleJoinRoom = async (roomId) => {
    if (!user) return;
    try {
      const resp = await fetch("http://localhost:3030/battles/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, userId: user.id }),
      });
      if (resp.ok) {
        const room = await resp.json();
        setCurrentRoom(room);
      }
    } catch (e) {}
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setBattleType(null);
    fetchBattleRooms();
  };

  const handleReady = () => {
    // Локально, можно заменить на запрос к серверу
    if (!user || !currentRoom) return;
    setCurrentRoom({
      ...currentRoom,
      players: currentRoom.players.map(p =>
        p.id === user.id ? { ...p, ready: true } : p
      ),
    });
  };

  const handleSetStake = (stake) => {
    // Можно реализовать изменение ставки
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    setUser(null);
    setCoinsDirect(0);
  };

  // Главный экран игры
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {/* Верхняя панель */}
      <View style={styles.topBar}>
        <Text style={styles.coins}>{coins || 0} 🧠</Text>
        <TouchableOpacity style={styles.profile} onPress={() => setShowProfile(true)}>
          <Image source={avatarImages[avatarIdx]} style={styles.avatar} />
          <Text style={styles.profileName}>{user.username || user.name || "Игрок"}</Text>
        </TouchableOpacity>
      </View>
      {/* Главная вкладка */}
      <View style={styles.center}>
        {selected === "home" && (
          <Image
            source={avatarImages[avatarIdx]}
            style={{
              width: 180,
              height: 260,
              resizeMode: "contain",
              marginTop: 50,
            }}
          />
        )}

        {/* Математика */}
        {selected === "math" && !mathGame && (
          <View style={styles.mathMenu}>
            <Text style={styles.mathMenuTitle}>Математика</Text>
            <View style={styles.mathMenuGrid}>
              {mathGames.map(game => (
                <TouchableOpacity
                  key={game.key}
                  style={styles.mathMenuButton}
                  onPress={() => {
                    setMathGame(game.key);
                  }}
                >
                  <Text style={styles.mathMenuButtonIcon}>{game.icon}</Text>
                  <Text style={styles.mathMenuButtonLabel}>{game.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {selected === "math" && mathGame === "enter" && (
          <ErrorCatcher>
            <MathEnterTask onBack={() => setMathGame(null)} addCoins={addCoins} />
          </ErrorCatcher>
        )}
        {selected === "math" && mathGame === "choose" && (
          <ErrorCatcher>
            <MathChooseTask onBack={() => setMathGame(null)} addCoins={addCoins} />
          </ErrorCatcher>
        )}
        {selected === "math" && mathGame === "pair" && (
          <ErrorCatcher>
            <MathPairTask onBack={() => setMathGame(null)} addCoins={addCoins} />
          </ErrorCatcher>
        )}
        {selected === "math" && mathGame === "blank" && (
          <ErrorCatcher>
            <MathBlankTask onBack={() => setMathGame(null)} addCoins={addCoins} />
          </ErrorCatcher>
        )}
        {selected === "math" && mathGame === "story" && (
          <ErrorCatcher>
            <MathstoryTask onBack={() => setMathGame(null)} addCoins={addCoins} />
          </ErrorCatcher>
        )}
        {selected === "math" && mathGame === "brainquest" && (
          <ErrorCatcher>
            <MathBrainQuest onBack={() => setMathGame(null)} addCoins={addCoins} />
          </ErrorCatcher>
        )}

        {/* Русский язык */}
        {selected === "russian" && (
          <ErrorCatcher>
            <RussianMenu onBack={() => setSelected("home")} addCoins={addCoins} coins={coins || 0} />
          </ErrorCatcher>
        )}

        {/* Битвы */}
        {/* Битвы меню: выбор батла, список комнат, создание */}
        {selected === "battle" && !currentRoom && !battleType && (
          <View style={styles.battleMenu}>
            <Text style={styles.battleMenuTitle}>Битвы</Text>
            {/* Выбор типа битвы */}
            <View style={styles.battleMenuGrid}>
              {[
                { key: "word", label: "Словесная битва", icon: "🤺" },
                { key: "pairs", label: "Пары-бойцы", icon: "🥊" }
              ].map(b => (
                <TouchableOpacity
                  key={b.key}
                  style={styles.battleMenuButton}
                  onPress={() => handleSelectBattleType(b.key)}
                >
                  <Text style={styles.battleMenuButtonIcon}>{b.icon}</Text>
                  <Text style={styles.battleMenuButtonLabel}>{b.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Список комнат */}
            <Text style={{color:"#fff",marginTop:18,marginBottom:4,fontSize:16,fontWeight:"600"}}>Открытые комнаты</Text>
            <View style={{width:"100%", maxWidth:340}}>
              {battleRooms.length === 0 && (
                <Text style={{color:"#888",textAlign:"center",margin:12}}>Нет доступных комнат</Text>
              )}
              {battleRooms.map(room => (
                <TouchableOpacity
                  key={room.id}
                  style={[styles.battleMenuButton, {flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:8,padding:12,height:64}]}
                  onPress={() => handleJoinRoom(room.id)}
                  disabled={room.players.length >= 2}
                >
                  <View>
                    <Text style={{color:"#fff",fontSize:15,fontWeight:"bold"}}>{room.type === "word" ? "Словесная битва" : "Пары-бойцы"}</Text>
                    <Text style={{color:"#ccc",fontSize:13}}>Ставка: {room.stake} 🧠</Text>
                  </View>
                  <Text style={{color:"#fff",fontSize:15}}>{room.players.length}/2</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {/* Выбор ставки */}
        {selected === "battle" && showStakeModal && (
          <ErrorCatcher>
            <BattleStakeModal
              open={showStakeModal}
              onSelect={handleSelectStake}
              onClose={() => {
                setShowStakeModal(false);
                setBattleType(null);
              }}
            />
          </ErrorCatcher>
        )}
        {/* Комната битвы */}
        {selected === "battle" && currentRoom && (
          <ErrorCatcher>
            <BattleRoom
              room={currentRoom}
              userId={user ? user.id : ""}
              onSetStake={handleSetStake}
              onReady={handleReady}
              onLeave={handleLeaveRoom}
              onStart={() => alert("Батл начался!")}
              isHost={currentRoom.players[0] && user ? currentRoom.players[0].id === user.id : false}
            />
          </ErrorCatcher>
        )}
      </View>

      {/* Нижнее меню */}
      <View style={[styles.bottomMenu, { paddingBottom: insets.bottom }]}>
        {menu.map((item) => (
          <TouchableOpacity
            key={item.key}
            onPress={() => {
              setSelected(item.key);
              setMathGame(null);
            }}
            style={styles.bottomMenuItem}
          >
            <Text style={styles.bottomMenuItemIcon}>{item.icon}</Text>
            <Text style={styles.bottomMenuItemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Модальное окно приглашения */}
      <Modal visible={showInvite} transparent animationType="fade" onRequestClose={() => setShowInvite(false)}>
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.55)",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <View style={{
            backgroundColor: "#23232b",
            borderRadius: 16,
            padding: 28,
            minWidth: 320,
            alignItems: "center"
          }}>
            <Text style={{ color: "#fff", fontSize: 20, marginBottom: 10 }}>Пригласить друзей</Text>
            <Text style={{ color: "#fff" }}>Скопируйте и отправьте ссылку для приглашения:</Text>
            <TextInput
              value="https://game-app.site/invite/ABC123"
              editable={false}
              style={{
                width: 240,
                backgroundColor: "#18181f",
                color: "#fff",
                padding: 10,
                borderRadius: 8,
                fontSize: 16,
                marginTop: 10,
                marginBottom: 10,
                textAlign: "center"
              }}
            />
            <TouchableOpacity
              style={{
                backgroundColor: "#4685ff",
                borderRadius: 8,
                padding: 10,
                marginTop: 10
              }}
              onPress={() => setShowInvite(false)}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>Скопировать</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Модальное окно профиля */}
      {showProfile && (
        <ErrorCatcher>
          <Profile
            user={user}
            coins={coins || 0}
            onClose={() => setShowProfile(false)}
            onLogout={handleLogout}
          />
        </ErrorCatcher>
      )}
    </SafeAreaView>
  );
}

// Глобальный ErrorCatcher для рендера компонент
class ErrorCatcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // Можно логировать ошибку
  }
  render() {
    if (this.state.hasError) {
      return <Text style={{color:"#fff"}}>Ошибка при рендере компонента</Text>;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", padding: 16 },
  coins: { color: "#fff", fontSize: 20, marginRight: 16 },
  profile: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
  profileName: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  mathMenu: {
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    marginTop: 12,
  },
  mathMenuTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 18,
    textAlign: "center",
    color: "#fff",
  },
  mathMenuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 32,
    maxWidth: 340,
  },
  mathMenuButton: {
    backgroundColor: "#101015",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    alignItems: "center",
    marginBottom: 16,
  },
  mathMenuButtonIcon: {
    fontSize: 38,
    marginBottom: 8,
    color: "#fff",
  },
  mathMenuButtonLabel: {
    fontSize: 16,
    color: "#fff",
  },
  bottomMenu: {
    flexDirection: "row",
    height: 70,
    backgroundColor: "#101015",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  bottomMenuItem: {
    flex: 1,
    alignItems: "center",
  },
  bottomMenuItemIcon: {
    fontSize: 26,
    marginBottom: 3,
    color: "#fff",
  },
  bottomMenuItemLabel: {
    color: "#fff",
  },
  battleMenu: {
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    marginTop: 12,
  },
  battleMenuTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 18,
    textAlign: "center",
    color: "#fff",
  },
  battleMenuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 12,
    maxWidth: 340,
  },
  battleMenuButton: {
    backgroundColor: "#101015",
    borderRadius: 12,
    padding: 14,
    width: "48%",
    alignItems: "center",
    marginBottom: 10,
    minHeight: 54,
  },
  battleMenuButtonIcon: {
    fontSize: 32,
    marginBottom: 6,
    color: "#fff",
  },
  battleMenuButtonLabel: {
    fontSize: 15,
    color: "#fff",
  },
});