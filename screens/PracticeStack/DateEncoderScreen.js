// screens/PracticeStack/DateEncoderScreen.js
// Кодировщик даты: дд.мм.гггг → 3 карточки (день 00-99, месяц из каталога месяцев, год — последние 3 цифры)
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
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getCardByNum } from '../LearningStack/loadCards.js';
import monthsData from '../../data/months.js';

const MAX_DAY = 2;
const MAX_MONTH = 2;
const MAX_YEAR = 4;

/** Подсказка по буквам кода (как в справочнике); для месяцев не показываем */
function getBckDisplay(num, code, catalogId) {
  if (catalogId === 'months' || !code) return '';
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

/** Карточка месяца по номеру 01–12 */
function getMonthCard(monthStr) {
  const n = parseInt(monthStr, 10);
  if (n < 1 || n > 12) return null;
  const card = monthsData[n - 1];
  return card ? { ...card, catalogId: 'months' } : null;
}

export default function DateEncoderScreen() {
  const navigation = useNavigation();
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [resultCards, setResultCards] = useState([]);
  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => dayRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const dayDigits = day.replace(/\D/g, '').slice(0, MAX_DAY);
  const monthDigits = month.replace(/\D/g, '').slice(0, MAX_MONTH);
  const yearDigits = year.replace(/\D/g, '').slice(0, MAX_YEAR);

  const isFullDate =
    dayDigits.length === MAX_DAY &&
    monthDigits.length === MAX_MONTH &&
    yearDigits.length >= 1;
  const monthNum = monthDigits.length > 0 ? parseInt(monthDigits, 10) : 0;
  const isMonthValid = monthNum >= 1 && monthNum <= 12;

  const onDayChange = useCallback((text) => {
    const digits = text.replace(/\D/g, '').slice(0, MAX_DAY);
    setDay(digits);
    if (digits.length === MAX_DAY) setTimeout(() => monthRef.current?.focus(), 0);
  }, []);
  const onMonthChange = useCallback((text) => {
    const digits = text.replace(/\D/g, '').slice(0, MAX_MONTH);
    setMonth(digits);
    if (digits.length === MAX_MONTH) setTimeout(() => yearRef.current?.focus(), 0);
  }, []);
  const onYearChange = useCallback((text) => {
    setYear(text.replace(/\D/g, '').slice(0, MAX_YEAR));
  }, []);

  const onEncode = useCallback(() => {
    if (!isFullDate || !isMonthValid) return;
    Keyboard.dismiss();
    const dayPadded = dayDigits.padStart(2, '0');
    const monthPadded = monthDigits.padStart(2, '0');
    const yearNum = yearDigits.length === 4 ? parseInt(yearDigits, 10) : 0;
    const yearForCard = yearDigits.length === 4 && yearNum >= 2000
      ? yearDigits.slice(-2).padStart(2, '0')
      : yearDigits.length <= 2
        ? yearDigits.padStart(2, '0')
        : yearDigits.slice(-3);
    const dayCard = getCardByNum(dayPadded);
    const monthCard = getMonthCard(monthPadded);
    const yearCard = getCardByNum(yearForCard);
    const withMeta = (card, catalogId, type) => {
      if (!card) return null;
      return { ...card, catalogId: card.catalogId || catalogId, type: type || 'numbers' };
    };
    setResultCards([
      withMeta(dayCard, '00-99', 'numbers'),
      withMeta(monthCard, 'months', 'months'),
      withMeta(yearCard, yearCard?.num?.length === 3 ? `${yearCard.num[0]}00-${yearCard.num[0]}99` : '00-99', 'numbers'),
    ].filter(Boolean));
  }, [dayDigits, monthDigits, yearDigits, isFullDate, isMonthValid]);

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
        <Text style={styles.header}>Дата</Text>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>День</Text>
          <TextInput
            ref={dayRef}
            style={[styles.input, focusedField === 'day' && styles.inputFocused]}
            value={day}
            onChangeText={onDayChange}
            onFocus={() => setFocusedField('day')}
            onBlur={() => setFocusedField(null)}
            placeholder="01 - 31"
            autoFocus
            placeholderTextColor="#64748b"
            keyboardType="number-pad"
            maxLength={MAX_DAY}
            returnKeyType="default"
            onSubmitEditing={() => monthRef.current?.focus()}
          />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Месяц</Text>
          <TextInput
            ref={monthRef}
            style={[styles.input, focusedField === 'month' && styles.inputFocused]}
            value={month}
            onChangeText={onMonthChange}
            onFocus={() => setFocusedField('month')}
            onBlur={() => setFocusedField(null)}
            placeholder="01 - 12"
            placeholderTextColor="#64748b"
            keyboardType="number-pad"
            maxLength={MAX_MONTH}
            returnKeyType="default"
            onSubmitEditing={() => yearRef.current?.focus()}
          />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Год</Text>
          <TextInput
            ref={yearRef}
            style={[styles.input, focusedField === 'year' && styles.inputFocused]}
            value={year}
            onChangeText={onYearChange}
            onFocus={() => setFocusedField('year')}
            onBlur={() => setFocusedField(null)}
            placeholder="гггг"
            placeholderTextColor="#64748b"
            keyboardType="number-pad"
            maxLength={MAX_YEAR}
            returnKeyType="default"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isFullDate && isMonthValid ? styles.buttonActive : styles.buttonDisabled]}
          onPress={onEncode}
          disabled={!isFullDate || !isMonthValid}
          activeOpacity={isFullDate && isMonthValid ? 0.8 : 1}
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
                  {getBckDisplay(card.num, card.code, card.catalogId) ? (
                    <Text style={styles.cardBck}>{getBckDisplay(card.num, card.code, card.catalogId)}</Text>
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
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    width: 80,
    fontSize: 17,
    color: '#94a3b8',
  },
  input: {
    flex: 1,
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
