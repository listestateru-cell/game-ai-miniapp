import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { loadOzhegovDb } from "./ozhegovDb";

// Список длинных слов
const longWords = [
  "Сельскохозяйственный", "Высокопоставленный", "Человеконенавистничество", "Переосвидетельствование",
  "Электрокардиография", "Субъективизироваться", "Интернационализация", "Сверхпроводимость",
  "Непредсказуемость", "Самоусовершенствование", "Административно-территориальный", "Благотворительность",
  "Государственный", "Квалифицированный", "Контрреформация", "Лесохозяйственный", "Многофункциональный",
  "Нефтеперерабатывающий", "Обезлюдевание", "Параллелограмм", "Полупроводниковый", "Продовольственный",
  "Радиоэлектроника", "Реконструкция", "Самовоспламенение", "Сверхъестественный", "Совершенствование",
  "Соответствующий", "Социокультурный", "Трансформационный", "Ультрафиолетовый", "Фотоэлектрический",
  "Хлоропласты", "Цивилизованность", "Чрезмерность", "Экстраординарный", "Электромагнитный",
  "Экспериментальный", "Энциклопедический", "Юридически-правовой", "Ядероопасный",
  "Антиконституционный", "Гиперчувствительность", "Дезинтегрироваться", "Иммунодефицитный",
  "Инфраструктурный", "Контрреволюционер", "Космополитизм", "Микроскопический", "Трансконтинентальный"
];

// Получить множество лемм из объекта словаря
function getLemmasFromDb(db) {
  return new Set(Object.keys(db).map(l => l.toLowerCase()));
}

// Проверить, можно ли составить слово из букв другого слова
function canFormWord(word, from) {
  let fromLetters = from.toLowerCase().split("");
  for (let char of word.toLowerCase()) {
    let idx = fromLetters.indexOf(char);
    if (idx === -1) return false;
    fromLetters.splice(idx, 1);
  }
  return true;
}

export default function WordFormationChallenge(props) {
  const { onBack, addCoins = () => {} } = props;
  const [lemmas, setLemmas] = useState(null);
  const [currentLongWord, setCurrentLongWord] = useState("");
  const [input, setInput] = useState("");
  const [formedWords, setFormedWords] = useState([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef();
  const [feedback, setFeedback] = useState("");

  // Загрузка лемм из Ожегова через общий модуль
  useEffect(() => {
    loadOzhegovDb().then(db => {
      const set = getLemmasFromDb(db);
      console.log("Лемм в словаре:", set.size, Array.from(set).slice(0, 10));
      setLemmas(set);
    });
  }, []);

  // Запуск новой игры
  function startGame() {
    setCurrentLongWord(longWords[Math.floor(Math.random() * longWords.length)]);
    setInput("");
    setFormedWords([]);
    setScore(0);
    setTime(60);
    setFinished(false);
  }

  useEffect(() => {
    if (!lemmas) return;
    startGame();
    // eslint-disable-next-line
  }, [lemmas]);

  // Таймер
  useEffect(() => {
    if (finished) return;
    if (time === 0) {
      setFinished(true);
      addCoins(score);
      return;
    }
    timerRef.current = setTimeout(() => setTime(time - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [time, finished, score, addCoins]);

  // Добавь очистку таймера при размонтировании
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  function submitWord() {
    const trimmed = input.trim().toLowerCase();
    setInput("");
    if (!trimmed) return;
    if (trimmed.length < 3) {
      setFeedback("Слово должно быть от 3 букв");
      return;
    }
    if (formedWords.includes(trimmed)) {
      setFeedback("Слово уже использовано");
      return;
    }
    if (!canFormWord(trimmed, currentLongWord)) {
      setFeedback("Нельзя составить из этих букв");
      return;
    }
    // Проверка на наличие лемм и что это Set
    if (!lemmas || typeof lemmas.has !== "function" || !lemmas.has(trimmed)) {
      setFeedback("Слово не найдено в словаре Ожегова");
      return;
    }
    setFormedWords(prev => [...prev, trimmed]);
    setScore(prev => prev + trimmed.length);
    setFeedback("");
  }

  // После окончания
  function restart() {
    startGame();
    setFeedback("");
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Русский язык</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Словесный челлендж</Text>
      <View style={styles.wordBox}>
        <Text style={styles.wordBoxLabel}>Исходное слово:</Text>
        <Text style={styles.longWord}>{currentLongWord || "..."}</Text>
      </View>
      <Text style={styles.timer}>Осталось: {time} сек</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          editable={!finished}
          onChangeText={setInput}
          placeholder="Введите слово"
          placeholderTextColor="#888"
          style={styles.input}
          onSubmitEditing={submitWord}
        />
        <TouchableOpacity
          style={[styles.okBtn, finished && { backgroundColor: "#888" }]}
          onPress={submitWord}
          disabled={finished}
        >
          <Text style={styles.okBtnText}>OK</Text>
        </TouchableOpacity>
      </View>
      {feedback ? (
        <Text style={styles.feedback}>{feedback}</Text>
      ) : null}
      <Text style={styles.stats}>
        Слов: {formedWords.length} &nbsp;|&nbsp; Мозгокоинов: {score}
      </Text>
      <View style={styles.wordsList}>
        {formedWords.length === 0
          ? <Text style={styles.wordsEmpty}>Пока ни одного слова</Text>
          : formedWords.map((w, i) =>
            <Text key={w} style={styles.wordItem}>{i + 1}. {w}</Text>
          )
        }
      </View>
      {finished && (
        <View style={styles.finishedBox}>
          <Text style={styles.finishedTitle}>⏰ Время вышло!</Text>
          <Text style={styles.finishedStats}>
            Вы составили <Text style={{ fontWeight: "700" }}>{formedWords.length}</Text> слов {"\n"}
            Заработали: <Text style={{ fontWeight: "700" }}>{score}</Text> 🧠
          </Text>
          <TouchableOpacity style={styles.restartBtn} onPress={restart}>
            <Text style={styles.restartBtnText}>Снова</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 500,
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
    textAlign: "center",
    fontSize: 22,
    color: "#fff",
    marginBottom: 10,
  },
  wordBox: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 18,
    alignItems: "center",
  },
  wordBoxLabel: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  longWord: {
    fontSize: 32,
    color: "#ffe066",
    letterSpacing: 2,
    textAlign: "center",
    fontWeight: "700",
    wordBreak: "break-word",
  },
  timer: {
    textAlign: "center",
    fontSize: 18,
    color: "#ff7675",
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 20,
    borderRadius: 8,
    borderWidth: 0,
    width: 200,
    backgroundColor: "#23232b",
    color: "#fff",
  },
  okBtn: {
    marginLeft: 8,
    backgroundColor: "#4685ff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 22,
  },
  okBtnText: {
    color: "#fff",
    fontSize: 18,
  },
  feedback: {
    textAlign: "center",
    color: "#ff7675",
    fontSize: 17,
    marginBottom: 8,
  },
  stats: {
    textAlign: "center",
    fontSize: 19,
    color: "#fff",
    marginBottom: 10,
  },
  wordsList: {
    backgroundColor: "#23232b",
    borderRadius: 12,
    minHeight: 80,
    maxHeight: 250,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    marginBottom: 18,
  },
  wordsEmpty: {
    color: "#888",
    textAlign: "center",
    marginTop: 12,
  },
  wordItem: {
    color: "#ffe066",
    marginVertical: 2,
    fontSize: 18,
  },
  finishedBox: {
    marginVertical: 18,
    backgroundColor: "#202026",
    color: "#2ed573",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 10,
    fontSize: 22,
    alignItems: "center",
  },
  finishedTitle: {
    fontSize: 22,
    color: "#2ed573",
    marginBottom: 7,
    textAlign: "center",
    fontWeight: "700",
  },
  finishedStats: {
    fontSize: 19,
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  restartBtn: {
    marginTop: 16,
    backgroundColor: "#4685ff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  restartBtnText: {
    color: "#fff",
    fontSize: 19,
  },
});