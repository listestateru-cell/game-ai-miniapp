import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import STORY_TASKS from "./storyTasks";

const START_LEVEL = 1;

function getRandomQuestion(level, prevIdx = null) {
  const levelTasks = STORY_TASKS.filter(q => q.level === level);
  if (!levelTasks.length) return null;
  let idx;
  do {
    idx = Math.floor(Math.random() * levelTasks.length);
  } while (levelTasks.length > 1 && idx === prevIdx);
  return { ...levelTasks[idx], idx };
}

export default function MathstoryTask({ onBack, addCoins }) {
  const [level, setLevel] = useState(START_LEVEL);
  const [question, setQuestion] = useState(() => getRandomQuestion(START_LEVEL));
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState("");
  const [prevIdx, setPrevIdx] = useState(question?.idx);

  function nextQuestion(newLevel = level) {
    const nextQ = getRandomQuestion(newLevel, prevIdx);
    setQuestion(nextQ);
    setPrevIdx(nextQ?.idx);
    setValue("");
    setFeedback("");
  }

  function checkAnswer() {
    if (!question) return;
    const normalizedAnswer = String(question.answer).replace(",", ".").trim();
    const normalizedInput = String(value).replace(",", ".").trim();
    if (normalizedInput === normalizedAnswer) {
      setFeedback("✅ Верно! +5 🧠");
      addCoins && addCoins(5);
      setTimeout(() => nextQuestion(), 1200);
    } else {
      setFeedback("❌ Неверно! Попробуй еще раз.");
    }
  }

  function handleLevelChange(dir) {
    let newLevel = level + dir;
    const maxLevel = Math.max(...STORY_TASKS.map(q => q.level));
    if (newLevel < 1) newLevel = 1;
    if (newLevel > maxLevel) newLevel = maxLevel;
    setLevel(newLevel);
    setTimeout(() => nextQuestion(newLevel), 200);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>← Математика</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Текстовые задачи</Text>
        <Text style={styles.levelBox}>Уровень {level}</Text>
      </View>
      {/* Вопрос */}
      <View style={styles.questionBox}>
        <Text style={styles.questionText}>
          {question ? question.text : "Нет задач для этого уровня."}
        </Text>
      </View>
      {/* Ввод ответа */}
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Введите ответ..."
          placeholderTextColor="#888"
          style={styles.input}
          keyboardType="default"
          returnKeyType="done"
          onSubmitEditing={checkAnswer}
        />
        <TouchableOpacity style={styles.checkBtn} onPress={checkAnswer}>
          <Text style={styles.checkBtnText}>Проверить</Text>
        </TouchableOpacity>
      </View>
      {/* Фидбек */}
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
      {/* Переключение уровня */}
      <View style={styles.levelSwitch}>
        <TouchableOpacity style={styles.levelBtn} onPress={() => handleLevelChange(-1)}>
          <Text style={styles.levelBtnText}>← уровень</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.levelBtn} onPress={() => handleLevelChange(1)}>
          <Text style={styles.levelBtnText}>уровень →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    marginTop: 24,
    color: "#fff",
    paddingHorizontal: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
    justifyContent: "space-between",
  },
  backBtn: {
    color: "#4685ff",
    fontSize: 18,
    marginRight: 8,
    fontWeight: "500",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  levelBox: {
    marginLeft: 8,
    fontSize: 17,
    color: "#ffd166",
    fontWeight: "600",
  },
  questionBox: {
    backgroundColor: "#18181f",
    color: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 13,
    fontSize: 18,
    marginBottom: 26,
    minHeight: 78,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 3,
    justifyContent: "center",
  },
  questionText: {
    color: "#fff",
    fontSize: 18,
  },
  inputWrap: {
    alignItems: "center",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#23232b",
    color: "#fff",
    fontSize: 18,
    borderRadius: 7,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 18,
    width: 140,
    textAlign: "center",
  },
  checkBtn: {
    backgroundColor: "#4685ff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  checkBtnText: {
    color: "#fff",
    fontSize: 18,
  },
  feedback: {
    marginTop: 20,
    fontSize: 20,
    textAlign: "center",
  },
  feedbackCorrect: {
    color: "#2ed573",
  },
  feedbackWrong: {
    color: "#ff7675",
  },
  levelSwitch: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },
  levelBtn: {
    backgroundColor: "#444",
    borderRadius: 7,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  levelBtnText: {
    color: "#fff",
    fontSize: 16,
  },
});