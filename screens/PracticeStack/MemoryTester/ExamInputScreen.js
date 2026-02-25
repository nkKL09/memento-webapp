// Ввод ответов экзамена (аналогично TrainingInput, по завершении — переход на результат с сохранением)
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Keyboard, InteractionManager } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { isNumberModule } from './trainingUtils';
import { MONTHS, DAYS } from './trainingUtils';

export default function ExamInputScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { sequence = [], moduleId, moduleName, count, startTime } = route.params || {};
  const n = sequence.length || 0;
  const isNum = isNumberModule(moduleId);
  const [answers, setAnswers] = useState(Array(n).fill(''));
  const [pickerIndex, setPickerIndex] = useState(null);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputRefs = useRef([]);
  const scrollRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const subShow = Keyboard.addListener(show, () => setKeyboardVisible(true));
    const subHide = Keyboard.addListener(hide, () => setKeyboardVisible(false));
    return () => { subShow.remove(); subHide.remove(); };
  }, []);

  const focusTimeoutRef = useRef(null);
  useEffect(() => {
    if (n === 0 || !isNum) return;
    const task = InteractionManager.runAfterInteractions(() => {
      focusTimeoutRef.current = setTimeout(() => inputRefs.current[0]?.focus(), 800);
    });
    return () => {
      task.cancel();
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    };
  }, [n, isNum]);

  useEffect(() => {
    if (n === 0 || isNum) return;
    const t = setTimeout(() => setPickerIndex(0), 800);
    return () => clearTimeout(t);
  }, [n, isNum]);

  useEffect(() => {
    if (pickerIndex == null || isNum) return;
    const t = setTimeout(() => searchInputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [pickerIndex, isNum]);

  const INPUT_OFFSET = 96;
  const INPUT_ROW_HEIGHT = 46;
  useEffect(() => {
    if (pickerIndex != null && !isNum && scrollRef.current) {
      const t = setTimeout(() => {
        const y = Math.max(0, INPUT_OFFSET + pickerIndex * INPUT_ROW_HEIGHT - 120);
        scrollRef.current?.scrollTo({ y, animated: true });
      }, 150);
      return () => clearTimeout(t);
    }
  }, [pickerIndex, isNum]);

  const maxLen = moduleId === 'threeDigit' ? 3 : 2;
  const options = moduleId === 'months' ? MONTHS : moduleId === 'days' ? DAYS : [];

  if (n === 0 || startTime == null) {
    navigation.navigate('MemoryTester');
    return null;
  }

  const scrollToRow = (index) => {
    const INPUT_OFFSET = 96;
    const INPUT_ROW_HEIGHT = 46;
    const y = Math.max(0, INPUT_OFFSET + index * INPUT_ROW_HEIGHT - 120);
    scrollRef.current?.scrollTo({ y, animated: true });
  };

  const updateAnswer = (index, text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, maxLen);
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
    if (cleaned.length === maxLen && index < n - 1) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
        scrollToRow(index + 1);
      }, 0);
    }
  };

  const openPicker = (index) => {
    if (pickerIndex === index) {
      setPickerIndex(null);
      return;
    }
    setDropdownSearch('');
    setPickerIndex(index);
  };

  const selectOption = (value) => {
    if (pickerIndex != null) {
      setAnswers((prev) => {
        const next = [...prev];
        next[pickerIndex] = value;
        return next;
      });
      setDropdownSearch('');
      if (pickerIndex + 1 < n) {
        setPickerIndex(pickerIndex + 1);
      } else {
        setPickerIndex(null);
      }
    }
  };

  const onCheck = () => {
    const endTime = Date.now();
    const normalize = (v) => (isNum && moduleId === 'twoDigit' ? v.padStart(2, '0') : isNum && moduleId === 'threeDigit' ? v.padStart(3, '0') : v);
    let correct = 0;
    const errors = [];
    for (let i = 0; i < n; i++) {
      const a = normalize(answers[i].trim());
      const ok = a === sequence[i];
      if (ok) correct++;
      else errors.push({ position: i + 1, correct: sequence[i], answered: answers[i].trim() || '—' });
    }
    const total = n;
    const coefficient = total > 0 ? correct / total : 0;
    navigation.navigate('ExamResult', {
      correctCount: correct,
      total,
      coefficient,
      errors,
      moduleId,
      moduleName,
      count,
      startTime,
      endTime,
    });
  };

  const allFilled = isNum ? answers.every((a) => a.length >= 1) : answers.every((a) => a !== '');

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={[styles.scrollContent, keyboardVisible && { paddingBottom: 280 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Введите запомненные {isNum ? 'числа' : 'значения'}</Text>
        <View style={styles.grid}>
          {Array.from({ length: n }, (_, i) => (
            <View key={i}>
              <View style={[styles.row, pickerIndex === i && styles.rowPickerOpen]}>
                <Text style={styles.label}>{i + 1}.</Text>
                {isNum ? (
                  <TextInput
                    ref={(r) => { inputRefs.current[i] = r; }}
                    style={[styles.input, moduleId === 'threeDigit' && styles.inputWide]}
                    value={answers[i]}
                    onChangeText={(t) => updateAnswer(i, t)}
                    onFocus={() => scrollToRow(i)}
                    keyboardType="number-pad"
                    maxLength={maxLen}
                    placeholder={moduleId === 'threeDigit' ? '000' : '00'}
                    placeholderTextColor="#64748b"
                  />
                ) : (
                  <TouchableOpacity style={styles.selectBtn} onPress={() => openPicker(i)} activeOpacity={0.7}>
                    <Text style={styles.selectBtnText} numberOfLines={1}>{answers[i] || 'Выбрать'}</Text>
                  </TouchableOpacity>
                )}
              </View>
              {!isNum && pickerIndex === i && (
                <View style={styles.dropdown}>
                  <TextInput
                    ref={searchInputRef}
                    style={styles.dropdownSearch}
                    value={dropdownSearch}
                    onChangeText={setDropdownSearch}
                    placeholder="Поиск по списку..."
                    placeholderTextColor="#64748b"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <ScrollView style={styles.dropdownList} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                    {(() => {
                      const q = dropdownSearch.trim().toLowerCase();
                      const filtered = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
                      if (filtered.length === 0) {
                        return <Text style={styles.dropdownEmpty}>Ничего не найдено</Text>;
                      }
                      return filtered.map((item, idx) => (
                        <TouchableOpacity key={item} style={[styles.dropdownItem, idx === filtered.length - 1 && styles.dropdownItemLast]} onPress={() => selectOption(item)} activeOpacity={0.7}>
                          <Text style={styles.dropdownItemText}>{item}</Text>
                        </TouchableOpacity>
                      ));
                    })()}
                  </ScrollView>
                </View>
              )}
            </View>
          ))}
        </View>
        <TouchableOpacity style={[styles.button, !allFilled && styles.buttonDisabled]} onPress={onCheck} disabled={!allFilled} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Проверить</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 40 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 16 },
  grid: { marginBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rowPickerOpen: { marginBottom: 4 },
  label: { width: 32, fontSize: 16, color: '#e2e8f0' },
  input: {
    width: 56,
    fontSize: 18,
    color: '#ffffff',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  inputWide: { width: 72 },
  selectBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 2, borderColor: '#334155' },
  selectBtnText: { fontSize: 16, color: '#e2e8f0' },
  button: { height: 56, borderRadius: 26, backgroundColor: '#49c0f8', justifyContent: 'center', alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#334155', opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  dropdown: { marginLeft: 32, marginBottom: 12, borderRadius: 10, backgroundColor: '#1a2a35', borderWidth: 2, borderColor: '#334155', overflow: 'hidden' },
  dropdownSearch: { fontSize: 16, color: '#ffffff', backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#334155', paddingVertical: 10, paddingHorizontal: 14 },
  dropdownList: { maxHeight: 220 },
  dropdownEmpty: { paddingVertical: 16, paddingHorizontal: 14, fontSize: 15, color: '#64748b' },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#334155' },
  dropdownItemLast: { borderBottomWidth: 0 },
  dropdownItemText: { fontSize: 16, color: '#e2e8f0' },
});
