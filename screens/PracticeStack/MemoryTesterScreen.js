// screens/PracticeStack/MemoryTesterScreen.js — главный экран: три режима + История
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import { hapticImpact } from '../../telegramWebApp';

export default function MemoryTesterScreen() {
  const navigation = useNavigation();

  const onTilePress = (screen) => {
    hapticImpact('light');
    navigation.navigate(screen);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Memory Tester" showBackButton />
      <TouchableOpacity
        style={styles.tile}
        onPress={() => onTilePress('IntroTestInstruction')}
        activeOpacity={0.8}
      >
        <Text style={styles.tileTitle}>Вводное тестирование</Text>
        <Text style={styles.tileSubtitle}>Проверка фоновых возможностей памяти (20 чисел)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tile}
        onPress={() => onTilePress('TrainingConfig')}
        activeOpacity={0.8}
      >
        <Text style={styles.tileTitle}>Тренировка</Text>
        <Text style={styles.tileSubtitle}>Настраиваемый режим</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tile}
        onPress={() => onTilePress('ExamConfig')}
        activeOpacity={0.8}
      >
        <Text style={styles.tileTitle}>Экзамен</Text>
        <Text style={styles.tileSubtitle}>Коэффициент способности запоминания</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tile}
        onPress={() => onTilePress('ExamHistory')}
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
  content: { paddingHorizontal: 20, paddingBottom: 60 },
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
