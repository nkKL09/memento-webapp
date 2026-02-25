// screens/PracticeStack/MemoryTester/IntroTestInputScreen.js — ввод по позициям 1–20
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Keyboard, InteractionManager } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import BackButton from '../../../components/BackButton';

const MAX_LEN = 2;

export default function IntroTestInputScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const sequence = route.params?.sequence || [];
  const [answers, setAnswers] = useState(Array(20).fill(''));
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
    if (sequence.length === 0) return;
    const task = InteractionManager.runAfterInteractions(() => {
      focusTimeoutRef.current = setTimeout(() => inputRefs.current[0]?.focus(), 800);
    });
    return () => {
      task.cancel();
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    };
  }, [sequence.length]);

  if (sequence.length === 0) {
    navigation.replace('IntroTestInstruction');
    return null;
  }

  const INPUT_OFFSET = 96;
  const INPUT_ROW_HEIGHT = 46;
  const scrollToRow = (index) => {
    const y = Math.max(0, INPUT_OFFSET + index * INPUT_ROW_HEIGHT - 120);
    scrollRef.current?.scrollTo({ y, animated: true });
  };

  const updateAnswer = (index, text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, MAX_LEN);
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
    if (cleaned.length === MAX_LEN && index < 19) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
        scrollToRow(index + 1);
      }, 0);
    }
  };

  const onCheck = () => {
    let correct = 0;
    for (let i = 0; i < 20; i++) {
      const a = answers[i].padStart(2, '0');
      if (a === sequence[i]) correct++;
    }
    navigation.navigate('IntroTestResult', { correctCount: correct, total: 20 });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={[styles.scrollContent, keyboardVisible && { paddingBottom: 280 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <BackButton />
        <Text style={styles.header}>Введите запомненные числа</Text>
        <View style={styles.grid}>
          {Array.from({ length: 20 }, (_, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.label}>{i + 1}.</Text>
              <TextInput
                ref={(r) => { inputRefs.current[i] = r; }}
                style={styles.input}
                value={answers[i]}
                onChangeText={(t) => updateAnswer(i, t)}
                onFocus={() => scrollToRow(i)}
                keyboardType="number-pad"
                maxLength={MAX_LEN}
                placeholder="00"
                placeholderTextColor="#64748b"
              />
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={onCheck} activeOpacity={0.8}>
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
  label: { width: 28, fontSize: 16, color: '#e2e8f0' },
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
  button: {
    height: 56,
    borderRadius: 26,
    backgroundColor: '#49c0f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});
