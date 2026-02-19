// src/Battles/BattleRoom.js
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import BattlePlayersPanel from "./BattlePlayersPanel";
import MathPairBattle from "./MathPairBattle";

export default function BattleRoom({
  room,
  userId,
  word = '',
  onSendWord = () => {},
  words = [],
  timeLeft = 0,
  onSetStake = (amount) => {},
  onReady = () => {},
  onLeave = () => {},
  onStart = () => {},
  isHost = false,
  onWin = () => {}
}) {
  const [input, setInput] = useState("");

  // Защита от отсутствия room или room.players
  if (!room || !room.players) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>Комната не найдена или еще не создана.</Text>
        <TouchableOpacity style={styles.leaveButton} onPress={onLeave}>
          <Text style={styles.leaveButtonText}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Проверка на тип "pairs"
  if (room.type === "pairs") {
    return (
      <MathPairBattle
        room={room}
        userId={userId}
        stake={room.stake}
        onWin={onWin}
        onLeave={onLeave}
      />
    );
  }

  // Общие элементы для других типов битв
  const allReady = room.players.every(p => p.ready);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.battleIcon}>
        {room.type === "pairs" ? "🔗" : "🧠"}
      </Text>
      <Text style={styles.title}>
        Батл: {room.type ? room.type : "Неизвестно"}
      </Text>
      <View style={styles.roomIdContainer}>
        <Text style={styles.roomIdText}>ID комнаты: </Text>
        <Text style={styles.roomIdValue}>{room.id || "–"}</Text>
      </View>
      <Text style={styles.subtitle}>Участники:</Text>
      <BattlePlayersPanel players={room.players} userId={userId} stake={room.stake} />

      <TouchableOpacity style={styles.leaveButton} onPress={onLeave}>
        <Text style={styles.leaveButtonText}>Выйти</Text>
      </TouchableOpacity>

      <View style={styles.separator} />

      {room.players.length < 2 ? (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingIcon}>⏳</Text>
          <Text style={styles.waitingText}>Ждём соперника...</Text>
        </View>
      ) : (
        <>
          <View style={styles.wordContainer}>
            <Text style={styles.wordLabel}>Исходное слово:{"\n"}</Text>
            <Text style={styles.wordValue}>{word || "—"}</Text>
          </View>
          <Text style={styles.timeLeft}>
            Осталось: {typeof timeLeft === "number" ? timeLeft : 0}s
          </Text>
          <View style={styles.form}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Введите слово"
              style={styles.input}
              placeholderTextColor="#888"
              autoCorrect={false}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => {
                if (input.trim()) {
                  onSendWord(input.trim());
                  setInput("");
                }
              }}
            >
              <Text style={styles.sendButtonText}>Отправить</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.wordsCount}>
            Составлено: {Array.isArray(words) ? words.length : 0} слов
          </Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 600,
    marginHorizontal: "auto",
    padding: 32,
    backgroundColor: "#23232b",
    borderRadius: 24,
    position: "relative",
    color: "#fff",
    elevation: 9,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    alignItems: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#23232b",
    padding: 40,
  },
  infoText: {
    color: "#ffe066",
    fontSize: 20,
    marginBottom: 24,
    textAlign: "center"
  },
  battleIcon: {
    fontSize: 44,
    marginBottom: 10,
    textAlign: "center",
  },
  title: {
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 22,
    color: "#ffe066",
    textAlign: "center",
  },
  roomIdContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 14,
  },
  roomIdText: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
  },
  roomIdValue: {
    fontSize: 20,
    color: "#aaa",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 14,
    textAlign: "center",
  },
  leaveButton: {
    position: "absolute",
    right: 16,
    top: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: "#333",
    borderRadius: 14,
  },
  leaveButtonText: {
    color: "red",
    fontSize: 21,
    fontWeight: "bold",
    textAlign: "center",
  },
  waitingContainer: {
    marginVertical: 32,
    alignItems: "center",
  },
  waitingIcon: {
    fontSize: 48,
    color: "#ffe066",
    marginBottom: 12,
    textAlign: "center",
  },
  waitingText: {
    color: "#ffe066",
    fontSize: 26,
    marginVertical: 32,
    textAlign: "center",
    fontWeight: "700",
  },
  wordContainer: {
    backgroundColor: "#191925",
    borderRadius: 14,
    padding: 18,
    marginVertical: 32,
    alignItems: "center",
    width: "100%",
  },
  wordLabel: {
    fontSize: 27,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  wordValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffe066",
    textAlign: "center",
  },
  timeLeft: {
    fontSize: 28,
    color: "#ff4d4f",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "700",
  },
  form: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 18,
    alignItems: "center",
  },
  input: {
    fontSize: 23,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 9,
    borderWidth: 0,
    backgroundColor: "#222",
    color: "#fff",
    marginRight: 12,
    width: 230,
    textAlign: "center",
  },
  sendButton: {
    backgroundColor: "#ffe066",
    borderRadius: 9,
    paddingVertical: 12,
    paddingHorizontal: 28,
    minWidth: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#222",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
  },
  wordsCount: {
    fontSize: 23,
    color: "#fff",
    marginTop: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  separator: {
    width: "100%",
    height: 1,
    backgroundColor: "#444",
    marginVertical: 24,
  },
});