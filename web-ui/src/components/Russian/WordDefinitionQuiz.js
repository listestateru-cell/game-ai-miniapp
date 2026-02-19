import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { loadOzhegovDb } from "./ozhegovDb";

// Универсальный парсер: возвращает [{lemma, definition}]
function parseOzhegovEntries(db) {
  return Object.entries(db)
    .map(([lemma, definition]) => ({
      lemma: lemma.toLowerCase(),
      definition: definition.trim()
    }))
    .filter(e => e.lemma.length > 2 && e.definition.length > 6);
}

function shuffle(arr) {
  let a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WordDefinitionQuiz({ onBack, addCoins = () => {} }) {
  const [entries, setEntries] = useState([]);
  const [current, setCurrent] = useState(null); // {lemma, definition}
  const [options, setOptions] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Загрузка словаря через общий модуль
  useEffect(() => {
    loadOzhegovDb().then(db => {
      const parsed = parseOzhegovEntries(db);
      setEntries(parsed);
    });
  }, []);

  // Генерация нового вопроса
  function nextQuestion() {
    setDisabled(false);
    setFeedback("");
    if (!entries.length) return;
    const entry = entries[Math.floor(Math.random() * entries.length)];
    // Найти 2 других случайных, не совпадающих с правильным
    let distractors = shuffle(entries.filter(e => e.lemma !== entry.lemma)).slice(0, 2);
    let opts = shuffle([entry.definition, ...distractors.map(e => e.definition)]);
    setCurrent(entry);
    setOptions(opts);
  }

  // Генерируем первый вопрос
  useEffect(() => {
    if (entries.length > 0) nextQuestion();
    // eslint-disable-next-line
  }, [entries]);

  function handleAnswer(option) {
    if (disabled) return;
    setDisabled(true);
    if (option === current.definition) {
      setFeedback("✅ Верно! +10 🧠");
      addCoins(10);
      setTimeout(() => {
        setFeedback("");
        nextQuestion();
      }, 1200);
    } else {
      setFeedback(`❌ Неверно! \n${current.lemma}: ${current.definition}`);
      setTimeout(() => {
        setFeedback("");
        nextQuestion();
      }, 1500);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Русский язык</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Словесная викторина</Text>
      {current && (
        <View style={styles.questionBox}>
          <Text style={styles.questionText}>
            Какое определение у слова:
          </Text>
          <Text style={styles.lemmaText}>{current.lemma}</Text>
        </View>
      )}
      <ScrollView style={{maxHeight: 260}} contentContainerStyle={styles.optionsBox}>
        {options.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            disabled={disabled}
            onPress={() => handleAnswer(option)}
            style={[
              styles.optionBtn,
              disabled && { opacity: 0.7 }
            ]}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {feedback ? (
        <View style={[
          styles.feedbackBox,
          feedback.startsWith("✅") ? styles.feedbackCorrect : styles.feedbackWrong
        ]}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 600,
    alignSelf: "center",
    marginTop: 10, // было 30
    paddingHorizontal: 5, // было 10
    paddingBottom: 20, // было 40
    color: "#fff",
  },
  backBtn: {
    marginVertical: 10, // было 18
    alignSelf: "flex-start",
  },
  backBtnText: {
    color: "#4685ff",
    fontSize: 15, // было 18
    fontWeight: "500",
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6, // было 10
    fontSize: 18, // было 22
    color: "#fff",
  },
  questionBox: {
    marginVertical: 10, // было 22
    alignItems: "center",
  },
  questionText: {
    fontSize: 15, // было 20
    fontWeight: "600",
    color: "#ffe066",
    textAlign: "center",
    marginBottom: 4, // было 6
  },
  lemmaText: {
    fontSize: 22, // было 31
    color: "#ffe066",
    fontWeight: "700",
    textAlign: "center",
  },
  optionsBox: {
    marginBottom: 12, // было 24
    maxWidth: 520,
    alignSelf: "center",
    width: "100%",
    maxHeight: 260, // ограничение по высоте
  },
  optionBtn: {
    paddingVertical: 10, // было 16
    paddingHorizontal: 7, // было 10
    backgroundColor: "#23232b",
    borderRadius: 10,
    marginBottom: 10, // было 18
    marginHorizontal: 0,
    textAlign: "left",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  optionText: {
    color: "#fff",
    fontSize: 14, // было 18
    textAlign: "left",
  },
  feedbackBox: {
    borderRadius: 8,
    fontSize: 16, // было 22
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8, // было 10
    padding: 8, // было 13
    alignItems: "center",
  },
  feedbackCorrect: {
    backgroundColor: "#2ed573",
  },
  feedbackWrong: {
    backgroundColor: "#ff7675",
  },
  feedbackText: {
    color: "#fff",
    fontSize: 16, // было 22
    fontWeight: "700",
    textAlign: "center",
  },
});