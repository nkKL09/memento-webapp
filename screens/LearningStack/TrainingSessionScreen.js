// screens/LearningStack/TrainingSessionScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { loadCards } from './loadCards.js';
import { getProgress, addKnownAndSave, completeAndReset } from './trainingProgress.js';

const getCardId = (card) => (card && (card.num != null ? card.num : card.realName)) || '';

const suitConfig = {
  'Т': { symbol: '♣', color: '#ffffff' },
  'Ч': { symbol: '♥', color: '#ff4d4d' },
  'Б': { symbol: '♦', color: '#ff4d4d' },
  'П': { symbol: '♠', color: '#ffffff' },
};

const getCardTitle = (num) => {
  if (!num) return <Text style={styles.cardTitle}>???</Text>;
  if (num.length < 2) return <Text style={styles.cardTitle}>{num}</Text>;

  const suit = num[0];
  let rank = num.slice(1);
  const config = suitConfig[suit];
  if (!config) return <Text style={styles.cardTitle}>{num}</Text>;

  let rankDisplay = rank;
  if (rank === '10') rankDisplay = '1(0)';
  else if (rank === 'В') rankDisplay = 'Валет';
  else if (rank === 'Д') rankDisplay = 'Дама';
  else if (rank === 'К') rankDisplay = 'Король';
  else if (rank === 'Т') rankDisplay = 'Туз';

  return (
    <Text style={styles.cardTitle}>
      <Text style={{ color: config.color }}>{config.symbol}</Text>
      <Text style={{ color: '#ffffff' }}> {rankDisplay}</Text>
    </Text>
  );
};

const getBckDisplay = (num, code, catalogId) => {
  if (catalogId === 'week' || catalogId === 'ru-alphabet' || catalogId === 'en-alphabet') return '';
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

export default function TrainingSessionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { subRange, catalogId, shuffleMode, sessionTitle, fullCatalog } = route.params || {};

  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const sessionHadPostponedRef = useRef(false);

  const subRangeKey = fullCatalog ? 'full' : subRange;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = loadCards(catalogId, shuffleMode || fullCatalog ? null : subRange);
      if (shuffleMode) {
        if (!cancelled) {
          setCards(data);
          setCardIndex(data.length > 0 ? Math.floor(Math.random() * data.length) : 0);
          setIsFlipped(false);
          setLoading(false);
        }
        return;
      }
      const { knownIds } = await getProgress(catalogId, subRangeKey);
      const knownSet = new Set(knownIds);
      const remaining = data.filter((c) => !knownSet.has(getCardId(c)));
      if (!cancelled) {
        sessionHadPostponedRef.current = false;
        setCards(remaining);
        setCardIndex(0);
        setIsFlipped(false);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [catalogId, subRange, shuffleMode, fullCatalog, subRangeKey]);

  const currentCard = cards[cardIndex] || {};

  const handleShuffle = () => {
    if (cards.length === 0) return;
    setCardIndex(Math.floor(Math.random() * cards.length));
    setIsFlipped(false);
  };

  const handleKnow = useCallback(async () => {
    if (cards.length === 0) return;
    const id = getCardId(currentCard);
    const { knownIds } = await getProgress(catalogId, subRangeKey);
    const nextKnown = [...new Set([...knownIds, id])];
    await addKnownAndSave(catalogId, subRangeKey, nextKnown);
    const nextRemaining = cards.filter((c) => getCardId(c) !== id);
    setIsFlipped(false);
    if (nextRemaining.length === 0) {
      if (!sessionHadPostponedRef.current) {
        await completeAndReset(catalogId, subRangeKey);
      }
      setTimeout(() => navigation.goBack(), 180);
      return;
    }
    setCards(nextRemaining);
    setCardIndex((i) => (i >= nextRemaining.length ? nextRemaining.length - 1 : i));
  }, [cards, currentCard, catalogId, subRangeKey, navigation]);

  const handleRepeatLater = useCallback(() => {
    if (cards.length === 0) return;
    sessionHadPostponedRef.current = true;
    const id = getCardId(currentCard);
    const nextRemaining = cards.filter((c) => getCardId(c) !== id);
    setIsFlipped(false);
    if (nextRemaining.length === 0) {
      setTimeout(() => navigation.goBack(), 180);
      return;
    }
    setCards(nextRemaining);
    setCardIndex((i) => Math.min(i, nextRemaining.length - 1));
  }, [cards, currentCard, navigation]);

  const handleNext = () => {
    setIsFlipped(false);
    if (cards.length === 0 || cardIndex >= cards.length - 1) {
      setTimeout(() => navigation.goBack(), 180);
      return;
    }
    setCardIndex(cardIndex + 1);
  };

  const hintText = isFlipped ? 'Нажми, чтобы вернуться' : 'Нажми, чтобы увидеть образ';

  const getDisplayText = () => currentCard.num || currentCard.realName || currentCard.code || '?';

  const renderFrontSide = () => {
    if (catalogId === 'cards') return getCardTitle(currentCard.num);
    if (catalogId === 'ru-alphabet' || catalogId === 'en-alphabet' || catalogId.includes('-')) {
      return <Text style={styles.bigText}>{getDisplayText()}</Text>;
    }
    return <Text style={styles.nameText}>{getDisplayText()}</Text>;
  };

  if (loading || !catalogId) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Загрузка...</Text>
      </View>
    );
  }

  const headerTitle = shuffleMode
    ? sessionTitle
    : fullCatalog
      ? (sessionTitle || `${subRange || ''} — обучение`)
      : subRange;

  if (!shuffleMode && cards.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>{headerTitle}</Text>
        <Text style={styles.emptyText}>Нет карточек для повторения</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{headerTitle}</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => setIsFlipped(!isFlipped)}
        activeOpacity={0.95}
      >
        <View style={styles.cardContent}>
          {!isFlipped ? (
            <>
              {renderFrontSide()}
              {getBckDisplay(currentCard.num, currentCard.code, catalogId) && (
                <Text style={styles.bckText}>
                  {getBckDisplay(currentCard.num, currentCard.code, catalogId)}
                </Text>
              )}
            </>
          ) : (
            <View style={styles.flippedContainer}>
              {currentCard.image && (
                <Image source={currentCard.image} style={styles.image} resizeMode="contain" />
              )}
              <Text style={styles.codeText}>{currentCard.code}</Text>
            </View>
          )}
        </View>

        <Text style={styles.tapHint}>{hintText}</Text>
      </TouchableOpacity>

      {shuffleMode && cards.length > 0 ? (
        <View style={styles.shuffleButtonContainer}>
          <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffle}>
            <Text style={styles.buttonText}>Перемешать</Text>
          </TouchableOpacity>
        </View>
      ) : isFlipped && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.knowButton} onPress={handleKnow}>
            <Text style={styles.buttonText}>Знаю</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.repeatButton} onPress={handleRepeatLater}>
            <Text style={styles.buttonText}>Повторить позже</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24', paddingTop: 18, paddingHorizontal: 20 },
  header: { fontSize: 34, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 40 },
  card: { width: '100%', height: 460, backgroundColor: '#1a2a35', borderRadius: 32, borderWidth: 6, borderColor: '#49c0f8', overflow: 'hidden', position: 'relative' },
  cardContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 70 },

  bigText: { fontSize: 110, fontWeight: '900', color: '#ffffff', textAlign: 'center' },
  nameText: { fontSize: 58, fontWeight: '700', color: '#ffffff', textAlign: 'center', letterSpacing: -0.5 },
  cardTitle: { fontSize: 58, fontWeight: '700', textAlign: 'center' },

  bckText: { fontSize: 36, color: '#49c0f8', marginTop: 16, fontWeight: '700' },
  flippedContainer: { alignItems: 'center', width: '100%' },
  image: { width: 260, height: 260, marginBottom: 30 },
  codeText: { fontSize: 48, fontWeight: '700', color: '#ffffff', textAlign: 'center', paddingHorizontal: 20 },
  tapHint: { position: 'absolute', bottom: 24, color: '#94a3b8', fontSize: 16, textAlign: 'center', width: '100%' },

  buttonsContainer: { flexDirection: 'row', width: '100%', marginTop: 40, paddingHorizontal: 4, gap: 12 },
  knowButton: { flex: 1, backgroundColor: '#22c55e', height: 60, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  repeatButton: { flex: 1, backgroundColor: '#f97316', height: 60, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  shuffleButtonContainer: { width: '100%', marginTop: 40, paddingHorizontal: 4 },
  shuffleButton: { backgroundColor: '#49c0f8', height: 60, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 18, color: '#94a3b8', textAlign: 'center', marginTop: 20 },
  backBtn: { marginTop: 24, backgroundColor: '#334155', height: 56, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
});