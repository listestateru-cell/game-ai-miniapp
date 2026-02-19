import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MathChooseTask({ onBack, addCoins, onFinish, questMode }) {
  const [a, setA] = useState(() => Math.floor(Math.random() * 20) + 10);
  const [b, setB] = useState(() => Math.floor(Math.random() * 20) + 10);
  const [feedback, setFeedback] = useState("");
  const [options, setOptions] = useState(generateOptions(a, b));

  function generateOptions(a, b) {
    const answer = a + b;
    let wrong = new Set();
    while (wrong.size < 3) {
      let fake = answer + Math.floor(Math.random() * 7) - 3;
      if (fake !== answer && fake > 0) wrong.add(fake);
    }
    return shuffle([answer, ...Array.from(wrong)]);
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function nextTask() {
    const na = Math.floor(Math.random() * 20) + 10;
    const nb = Math.floor(Math.random() * 20) + 10;
    setA(na);
    setB(nb);
    setOptions(generateOptions(na, nb));
    setFeedback("");
  }

  function handleChoice(val) {
    if (val === a + b) {
      setFeedback("✅ Верно! +3 🧠");
      addCoins(3);
      if (questMode && onFinish) {
        setTimeout(() => onFinish(), 700);
      } else {
        setTimeout(nextTask, 700);
      }
    } else {
      setFeedback("❌ Неверно!");
      setTimeout(() => setFeedback(""), 700);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>← Математика</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Выбрать из вариантов</Text>
      </View>
      <Text style={styles.question}>
        {a} + {b} = ?
      </Text>
      <View style={styles.optionsRow}>
        {options.map((opt, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleChoice(opt)}
            style={styles.optionBtn}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {feedback ? (
        <Text
          style={[
            styles.feedback,
            feedback.includes("Верно") ? styles.feedbackCorrect : styles.feedbackWrong,
          ]}
        >
          {feedback}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", maxWidth: 340, alignSelf: "center", padding: 10 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 26 },
  backBtn: {
    color: "#4685ff",
    fontSize: 18,
    marginRight: 8,
    fontWeight: "500",
  },
  title: { flex: 1, textAlign: "center", fontSize: 20, fontWeight: "600", color: "#fff" },
  question: { fontSize: 24, textAlign: "center", marginVertical: 36, color: "#fff" },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  optionBtn: {
    backgroundColor: "#23232b",
    borderRadius: 10,
    width: 68,
    height: 54,
    margin: 7,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  optionText: { color: "#fff", fontSize: 20 },
  feedback: { marginTop: 22, fontSize: 20, textAlign: "center" },
  feedbackCorrect: { color: "#2ed573" },
  feedbackWrong: { color: "#ff7675" },
});