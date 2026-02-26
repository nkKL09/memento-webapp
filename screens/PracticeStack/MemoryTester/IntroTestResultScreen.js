// screens/PracticeStack/MemoryTester/IntroTestResultScreen.js — результат вводного теста (в историю не сохраняем)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../../components/ScreenHeader';

export default function IntroTestResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const correctCount = route.params?.correctCount ?? 0;
  const total = route.params?.total ?? 20;

  const isBelowNorm = correctCount < 5;
  const interpretation = isBelowNorm
    ? 'Ниже нормы. Освоение мнемотехники может потребовать больше усилий.'
    : 'Норма и выше. Мнемотехнику освоить реально.';

  return (
    <View style={styles.container}>
      <ScreenHeader title="Результат" showBackButton />
      <Text style={styles.score}>Правильно: {correctCount} из {total}</Text>
      <Text style={styles.interpretation}>{interpretation}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('IntroTestInstruction')} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Ещё раз</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => navigation.navigate('MemoryTester')} activeOpacity={0.8}>
          <Text style={styles.buttonText}>В главное меню</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24', paddingTop: 18, paddingHorizontal: 20 },
  score: { fontSize: 28, fontWeight: '700', color: '#49c0f8', textAlign: 'center', marginBottom: 16 },
  interpretation: { fontSize: 16, color: '#e2e8f0', lineHeight: 24, textAlign: 'center', marginBottom: 32 },
  buttons: { gap: 12 },
  button: {
    height: 56,
    borderRadius: 26,
    backgroundColor: '#49c0f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSecondary: { backgroundColor: '#334155' },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});
