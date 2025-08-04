import { Image, StyleSheet, Text, View } from "react-native";

export default function BattlePlayersPanel({ players, userId, stake }) {
  // Первый игрок — всегда текущий пользователь, второй — соперник (если есть)
  const me = players.find(p => p.id === userId);
  const opponent = players.find(p => p.id !== userId);

  const getAvatarSource = (avatar) => {
    if (typeof avatar === "number") {
      return { uri: `/avatars/${avatar}.png` };
    }
    if (typeof avatar === "string") {
      return { uri: avatar };
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Мой персонаж */}
      <View style={styles.playerContainer}>
        {me.avatar ? (
          <Image
            source={getAvatarSource(me.avatar)}
            style={[styles.avatar, styles.meAvatar]}
          />
        ) : (
          <Text style={[styles.avatar, styles.meAvatar, styles.defaultAvatar]}>🧑‍🚀</Text>
        )}
        <Text style={styles.playerName}>{me.name}</Text>
        <Text style={styles.meStake}>Ставка: {me.stake || stake} 🧠</Text>
        <Text style={styles.playerLevel}>Уровень: {me.level || 1}</Text>
      </View>
      {/* VS */}
      <Text style={styles.vs}>VS</Text>
      {/* Соперник */}
      <View style={styles.playerContainer}>
        {opponent ? (
          <>
            {opponent.avatar ? (
              <Image
                source={getAvatarSource(opponent.avatar)}
                style={[styles.avatar, styles.opponentAvatar]}
              />
            ) : (
              <Text style={[styles.avatar, styles.opponentAvatar, styles.defaultAvatar]}>🧑‍💼</Text>
            )}
            <Text style={styles.playerName}>{opponent.name}</Text>
            <Text style={styles.opponentStake}>Ставка: {opponent.stake || stake} 🧠</Text>
            <Text style={styles.playerLevel}>Уровень: {opponent.level || 1}</Text>
          </>
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingIcon}>⏳</Text>
            <Text style={styles.waitingText}>Ждём соперника...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 18,
    paddingHorizontal: 12,
    backgroundColor: "#23232b",
    borderRadius: 24,
    shadowColor: "#000",
    elevation: 6,
  },
  playerContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 18,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 5,
    backgroundColor: "#191925",
    marginBottom: 8,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 60,
  },
  meAvatar: {
    borderColor: "#ffe066",
  },
  opponentAvatar: {
    borderColor: "#4685ff",
  },
  defaultAvatar: {
    color: "#fff",
    lineHeight: 100,
  },
  playerName: {
    fontWeight: "bold",
    fontSize: 22,
    color: "#fff",
    marginTop: 12,
  },
  meStake: {
    color: "#ffe066",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  opponentStake: {
    color: "#4685ff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  playerLevel: {
    color: "#aaa",
    fontSize: 18,
    marginTop: 4,
  },
  vs: {
    fontSize: 40,
    fontWeight: "900",
    color: "#ffe066",
    marginHorizontal: 32,
    letterSpacing: 3,
  },
  waitingContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  waitingIcon: {
    fontSize: 48,
    color: "#bbb",
  },
  waitingText: {
    color: "#bbb",
    fontSize: 19,
    marginTop: 20,
    textAlign: "center",
  },
});