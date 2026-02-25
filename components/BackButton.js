import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const styles = StyleSheet.create({
  wrap: { marginBottom: 16, alignSelf: 'flex-start' },
  wrapInRow: { marginBottom: 0, alignSelf: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#49c0f8',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    minHeight: 44,
  },
  text: { fontSize: 16, color: '#ffffff', fontWeight: '600', textAlign: 'center' },
});

export default function BackButton({ style, inRow }) {
  const navigation = useNavigation();

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <TouchableOpacity
      style={[inRow ? styles.wrapInRow : styles.wrap, styles.pill, style]}
      onPress={() => navigation.goBack()}
      activeOpacity={0.85}
    >
      <Text style={styles.text}>Назад</Text>
    </TouchableOpacity>
  );
}
