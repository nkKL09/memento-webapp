/**
 * Веб: синхронизация навигации с Telegram BackButton, History API и свайп «назад».
 * - В Telegram: показываем системную кнопку «Назад» в шапке, скрываем на корневом экране.
 * - В браузере: pushState при переходе вперёд, popstate → goBack() (кнопка «Назад» браузера).
 * - На мобильном вебе и в Telegram Web App: свайп от левого края → goBack() (одна и та же логика).
 */

import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { hapticImpact } from './telegramWebApp';

const isWeb = Platform.OS === 'web';

function getTelegramWebApp() {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp ?? null;
}

function isTelegramWebApp() {
  return Boolean(getTelegramWebApp());
}

/**
 * Определяет, можно ли вернуться назад, по корневому состоянию навигации.
 * Корневой навигатор — один экран MainTabs; вложенные стеки (LearningStack, PracticeStack) внутри табов.
 * Возвращает true, если активный таб — стек с index > 0 (не на первом экране стека).
 * Учитывает отсутствие state у таба до первого перехода в стек.
 */
function canGoBackFromRootState(rootState, navigationRef) {
  if (!rootState?.routes?.length) return false;
  const rootRoute = rootState.routes[rootState.index];
  const tabState = rootRoute?.state;
  if (!tabState?.routes?.length) return false;
  const tabRoute = tabState.routes[tabState.index];
  const stackState = tabRoute?.state;
  if (!stackState?.routes?.length) return false;
  if (stackState.index > 0 || stackState.routes.length > 1) return true;
  return false;
}

function canGoBack(navigationRef, rootState) {
  if (canGoBackFromRootState(rootState, navigationRef)) return true;
  return Boolean(navigationRef?.current?.canGoBack?.());
}

function useTelegramBackButton(navigationRef, isHandlingBackRef) {
  useEffect(() => {
    if (!isWeb) return;
    const twa = getTelegramWebApp();
    if (!twa?.BackButton) return;
    // ref может быть ещё не установлен при первом монтировании — вешаем обработчик в любом случае, при клике ref уже будет
    const handleBack = () => {
      const nav = navigationRef?.current;
      if (!nav) return;
      const rootState = nav.getRootState?.();
      if (!canGoBack(navigationRef, rootState)) return;
      hapticImpact('light');
      if (isHandlingBackRef) isHandlingBackRef.current = true;
      try {
        nav.dispatch(CommonActions.goBack());
      } finally {
        setTimeout(() => {
          if (isHandlingBackRef) isHandlingBackRef.current = false;
        }, 100);
      }
    };

    const offClick = twa.BackButton.onClick(handleBack);

    return () => {
      twa.BackButton.hide();
      if (typeof offClick === 'function') offClick();
    };
  }, [navigationRef, isHandlingBackRef]);
}

function useHistorySync(navigationRef, isHandlingBackRef) {
  const isHandlingPopstateRef = useRef(false);
  const isInitialRef = useRef(true);

  useEffect(() => {
    if (!isWeb) return;

    const handlePopstate = () => {
      const nav = navigationRef?.current;
      const rootState = nav?.getRootState?.();
      if (!canGoBack(navigationRef, rootState)) return;
      isHandlingPopstateRef.current = true;
      nav.goBack();
      setTimeout(() => {
        isHandlingPopstateRef.current = false;
      }, 0);
    };

    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [navigationRef]);

  return useCallback(() => {
    if (!isWeb || !navigationRef?.current) return;
    if (isHandlingPopstateRef.current || (isHandlingBackRef?.current)) return;

    if (isInitialRef.current) {
      isInitialRef.current = false;
      const state = navigationRef.current.getRootState();
      const key = state?.key ?? 'root';
      window.history.replaceState({ navKey: key }, '', window.location.href);
    } else {
      const state = navigationRef.current.getRootState();
      const key = state?.key ?? `nav-${Date.now()}`;
      window.history.pushState({ navKey: key }, '', window.location.href);
    }

    const twa = getTelegramWebApp();
    if (twa?.BackButton) {
      const rootState = navigationRef.current.getRootState?.();
      if (canGoBack(navigationRef, rootState)) {
        twa.BackButton.show();
      } else {
        twa.BackButton.hide();
      }
    }
  }, [navigationRef, isHandlingBackRef]);
}

function useSwipeBack(navigationRef, isHandlingBackRef) {
  useEffect(() => {
    if (!isWeb) return;
    const media = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)');
    if (!media?.matches) return;

    let startX = 0;
    let startY = 0;
    let didSwipe = false;
    const EDGE_THRESHOLD = 110;
    const SWIPE_MIN = 50;

    const onTouchStart = (e) => {
      startX = e.touches?.[0]?.clientX ?? 0;
      startY = e.touches?.[0]?.clientY ?? 0;
      didSwipe = false;
    };

    const onTouchMove = (e) => {
      const x = e.touches?.[0]?.clientX ?? 0;
      const y = e.touches?.[0]?.clientY ?? 0;
      const deltaX = x - startX;
      const deltaY = y - startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      if (startX <= EDGE_THRESHOLD && deltaX > 15) {
        if (absY > absX * 1.2) return;
        e.preventDefault();
        e.stopPropagation?.();
        if (deltaX >= SWIPE_MIN) didSwipe = true;
      }
    };

    const onTouchEnd = () => {
      const nav = navigationRef?.current;
      if (didSwipe && nav && canGoBack(navigationRef, nav.getRootState?.())) {
        if (getTelegramWebApp()) hapticImpact('light');
        if (isHandlingBackRef) isHandlingBackRef.current = true;
        try {
          nav.dispatch(CommonActions.goBack());
        } finally {
          setTimeout(() => {
            if (isHandlingBackRef) isHandlingBackRef.current = false;
          }, 100);
        }
      }
      didSwipe = false;
    };

    const onTouchCancel = () => {
      didSwipe = false;
    };

    const opts = { capture: true };
    const optsPassive = { capture: true, passive: true };
    document.addEventListener('touchstart', onTouchStart, optsPassive);
    document.addEventListener('touchmove', onTouchMove, { ...opts, passive: false });
    document.addEventListener('touchend', onTouchEnd, optsPassive);
    document.addEventListener('touchcancel', onTouchCancel, optsPassive);

    return () => {
      document.removeEventListener('touchstart', onTouchStart, optsPassive);
      document.removeEventListener('touchmove', onTouchMove, opts);
      document.removeEventListener('touchend', onTouchEnd, optsPassive);
      document.removeEventListener('touchcancel', onTouchCancel, optsPassive);
    };
  }, [navigationRef, isHandlingBackRef]);
}

/**
 * Возвращает обработчик для onStateChange из NavigationContainer.
 * Передайте его в <NavigationContainer ref={navigationRef} onStateChange={handleStateChange} />.
 */
export function useWebAppNavSync(navigationRef) {
  const isTelegram = isWeb && isTelegramWebApp();
  const isHandlingBackRef = useRef(false);

  useTelegramBackButton(isTelegram ? navigationRef : { current: null }, isHandlingBackRef);
  const handleStateChange = useHistorySync(navigationRef, isHandlingBackRef);
  useSwipeBack(navigationRef, isHandlingBackRef);

  return handleStateChange;
}

export { isTelegramWebApp, getTelegramWebApp };
