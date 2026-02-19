import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MathBlankTask from '../Math/MathBlankTask';
import MathBrainQuest from '../Math/MathBrainQuest';
import MathChooseTask from '../Math/MathChooseTask';
import MathEnterTask from '../Math/MathEnterTask';
import MathPairTask from '../Math/MathPairTask';
import MathstoryTask from '../Math/MathstoryTask';

const mathGames = [
  { key: "enter", label: "Ввести ответ", icon: "🔢" },
  { key: "choose", label: "Выбрать из вариантов", icon: "📚" },
  { key: "pair", label: "Соединить пары", icon: "🔗" },
  { key: "blank", label: "Пустые квадратики", icon: "⬜" },
  { key: "story", label: "Текстовые задачи", icon: "📖" },
  { key: "brainquest", label: "Мозговой квест", icon: "🧩" }
];

interface MathHubProps {
  addCoins: (amount: number) => void;
  mathGame: string | null;
  onSelectGame: (game: string | null) => void;
  onBackToHome: () => void;
}

export const MathHub: React.FC<MathHubProps> = ({ addCoins, mathGame, onSelectGame, onBackToHome }) => {

  const renderGame = () => {
    switch (mathGame) {
      case 'enter':
        return <MathEnterTask onBack={() => onSelectGame(null)} addCoins={() => addCoins(10)} onFinish={() => {}} questMode={null} />;
      case 'choose':
        return <MathChooseTask onBack={() => onSelectGame(null)} addCoins={addCoins} onFinish={() => {}} questMode={null} />;
      case 'pair':
        return <MathPairTask onBack={() => onSelectGame(null)} addCoins={addCoins} onFinish={() => {}} questMode={null} />;
      case 'blank':
        return <MathBlankTask onBack={() => onSelectGame(null)} addCoins={addCoins} />;
      case 'story':
        return <MathstoryTask onBack={() => onSelectGame(null)} addCoins={addCoins} onFinish={() => {}} questMode={null} />;
      case 'brainquest':
        return <MathBrainQuest onBack={() => onSelectGame(null)} addCoins={addCoins} />;
      default:
        return null;
    }
  };

  if (mathGame) {
    return renderGame();
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBackToHome}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.grid}>
        {mathGames.map(game => (
          <TouchableOpacity key={game.key} style={styles.gameCard} onPress={() => onSelectGame(game.key)}>
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
});