// screens/LearningStack/textbookRead.js — какие статьи учебника отмечены как прочитанные
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'textbook_read';

export async function getReadArticleIds() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function setArticleRead(articleId) {
  try {
    const ids = await getReadArticleIds();
    if (ids.includes(articleId)) return;
    await AsyncStorage.setItem(KEY, JSON.stringify([...ids, articleId]));
  } catch (e) {
    console.warn('textbookRead setArticleRead', e);
  }
}

export async function removeArticleRead(articleId) {
  try {
    const ids = await getReadArticleIds();
    const next = ids.filter((id) => id !== articleId);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('textbookRead removeArticleRead', e);
  }
}

export function isArticleRead(ids, articleId) {
  return ids != null && ids.includes(articleId);
}
