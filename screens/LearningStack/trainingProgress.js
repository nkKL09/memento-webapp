// screens/LearningStack/trainingProgress.js — сохранение прогресса обучения (знаю / звёзды)
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'training_';

function storageKey(catalogId, subRangeKey) {
  const sub = subRangeKey == null || subRangeKey === '' ? 'full' : subRangeKey;
  return PREFIX + catalogId + '_' + sub;
}

export async function getProgress(catalogId, subRangeKey) {
  try {
    const key = storageKey(catalogId, subRangeKey);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return { knownIds: [], stars: 0 };
    const data = JSON.parse(raw);
    return {
      knownIds: Array.isArray(data.knownIds) ? data.knownIds : [],
      stars: typeof data.stars === 'number' ? Math.min(3, Math.max(0, data.stars)) : 0,
    };
  } catch {
    return { knownIds: [], stars: 0 };
  }
}

export async function setKnownIds(catalogId, subRangeKey, knownIds) {
  try {
    const key = storageKey(catalogId, subRangeKey);
    const current = await getProgress(catalogId, subRangeKey);
    await AsyncStorage.setItem(key, JSON.stringify({ ...current, knownIds }));
  } catch (_) {}
}

export async function addKnownAndSave(catalogId, subRangeKey, knownIds) {
  return setKnownIds(catalogId, subRangeKey, knownIds);
}

export async function setStars(catalogId, subRangeKey, stars) {
  try {
    const key = storageKey(catalogId, subRangeKey);
    const current = await getProgress(catalogId, subRangeKey);
    await AsyncStorage.setItem(key, JSON.stringify({ ...current, stars: Math.min(3, Math.max(0, stars)) }));
  } catch (_) {}
}

/** После полного прохождения: +1 звезда, сброс knownIds. */
export async function completeAndReset(catalogId, subRangeKey) {
  try {
    const key = storageKey(catalogId, subRangeKey);
    const current = await getProgress(catalogId, subRangeKey);
    const nextStars = Math.min(3, (current.stars || 0) + 1);
    await AsyncStorage.setItem(key, JSON.stringify({ knownIds: [], stars: nextStars }));
  } catch (_) {}
}
