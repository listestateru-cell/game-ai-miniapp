import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface CategoryCardProps {
  title: string;
  onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181f',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});