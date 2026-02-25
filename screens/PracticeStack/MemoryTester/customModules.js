// Свои (пользовательские) модули Memory Tester
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'memory_tester_custom_modules';

/** @returns {Promise<Array<{ id: string, name: string, elements: string[] }>>} */
export async function getCustomModules() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** Создать модуль. id будет вида custom_<uuid>. */
export async function addCustomModule({ name, elements }) {
  try {
    const list = await getCustomModules();
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const item = { id, name: (name || '').trim(), elements: Array.isArray(elements) ? elements.filter(Boolean).map((s) => String(s).trim()) : [] };
    await AsyncStorage.setItem(KEY, JSON.stringify([...list, item]));
    return item;
  } catch (e) {
    console.warn('customModules addCustomModule', e);
  }
}

/** Обновить модуль по id. */
export async function updateCustomModule(id, { name, elements }) {
  try {
    const list = await getCustomModules();
    const next = list.map((m) => {
      if (m.id !== id) return m;
      return {
        ...m,
        name: name != null ? String(name).trim() : m.name,
        elements: elements != null ? (Array.isArray(elements) ? elements.filter(Boolean).map((s) => String(s).trim()) : []) : m.elements,
      };
    });
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    return next.find((m) => m.id === id);
  } catch (e) {
    console.warn('customModules updateCustomModule', e);
  }
}

/** Удалить модуль по id. */
export async function removeCustomModule(id) {
  try {
    const list = await getCustomModules();
    const next = list.filter((m) => m.id !== id);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('customModules removeCustomModule', e);
  }
}
