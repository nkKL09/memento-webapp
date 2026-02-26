import React from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../../components/BackButton';
import OptimizedImage from '../../components/OptimizedImage';
import { isTelegramWebApp } from '../../telegramWebApp';

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

export default function ReferenceCard({ route }) {
  const navigation = useNavigation();
  const { card } = route.params;

  const titleContent = card.type === 'cards' ? getCardTitle(card.num) : (
    <Text style={styles.numTitle}>{card.num}</Text>
  );
  const isTwa = Platform.OS === 'web' && isTelegramWebApp();
  const headerTop = isTwa ? { paddingTop: 12 } : null;

  return (
    <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
      <View style={[styles.container, Platform.OS === 'web' && { paddingBottom: 90 }]}>
        {Platform.OS === 'web' ? (
          <View style={[styles.headerRow, headerTop]}>
            <View style={styles.backWrap}>
              <BackButton inRow />
            </View>
            <View style={styles.headerCenterWrap} pointerEvents="box-none">
              <View style={styles.titleCenterInner}>{titleContent}</View>
            </View>
          </View>
        ) : (
          <View style={[styles.headerCenteredWrap, headerTop]}>{titleContent}</View>
        )}

        <View style={styles.scrollContentWrapper}>
          <View style={styles.scrollContent}>
            {card.image && (
              <OptimizedImage source={card.image} style={styles.bigImage} resizeMode="contain" />
            )}

            <Text style={styles.codeText}>{card.code}</Text>

            <Text style={styles.bckText}>
              {getBckDisplay(card.num, card.code, card.catalogId)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingTop: 18, paddingHorizontal: 20, paddingLeft: 24, minHeight: 48, position: 'relative' },
  backWrap: { flexShrink: 0, marginRight: 16, alignSelf: 'center' },
  headerCenterWrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  titleCenterInner: { alignItems: 'center', justifyContent: 'center' },
  headerCenteredWrap: { paddingTop: 18, marginBottom: 16, alignItems: 'center', justifyContent: 'center' },
  numTitle: { fontSize: 48, fontWeight: '900', color: '#ffffff', letterSpacing: -2, textAlign: 'center' },
  scrollContentWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 100 },
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