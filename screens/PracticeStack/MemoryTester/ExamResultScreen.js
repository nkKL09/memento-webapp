// Результат экзамена: коэффициент, ошибки, сохранение в историю
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../../components/ScreenHeader';
import { addExamResult, removeExamResult } from './examHistory';

function formatCoefficient(k) {
  if (Number.isInteger(k * 100)) return (k * 100).toFixed(0) + '%';
  return (k * 100).toFixed(1).replace('.', ',') + '%';
}

export default function ExamResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const correctCount = route.params?.correctCount ?? 0;
  const total = route.params?.total ?? 0;
  const coefficient = route.params?.coefficient ?? 0;
  const errors = route.params?.errors ?? [];
  const moduleId = route.params?.moduleId ?? '';
  const moduleName = route.params?.moduleName ?? '';
  const count = route.params?.count ?? 0;
  const startTime = route.params?.startTime;
  const endTime = route.params?.endTime;
  const savedRef = useRef(false);

  const fromHistory = route.params?.fromHistory === true;
  const examId = route.params?.examId;

  const onDeleteRecord = () => {
    if (examId == null) return;
    Alert.alert(
      'Удалить запись?',
      'Результат будет удалён без возможности восстановления.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: async () => {
          await removeExamResult(examId);
          navigation.goBack();
        } },
      ]
    );
  };

  useEffect(() => {
    if (fromHistory || savedRef.current || startTime == null || endTime == null) return;
    savedRef.current = true;
    addExamResult({
      moduleId,
      moduleName,
      count,
      correct: correctCount,
      total,
      coefficient,
      startTime,
      endTime,
      errors,
    });
  }, [fromHistory, startTime, endTime, moduleId, moduleName, count, correctCount, total, coefficient, errors]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Результат экзамена" showBackButton />
      <Text style={styles.score}>Правильно: {correctCount} из {total}</Text>
      <View style={styles.coefBlock}>
        <Text style={styles.coefLabel}>Коэффициент запоминания</Text>
        <Text style={styles.coefValue}>K = {coefficient.toFixed(2).replace('.', ',')}</Text>
        <Text style={styles.coefPercent}>{formatCoefficient(coefficient)}</Text>
      </View>
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
      {!fromHistory && <Text style={styles.savedHint}>Результат сохранён в историю</Text>}
      <View style={styles.buttons}>
        {!fromHistory && (
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ExamConfig')} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Ещё раз</Text>
          </TouchableOpacity>
        )}
        {fromHistory && (
          <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={onDeleteRecord} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Удалить запись</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.button, (fromHistory ? null : styles.buttonSecondary)]} onPress={() => (fromHistory ? navigation.goBack() : navigation.navigate('MemoryTester'))} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{fromHistory ? 'Назад к истории' : 'В главное меню'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  content: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 60 },
  score: { fontSize: 28, fontWeight: '700', color: '#49c0f8', textAlign: 'center', marginBottom: 16 },
  coefBlock: { alignItems: 'center', marginBottom: 24, paddingVertical: 16, paddingHorizontal: 20, backgroundColor: '#1a2a35', borderRadius: 12 },
  coefLabel: { fontSize: 14, color: '#94a3b8', marginBottom: 4 },
  coefValue: { fontSize: 26, fontWeight: '700', color: '#ffffff' },
  coefPercent: { fontSize: 18, color: '#49c0f8', marginTop: 4 },
  errorsBlock: { marginBottom: 24 },
  errorsTitle: { fontSize: 16, fontWeight: '600', color: '#94a3b8', marginBottom: 12 },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  errorPos: { width: 28, fontSize: 14, color: '#e2e8f0' },
  errorCorrect: { flex: 1, fontSize: 14, color: '#22c55e' },
  errorSep: { fontSize: 14, color: '#64748b', marginHorizontal: 6 },
  errorAnswered: { flex: 1, fontSize: 14, color: '#ef4444' },
  savedHint: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 20 },
  buttons: { gap: 12 },
  button: { height: 56, borderRadius: 26, backgroundColor: '#49c0f8', justifyContent: 'center', alignItems: 'center' },
  buttonSecondary: { backgroundColor: '#334155' },
  buttonDanger: { backgroundColor: '#b91c1c' },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});
