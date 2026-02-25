// screens/PracticeStack/MemoryTesterScreen.js — главный экран: три режима + История
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function MemoryTesterScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Memory Tester</Text>

      <TouchableOpacity
        style={styles.tile}
        onPress={() => navigation.navigate('IntroTestInstruction')}
        activeOpacity={0.8}
      >
        <Text style={styles.tileTitle}>Вводное тестирование</Text>
        <Text style={styles.tileSubtitle}>Проверка фоновых возможностей памяти (20 чисел)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tile}
        onPress={() => navigation.navigate('TrainingConfig')}
        activeOpacity={0.8}
      >
        <Text style={styles.tileTitle}>Тренировка</Text>
        <Text style={styles.tileSubtitle}>Настраиваемый режим</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tile}
        onPress={() => navigation.navigate('ExamConfig')}
        activeOpacity={0.8}
      >
        <Text style={styles.tileTitle}>Экзамен</Text>
        <Text style={styles.tileSubtitle}>Коэффициент способности запоминания</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tile}
        onPress={() => navigation.navigate('ExamHistory')}
        activeOpacity={0.8}
      >
        <Text style={styles.tileTitle}>История</Text>
        <Text style={styles.tileSubtitle}>Результаты прошлых попыток</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  content: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 60 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 28 },
  tile: {
    backgroundColor: '#1a2a35',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tileTitle: { fontSize: 18, fontWeight: '600', color: '#ffffff' },
  tileSubtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
});
