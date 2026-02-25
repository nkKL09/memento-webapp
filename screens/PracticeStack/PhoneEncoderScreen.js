// screens/PracticeStack/PhoneEncoderScreen.js
// Кодировщик номера телефона: +7 (9XX) XXX-XX-XX → 4 карточки (2+3+2+2, первая группа без ведущей 9)
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../../components/BackButton';
import { getCardByNum } from '../LearningStack/loadCards.js';

const PREFIX = '+7 ('; // скобка без 9 — цифра 9 в одной строке с маской для одинакового межбуквенного расстояния
const TOTAL_DIGITS = 9; // пользователь вводит 9 цифр после фиксированной 9

/** Подсказка по буквам кода для числовых карточек (как в справочнике) */
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

/** Маска после +7 (9: XX) XXX-XX-XX (9 позиций, со скобкой и пробелом, без тире после скобки) */
function formatDisplay(digits) {
  const d = digits.padEnd(9, '_');
  return d.slice(0, 2) + ') ' + d.slice(2, 5) + '-' + d.slice(5, 7) + '-' + d.slice(7, 9);
}

export default function PhoneEncoderScreen() {
  const navigation = useNavigation();
  const [digits, setDigits] = useState('');
  const [resultCards, setResultCards] = useState([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const displayMask = '9' + formatDisplay(digits); // «9» в одной строке с цифрами — единый letterSpacing
  const isComplete = digits.length === TOTAL_DIGITS;

  const onInputChange = useCallback((text) => {
    setDigits(text.replace(/\D/g, '').slice(0, TOTAL_DIGITS));
  }, []);

  const onEncode = useCallback(() => {
    if (digits.length !== TOTAL_DIGITS) return;
    Keyboard.dismiss();
    // Кодируем 4 группы: 2 цифры (после 9), 3, 2, 2 — ведущую 9 не используем
    const n1 = digits.slice(0, 2);
    const n2 = digits.slice(2, 5);
    const n3 = digits.slice(5, 7);
    const n4 = digits.slice(7, 9);
    const c1 = getCardByNum(n1);
    const c2 = getCardByNum(n2);
    const c3 = getCardByNum(n3);
    const c4 = getCardByNum(n4);
    const withMeta = (card) => {
      if (!card) return null;
      const catalogId = card.num.length === 2 ? '00-99' : `${card.num[0]}00-${card.num[0]}99`;
      return { ...card, type: 'numbers', catalogId };
    };
    setResultCards([withMeta(c1), withMeta(c2), withMeta(c3), withMeta(c4)].filter(Boolean));
  }, [digits]);

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
        <Text style={styles.header}>Номер телефона</Text>

        <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
          <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
            <Text style={styles.prefix}>{PREFIX}</Text>
            <View style={styles.maskWrap}>
              <Text style={styles.maskText} numberOfLines={1}>
                {displayMask}
              </Text>
              <TextInput
                ref={inputRef}
                style={styles.inputHidden}
                value={digits}
                onChangeText={onInputChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                keyboardType="number-pad"
                maxLength={TOTAL_DIGITS}
                caretHidden={true}
                autoFocus
              />
            </View>
          </View>
        </TouchableWithoutFeedback>

        <TouchableOpacity
          style={[styles.button, isComplete ? styles.buttonActive : styles.buttonDisabled]}
          onPress={onEncode}
          disabled={!isComplete}
          activeOpacity={isComplete ? 0.8 : 1}
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
                  <Image source={card.image} style={styles.cardThumb} resizeMode="contain" />
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
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2a35',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#334155',
    paddingHorizontal: 16,
    marginBottom: 8,
    minHeight: 56,
  },
  inputWrapFocused: {
    borderColor: '#49c0f8',
  },
  prefix: { fontSize: 20, color: '#ffffff', marginRight: 0 },
  maskWrap: { flex: 1, justifyContent: 'center', minHeight: 44 },
  maskText: {
    fontSize: 20,
    color: '#ffffff',
    letterSpacing: 1,
  },
  inputHidden: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    fontSize: 20,
    color: 'transparent',
    paddingVertical: 14,
    letterSpacing: 1,
    outlineStyle: 'none',
    outlineWidth: 0,
  },
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
