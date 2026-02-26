// История результатов экзаменов Memory Tester
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageKeyPrefix } from '../../../telegramWebApp';

function getKey() {
  return getStorageKeyPrefix() + 'memory_tester_exam_history';
}

/** @returns {Promise<Array<{ id: string, moduleId: string, moduleName: string, count: number, correct: number, total: number, coefficient: number, startTime: number, endTime: number }>>} */
export async function getExamHistory() {
  try {
    const raw = await AsyncStorage.getItem(getKey());
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** Сохранить результат экзамена. */
export async function addExamResult(entry) {
  try {
    const list = await getExamHistory();
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const item = { ...entry, id };
    await AsyncStorage.setItem(getKey(), JSON.stringify([item, ...list]));
    return item;
  } catch (e) {
    console.warn('examHistory addExamResult', e);
  }
}

/** Удалить одну запись по id. */
export async function removeExamResult(id) {
  try {
    const list = await getExamHistory();
    const next = list.filter((item) => item.id !== id);
    await AsyncStorage.setItem(getKey(), JSON.stringify(next));
  } catch (e) {
    console.warn('examHistory removeExamResult', e);
  }
}

/** Удалить всю историю. */
export async function clearExamHistory() {
  try {
    await AsyncStorage.setItem(getKey(), JSON.stringify([]));
  } catch (e) {
    console.warn('examHistory clearExamHistory', e);
  }
}
