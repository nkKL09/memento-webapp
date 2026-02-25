// screens/PracticeStack/MemoryTester/TrainingResultScreen.js — результат тренировки + разбор ошибок
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function TrainingResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const correctCount = route.params?.correctCount ?? 0;
  const total = route.params?.total ?? 0;
  const errors = route.params?.errors ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Результат тренировки</Text>
      <Text style={styles.score}>Правильно: {correctCount} из {total}</Text>
      {errors.length > 0 && (
        <View style={styles.errorsBlock}>
          <Text style={styles.errorsTitle}>Ошибки (позиция → показано / введено)</Text>
          {errors.map((e, i) => (
            <View key={i} style={styles.errorRow}>
              <Text style={styles.errorPos}>{e.position}.</Text>
              <Text style={styles.errorCorrect}>{e.correct}</Text>
              <Text style={styles.errorSep}>→</Text>
              <Text style={styles.errorAnswered}>{e.answered}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TrainingConfig')} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Ещё раз</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => navigation.navigate('MemoryTester')} activeOpacity={0.8}>
          <Text style={styles.buttonText}>В главное меню</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  content: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 60 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 24 },
  score: { fontSize: 28, fontWeight: '700', color: '#49c0f8', textAlign: 'center', marginBottom: 24 },
  errorsBlock: { marginBottom: 24 },
  errorsTitle: { fontSize: 16, fontWeight: '600', color: '#94a3b8', marginBottom: 12 },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  errorPos: { width: 28, fontSize: 14, color: '#e2e8f0' },
  errorCorrect: { flex: 1, fontSize: 14, color: '#22c55e' },
  errorSep: { fontSize: 14, color: '#64748b', marginHorizontal: 6 },
  errorAnswered: { flex: 1, fontSize: 14, color: '#ef4444' },
  buttons: { gap: 12 },
  button: { height: 56, borderRadius: 26, backgroundColor: '#49c0f8', justifyContent: 'center', alignItems: 'center' },
  buttonSecondary: { backgroundColor: '#334155' },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});
