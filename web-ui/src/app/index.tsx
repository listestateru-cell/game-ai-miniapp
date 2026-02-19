// src/App.js

import { generatePairs } from '@game/core';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { AppState, Image, Modal, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import BattleMenu from "../components/Battles/BattleMenu";
import BattleRoom from "../components/Battles/BattleRoom";
import BattleStakeModal from "../components/Battles/BattleStakeModal";
import { HomeScreen } from "../components/Home/HomeScreen";
import Profile from "../components/Profile/Profile";
import Login from "../components/Registr/Login";
import Registration from "../components/Registr/Registration";
import useCoins from "../hooks/useCoins";
import { getUser } from "../src/apiClient";

const API_BASE = Platform.OS === 'web'
  ? 'http://localhost:3030'
  : 'http://172.20.10.3:3030'; // ← вот тут новый IP!

// Battle server URL (укажи свой IP/порт если не localhost)
const BATTLE_API_URL = Platform.OS === 'web'
  ? "http://localhost:4000"
  : "http://<ТВОЙ_IP>:4000";

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
  require("../assets/images/fox.png"),
  require("../assets/images/hedgehog.png"),
  require("../assets/images/hare.png"),
  require("../assets/images/bear.png"),
  require("../assets/images/owl.png"),
  require("../assets/images/wolf.png"),
];
const avatarNames = ["лиса", "ёж", "заяц", "медведь", "сова", "волк"];

interface IUser {
  id: string;
  username?: string;
  name?: string;
  coins?: number;
  avatar?: number | string;
}
interface IBattleRoom {
  id: string;
  type: string;
  stake: number;
  players: IUser[];
  createdAt: number;
  started: boolean;
  pairTask?: any;
}

export default function App() {
  const [user, setUser] = useState<IUser | null>(null);
  const { coins, addCoins, setCoinsDirect, fetchCoinsFromServer } = useCoins();
  const [battleRooms, setBattleRooms] = useState<IBattleRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<IBattleRoom | null>(null);
  const [selected, setSelected] = useState<string>("home");
  const [showInvite, setShowInvite] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [mathGame, setMathGame] = useState<string | null>(null);
  const [stake, setStake] = useState<number>(100);
  const [battleType, setBattleType] = useState<string | null>(null);
  const [showStakeModal, setShowStakeModal] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(false);

  const insets = useSafeAreaInsets();

  const battleTypes = [
    { key: "word", label: "Словесная битва" },
    { key: "pairs", label: "Соединить пары" }
  ];

  // === BATTLE: Загрузка комнат с сервера ===
  async function fetchBattleRooms(): Promise<void> {
    try {
      const res = await fetch(`${BATTLE_API_URL}/battles`);
      const data = await res.json();
      setBattleRooms(data);
    } catch (e) {
      setBattleRooms([]);
    }
  }

  // Загрузка пользователя при старте
  useEffect(() => {
    async function loadUser() {
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        try {
          const fresh = await getUser(parsed.id);
          setUser(fresh);
          setCoinsDirect(fresh.coins || 0);
          await AsyncStorage.setItem("user", JSON.stringify(fresh));
        } catch {
          setUser(parsed);
          setCoinsDirect(parsed.coins || 0);
        }
      }
    }
    loadUser();
  }, []);

  // Синхронизация при возврате из фона
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && user?.id) {
        fetchCoinsFromServer();
        getUser(user.id).then(fresh => {
          setUser(fresh);
          AsyncStorage.setItem("user", JSON.stringify(fresh));
        });
      }
    });
    return () => sub.remove();
  }, [user]);


  async function handleRegister(newUser: IUser): Promise<void> {
    setUser(newUser);
    setCoinsDirect(newUser.coins || 0);
    try {
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
    } catch (e) {
      console.error("Failed to save user to AsyncStorage", e);
    }
  }

  async function handleLogout(): Promise<void> {
    try {
      await AsyncStorage.removeItem("user");
    } catch (e) {
      console.error("Failed to remove user from AsyncStorage", e);
    }
    setUser(null);
    setCoinsDirect(0);
    setSelected("home");
    setMathGame(null);
    setCurrentRoom(null);
    setBattleType(null);
  }

  // === BATTLE: Создание комнаты на сервере ===
  async function handleSelectStake(amount: number): Promise<void> {
    setStake(amount);
    setShowStakeModal(false);
    if (!user) {
      setShowLogin(true);
      return;
    }
    try {
      const res = await fetch(`${BATTLE_API_URL}/battles/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user,
          type: battleType,
          stake: amount,
        }),
      });
      const newRoom = await res.json();
      setCurrentRoom(newRoom as IBattleRoom);
      await fetchBattleRooms();
    } catch {
      // ошибка — не создаём комнату
    }
  }

  // === BATTLE: Присоединение к комнате через сервер ===
  async function handleJoinRoom(roomId: string): Promise<void> {
    if (!user) {
      setShowLogin(true);
      return;
    }
    try {
      const res = await fetch(`${BATTLE_API_URL}/battles/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, user }),
      });
      const updatedRoom = await res.json();
      setCurrentRoom(updatedRoom as IBattleRoom);
      await fetchBattleRooms();
    } catch {
      // не удалось присоединиться
    }
  }

  function handleSetStake(amount: number): void {
    setCurrentRoom((room: IBattleRoom | null): IBattleRoom | null => {
      if (!room) return null;
      return {
        ...room,
        players: room.players.map(p =>
          p.id === (user ? user.id : null) ? { ...p, stake: amount } : p
        )
      };
    });
  }

  function handleReady(): void {
    setCurrentRoom((room: IBattleRoom | null): IBattleRoom | null => {
      if (!room) return null;
      return {
        ...room,
        players: room.players.map(p =>
          p.id === (user ? user.id : null) ? { ...p, ready: true } : p
        )
      };
    });
  }

  function handleSelectBattleType(type: string): void {
    setBattleType(type);
    setShowStakeModal(true);
  }

  useEffect(() => {
    if (
      currentRoom &&
      currentRoom.type === "pairs" &&
      currentRoom.players.length === 2 &&
      !currentRoom.pairTask
    ) {
      const pairTask = generatePairs();
      setBattleRooms(rooms =>
        rooms.map(r =>
          r.id === currentRoom.id ? { ...r, pairTask } : r
        )
      );
    }
  }, [currentRoom]);

  // === BATTLE: Авто-загрузка battleRooms при открытии вкладки и каждые 3 сек ===
  useEffect(() => {
    if (selected === "battle") {
      fetchBattleRooms();
      const interval = setInterval(fetchBattleRooms, 3000);
      return () => clearInterval(interval);
    }
  }, [selected]);

  // === ВАЖНО: вычисление индекса аватара пользователя ===
  let avatarIdx = 0;
  if (user) {
    if (typeof user.avatar === "number") {
      avatarIdx = user.avatar;
    } else if (typeof user.avatar === "string") {
      avatarIdx = avatarNames.indexOf(user.avatar);
      if (avatarIdx < 0) avatarIdx = 0;
    }
  }

  // Синхронизация при возврате приложения из фона
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        fetchCoinsFromServer();
      }
    });
    return () => subscription.remove();
  }, [user]);

  // Синхронизация при переходе на главную вкладку
  useEffect(() => {
    if (selected === "home") {
      fetchCoinsFromServer();
    }
  }, [selected]);

  // Если пользователь не зарегистрирован, показываем форму регистрации/входа
  if (!user) {
    return showLogin ? (
      <Login
        onLogin={handleRegister}
        onGoToRegister={() => setShowLogin(false)}
      />
    ) : (
      <Registration
        onRegister={handleRegister}
        onGoToLogin={() => setShowLogin(true)}
      />
    );
  }

  // Главный экран игры с вкладками, меню, аватаром, монетами и модальными окнами
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
      {Platform.OS === "ios" && <StatusBar barStyle="light-content" />}
      {Platform.OS === "android" && <StatusBar backgroundColor="#000" barStyle="light-content" />}
      {/* Верхняя панель */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setShowInvite(true)}>
          <Text style={styles.emoji}>🤝🏼</Text>
        </TouchableOpacity>
        <Text style={styles.coins}>{coins || 0} 🧠</Text>
        <TouchableOpacity style={styles.profile} onPress={() => setShowProfile(true)}>
          <Image source={avatarImages[avatarIdx]} style={styles.avatar} />
          <Text style={styles.profileName}>{user.username || user.name || "Игрок"}</Text>
        </TouchableOpacity>
      </View>

      {/* Центральная область контента */}
      <View style={styles.center}>
        {/* Главная вкладка */}
        {selected === "home" && (
          <HomeScreen onOpenSection={setSelected} />
        )}

        {/* Математика */}
        {selected === "math" && (
          <MathHub addCoins={addCoins} mathGame={mathGame} onSelectGame={setMathGame} onBackToHome={() => { setMathGame(null); setSelected("home"); }} />
        )}

        {/* Русский язык */}
        {selected === "russian" && (
          <RussianHub onBackToHome={() => setSelected("home")} />
        )}

        {/* Битвы */}
        {selected === "battle" && !currentRoom && !battleType && (
          <BattleMenu rooms={battleRooms} onSelectType={handleSelectBattleType} onJoinRoom={handleJoinRoom} />
        )}
        {selected === "battle" && showStakeModal && (
          <BattleStakeModal
            open={showStakeModal}
            onSelect={handleSelectStake}
            onClose={() => setShowStakeModal(false)}
            user={user}
            battleType={battleType}
          />
        )}
        {selected === "battle" && currentRoom && (
          <BattleRoom
            room={currentRoom}
            userId={user ? user.id : ""}
            onSetStake={handleSetStake}
            onReady={handleReady}
            onLeave={() => {
              setCurrentRoom(null);
              setBattleType(null);
            }}
            onStart={() => alert("Батл начался!")}
            isHost={currentRoom.players[0] && user ? currentRoom.players[0].id === user.id : false}
          />
        )}
      </View>

      {/* Нижнее меню вкладок */}
      <View style={[styles.bottomMenu, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {menu.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.bottomMenuButton,
              selected === tab.key && styles.bottomMenuButtonActive
            ]}
            onPress={() => {
              setSelected(tab.key);
              setMathGame(null);
              setBattleType(null);
              setCurrentRoom(null);
            }}
          >
            <Text
              style={[
                styles.bottomMenuIcon,
                selected === tab.key ? styles.bottomMenuIconActive : styles.bottomMenuIconInactive
              ]}
            >
              {tab.icon}
            </Text>
            <Text
              style={[
                styles.bottomMenuLabel,
                selected === tab.key ? styles.bottomMenuLabelActive : styles.bottomMenuLabelInactive
              ]}
            >
              {tab.label}
            </Text>
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
        <Profile user={user} coins={coins || 0} onClose={() => setShowProfile(false)} onLogout={handleLogout} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 0,
    paddingBottom: 0,
    margin: 0,
    // Removed width: "100vw", height: "100vh", minHeight, minWidth for mobile compatibility
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingHorizontal: 24,
    height: 64,
  },
  emoji: { fontSize: 26, color: "#fff" },
  coins: { fontSize: 19, fontWeight: "700", color: "#fff" },
  profile: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 8 },
  profileName: { fontSize: 17, fontWeight: "600", color: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 84 },
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
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "rgba(20,20,30,0.93)",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 74,
    paddingHorizontal: 10,
    borderTopWidth: 0,
    zIndex: 999,
    // paddingBottom динамически добавляется в компоненте
  },
  bottomMenuButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  bottomMenuButtonActive: {
    backgroundColor: "rgba(70,133,255,0.14)",
  },
  bottomMenuIcon: {
    fontSize: 28,
    marginBottom: 2,
  },
  bottomMenuIconActive: {
    color: "#4685ff",
  },
  bottomMenuIconInactive: {
    color: "#e5e5e5",
  },
  bottomMenuLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  bottomMenuLabelActive: {
    color: "#4685ff",
  },
  bottomMenuLabelInactive: {
    color: "#fff",
    opacity: 0.8,
  },
});