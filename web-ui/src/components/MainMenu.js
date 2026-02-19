import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Стандартный массив доступных игр/режимов для меню
const defaultMathGames = [
  { key: "enter", label: "Ввести ответ", icon: "⌨️" },
  { key: "choose", label: "Выбрать", icon: "🔘" },
  { key: "pair", label: "Пары", icon: "🔗" },
  { key: "blank", label: "Квадратики", icon: "⬜️" },
  { key: "story", label: "Текст", icon: "📜" },
  { key: "brainquest", label: "Квест", icon: "🧠" }
];

// Массивы аватаров и имён
const avatarImages = [
  require("../assets/images/fox.png"),
  require("../assets/images/hedgehog.png"),
  require("../assets/images/hare.png"),
  require("../assets/images/bear.png"),
  require("../assets/images/owl.png"),
  require("../assets/images/wolf.png"),
];
const avatarNames = ["лиса", "ёж", "заяц", "медведь", "сова", "волк"];

let avatarIdx = typeof user.avatar === "number"
  ? user.avatar
  : avatarNames.indexOf(user.avatar);

if (avatarIdx < 0) avatarIdx = 0;

export default function MainMenu({ onSelect, mathGames = defaultMathGames, selected }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem("user").then(stored => {
      if (stored) setUser(JSON.parse(stored));
    });
  }, []);

  if (!user) return <Text style={{ marginTop: 80, color: "#fff" }}>Загрузка...</Text>;

  // Получаем индекс аватара
  let avatarIdx = typeof user.avatar === "number"
    ? user.avatar
    : avatarNames.indexOf(user.avatar);

  // Если индекс не найден, ставим 0 (лиса)
  if (avatarIdx < 0) avatarIdx = 0;

  return (
    <View>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        {/* <Image
          source={avatarImages[avatarIdx]}
          style={styles.avatarBig}
        />
        <Text style={styles.avatarName}>
          {avatarNames[avatarIdx]}
        </Text>
        <Text style={{ color: "#FFD700", fontWeight: "700", fontSize: 20, marginBottom: 4 }}>
          {user.username || user.name}
        </Text> */}
        {/* В центре */}
        <Image source={avatarImages[avatarIdx]} style={styles.avatarBig} />
      </View>
      <View style={styles.menuGrid}>
        {mathGames.map(game => {
          const isSelected = selected === game.key;
          return (
            <TouchableOpacity
              key={game.key}
              style={[styles.menuButton, isSelected && styles.menuButtonSelected]}
              onPress={() => onSelect(game.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{game.icon}</Text>
              <Text style={styles.menuLabel}>{game.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {/* В углу */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image source={avatarImages[avatarIdx]} style={styles.avatarSmall} />
        <Text style={styles.nickname}>{user.username || "Игрок"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuGrid: {
    marginTop: 34,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuButton: {
    backgroundColor: "#18181f",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: "48%",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "transparent",
  },
  menuButtonSelected: {
    borderColor: "#FFD700",
  },
  menuIcon: {
    fontSize: 44,
    marginBottom: 14,
  },
  menuLabel: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  avatarBig: {
    width: 120,
    height: 160,
    resizeMode: "contain",
    marginBottom: 10,
    borderRadius: 24,
    backgroundColor: "#23232b",
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  nickname: {
    color: "#FFD700",
    fontWeight: "700",
    fontSize: 16,
  },
});