// screens/LearningStack/loadCards.js — общая загрузка карточек каталога
import * as CatalogData from '../../data/index.js';
import ruAlphabetData from '../../data/ruAlphabet.js';
import enAlphabetData from '../../data/enAlphabet.js';

export function loadCards(catalogId, subRange) {
  if (!catalogId) return [];

  let dataSource = [];

  if (catalogId === 'ru-alphabet') {
    dataSource = ruAlphabetData || [];
  } else if (catalogId === 'en-alphabet') {
    dataSource = enAlphabetData || [];
  } else if (catalogId === 'months') {
    dataSource = CatalogData.months || [];
  } else if (catalogId === 'week') {
    dataSource = CatalogData.week || [];
  } else if (catalogId === 'cards') {
    dataSource = CatalogData.playingCards || [];
    const suitMap = { 'Трефы': 'Т', 'Черви': 'Ч', 'Бубны': 'Б', 'Пики': 'П' };
    const suitLetter = suitMap[subRange];
    if (suitLetter) {
      dataSource = dataSource.filter(card => card.num?.startsWith(suitLetter));
    }
  } else if (catalogId.includes('-')) {
    const numericMap = {
      '00-99': CatalogData.cards0099 || [],
      '000-099': CatalogData.cards000099 || [],
      '100-199': CatalogData.cards100199 || [],
      '200-299': CatalogData.cards200299 || [],
      '300-399': CatalogData.cards300399 || [],
      '400-499': CatalogData.cards400499 || [],
      '500-599': CatalogData.cards500599 || [],
      '600-699': CatalogData.cards600699 || [],
      '700-799': CatalogData.cards700799 || [],
      '800-899': CatalogData.cards800899 || [],
      '900-999': CatalogData.cards900999 || [],
    };
    dataSource = numericMap[catalogId] || [];

    if (subRange) {
      const [startStr, endStr] = subRange.split('-');
      dataSource = dataSource.filter(card => {
        const num = card.num || '';
        return num >= startStr && num <= endStr;
      });
    }
  }

  return dataSource;
}

/** Найти карточку по числу: для 2 цифр — каталог 00-99, для 3 — 000-099 … 900-999 */
export function getCardByNum(numStr) {
  if (!numStr || typeof numStr !== 'string') return null;
  const digits = numStr.replace(/\D/g, '');
  if (digits.length === 2) {
    const padded = digits.padStart(2, '0');
    const cards = loadCards('00-99', null);
    return cards.find((c) => (c.num || '').padStart(2, '0') === padded) || null;
  }
  if (digits.length === 3) {
    const padded = digits.padStart(3, '0');
    const first = padded[0];
    const catalogId = first === '0' ? '000-099' : `${first}00-${first}99`;
    const cards = loadCards(catalogId, null);
    return cards.find((c) => (c.num || '').padStart(3, '0') === padded) || null;
  }
  return null;
}
