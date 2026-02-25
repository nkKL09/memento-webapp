// screens/PracticeStack/CardMemorizationRunScreen.js
// Фазы: запоминание (только образ, Дальше) → 5 мат. примеров на одном экране → проверка (сетка 4×13)
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  InteractionManager,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import playingCards from '../../data/playingCards.js';
import { generateMathTasks, opSymbol } from './MemoryTester/mathTaskUtils';

const SUITS = ['П', 'Б', 'Т', 'Ч'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'В', 'Д', 'К', 'Т'];
const SUIT_SYMBOLS = { 'Т': '♣', 'Ч': '♥', 'Б': '♦', 'П': '♠' };
const SUIT_COLORS = { 'Т': '#ffffff', 'Ч': '#ff4d4d', 'Б': '#ff4d4d', 'П': '#ffffff' };

function getCardByNum(num) {
  return playingCards.find((c) => c.num === num) || null;
}

const MATH_ROW_HEIGHT = 56;
const MATH_HEADER_HEIGHT = 38;
const FLASH_DURATION_MS = 500;

export default function CardMemorizationRunScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { sequence = [], secondsPerCard = 0 } = route.params || {};
  const n = sequence.length;

  const [phase, setPhase] = useState('memorize');
  const [memIndex, setMemIndex] = useState(0);
  const memStartRef = useRef(null);
  const memEndRef = useRef(null);
  const mathTasks = useMemo(() => generateMathTasks(5), []);
  const [mathAnswers, setMathAnswers] = useState(['', '', '', '', '']);
  const [mathWrongFlash, setMathWrongFlash] = useState([]);
  const [mathLastCheckCorrect, setMathLastCheckCorrect] = useState([]);
  const [mathEditedSinceCheck, setMathEditedSinceCheck] = useState([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const mathInputRefs = useRef([]);
  const mathScrollRef = useRef(null);
  const mathFocusTimeoutRef = useRef(null);
  const [checkIndex, setCheckIndex] = useState(0);
  const checkStartRef = useRef(null);
  const checkEndRef = useRef(null);
  const [mistakes, setMistakes] = useState([]);
  const [feedbackNum, setFeedbackNum] = useState(null);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);

  useEffect(() => {
    if (phase === 'memorize' && memIndex === 0) memStartRef.current = Date.now();
  }, [phase, memIndex]);

  useEffect(() => {
    if (phase !== 'memorize' || secondsPerCard <= 0 || memIndex >= n) return;
    const t = setTimeout(() => {
      if (memIndex >= n - 1) {
        memEndRef.current = Date.now();
        setPhase('math');
        setMathAnswers(['', '', '', '', '']);
      } else {
        setMemIndex((i) => i + 1);
      }
    }, secondsPerCard * 1000);
    return () => clearTimeout(t);
  }, [phase, memIndex, n, secondsPerCard]);

  useEffect(() => {
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const subShow = Keyboard.addListener(show, () => setKeyboardVisible(true));
    const subHide = Keyboard.addListener(hide, () => setKeyboardVisible(false));
    return () => { subShow.remove(); subHide.remove(); };
  }, []);

  useEffect(() => {
    if (mathWrongFlash.length === 0) return;
    const t = setTimeout(() => setMathWrongFlash([]), FLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, [mathWrongFlash]);

  useEffect(() => {
    if (phase !== 'math') return;
    const task = InteractionManager.runAfterInteractions(() => {
      mathFocusTimeoutRef.current = setTimeout(() => mathInputRefs.current[0]?.focus(), 500);
    });
    return () => {
      task.cancel();
      if (mathFocusTimeoutRef.current) clearTimeout(mathFocusTimeoutRef.current);
    };
  }, [phase]);

  const handleMemNext = useCallback(() => {
    if (memIndex >= n - 1) {
      memEndRef.current = Date.now();
      setPhase('math');
      setMathAnswers(['', '', '', '', '']);
    } else {
      setMemIndex((i) => i + 1);
    }
  }, [memIndex, n]);

  const mathScrollToRow = useCallback((index) => {
    const y = Math.max(0, MATH_HEADER_HEIGHT + index * MATH_ROW_HEIGHT - 120);
    mathScrollRef.current?.scrollTo({ y, animated: true });
  }, []);

  const mathUpdateAnswer = useCallback((index, text) => {
    const num = text.replace(/\D/g, '').slice(0, 2);
    setMathEditedSinceCheck((prev) => (prev.includes(index) ? prev : [...prev, index]));
    setMathAnswers((prev) => {
      const next = [...prev];
      next[index] = num;
      return next;
    });
    if (num.length === 2 && index < 4) {
      setTimeout(() => {
        mathInputRefs.current[index + 1]?.focus();
        mathScrollToRow(index + 1);
      }, 0);
    }
  }, [mathScrollToRow]);

  const handleMathNext = useCallback(() => {
    const wrong = [];
    const correct = [];
    mathTasks.forEach((task, i) => {
      const num = parseInt(mathAnswers[i], 10);
      if (num !== task.result) wrong.push(i);
      else correct.push(i);
    });
    setMathLastCheckCorrect(correct);
    setMathEditedSinceCheck([]);
    if (wrong.length > 0) {
      setMathWrongFlash(wrong);
      return;
    }
    setPhase('check');
    checkStartRef.current = Date.now();
  }, [mathTasks, mathAnswers]);

  const handleCheckSelect = useCallback((selectedNum) => {
    if (feedbackNum != null) return;
    const expectedNum = sequence[checkIndex].num;
    const correct = selectedNum === expectedNum;
    setFeedbackNum(selectedNum);
    setFeedbackCorrect(correct);
    const newMistake = !correct ? { position: checkIndex + 1, expectedNum, actualNum: selectedNum } : null;
    const advance = () => {
      setFeedbackNum(null);
      if (checkIndex >= n - 1) {
        checkEndRef.current = Date.now();
        const finalErrors = newMistake ? [...mistakes, newMistake] : mistakes;
        navigation.replace('CardMemorizationResults', {
          timeMem: memEndRef.current - memStartRef.current,
          timeCheck: checkEndRef.current - checkStartRef.current,
          errors: finalErrors,
          total: n,
        });
      } else {
        if (newMistake) setMistakes((prev) => [...prev, newMistake]);
        setCheckIndex((i) => i + 1);
      }
    };
    setTimeout(advance, 600);
  }, [checkIndex, sequence, n, mistakes, navigation, feedbackNum]);

  if (n === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Нет данных</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'memorize') {
    const card = sequence[memIndex];
    const suit = card?.num?.[0];
    const rank = card?.num?.slice(1);
    const sym = suit ? SUIT_SYMBOLS[suit] : '';
    const color = suit ? SUIT_COLORS[suit] : '#ffffff';
    return (
      <View style={styles.container}>
        <Text style={styles.phaseTitle}>Запоминание</Text>
        <Text style={styles.counter}>Карта {memIndex + 1} из {n}</Text>
        <View style={styles.cardFaceWrap}>
          <View style={styles.cardFaceRow}>
            <Text style={[styles.cardFaceSymbol, { color }]}>{sym}</Text>
            <Text style={styles.cardFaceRank}>{rank}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.nextButton} onPress={handleMemNext} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Дальше</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'math') {
    const mathAllFilled = mathAnswers.every((a) => a !== '');
    const mathCanProceed = mathAllFilled;
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
        <ScrollView
          ref={mathScrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, keyboardVisible && { paddingBottom: 280 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.phaseTitle}>Простые примеры</Text>
          <Text style={styles.counter}>Математические примеры</Text>
          {mathTasks.map((task, i) => (
            <View key={i} style={[styles.mathRow, mathWrongFlash.includes(i) && styles.mathRowFlash]}>
              <Text style={styles.mathTask}>{task.a} {opSymbol(task.op)} {task.b} = ?</Text>
              <TextInput
                ref={(r) => { mathInputRefs.current[i] = r; }}
                style={[styles.mathInput, mathWrongFlash.includes(i) && styles.mathInputFlash]}
                value={mathAnswers[i]}
                onChangeText={(t) => mathUpdateAnswer(i, t)}
                onFocus={() => mathScrollToRow(i)}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="?"
                placeholderTextColor="#64748b"
              />
              {mathLastCheckCorrect.includes(i) && !mathEditedSinceCheck.includes(i) && <Text style={styles.mathFeedbackOk}>Верно</Text>}
              {mathLastCheckCorrect.length > 0 && !mathLastCheckCorrect.includes(i) && !mathEditedSinceCheck.includes(i) && mathAnswers[i] !== '' && (
                <Text style={styles.mathFeedbackBad}>Неверно</Text>
              )}
            </View>
          ))}
          <View style={styles.mathFooter}>
            <TouchableOpacity
              style={[styles.nextButton, !mathCanProceed && styles.buttonDisabled]}
              onPress={handleMathNext}
              disabled={!mathCanProceed}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>К проверке</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // phase === 'check': grid 4+4+4+1 per suit; highlight tapped card green/red
  const renderGridRow = (suit, ranksSlice, rowIdx) => {
    const cells = ranksSlice.map((rank) => {
      const num = rank === '10' ? suit + '10' : suit + rank;
      const sym = SUIT_SYMBOLS[suit];
      const color = SUIT_COLORS[suit];
      const isFeedback = feedbackNum === num;
      const cellStyle = [
        styles.gridCell,
        isFeedback && (feedbackCorrect ? styles.gridCellCorrect : styles.gridCellWrong),
      ];
      return (
        <TouchableOpacity
          key={num}
          style={cellStyle}
          onPress={() => handleCheckSelect(num)}
          activeOpacity={0.8}
          disabled={feedbackNum != null}
        >
          <View style={styles.gridCellContent}>
            <Text style={[styles.gridCellSymbol, { color }]}>{sym}</Text>
            <Text style={styles.gridCellRank}>{rank}</Text>
          </View>
        </TouchableOpacity>
      );
    });
    const emptyCount = 4 - cells.length;
    return (
      <View key={`${suit}-${rowIdx}`} style={styles.gridRow}>
        {cells}
        {emptyCount > 0 && Array.from({ length: emptyCount }, (_, i) => <View key={`e-${i}`} style={styles.gridCellEmpty} />)}
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.phaseTitle}>Проверка</Text>
      <Text style={styles.counterLarge}>{checkIndex + 1} из {n}</Text>
      <ScrollView style={styles.gridScroll} contentContainerStyle={styles.gridContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {SUITS.map((suit) => (
            <React.Fragment key={suit}>
              {renderGridRow(suit, RANKS.slice(0, 4), 0)}
              {renderGridRow(suit, RANKS.slice(4, 8), 1)}
              {renderGridRow(suit, RANKS.slice(8, 12), 2)}
              {renderGridRow(suit, RANKS.slice(12, 13), 3)}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24', paddingTop: 18, paddingHorizontal: 16 },
  header: { fontSize: 22, color: '#ffffff', textAlign: 'center', marginTop: 20 },
  backBtn: { backgroundColor: '#334155', marginTop: 20, paddingVertical: 14, borderRadius: 20, alignItems: 'center' },
  phaseTitle: { fontSize: 22, fontWeight: '600', color: '#ffffff', textAlign: 'center', marginBottom: 8 },
  counter: { fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 16 },
  counterLarge: { fontSize: 24, fontWeight: '600', color: '#ffffff', textAlign: 'center', marginBottom: 12 },
  cardFaceWrap: { justifyContent: 'center', alignItems: 'center', minHeight: 320, marginHorizontal: 24, marginBottom: 24, backgroundColor: '#1a2a35', borderRadius: 20, padding: 40 },
  cardFaceRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  cardFaceSymbol: { fontSize: 80, fontWeight: 'bold' },
  cardFaceRank: { fontSize: 48, color: '#ffffff', fontWeight: '600' },
  nextButton: { backgroundColor: '#49c0f8', height: 56, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  buttonDisabled: { backgroundColor: '#334155', opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 16 },
  mathRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'transparent' },
  mathRowFlash: { backgroundColor: '#7f1d1d' },
  mathTask: { fontSize: 22, color: '#ffffff', marginRight: 12, minWidth: 100 },
  mathInput: {
    fontSize: 20,
    color: '#ffffff',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    width: 64,
    textAlign: 'center',
  },
  mathInputFlash: { borderColor: '#dc2626', backgroundColor: '#7f1d1d' },
  mathFeedbackOk: { fontSize: 14, color: '#22c55e', marginLeft: 10 },
  mathFeedbackBad: { fontSize: 14, color: '#ef4444', marginLeft: 10 },
  mathFooter: { paddingHorizontal: 0, paddingBottom: 24 },
  gridScroll: { flex: 1 },
  gridContent: { paddingBottom: 24 },
  grid: { flexDirection: 'column' },
  gridRow: { flexDirection: 'row', marginBottom: 6 },
  gridCell: {
    flex: 1,
    minWidth: 40,
    aspectRatio: 0.9,
    backgroundColor: '#1a2a35',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  gridCellEmpty: { flex: 1, minWidth: 40, aspectRatio: 0.9, margin: 2 },
  gridCellCorrect: { backgroundColor: '#22c55e' },
  gridCellWrong: { backgroundColor: '#ef4444' },
  gridCellContent: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  gridCellSymbol: { fontSize: 14, fontWeight: 'bold' },
  gridCellRank: { fontSize: 12, color: '#e2e8f0' },
});
