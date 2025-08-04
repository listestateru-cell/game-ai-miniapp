import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MathPairTask from "../Math/MathPairTask";
import BattlePlayersPanel from "./BattlePlayersPanel";

export default function MathPairBattle({ room, userId, stake, onWin, onLeave }) {
  const [startTime, setStartTime] = useState(null);
  const [finished, setFinished] = useState(false);
  const [time, setTime] = useState(null);

  // useEffect должен быть до любых return/if!
  useEffect(() => {
    if (room.players.length === 2 && !startTime) {
      setStartTime(Date.now());
    }
  }, [room.players.length, startTime]);

  function handleFinish() {
    const finishTime = Date.now();
    const myTime = ((finishTime - startTime) / 1000).toFixed(2);
    setTime(myTime);
    setFinished(true);
    onWin && onWin(userId, myTime);
  }

  // 1. Ждём соперника
  if (room.players.length < 2) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Батл: Соединить пары</Text>
        <Text style={styles.roomId}>
          ID комнаты: <Text style={styles.roomIdValue}>{room.id}</Text>
        </Text>
        <BattlePlayersPanel players={room.players} userId={userId} stake={room.stake} />
        <TouchableOpacity style={styles.exitButton} onPress={onLeave}>
          <Text style={styles.exitButtonText}>Выйти</Text>
        </TouchableOpacity>
        <Text style={styles.waitingText}>Ожидание соперника...</Text>
      </ScrollView>
    );
  }

  // 2. Показываем игру, если оба игрока и не завершено
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Батл: Соединить пары</Text>
      <Text style={styles.roomId}>
        ID комнаты: <Text style={styles.roomIdValue}>{room.id}</Text>
      </Text>
      <BattlePlayersPanel players={room.players} userId={userId} stake={room.stake} />
      {!finished ? (
        <MathPairTask
          taskData={room.pairTask}
          onBack={onLeave}
          addCoins={() => {}}
          questMode={true}
          onFinish={handleFinish}
        />
      ) : (
        <View style={styles.finishedContainer}>
          <TouchableOpacity style={styles.exitButton} onPress={onLeave}>
            <Text style={styles.exitButtonText}>Выйти</Text>
          </TouchableOpacity>
          <Text style={styles.finishedText}>
            Ваше время: <Text style={styles.boldText}>{time} сек</Text>
          </Text>
          <Text style={styles.finishedText}>Ожидаем соперника...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 700,
    marginHorizontal: "auto",
    padding: 24,
    backgroundColor: "#000", // assuming black background as original had white text
    flexGrow: 1,
  },
  title: {
    textAlign: "center",
    color: "#fff",
    fontSize: 24,
    marginBottom: 16,
  },
  roomId: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
    color: "#fff",
  },
  roomIdValue: {
    color: "#aaa",
  },
  exitButton: {
    position: "absolute",
    right: 24,
    top: 24,
  },
  exitButtonText: {
    color: "#ff7675",
    fontSize: 18,
  },
  waitingText: {
    textAlign: "center",
    fontSize: 24,
    marginTop: 40,
    color: "#fff",
  },
  finishedContainer: {
    marginTop: 40,
    position: "relative",
    alignItems: "center",
  },
  finishedText: {
    fontSize: 28,
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
  },
  boldText: {
    fontWeight: "bold",
  },
});