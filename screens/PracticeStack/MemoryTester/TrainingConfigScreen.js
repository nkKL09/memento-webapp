// screens/PracticeStack/MemoryTester/TrainingConfigScreen.js — настройки тренировки
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import BackButton from '../../../components/BackButton';
import { MODULES, generateTrainingSequence, isNumberModule, isCatalogModule } from './trainingUtils';
import { getCustomModules } from './customModules';

export default function TrainingConfigScreen() {
  const navigation = useNavigation();
  const [moduleId, setModuleId] = useState('twoDigit');
  const [countStr, setCountStr] = useState('20');
  const [rangeMinStr, setRangeMinStr] = useState('0');
  const [rangeMaxStr, setRangeMaxStr] = useState('99');
  const [doMath, setDoMath] = useState(true);
  const [showIndex, setShowIndex] = useState(true);
  const [customModules, setCustomModules] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getCustomModules().then((data) => {
        if (!cancelled) setCustomModules(data);
      });
      return () => { cancelled = true; };
    }, [])
  );

  const builtInMod = MODULES.find((m) => m.id === moduleId);
  const customMod = customModules.find((m) => m.id === moduleId);
  const mod = builtInMod || (customMod ? { id: customMod.id, name: customMod.name, max: (customMod.elements || []).length } : null);
  const maxCount = mod ? mod.max : 100;
  const isCatalog = isCatalogModule(moduleId);
  const count = isCatalog ? maxCount : (parseInt(countStr, 10) || 10);
  const rangeMin = rangeMinStr === '' ? null : parseInt(rangeMinStr, 10);
  const rangeMax = rangeMaxStr === '' ? null : parseInt(rangeMaxStr, 10);
  const countOk = isCatalog ? true : (count >= 10 && count <= maxCount);
  const rangeOk = !isNumberModule(moduleId) || (rangeMin != null && rangeMax != null && rangeMin <= rangeMax);
  const customElements = customMod?.elements ?? null;
  const options = customElements && customElements.length > 0 ? customElements : null;

  useEffect(() => {
    if (moduleId.startsWith('custom_') && !customModules.some((m) => m.id === moduleId)) {
      setModuleId('twoDigit');
    }
  }, [moduleId, customModules]);

  useEffect(() => {
    if (moduleId === 'twoDigit') {
      setRangeMinStr('0');
      setRangeMaxStr('99');
    } else if (moduleId === 'threeDigit') {
      setRangeMinStr('0');
      setRangeMaxStr('999');
    }
  }, [moduleId]);

  useEffect(() => {
    if (isCatalog) {
      setCountStr(String(maxCount));
    } else {
      const n = parseInt(countStr, 10) || 0;
      if (n < 10 || n > maxCount) setCountStr(String(Math.min(20, maxCount)));
    }
  }, [moduleId, maxCount, isCatalog]);

  const onStart = () => {
    if (!countOk || !rangeOk) return;
    const sequence = generateTrainingSequence(moduleId, count, rangeMin, rangeMax, customElements);
    navigation.navigate('TrainingShow', {
      sequence,
      moduleId,
      count,
      doMath,
      showIndex,
      options,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <BackButton />
      <Text style={styles.header}>Тренировка</Text>

      <Text style={styles.label}>Модуль</Text>
      <View style={styles.options}>
        {MODULES.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.option, moduleId === m.id && styles.optionActive]}
            onPress={() => setModuleId(m.id)}
          >
            <Text style={[styles.optionText, moduleId === m.id && styles.optionTextActive]}>{m.name}</Text>
          </TouchableOpacity>
        ))}
        {customModules.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.option, moduleId === m.id && styles.optionActive]}
            onPress={() => setModuleId(m.id)}
          >
            <Text style={[styles.optionText, moduleId === m.id && styles.optionTextActive]} numberOfLines={1}>{m.name || 'Без названия'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.manageCustom} onPress={() => navigation.navigate('CustomModulesList')} activeOpacity={0.7}>
        <Text style={styles.manageCustomText}>Управление своими модулями</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Количество элементов {isCatalog ? '' : `(10–${maxCount})`}</Text>
      {isCatalog ? (
        <View style={styles.countFixed}>
          <Text style={styles.countFixedText}>{maxCount}</Text>
        </View>
      ) : (
        <TextInput
          style={styles.input}
          value={countStr}
          onChangeText={setCountStr}
          keyboardType="number-pad"
          placeholder="20"
          placeholderTextColor="#64748b"
        />
      )}

      {isNumberModule(moduleId) && (
        <>
          <Text style={styles.label}>Диапазон (от и до)</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.inputSmall]}
              value={rangeMinStr}
              onChangeText={setRangeMinStr}
              keyboardType="number-pad"
              placeholder={moduleId === 'twoDigit' ? '0' : '0'}
              placeholderTextColor="#64748b"
            />
            <Text style={styles.rangeSep}>—</Text>
            <TextInput
              style={[styles.input, styles.inputSmall]}
              value={rangeMaxStr}
              onChangeText={setRangeMaxStr}
              keyboardType="number-pad"
              placeholder={moduleId === 'twoDigit' ? '99' : '999'}
              placeholderTextColor="#64748b"
            />
          </View>
        </>
      )}

      <TouchableOpacity style={styles.checkRow} onPress={() => setDoMath(!doMath)} activeOpacity={0.7}>
        <View style={[styles.checkbox, doMath && styles.checkboxChecked]}>
          {doMath && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkLabel}>5 примеров после запоминания</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.checkRow} onPress={() => setShowIndex(!showIndex)} activeOpacity={0.7}>
        <View style={[styles.checkbox, showIndex && styles.checkboxChecked]}>
          {showIndex && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkLabel}>Показывать порядковый номер</Text>
      </TouchableOpacity>

      <View style={styles.btnWrap}>
        <TouchableOpacity
          style={[styles.button, (!countOk || !rangeOk) && styles.buttonDisabled]}
          onPress={onStart}
          disabled={!countOk || !rangeOk}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Начать тренировку</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  content: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 60 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 16, color: '#94a3b8', marginBottom: 8, marginTop: 16 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#334155' },
  optionActive: { backgroundColor: '#49c0f8' },
  optionText: { fontSize: 14, color: '#e2e8f0' },
  optionTextActive: { color: '#ffffff', fontWeight: '600' },
  manageCustom: { marginTop: 8, marginBottom: 4 },
  manageCustomText: { fontSize: 15, color: '#49c0f8' },
  input: { fontSize: 18, color: '#ffffff', borderWidth: 2, borderColor: '#334155', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14 },
  inputSmall: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rangeSep: { fontSize: 18, color: '#94a3b8' },
  countFixed: { paddingVertical: 14, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#334155' },
  countFixedText: { fontSize: 18, color: '#94a3b8' },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  checkbox: { width: 26, height: 26, borderRadius: 6, borderWidth: 2, borderColor: '#64748b', marginRight: 14, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#49c0f8', borderColor: '#49c0f8' },
  checkmark: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  checkLabel: { flex: 1, fontSize: 17, color: '#e2e8f0' },
  btnWrap: { width: '100%', alignItems: 'center', marginTop: 32 },
  button: { height: 56, minWidth: 200, paddingHorizontal: 32, borderRadius: 26, backgroundColor: '#49c0f8', justifyContent: 'center', alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#334155', opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});
