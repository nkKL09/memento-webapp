// screens/PracticeStack/NumberEncoderScreen.js
// Кодировщик произвольного числа: разбиение на 3/2/1 цифры с приоритетом 00-99 при том же числе образов
import React, { useState, useCallback, useRef, useEffect } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../../components/BackButton';
import OptimizedImage from '../../components/OptimizedImage';
import { getCardByNum } from '../LearningStack/loadCards.js';

/** Разбиение цифр: n%3===0 → все по 3; n%3===2 → тройки + одна пара; n%3===1 → (k-1) троек + две пары */
function splitDigits(digits) {
  const n = digits.length;
  if (n === 0) return [];
  if (n === 1) return [digits];
  const r = n % 3;
  if (r === 0) {
    const chunks = [];
    for (let i = 0; i < n; i += 3) chunks.push(digits.slice(i, i + 3));
    return chunks;
  }
  if (r === 2) {
    const chunks = [];
    const numThrees = (n - 2) / 3;
    for (let i = 0; i < numThrees; i++) chunks.push(digits.slice(i * 3, i * 3 + 3));
    chunks.push(digits.slice(n - 2, n));
    return chunks;
  }
  // r === 1: (k-1) троек + две пары
  const k = (n - 1) / 3;
  const numThrees = k - 1;
  const chunks = [];
  for (let i = 0; i < numThrees; i++) chunks.push(digits.slice(i * 3, i * 3 + 3));
  chunks.push(digits.slice(numThrees * 3, numThrees * 3 + 2));
  chunks.push(digits.slice(numThrees * 3 + 2, numThrees * 3 + 4));
  return chunks;
}

/** Подсказка по буквам кода (как в справочнике) */
function getBckDisplay(num, code) {
  if (!code) return '';
  const upperLetters = code.match(/[А-ЯЁ]/g) || [];
  const bckMap = {
    'Г': 'Гж', 'Ж': 'гЖ', 'Д': 'Дт', 'Т': 'дТ', 'К': 'Кх', 'Х': 'кХ',
    'Ч': 'Чщ', 'Щ': 'чЩ', 'П': 'Пб', 'Б': 'пБ', 'Ш': 'Шл', 'Л': 'шЛ',
    'С': 'Сз', 'З': 'сЗ', 'В': 'Вф', 'Ф': 'вФ', 'Р': 'Рц', 'Ц': 'рЦ',
    'Н': 'Нм', 'М': 'нМ',
  };
  const bckParts = upperLetters.map((letter) => bckMap[letter] || '');
  return bckParts.filter(Boolean).join(' ');
}

function withMeta(card) {
  if (!card) return null;
  const catalogId = card.num.length === 2 ? '00-99' : `${card.num[0]}00-${card.num[0]}99`;
  return { ...card, type: 'numbers', catalogId };
}

export default function NumberEncoderScreen() {
  const navigation = useNavigation();
  const [digits, setDigits] = useState('');
  const [resultCards, setResultCards] = useState([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const onInputChange = useCallback((text) => {
    setDigits(text.replace(/\D/g, ''));
  }, []);

  const onEncode = useCallback(() => {
    const d = digits.replace(/\D/g, '');
    if (d.length === 0) return;
    Keyboard.dismiss();
    const chunks = splitDigits(d);
    const cards = chunks.map((chunk) => {
      const padded = chunk.length === 1 ? chunk.padStart(2, '0') : chunk;
      return withMeta(getCardByNum(padded));
    });
    setResultCards(cards.filter(Boolean));
  }, [digits]);

  const hasDigits = digits.replace(/\D/g, '').length >= 1;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <BackButton />
        <Text style={styles.header}>Произвольное число</Text>

        <View style={styles.fieldRow}>
          <TextInput
            ref={inputRef}
            style={[styles.input, focused && styles.inputFocused]}
            value={digits}
            onChangeText={onInputChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Введите число"
            placeholderTextColor="#64748b"
            keyboardType="number-pad"
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.button, hasDigits ? styles.buttonActive : styles.buttonDisabled]}
          onPress={onEncode}
          disabled={!hasDigits}
          activeOpacity={hasDigits ? 0.8 : 1}
        >
          <Text style={styles.buttonText}>Кодировать</Text>
        </TouchableOpacity>

        {resultCards.length > 0 && (
          <View style={styles.resultBlock}>
            <Text style={styles.resultTitle}>Образы по порядку</Text>
            {resultCards.map((card, index) => (
              <TouchableOpacity
                key={index}
                style={styles.cardRow}
                onPress={() => navigation.navigate('ReferenceCard', { card })}
                activeOpacity={0.8}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.cardNum}>{card.num}</Text>
                  <Text style={styles.cardCode}>{card.code}</Text>
                  {getBckDisplay(card.num, card.code) ? (
                    <Text style={styles.cardBck}>{getBckDisplay(card.num, card.code)}</Text>
                  ) : null}
                </View>
                {card.image && (
                  <OptimizedImage source={card.image} style={styles.cardThumb} resizeMode="contain" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  scroll: { flex: 1 },
  content: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 100 },
  header: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 40,
    textAlign: 'center',
  },
  fieldRow: { marginBottom: 8 },
  input: {
    backgroundColor: '#1a2a35',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    color: '#ffffff',
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  inputFocused: { borderColor: '#49c0f8' },
  button: {
    height: 56,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  buttonActive: { backgroundColor: '#49c0f8' },
  buttonDisabled: { backgroundColor: '#334155', opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  resultBlock: { marginTop: 8 },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2a35',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  cardLeft: { flex: 1 },
  cardNum: { fontSize: 26, fontWeight: 'bold', color: '#ffffff' },
  cardCode: { fontSize: 19, color: '#ffffff', marginVertical: 4 },
  cardBck: { fontSize: 16, color: '#49c0f8' },
  cardThumb: { width: 70, height: 70, borderRadius: 12 },
});
