import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import * as CatalogData from '../../data/index.js';
import BackButton from '../../components/BackButton';

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
    <Text style={{ fontSize: 26, fontWeight: 'bold' }}>
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

/* ====================== УМНЫЙ ПОИСК ====================== */
const customSearchFilterAndSort = (allCards, searchQuery) => {
  if (!searchQuery.trim()) return [];

  const q = searchQuery.toLowerCase().trim();
  const isNumericQuery = /^[0-9]+$/.test(q);

  let results = allCards.filter(card => {
    const numStr = card.num.toLowerCase();
    const codeStr = (card.code || '').toLowerCase();
    const realStr = (card.realName || '').toLowerCase();

    let matches = numStr.startsWith(q) ||
                  codeStr.startsWith(q) ||
                  realStr.startsWith(q);

    if (isNumericQuery) {
      const qClean = q.replace(/^0+/, '') || '0';
      const numClean = numStr.replace(/^0+/, '') || '0';
      if (numClean === qClean) matches = true;
    }

    return matches;
  });

  results = [...results].sort((a, b) => {
    const aNum = a.num;
    const bNum = b.num;

    if (isNumericQuery) {
      const qClean = q.replace(/^0+/, '') || '0';
      const aClean = aNum.replace(/^0+/, '') || '0';
      const bClean = bNum.replace(/^0+/, '') || '0';

      const aExact = aClean === qClean;
      const bExact = bClean === qClean;

      if (aExact !== bExact) return aExact ? -1 : 1;
      if (aExact && bExact) {
        return bNum.length - aNum.length;
      }

      return aNum.localeCompare(bNum, undefined, { numeric: true });
    }

    if (/^[а-яёa-z]/i.test(q)) {
      const aRu = a.catalogId === 'ru-alphabet';
      const bRu = b.catalogId === 'ru-alphabet';
      const aEn = a.catalogId === 'en-alphabet';
      const bEn = b.catalogId === 'en-alphabet';
      if (aRu !== bRu) return aRu ? -1 : 1;
      if (aEn !== bEn) return aEn ? -1 : 1;
    }

    return aNum.localeCompare(bNum);
  });

  return results;
};
/* ======================================================== */

export default function CodeLibrary({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [mainFilter, setMainFilter] = useState(null);
  const [numberFilter, setNumberFilter] = useState(null);
  const [alphabetFilter, setAlphabetFilter] = useState(null);
  const [suitFilter, setSuitFilter] = useState(null);

  const mainFilters = [
    { id: 'numbers', label: 'Числа' },
    { id: 'months', label: 'Месяцы' },
    { id: 'week', label: 'Неделя' },
    { id: 'alphabet', label: 'Алфавит' },
    { id: 'cards', label: 'Карты' },
  ];

  const numberRanges = [
    { id: '00-99', name: '00-99' },
    { id: '000-099', name: '000-099' },
    { id: '100-199', name: '100-199' },
    { id: '200-299', name: '200-299' },
    { id: '300-399', name: '300-399' },
    { id: '400-499', name: '400-499' },
    { id: '500-599', name: '500-599' },
    { id: '600-699', name: '600-699' },
    { id: '700-799', name: '700-799' },
    { id: '800-899', name: '800-899' },
    { id: '900-999', name: '900-999' },
  ];

  const suitFilters = [
    { id: 'Т', name: 'Трефы' },
    { id: 'Ч', name: 'Черви' },
    { id: 'Б', name: 'Бубны' },
    { id: 'П', name: 'Пики' },
  ];

  const allCards = useMemo(() => {
    const list = [];
    const catalogs = [
      { id: '00-99', name: '00-99', data: CatalogData.cards0099 || [], type: 'numbers' },
      { id: '000-099', name: '000-099', data: CatalogData.cards000099 || [], type: 'numbers' },
      { id: '100-199', name: '100-199', data: CatalogData.cards100199 || [], type: 'numbers' },
      { id: '200-299', name: '200-299', data: CatalogData.cards200299 || [], type: 'numbers' },
      { id: '300-399', name: '300-399', data: CatalogData.cards300399 || [], type: 'numbers' },
      { id: '400-499', name: '400-499', data: CatalogData.cards400499 || [], type: 'numbers' },
      { id: '500-599', name: '500-599', data: CatalogData.cards500599 || [], type: 'numbers' },
      { id: '600-699', name: '600-699', data: CatalogData.cards600699 || [], type: 'numbers' },
      { id: '700-799', name: '700-799', data: CatalogData.cards700799 || [], type: 'numbers' },
      { id: '800-899', name: '800-899', data: CatalogData.cards800899 || [], type: 'numbers' },
      { id: '900-999', name: '900-999', data: CatalogData.cards900999 || [], type: 'numbers' },
      { id: 'months', name: 'Месяц', data: CatalogData.months || [], type: 'months' },
      { id: 'week', name: 'Неделя', data: CatalogData.week || [], type: 'week' },
      { id: 'ru-alphabet', name: 'Рус. алфавит', data: CatalogData.ruAlphabet || [], type: 'alphabet' },
      { id: 'en-alphabet', name: 'Англ. алфавит', data: CatalogData.enAlphabet || [], type: 'alphabet' },
      { id: 'cards', name: 'Игральные карты', data: CatalogData.playingCards || [], type: 'cards' },
    ];

    const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
    const dayNames = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];

    catalogs.forEach(cat => {
      cat.data.forEach((card, index) => {
        let realName = '';
        if (cat.id === 'months') realName = monthNames[index] || '';
        if (cat.id === 'week') realName = dayNames[index] || '';

        list.push({
          ...card,
          catalogId: cat.id,
          catalogName: cat.name,
          realName,
          type: cat.type,
        });
      });
    });

    return list;
  }, []);

  const filteredCards = useMemo(() => {
    if (searchText.trim()) {
      return customSearchFilterAndSort(allCards, searchText);
    }

    if (!mainFilter) return [];

    let results = allCards;

    if (mainFilter === 'numbers') {
      if (!numberFilter) return [];
      results = results.filter(card => card.catalogId === numberFilter);
    } else if (mainFilter === 'months') {
      results = results.filter(c => c.type === 'months');
    } else if (mainFilter === 'week') {
      results = results.filter(c => c.type === 'week');
    } else if (mainFilter === 'alphabet') {
      if (!alphabetFilter) return [];
      results = results.filter(card => card.catalogId === alphabetFilter);
    } else if (mainFilter === 'cards') {
      if (!suitFilter) return [];
      results = results.filter(card => card.type === 'cards' && card.num.startsWith(suitFilter));
    }

    if (mainFilter === 'cards') {
      const rankOrder = { '2':1, '3':2, '4':3, '5':4, '6':5, '7':6, '8':7, '9':8, '10':9, 'В':10, 'Д':11, 'К':12, 'Т':13 };
      results.sort((a, b) => {
        const rankA = rankOrder[a.num.slice(1)] || 99;
        const rankB = rankOrder[b.num.slice(1)] || 99;
        return rankA - rankB;
      });
    } else {
      results.sort((a, b) => a.num.localeCompare(b.num));
    }

    return results;
  }, [searchText, mainFilter, numberFilter, alphabetFilter, suitFilter, allCards]);

  const openCard = (card) => {
    navigation.navigate('ReferenceCard', { card });
  };

  const hasSecondRow = mainFilter === 'numbers' || mainFilter === 'cards' || mainFilter === 'alphabet';

  const renderChipsHeader = () => (
    <>
      {searchText.trim() === '' && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={[styles.chipsContainer, { paddingBottom: 20 }]}
        >
          {mainFilters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.chip, mainFilter === filter.id && styles.chipActive]}
              onPress={() => {
                setMainFilter(filter.id);
                setNumberFilter(null);
                setAlphabetFilter(null);
                setSuitFilter(null);
              }}
            >
              <Text style={[styles.chipText, mainFilter === filter.id && styles.chipTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {searchText.trim() === '' && hasSecondRow && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={[styles.chipsContainer, { marginTop: 0, marginBottom: 12 }]}
        >
          {mainFilter === 'numbers' && numberRanges.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.chip, numberFilter === item.id && styles.chipActive]}
              onPress={() => setNumberFilter(item.id)}
            >
              <Text style={[styles.chipText, numberFilter === item.id && styles.chipTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
          {mainFilter === 'cards' && suitFilters.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.chip, suitFilter === item.id && styles.chipActive]}
              onPress={() => setSuitFilter(item.id)}
            >
              <Text style={[styles.chipText, suitFilter === item.id && styles.chipTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
          {mainFilter === 'alphabet' && (
            <>
              <TouchableOpacity
                style={[styles.chip, alphabetFilter === 'ru-alphabet' && styles.chipActive]}
                onPress={() => setAlphabetFilter('ru-alphabet')}
              >
                <Text style={[styles.chipText, alphabetFilter === 'ru-alphabet' && styles.chipTextActive]}>
                  Русский алфавит
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, alphabetFilter === 'en-alphabet' && styles.chipActive]}
                onPress={() => setAlphabetFilter('en-alphabet')}
              >
                <Text style={[styles.chipText, alphabetFilter === 'en-alphabet' && styles.chipTextActive]}>
                  Английский алфавит
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.header}>Справочник</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по номеру или слову..."
          placeholderTextColor="#94a3b8"
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="always"
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={filteredCards}
        keyExtractor={(item) => `${item.catalogId}-${item.num}`}
        ListHeaderComponent={renderChipsHeader}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => openCard(item)}>
            <View style={styles.left}>
              <Text style={styles.num}>
                {item.type === 'cards' ? getCardTitle(item.num) : item.num}
              </Text>
              <Text style={styles.code}>{item.code}</Text>
              <Text style={styles.bck}>
                {getBckDisplay(item.num, item.code, item.catalogId)}
              </Text>
            </View>
            {item.image && <Image source={item.image} style={styles.thumb} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View style={styles.empty} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121e24', 
    paddingTop: 18, 
    paddingHorizontal: 20 
  },
  header: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  searchContainer: { paddingBottom: 16 },
  searchInput: {
    backgroundColor: '#1a2a35',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    color: '#ffffff',
  },
  chipsContainer: {
    paddingHorizontal: 0,
    paddingBottom: 12,
    gap: 8,
  },
  chip: {
    backgroundColor: '#1a2a35',
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#49c0f8',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 14.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  list: { 
    paddingHorizontal: 0, 
    paddingBottom: 140,
  },
  item: {
    backgroundColor: '#1a2a35',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: { flex: 1 },
  num: { fontSize: 26, fontWeight: 'bold', color: '#ffffff' },
  code: { fontSize: 19, color: '#ffffff', marginVertical: 4 },
  bck: { fontSize: 16, color: '#49c0f8' },
  thumb: { width: 70, height: 70, borderRadius: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 140 },
});