import { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const battles = [
  { key: "word", icon: "🧠", title: "Словесная битва", desc: "Угадай слова, соревнуясь с противником!" },
  { key: "pairs", icon: "🧩", title: "Соединить пары", desc: "Соедини пары быстрее всех — проверим твою реакцию." },
  { key: "speed", icon: "🏃", title: "На скорость", desc: "Кто быстрее решит примеры? Битва на скорость!" },
];

export default function BattleMenu({ onSelectType, rooms, onJoinRoom }) {
  const [activeIdx, setActiveIdx] = useState(null);

  // Фильтруем только реальные комнаты с одним игроком (для Join)
  const availableRooms = Array.isArray(rooms)
    ? rooms.filter(
        room =>
          room &&
          typeof room === "object" &&
          Array.isArray(room.players) &&
          room.players.length === 1 &&
          !room.started
      )
    : [];

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Выберите битву</Text>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {battles.map((b, idx) => (
          <TouchableOpacity
            key={b.key}
            style={[
              styles.button,
              activeIdx === idx && Platform.OS === "web" && styles.buttonActive
            ]}
            activeOpacity={0.84}
            onPress={() => onSelectType && onSelectType(b.key)}
            onMouseEnter={() => Platform.OS === "web" && setActiveIdx(idx)}
            onMouseLeave={() => Platform.OS === "web" && setActiveIdx(null)}
          >
            <Text style={styles.emoji}>{b.icon}</Text>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonText}>{b.title}</Text>
              <Text style={styles.buttonDesc}>{b.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.roomsBlock}>
          <Text style={styles.roomsTitle}>Открытые комнаты</Text>
          {availableRooms.length > 0 ? (
            availableRooms.map(room => {
              const roomType =
                room.type === "word"
                  ? "Словесная битва"
                  : room.type === "pairs"
                  ? "Пары"
                  : room.type;
              return (
                <View key={room.id} style={styles.roomCard}>
                  <Text style={styles.roomInfo}>
                    {roomType} · {room.stake} 🧠
                  </Text>
                  <TouchableOpacity
                    style={styles.joinButton}
                    onPress={() => onJoinRoom && onJoinRoom(room.id)}
                  >
                    <Text style={styles.joinButtonText}>Присоединиться</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <Text style={styles.noRoomsText}>Нет свободных комнат</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#23232b",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    paddingTop: 38,
    width: "100%",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#ffe066",
    textAlign: "center",
    width: "100%",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 50,
    minWidth: 320,
    width: "100%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#32325e",
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderRadius: 18,
    width: 380,
    maxWidth: "97vw",
    minWidth: 280,
    marginBottom: 26,
    minHeight: 90,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  buttonActive: Platform.OS === "web" ? {
    backgroundColor: "#38418a",
    shadowColor: "#4685ff",
    shadowOpacity: 0.18,
    shadowRadius: 15,
    borderWidth: 2,
    borderColor: "#ffe066"
  } : {},
  emoji: {
    fontSize: 46,
    marginRight: 22,
  },
  buttonTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 7,
    textAlign: "left",
  },
  buttonDesc: {
    color: "#ffe066",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "left",
    opacity: 0.86,
    flexWrap: "wrap",
  },
  roomsBlock: {
    marginTop: 36,
    width: "100%",
    alignItems: "center",
  },
  roomsTitle: {
    color: "#ffe066",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  roomCard: {
    backgroundColor: "#232342",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    minWidth: 260,
    maxWidth: 360,
    width: "96%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  roomInfo: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  joinButton: {
    backgroundColor: "#4685ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  noRoomsText: {
    color: "#aaa",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
  },
});