// screens/PracticeStack/CardMemorizationResultsScreen.js
// Итоги: время запоминания, время проверки, количество ошибок, список ошибок
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const SUIT_SYMBOLS = { 'Т': '♣', 'Ч': '♥', 'Б': '♦', 'П': '♠' };
const SUIT_COLORS = { 'Т': '#ffffff', 'Ч': '#ff4d4d', 'Б': '#ff4d4d', 'П': '#ffffff' };

function formatCard(num) {
  if (!num || num.length < 2) return num;
  const suit = num[0];
  const rank = num.slice(1);
  const sym = SUIT_SYMBOLS[suit];
  const color = SUIT_COLORS[suit] || '#ffffff';
  return { sym, rank, color };
}

function formatMs(ms) {
  if (ms == null || ms < 0) return '0 сек';
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / 60000);
  if (min > 0) return `${min} мин ${sec} сек`;
  return `${sec} сек`;
}

export default function CardMemorizationResultsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { timeMem = 0, timeCheck = 0, errors = [], total = 0 } = route.params || {};
  const correct = total - errors.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator>
      <Text style={styles.header}>Результаты</Text>

      <View style={styles.block}>
        <Text style={styles.label}>Время запоминания</Text>
        <Text style={styles.value}>{formatMs(timeMem)}</Text>
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>Время проверки</Text>
        <Text style={styles.value}>{formatMs(timeCheck)}</Text>
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>Правильно</Text>
        <Text style={styles.value}>{correct} из {total}</Text>
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>Ошибок</Text>
        <Text style={[styles.value, errors.length > 0 && styles.valueError]}>{errors.length}</Text>
      </View>

      {errors.length > 0 && (
        <>
          <Text style={styles.errorsTitle}>Ошибки:</Text>
          <View style={styles.errorsBlock}>
            {errors.map((e, i) => {
              const exp = formatCard(e.expectedNum);
              const act = formatCard(e.actualNum);
              return (
                <View key={i} style={styles.errorRow}>
                  <Text style={styles.errorPos}>Позиция {e.position}</Text>
                  <Text style={styles.errorText}>
                    Вы: <Text style={{ color: act.color }}>{act.sym}</Text>{act.rank} — правильно: <Text style={{ color: exp.color }}>{exp.sym}</Text>{exp.rank}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PracticeScreen')} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Завершить</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  scrollContent: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 40 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 24 },
  block: { backgroundColor: '#1a2a35', borderRadius: 16, padding: 16, marginBottom: 12 },
  label: { fontSize: 14, color: '#94a3b8', marginBottom: 4 },
  value: { fontSize: 22, fontWeight: '600', color: '#ffffff' },
  valueError: { color: '#f87171' },
  errorsTitle: { fontSize: 18, fontWeight: '600', color: '#f87171', marginTop: 8, marginBottom: 12 },
  errorsBlock: { marginBottom: 16 },
  errorRow: { marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  errorPos: { fontSize: 14, color: '#94a3b8', marginBottom: 4 },
  errorText: { fontSize: 15, color: '#e2e8f0' },
  button: { backgroundColor: '#49c0f8', height: 56, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});
