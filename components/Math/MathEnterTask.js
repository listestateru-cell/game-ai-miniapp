import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function MathEnterTask({ onBack, addCoins, onFinish, questMode }) {
  const [a, setA] = useState(() => Math.floor(Math.random() * 20) + 1);
  const [b, setB] = useState(() => Math.floor(Math.random() * 20) + 1);
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState("");

  function nextTask() {
    setA(Math.floor(Math.random() * 20) + 1);
    setB(Math.floor(Math.random() * 20) + 1);
    setValue("");
    setFeedback("");
  }

  function checkAnswer() {
    if (parseInt(value, 10) === a + b) {
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
        <Text style={styles.title}>Ввести ответ</Text>
      </View>
      <Text style={styles.question}>
        {a} + {b} = ?
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder="Введите ответ..."
        placeholderTextColor="#888"
        keyboardType="numeric"
        returnKeyType="done"
        onSubmitEditing={checkAnswer}
      />
      <TouchableOpacity style={styles.button} onPress={checkAnswer}>
        <Text style={styles.buttonText}>Проверить</Text>
      </TouchableOpacity>
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
  input: {
    backgroundColor: "#23232b",
    color: "#fff",
    fontSize: 18,
    borderRadius: 7,
    padding: 10,
    marginBottom: 18,
    borderWidth: 0,
    textAlign: "center",
  },
  button: {
    marginTop: 12,
    backgroundColor: "#4685ff",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18 },
  feedback: { marginTop: 20, fontSize: 20, textAlign: "center" },
  feedbackCorrect: { color: "#2ed573" },
  feedbackWrong: { color: "#ff7675" },
});