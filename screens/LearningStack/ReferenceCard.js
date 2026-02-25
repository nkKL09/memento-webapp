import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import BackButton from '../../components/BackButton';
import OptimizedImage from '../../components/OptimizedImage';

const suitConfig = {
  'Т': { symbol: '♣', color: '#ffffff' },
  'Ч': { symbol: '♥', color: '#ff4d4d' },
  'Б': { symbol: '♦', color: '#ff4d4d' },
  'П': { symbol: '♠', color: '#ffffff' },
};

const getCardTitle = (num) => {
  if (!num || num.length < 2) return num;
  const suit = num[0];
  let rank = num.slice(1);
  const config = suitConfig[suit];
  if (!config) return num;

  let rankDisplay = rank;
  if (rank === '10') rankDisplay = '1(0)';
  else if (rank === 'В') rankDisplay = 'Валет';
  else if (rank === 'Д') rankDisplay = 'Дама';
  else if (rank === 'К') rankDisplay = 'Король';
  else if (rank === 'Т') rankDisplay = 'Туз';

  return (
    <Text style={styles.numTitle}>
      <Text style={{ color: config.color }}>{config.symbol}</Text>
      <Text style={{ color: '#ffffff' }}> {rankDisplay}</Text>
    </Text>
  );
};

const getBckDisplay = (num, code, catalogId) => {
  if (catalogId === 'week' || catalogId === 'ru-alphabet' || catalogId === 'en-alphabet' || catalogId === 'months') return '';
  if (!code) return '';

  if (catalogId === 'cards') {
    const suit = num[0];
    const upperLetters = code.match(/[А-ЯЁ]/g) || [];
    const chosenLetter = upperLetters.length > 1 ? upperLetters[1] : upperLetters[0] || '';
    const bckMap = {
      'Г': 'Гж', 'Ж': 'гЖ', 'Д': 'Дт', 'Т': 'дТ', 'К': 'Кх', 'Х': 'кХ',
      'Ч': 'Чщ', 'Щ': 'чЩ', 'П': 'Пб', 'Б': 'пБ', 'Ш': 'Шл', 'Л': 'шЛ',
      'С': 'Сз', 'З': 'сЗ', 'В': 'Вф', 'Ф': 'вФ', 'Р': 'Рц', 'Ц': 'рЦ',
      'Н': 'Нм', 'М': 'нМ',
    };
    const rankBck = bckMap[chosenLetter] || '';
    return `${suit} ${rankBck}`;
  }

  const upperLetters = code.match(/[А-ЯЁ]/g) || [];
  const bckMap = {
    'Г': 'Гж', 'Ж': 'гЖ', 'Д': 'Дт', 'Т': 'дТ', 'К': 'Кх', 'Х': 'кХ',
    'Ч': 'Чщ', 'Щ': 'чЩ', 'П': 'Пб', 'Б': 'пБ', 'Ш': 'Шл', 'Л': 'шЛ',
    'С': 'Сз', 'З': 'сЗ', 'В': 'Вф', 'Ф': 'вФ', 'Р': 'Рц', 'Ц': 'рЦ',
    'Н': 'Нм', 'М': 'нМ',
  };
  const bckParts = upperLetters.map(letter => bckMap[letter] || '');
  return bckParts.filter(Boolean).join(' ');
};

export default function ReferenceCard({ route, navigation }) {
  const { card } = route.params;

  return (
    <View style={styles.container}>
      <BackButton />
      {card.type === 'cards' ? getCardTitle(card.num) : (
        <Text style={styles.numTitle}>{card.num}</Text>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {card.image && (
          <OptimizedImage source={card.image} style={styles.bigImage} resizeMode="contain" />
        )}

        <Text style={styles.codeText}>{card.code}</Text>

        <Text style={styles.bckText}>
          {getBckDisplay(card.num, card.code, card.catalogId)}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  numTitle: { 
    fontSize: 48, 
    fontWeight: '900', 
    color: '#ffffff', 
    textAlign: 'center', 
    marginTop: 95,
    letterSpacing: -2 
  },
  scrollContent: { 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingBottom: 100 
  },
  bigImage: { 
    width: 300, 
    height: 300, 
    borderRadius: 20, 
    marginVertical: 30 
  },
  codeText: { 
    fontSize: 42, 
    fontWeight: '700', 
    color: '#ffffff', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  bckText: { 
    fontSize: 28, 
    color: '#49c0f8', 
    fontWeight: '700', 
    letterSpacing: 6, 
    textAlign: 'center' 
  },
});