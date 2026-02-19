import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const mathGames = [
  { key: "enter", label: "Ввести ответ", icon: "⌨️" },
  { key: "choose", label: "Выбрать", icon: "🔘" },
  { key: "pair", label: "Пары", icon: "🔗" },
  { key: "blank", label: "Квадратики", icon: "⬜️" },
  { key: "story", label: "Текст", icon: "📜" },
  { key: "brainquest", label: "Квест", icon: "🧠" }
];

export default function MathGames({ onSelectGame, onBack }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Математика</Text>
      <View style={styles.grid}>
        {mathGames.map((game) => (
          <TouchableOpacity
            key={game.key}
            style={styles.gameBtn}
            onPress={() => onSelectGame(game.key)}
          >
            <Text style={styles.gameIcon}>{game.icon}</Text>
            <Text style={styles.gameLabel}>{game.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Назад</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
    marginTop: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 18,
    textAlign: "center",
    color: "#fff",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 32,
  },
  gameBtn: {
    backgroundColor: "#18181f",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    alignItems: "center",
    marginBottom: 24,
  },
  gameIcon: {
    fontSize: 38,
    marginBottom: 8,
    color: "#fff",
  },
  gameLabel: {
    fontSize: 16,
    color: "#fff",
  },
  backBtn: {
    marginTop: 8,
    padding: 8,
  },
  backBtnText: {
    color: "#4685ff",
    fontSize: 17,
  },
});