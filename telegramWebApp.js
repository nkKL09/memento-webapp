/**
 * Telegram Web App API — только для веба. На нативе все функции no-op или возвращают значения по умолчанию.
 * Скрипт https://telegram.org/js/telegram-web-app.js подключается первым в <head> при сборке (scripts/patch-index-fonts.js).
 */

import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

function getTwa() {
  if (!isWeb || typeof window === 'undefined') return null;
  return window.Telegram?.WebApp ?? null;
}

export function isTelegramWebApp() {
  return Boolean(getTwa());
}

/** ID пользователя Telegram из initDataUnsafe (для привязки прогресса). На нативе — null. */
export function getTelegramUserId() {
  const twa = getTwa();
  const user = twa?.initDataUnsafe?.user;
  return user?.id ?? null;
}

/** Префикс для ключей AsyncStorage: в Telegram — «tg_123_», иначе «». Прогресс привязывается к аккаунту. */
export function getStorageKeyPrefix() {
  const id = getTelegramUserId();
  return id != null ? `tg_${id}_` : '';
}

/** Сообщить Telegram, что приложение готово — скрыть их индикатор загрузки. */
export function ready() {
  const twa = getTwa();
  if (twa?.ready) twa.ready();
}

/** Развернуть Mini App на максимальную высоту. */
export function expand() {
  const twa = getTwa();
  if (twa?.expand) twa.expand();
}

/** Цвет шапки в TWA (синее поле, белые иконки/текст — задаёт Telegram). */
const HEADER_COLOR = '#49c0f8';

/**
 * Установить цвет шапки Mini App — фирменный синий.
 * До Bot API 6.9 принимается только theme key (bg_color/secondary_bg_color); произвольный hex — с 6.9.
 * В части клиентов Telegram есть баг, при котором setHeaderColor не даёт эффекта — тогда вид остаётся стандартным.
 */
export function setHeaderColor() {
  const twa = getTwa();
  if (!twa?.setHeaderColor) return;
  const canUseHex = typeof twa.isVersionAtLeast === 'function' && twa.isVersionAtLeast('6.9');
  if (canUseHex) {
    twa.setHeaderColor(HEADER_COLOR);
  } else {
    twa.setHeaderColor('secondary_bg_color');
  }
}

/** Отключить закрытие свайпом вниз (удобно при вертикальном скролле). */
export function disableVerticalSwipes() {
  const twa = getTwa();
  if (twa?.disableVerticalSwipes) twa.disableVerticalSwipes();
}

/**
 * Резервный трюк для веба: сделать документ хотя бы чуть скроллируемым (1px),
 * чтобы свайп вниз не интерпретировался как закрытие Mini App. Вызывать только на web при isTelegramWebApp().
 */
export function ensureDocumentScrollable() {
  if (!isWeb || typeof document === 'undefined' || !isTelegramWebApp()) return;
  const el = document.documentElement;
  const vh = window.innerHeight || 0;
  if (el && vh > 0 && el.scrollHeight <= vh) {
    el.style.setProperty('min-height', 'calc(100vh + 1px)', 'important');
  }
}

/**
 * Подписка на появление WebApp и viewportChanged с вызовом disableVerticalSwipes.
 * Возвращает функцию отписки.
 */
export function setupDisableVerticalSwipesOnReady() {
  if (!isWeb) return () => {};
  const twa = getTwa();
  if (twa) {
    disableVerticalSwipes();
    setHeaderColor();
    const onViewport = () => {
      disableVerticalSwipes();
      setHeaderColor();
    };
    if (twa.onEvent) {
      twa.onEvent('viewportChanged', onViewport);
      return () => twa.offEvent?.('viewportChanged', onViewport);
    }
    return () => {};
  }
  const id = setInterval(() => {
    const w = getTwa();
    if (w) {
      clearInterval(id);
      disableVerticalSwipes();
      setHeaderColor();
      if (w.onEvent) w.onEvent('viewportChanged', () => { disableVerticalSwipes(); setHeaderColor(); });
    }
  }, 50);
  return () => clearInterval(id);
}

/** Предложить добавить иконку на рабочий стол (Bot API 8.0+). */
export function addToHomeScreen() {
  const twa = getTwa();
  if (twa?.addToHomeScreen) twa.addToHomeScreen();
}

/** Минимальный верхний отступ для iOS (статус-бар + Dynamic Island). Telegram часто отдаёт 0 или слишком мало. */
const FALLBACK_TOP_INSET_IOS = 110;

function isLikelyIOS() {
  if (!isWeb || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Safe area insets (отступы от вырезов, острова и т.д.).
 * Приоритет: contentSafeAreaInset (контент не перекрывается UI Telegram), затем safeAreaInset.
 * На iOS в Telegram часто приходят 0 — подставляем fallback для верха (Dynamic Island).
 * @returns {{ top: number, bottom: number, left: number, right: number }}
 */
export function getSafeAreaInsets() {
  const twa = getTwa();
  const insets = twa?.contentSafeAreaInset ?? twa?.safeAreaInset;
  let top = 0,
    bottom = 0,
    left = 0,
    right = 0;
  if (insets) {
    top = Number(insets.top) || 0;
    bottom = Number(insets.bottom) || 0;
    left = Number(insets.left) || 0;
    right = Number(insets.right) || 0;
  }
  if (twa && top < FALLBACK_TOP_INSET_IOS && (isLikelyIOS() || isTelegramWebApp())) {
    top = FALLBACK_TOP_INSET_IOS;
  }
  return { top, bottom, left, right };
}

/**
 * Не сдвигаем весь экран — safe area применяется только к заголовку (ScreenHeader).
 * Отступы на body отключены, чтобы не было чёрной полосы сверху.
 */
export function applySafeAreaToDocument(_insets) {
  if (!isWeb || !isTelegramWebApp()) return;
  const el = document.body;
  if (!el) return;
  el.style.removeProperty('padding-top');
  el.style.removeProperty('padding-bottom');
  el.style.removeProperty('padding-left');
  el.style.removeProperty('padding-right');
}

/** Подписка на изменение safe area (ориентация и т.д.). Возвращает функцию отписки. */
export function onSafeAreaChanged(callback) {
  const twa = getTwa();
  if (!twa?.onEvent || !callback) return () => {};
  const handler = () => callback(getSafeAreaInsets());
  twa.onEvent('safeAreaChanged', handler);
  twa.onEvent('contentSafeAreaChanged', handler);
  return () => {
    twa.offEvent('safeAreaChanged', handler);
    twa.offEvent('contentSafeAreaChanged', handler);
  };
}

// --- HapticFeedback ---

function getHapticFeedback() {
  const twa = getTwa();
  const h = twa?.HapticFeedback ?? twa?.hapticFeedback;
  if (!h) return null;
  if (typeof twa?.isVersionAtLeast === 'function' && twa.isVersionAtLeast('6.1') === false) return null;
  if (typeof h.isSupported === 'function' && h.isSupported() === false) return null;
  return h;
}

/** Лёгкий/средний/тяжёлый удар (кнопки, значимые действия). Вызывать синхронно в обработчике нажатия. */
export function hapticImpact(style = 'medium') {
  const h = getHapticFeedback();
  if (h?.impactOccurred) h.impactOccurred(style);
}

/** Смена выбора (табы, перелистывание, выбор пункта). Вызывать синхронно в onPress/onClick. */
export function hapticSelection() {
  const h = getHapticFeedback();
  if (h?.selectionChanged) h.selectionChanged();
}

/** Уведомление: success / warning / error. */
export function hapticNotification(type = 'success') {
  const h = getHapticFeedback();
  if (h?.notificationOccurred) h.notificationOccurred(type);
}
