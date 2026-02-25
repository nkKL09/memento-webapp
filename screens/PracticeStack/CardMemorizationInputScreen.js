// screens/PracticeStack/CardMemorizationInputScreen.js
// Ввод количества карт для запоминания, генерация случайной последовательности
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import playingCards from '../../data/playingCards.js';

const TIME_OPTIONS = [
  { value: 0, label: 'Без времени' },
  { value: 1, label: '1 сек' },
  { value: 2, label: '2 сек' },
  { value: 3, label: '3 сек' },
  { value: 4, label: '4 сек' },
  { value: 5, label: '5 сек' },
  { value: 6, label: '6 сек' },
  { value: 7, label: '7 сек' },
];

function generateRandomSequence(n) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * playingCards.length);
    list.push(playingCards[idx]);
  }
  return list;
}

export default function CardMemorizationInputScreen() {
  const navigation = useNavigation();
  const [countStr, setCountStr] = useState('');
  const [timeExpanded, setTimeExpanded] = useState(false);
  const [secondsPerCard, setSecondsPerCard] = useState(0);

  const count = Math.max(0, parseInt(countStr.replace(/\D/g, ''), 10) || 0);
  const canStart = count >= 1;
  const selectedTimeLabel = TIME_OPTIONS.find((o) => o.value === secondsPerCard)?.label || 'Без времени';

  const onStart = useCallback(() => {
    if (!canStart) return;
    Keyboard.dismiss();
    const sequence = generateRandomSequence(count);
    navigation.navigate('CardMemorizationRun', { sequence, secondsPerCard });
  }, [count, canStart, secondsPerCard, navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Запоминание карт</Text>
        <Text style={styles.hint}>Сколько карт запомнить? (можно больше 52 — каждая выбирается случайно)</Text>
        <TextInput
          style={styles.input}
          value={countStr}
          onChangeText={setCountStr}
          placeholder="Например: 10"
          placeholderTextColor="#64748b"
          keyboardType="number-pad"
        />

        <TouchableOpacity
          style={styles.timeTile}
          onPress={() => setTimeExpanded((e) => !e)}
          activeOpacity={0.8}
        >
          <Text style={styles.timeTileTitle}>Секунд на одну карту</Text>
          <Text style={styles.timeTileValue}>{selectedTimeLabel} {timeExpanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>
        {timeExpanded && (
          <View style={styles.timeOptions}>
            {TIME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.timeOption, secondsPerCard === opt.value && styles.timeOptionActive]}
                onPress={() => { setSecondsPerCard(opt.value); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.timeOptionText, secondsPerCard === opt.value && styles.timeOptionTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, canStart ? styles.buttonActive : styles.buttonDisabled]}
          onPress={onStart}
          disabled={!canStart}
          activeOpacity={canStart ? 0.8 : 1}
        >
          <Text style={styles.buttonText}>Начать</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  scrollContent: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 40 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 12 },
  hint: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 20 },
  input: {
    backgroundColor: '#1a2a35',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 16,
  },
  timeTile: {
    backgroundColor: '#1a2a35',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeTileTitle: { fontSize: 16, color: '#e2e8f0' },
  timeTileValue: { fontSize: 16, color: '#49c0f8', fontWeight: '600' },
  timeOptions: { marginBottom: 16, gap: 8 },
  timeOption: {
    backgroundColor: '#1a2a35',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  timeOptionActive: { backgroundColor: '#334155' },
  timeOptionText: { fontSize: 16, color: '#94a3b8' },
  timeOptionTextActive: { color: '#ffffff', fontWeight: '600' },
  button: {
    height: 56,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonActive: { backgroundColor: '#49c0f8' },
  buttonDisabled: { backgroundColor: '#334155', opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});
