import { useEffect, useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BattleRoom from "../Battles/BattleRoom";

const demoRoom = {
  id: "room42",
  type: "Словесная битва",
  players: [
    { id: "1", name: "Иван", avatar: "И", stake: 15, ready: true },
    { id: "2", name: "Лена", avatar: "Л", stake: 12, ready: false },
  ],
};

export default function BattleRoomPage({ room: propRoom, userId: propUserId }) {
  const [room, setRoom] = useState(propRoom || demoRoom);
  const [userId, setUserId] = useState(propUserId || (demoRoom.players[1] && demoRoom.players[1].id));

  useEffect(() => {
    if (propRoom) {
      setRoom(propRoom);
    }
  }, [propRoom]);

  useEffect(() => {
    if (propUserId) {
      setUserId(propUserId);
    }
  }, [propUserId]);

  function handleSetStake(amount) {
    if (!userId) return;
    console.log(`Пользователь ${userId} установил ставку: ${amount}`);
    setRoom((r) => ({
      ...r,
      players: r.players.map((p) =>
        p.id === userId ? { ...p, stake: amount } : p
      ),
    }));
  }
  function handleReady() {
    if (!userId) return;
    console.log(`Пользователь ${userId} готов`);
    setRoom((r) => ({
      ...r,
      players: r.players.map((p) =>
        p.id === userId ? { ...p, ready: true } : p
      ),
    }));
  }
  function handleLeave() {
    if (!userId) return;
    console.log(`Пользователь ${userId} вышел из комнаты`);
    setRoom(demoRoom);
  }
  function handleStart() {
    console.log("Батл начался!");
    if (Platform.OS === "web") {
      alert("Батл начался!");
    }
  }

  const isRoomEmpty =
    !room || !room.players || room.players.length === 0;

  const isHost = room && room.players && userId && room.players[0].id === userId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Батл-комната</Text>

        {isRoomEmpty ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🕳️</Text>
            <Text style={styles.emptyText}>Комната пуста, попробуйте позже.</Text>
          </View>
        ) : (
          <View style={styles.battleRoomWrapper}>
            <BattleRoom
              room={room || demoRoom}
              userId={userId}
              onSetStake={handleSetStake}
              onReady={handleReady}
              onLeave={handleLeave}
              onStart={handleStart}
              isHost={isHost}
            />
          </View>
        )}

        <TouchableOpacity
          onPress={handleLeave}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Назад в меню</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#23232b",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    color: "#ffe066",
    fontWeight: "bold",
    marginBottom: 14,
    userSelect: "none",
  },
  emptyContainer: {
    maxWidth: 650,
    width: "100%",
    alignItems: "center",
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 80,
    lineHeight: 80,
  },
  emptyText: {
    color: "#ffe066",
    fontSize: 28,
    textAlign: "center",
    userSelect: "none",
  },
  battleRoomWrapper: {
    maxWidth: 650,
    width: "100%",
  },
  backButton: {
    marginTop: 24,
    backgroundColor: "#ffe066",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    maxWidth: 650,
    width: "100%",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#23232b",
    userSelect: "none",
  },
});