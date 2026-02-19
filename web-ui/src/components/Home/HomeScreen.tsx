import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CategoryCard } from '../ui/CategoryCard';

interface HomeScreenProps {
  onOpenSection: (section: 'math' | 'russian' | 'battle') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenSection }) => {
  return (
    <View style={styles.container}>
      <CategoryCard title="Math" onPress={() => onOpenSection('math')} />
      <CategoryCard title="Russian" onPress={() => onOpenSection('russian')} />
      <CategoryCard title="Battles" onPress={() => onOpenSection('battle')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
});