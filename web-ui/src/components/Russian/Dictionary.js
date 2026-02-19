import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { loadOzhegovDb } from "./ozhegovDb";

// Точный поиск форм
function getWordForms(db, base) {
  // Ищем все формы: ТОК, ТОК1, ТОК2...
  const exactForms = Object.keys(db).filter(k =>
    k === base || (k.startsWith(base) && /^[0-9]+$/.test(k.slice(base.length)))
  );
  return exactForms;
}

export default function RussianDictionary({ onBack }) {
  const [db, setDb] = useState(null);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState("");
  const [definition, setDefinition] = useState("");

  useEffect(() => {
    loadOzhegovDb().then(setDb); // или setLemmas
  }, []);

  useEffect(() => {
    if (!db || !input) {
      setSuggestions([]);
      return;
    }

    const norm = input.trim().toUpperCase();

    // Ищем все слова, начинающиеся с введенного текста
    let matches = Object.keys(db).filter(word => word.startsWith(norm));

    // Ограничиваем количество предложений
    matches = matches.slice(0, 10);

    setSuggestions(matches);
  }, [input, db]);

  function handleSelect(word) {
    setSelected(word);
    // Показываем все формы слова
    const forms = getWordForms(db, word);
    if (forms.length > 1) {
      setDefinition(
        forms.map(f => `${f}:\n${db[f]}`).join("\n\n")
      );
    } else {
      setDefinition(db[word]);
    }
    setSuggestions([]);
    setInput(word);
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Русский язык</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Словарь Ожегова</Text>
      <TextInput
        value={input}
        onChangeText={text => {
          setInput(text);
          setSelected("");
          setDefinition("");
        }}
        placeholder="Введите слово..."
        placeholderTextColor="#888"
        style={styles.input}
      />
      {suggestions.length > 0 && (
        <View style={styles.suggestionsBox}>
          {suggestions.map(word => (
            <TouchableOpacity key={word} onPress={() => handleSelect(word)}>
              <Text style={styles.suggestion}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {selected ? (
        <View style={styles.definitionBox}>
          <Text style={styles.definitionText}>{definition}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 450,
    alignSelf: "center",
    marginTop: 30,
    paddingHorizontal: 10,
    paddingBottom: 40,
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
  input: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 20,
    borderRadius: 8,
    borderWidth: 0,
    width: "100%",
    marginBottom: 12,
    backgroundColor: "#23232b",
    color: "#fff",
  },
  suggestionsBox: {
    backgroundColor: "#18181f",
    borderRadius: 8,
    marginBottom: 14,
    alignItems: "stretch",
  },
  suggestion: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    color: "#fff",
    fontSize: 19,
  },
  definitionBox: {
    backgroundColor: "#202026",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginTop: 10,
  },
  definitionText: {
    color: "#fff",
    fontSize: 18,
    whiteSpace: "pre-wrap", // для web, на RN не влияет
  },
});