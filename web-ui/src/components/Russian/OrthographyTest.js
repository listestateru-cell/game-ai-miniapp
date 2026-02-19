import { useEffect, useState } from "react";
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { loadOzhegovDb } from "./ozhegovDb";

// Функция: выбрать все слова нужной длины
function getWordsByLength(db, length) {
  return Object.keys(db).filter(word => word.length === length && /^[А-ЯЁ]+$/.test(word));
}

// Перемешать буквы
function shuffleWord(word) {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

// Найти все анаграммы из словаря для набора букв scrambled
function getAnagrams(db, scrambled) {
  const sorted = scrambled.split("").sort().join("");
  return Object.keys(db).filter(word =>
    word.length === scrambled.length &&
    word.split("").sort().join("") === sorted
  );
}

export default function OrthographyTest(props) {
  const { onBack, addCoins = () => {} } = props;
  const [db, setDb] = useState(null);
  const [word, setWord] = useState("");
  const [scrambled, setScrambled] = useState("");
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showCorrect, setShowCorrect] = useState(false);

  // Загружаем словарь через общий модуль
  useEffect(() => {
    loadOzhegovDb().then(setDb);
  }, []);

  // Загружаем новое слово (и сбрасываем состояния)
  function nextWord() {
    if (!db) return;
    const words4 = getWordsByLength(db, 4);
    if (words4.length === 0) return;
    const original = words4[Math.floor(Math.random() * words4.length)];
    let scrambledWord = shuffleWord(original);
    while (scrambledWord === original && words4.length > 1) {
      scrambledWord = shuffleWord(original);
    }
    setWord(original);
    setScrambled(scrambledWord);
    setInput("");
    setFeedback("");
    setShowCorrect(false);
  }

  // При первой загрузке базы — первый раз nextWord
  useEffect(() => {
    if (db) nextWord();
  }, [db]);

  // Проверка ответа
  function check() {
    if (showCorrect) return;
    const answer = input.trim().toUpperCase();
    const possible = getAnagrams(db, scrambled);

    if (possible.includes(answer)) {
      setFeedback(`✅ Верно! +20 🧠\n${db[answer]}`);
      addCoins(20);
      setTimeout(nextWord, 1800);
    } else {
      setFeedback(
        `❌ Неверно!\nЗагаданное слово: "${word}"\n\n${db[word]}`
      );
      setShowCorrect(true);
    }
    Keyboard.dismiss();
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Русский язык</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Орфографический тест</Text>
      <View style={styles.scrambledBox}>
        <Text style={styles.scrambledText}>{scrambled || "Загрузка..."}</Text>
      </View>
      <View style={styles.inputWrap}>
        <TextInput
          value={input}
          editable={!showCorrect}
          onChangeText={setInput}
          placeholder="Ваш ответ"
          placeholderTextColor="#888"
          style={styles.input}
          autoCapitalize="characters"
          autoCorrect={false}
          onSubmitEditing={check}
        />
        <TouchableOpacity
          style={[styles.checkBtn, showCorrect && { backgroundColor: "#888" }]}
          onPress={check}
          disabled={showCorrect}
        >
          <Text style={styles.checkBtnText}>Проверить</Text>
        </TouchableOpacity>
      </View>
      {feedback ? (
        <View style={[
          styles.feedbackBox,
          feedback.includes("Верно") ? styles.feedbackCorrect : styles.feedbackWrong
        ]}>
          <Text style={styles.feedbackText}>{feedback}</Text>
          {showCorrect && (
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => {
                setShowCorrect(false);
                setFeedback("");
                nextWord();
              }}
            >
              <Text style={styles.nextBtnText}>Дальше</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 420,
    alignSelf: "center",
    marginTop: 30,
    paddingHorizontal: 10,
    paddingBottom: 40,
    color: "#fff",
  },
  backBtn: {
    marginVertical: 18,
    alignSelf: "flex-start",
  },
  backBtnText: {
    color: "#4685ff",
    fontSize: 18,
    fontWeight: "500",
  },
  title: {
    fontWeight: "700",
    marginBottom: 12,
    fontSize: 22,
    color: "#fff",
    textAlign: "center",
  },
  scrambledBox: {
    backgroundColor: "#18181f",
    padding: 22,
    borderRadius: 14,
    fontSize: 36,
    alignItems: "center",
    letterSpacing: 6,
    marginBottom: 20,
    minHeight: 64,
    justifyContent: "center",
  },
  scrambledText: {
    fontSize: 36,
    color: "#fff",
    letterSpacing: 6,
    textAlign: "center",
  },
  inputWrap: {
    alignItems: "center",
    marginBottom: 12,
  },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 22,
    borderRadius: 8,
    borderWidth: 0,
    width: 180,
    backgroundColor: "#23232b",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  checkBtn: {
    marginTop: 8,
    backgroundColor: "#4685ff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  checkBtnText: {
    color: "#fff",
    fontSize: 20,
  },
  feedbackBox: {
    marginTop: 20,
    fontSize: 20,
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
  },
  feedbackText: {
    fontSize: 20,
    textAlign: "center",
    color: "#fff",
    marginBottom: 8,
  },
  feedbackCorrect: {
    backgroundColor: "#2ed57333",
  },
  feedbackWrong: {
    backgroundColor: "#ff767533",
  },
  nextBtn: {
    marginTop: 10,
    backgroundColor: "#4685ff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 18,
  },
});