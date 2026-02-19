import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const russianGames = [
  { key: "words", label: "Слова", icon: "🅰️" },
  { key: "spelling", label: "Ударения", icon: "✍️" },
  { key: "grammar", label: "Правописание", icon: "📚" },
  { key: "reading", label: "Синонимы", icon: "📖" }
];

interface RussianHubProps {
  onBackToHome: () => void;
}

export const RussianHub: React.FC<RussianHubProps> = ({ onBackToHome }) => {

  const renderGame = () => {
    if (selectedGame) {
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{selectedGame} - Coming soon</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedGame(null)}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  if (selectedGame) {
    return renderGame();
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBackToHome}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.grid}>
        {russianGames.map(game => (
          <TouchableOpacity key={game.key} style={styles.gameCard} onPress={() => setSelectedGame(game.key)}>
            <Text style={styles.icon}>{game.icon}</Text>
            <Text style={styles.label}>{game.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  backButton: {
    backgroundColor: '#18181f',
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#fff',
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gameCard: {
    backgroundColor: '#18181f',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    marginBottom: 10,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
});