// 5 примеров (+, −, ×, ÷), ответ 10–99, перед вводом ответов тренировки
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Keyboard, InteractionManager } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../../components/ScreenHeader';
import { generateMathTasks, opSymbol } from './mathTaskUtils';

const FLASH_DURATION_MS = 500;
const MATH_ROW_HEIGHT = 56;
const MATH_HEADER_HEIGHT = 38;

export default function TrainingMathScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { sequence = [], moduleId, count, options } = route.params || {};

  const tasks = useMemo(() => generateMathTasks(5), []);
  const [answers, setAnswers] = useState(['', '', '', '', '']);
  const [wrongFlash, setWrongFlash] = useState([]);
  const [lastCheckCorrect, setLastCheckCorrect] = useState([]);
  const [editedSinceCheck, setEditedSinceCheck] = useState([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputRefs = useRef([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const subShow = Keyboard.addListener(show, () => setKeyboardVisible(true));
    const subHide = Keyboard.addListener(hide, () => setKeyboardVisible(false));
    return () => { subShow.remove(); subHide.remove(); };
  }, []);

  const focusTimeoutRef = useRef(null);
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      focusTimeoutRef.current = setTimeout(() => inputRefs.current[0]?.focus(), 500);
    });
    return () => {
      task.cancel();
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (wrongFlash.length === 0) return;
    const t = setTimeout(() => setWrongFlash([]), FLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, [wrongFlash]);

  if (!sequence.length) {
    navigation.navigate('MemoryTester');
    return null;
  }

  const scrollToRow = (index) => {
    const y = Math.max(0, MATH_HEADER_HEIGHT + index * MATH_ROW_HEIGHT - 120);
    scrollRef.current?.scrollTo({ y, animated: true });
  };

  const updateAnswer = (index, text) => {
    const num = text.replace(/\D/g, '').slice(0, 2);
    setEditedSinceCheck((prev) => (prev.includes(index) ? prev : [...prev, index]));
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = num;
      return next;
    });
    if (num.length === 2 && index < 4) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
        scrollToRow(index + 1);
      }, 0);
    }
  };

  const onNext = () => {
    const wrong = [];
    const correct = [];
    tasks.forEach((task, i) => {
      const num = parseInt(answers[i], 10);
      if (num !== task.result) wrong.push(i);
      else correct.push(i);
    });
    setLastCheckCorrect(correct);
    setEditedSinceCheck([]);
    if (wrong.length > 0) {
      setWrongFlash(wrong);
      return;
    }
    navigation.navigate('TrainingInput', { sequence, moduleId, count, options });
  };

  const allFilled = answers.every((a) => a !== '');
  const canProceed = allFilled;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={[styles.scrollContent, keyboardVisible && { paddingBottom: 280 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Математические примеры" showBackButton />
        <Text style={styles.counter}>Математические примеры</Text>
        {tasks.map((task, i) => (
          <View key={i} style={[styles.row, wrongFlash.includes(i) && styles.rowFlash]}>
            <Text style={styles.task}>{task.a} {opSymbol(task.op)} {task.b} = ?</Text>
            <TextInput
              ref={(r) => { inputRefs.current[i] = r; }}
              style={[styles.input, wrongFlash.includes(i) && styles.inputFlash]}
              value={answers[i]}
              onChangeText={(t) => updateAnswer(i, t)}
              onFocus={() => scrollToRow(i)}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="?"
              placeholderTextColor="#64748b"
            />
            {lastCheckCorrect.includes(i) && !editedSinceCheck.includes(i) && <Text style={styles.feedbackOk}>Верно</Text>}
            {lastCheckCorrect.length > 0 && !lastCheckCorrect.includes(i) && !editedSinceCheck.includes(i) && answers[i] !== '' && (
              <Text style={styles.feedbackBad}>Неверно</Text>
            )}
          </View>
        ))}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.button, !canProceed && styles.buttonDisabled]} onPress={onNext} disabled={!canProceed} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Дальше</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 16 },
  counter: { fontSize: 18, color: '#94a3b8', textAlign: 'center', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'transparent' },
  rowFlash: { backgroundColor: '#7f1d1d' },
  task: { fontSize: 22, color: '#ffffff', marginRight: 12, minWidth: 100 },
  input: { fontSize: 20, color: '#ffffff', borderWidth: 2, borderColor: '#334155', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, width: 64, textAlign: 'center' },
  inputFlash: { borderColor: '#dc2626', backgroundColor: '#7f1d1d' },
  feedbackOk: { fontSize: 14, color: '#22c55e', marginLeft: 10 },
  feedbackBad: { fontSize: 14, color: '#ef4444', marginLeft: 10 },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
  button: { height: 56, borderRadius: 26, backgroundColor: '#49c0f8', justifyContent: 'center', alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#334155', opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});
