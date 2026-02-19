import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RussianDictionary from "./Dictionary";
import OrthographyTest from "./OrthographyTest";
import WordDefinitionQuiz from "./WordDefinitionQuiz";
import WordFormationChallenge from "./WordFormationChallenge";

// Меню пунктов для русского языка с описаниями для подсказок
const menuItems = [
  { key: "dictionary", label: "Словарь", icon: "📖", description: "Просмотр словаря и значений" },
  { key: "orthography", label: "Орфография", icon: "✍️", description: "Тесты по орфографии" },
  { key: "wordchallenge", label: "Челлендж", icon: "🧩", description: "Задачи на словообразование" },
  { key: "definitionquiz", label: "Викторина", icon: "❓", description: "Викторина по определениям слов" }
];

// Основной компонент меню русского языка
export default function RussianMenu({ onBack, addCoins, coins }) {
  const [mode, setMode] = useState(null);

  // Функция для отображения подсказки при долгом нажатии
  const showTooltip = (description) => {
    Alert.alert("Подсказка", description);
  };

  // Переход к выбранному разделу
  if (mode === "dictionary")
    return <RussianDictionary onBack={() => setMode(null)} />;
  if (mode === "orthography")
    return <OrthographyTest onBack={() => setMode(null)} addCoins={addCoins} />;
  if (mode === "wordchallenge")
    return <WordFormationChallenge onBack={() => setMode(null)} addCoins={addCoins} />;
  if (mode === "definitionquiz")
    return <WordDefinitionQuiz onBack={() => setMode(null)} addCoins={addCoins} />;

  // Главное меню русского языка
  return (
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Русский язык</Text>
        <View style={styles.menuGrid}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuBtn}
              activeOpacity={0.7}
              onPress={() => setMode(item.key)}
              onLongPress={() => showTooltip(item.description)}
            >
              <Text style={styles.iconEmoji}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Кнопка возврата на главный экран */}
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: "center" },
  container: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    marginTop: 24,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    color: "#fff",
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    marginBottom: 32,
  },
  menuBtn: {
    width: 140,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#18181f",
    borderRadius: 18,
    paddingVertical: 32,
    margin: 8, // уменьшен отступ для маленьких экранов
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  iconEmoji: { fontSize: 42, marginBottom: 10 }, // увеличен размер эмодзи для слабовидящих
  menuLabel: { fontSize: 18, color: "#fff", fontWeight: "800" }, // увеличена яркость и толщина шрифта
  backBtn: { marginTop: 18 },
  backText: { color: "#4685ff", fontSize: 18 },
});