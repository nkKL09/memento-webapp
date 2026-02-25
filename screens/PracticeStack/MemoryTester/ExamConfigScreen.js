// Настройки экзамена (только числовые модули: двузначные, трёхзначные)
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MODULES, generateTrainingSequence } from './trainingUtils';

const EXAM_MODULES = MODULES.filter((m) => m.id === 'twoDigit' || m.id === 'threeDigit');

export default function ExamConfigScreen() {
  const navigation = useNavigation();
  const [moduleId, setModuleId] = useState('twoDigit');
  const [countStr, setCountStr] = useState('20');

  const mod = EXAM_MODULES.find((m) => m.id === moduleId);
  const maxCount = mod ? mod.max : 100;
  const minCount = 20;
  const count = parseInt(countStr, 10) || 0;
  const countOk = count >= minCount && count <= maxCount;

  useEffect(() => {
    const n = parseInt(countStr, 10) || 0;
    if (countStr !== '' && (n < minCount || n > maxCount)) {
      setCountStr(String(Math.min(Math.max(minCount, n), maxCount)));
    }
  }, [moduleId, maxCount]);

  const onStart = () => {
    if (!countOk) return;
    const rangeMin = moduleId === 'threeDigit' ? 0 : 0;
    const rangeMax = moduleId === 'threeDigit' ? 999 : 99;
    const sequence = generateTrainingSequence(moduleId, count, rangeMin, rangeMax);
    navigation.navigate('ExamShow', {
      sequence,
      moduleId,
      moduleName: mod?.name ?? '',
      count,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Экзамен</Text>
      <Text style={styles.subtitle}>Коэффициент способности запоминания</Text>

      <Text style={styles.label}>Модуль</Text>
      <View style={styles.options}>
        {EXAM_MODULES.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.option, moduleId === m.id && styles.optionActive]}
            onPress={() => setModuleId(m.id)}
          >
            <Text style={[styles.optionText, moduleId === m.id && styles.optionTextActive]}>{m.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Количество элементов (20–{maxCount})</Text>
      <TextInput
        style={styles.input}
        value={countStr}
        onChangeText={setCountStr}
        keyboardType="number-pad"
        placeholder="min: 20"
        placeholderTextColor="#64748b"
      />

      <View style={styles.btnWrap}>
        <TouchableOpacity
          style={[styles.button, !countOk && styles.buttonDisabled]}
          onPress={onStart}
          disabled={!countOk}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Начать экзамен</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  content: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 60 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 16, color: '#94a3b8', marginBottom: 8, marginTop: 16 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#334155' },
  optionActive: { backgroundColor: '#49c0f8' },
  optionText: { fontSize: 14, color: '#e2e8f0' },
  optionTextActive: { color: '#ffffff', fontWeight: '600' },
  input: { fontSize: 18, color: '#ffffff', borderWidth: 2, borderColor: '#334155', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14 },
  btnWrap: { width: '100%', alignItems: 'center', marginTop: 32 },
  button: { height: 56, minWidth: 200, paddingHorizontal: 32, borderRadius: 26, backgroundColor: '#49c0f8', justifyContent: 'center', alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#334155', opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});
