import React, { useState, useEffect, useRef } from 'react';
import { View, Image, Platform, Pressable, Animated, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFontsLoaded } from './loadFonts';
import { useWebAppNavSync } from './useWebAppNavSync';
import {
  isTelegramWebApp,
  ready,
  expand,
  disableVerticalSwipes,
  setHeaderColor,
  setupDisableVerticalSwipesOnReady,
  ensureDocumentScrollable,
  getSafeAreaInsets,
  applySafeAreaToDocument,
  onSafeAreaChanged,
  hapticSelection,
} from './telegramWebApp';
import { AppIcon } from './components/AppIcon';

import HomeScreen from './screens/HomeScreen';
import PracticeStack from './screens/PracticeStack/PracticeStack';
import ProfileScreen from './screens/ProfileScreen';

import LearningStack from './screens/LearningStack/LearningStack';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();   // переименовал для ясности

function TabBarButtonWithHaptic(props) {
  const { onPress, href, to, ...rest } = props;
  return (
    <Pressable
      {...rest}
      onPress={(e) => {
        if (e?.preventDefault) e.preventDefault();
        if (e?.nativeEvent?.preventDefault) e.nativeEvent.preventDefault();
        hapticSelection();
        onPress?.(e);
      }}
    />
  );
}

function MainTabs() {
  // На web без обёртки flex-контейнер может не ограничивать высоту — таб-бар визуально перекрывает контент.
  // Обёртка с flex: 1 и minHeight: 0 даёт корректный расклад как в Expo Go (таб-бар в потоке).
  const tabWrapperStyle = Platform.OS === 'web' ? { flex: 1, minHeight: 0 } : { flex: 1 };

  return (
    <View style={tabWrapperStyle} collapsable={false}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#121e24',
            borderTopWidth: 1,
            borderTopColor: '#334155',
            height: 75,
            paddingTop: 12,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: '#49c0f8',
          tabBarInactiveTintColor: '#666',
          tabBarShowLabel: false,
          tabBarButton: TabBarButtonWithHaptic,
        }}
      >
      <Tab.Screen 
        name="Главная" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color }) => <AppIcon name="home" size={26} color={color} /> }} 
      />
      <Tab.Screen 
        name="Обучение" 
        component={LearningStack}
        options={{ tabBarIcon: ({ color }) => <AppIcon name="book" size={26} color={color} /> }} 
      />
      <Tab.Screen 
        name="Практика" 
        component={PracticeStack} 
        options={{ tabBarIcon: ({ color }) => <AppIcon name="barbell" size={26} color={color} /> }} 
      />
      <Tab.Screen 
        name="Профиль" 
        component={ProfileScreen} 
        options={{ tabBarIcon: ({ color }) => <AppIcon name="person" size={26} color={color} /> }} 
      />
    </Tab.Navigator>
    </View>
  );
}

const SPLASH_DURATION = 2000;

const FONTS_LOAD_TIMEOUT_MS = 5000;

const SPLASH_BG = '#0f1a26';
const LOAD_BAR_HEIGHT = 3;

/** Полоска загрузки снизу (неопределённый прогресс). */
function LoadingBar() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) loop();
      });
    };
    loop();
    return () => anim.stopAnimation();
  }, [anim]);
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-100%', '280%'],
  });
  return (
    <View style={loadBarStyles.outer}>
      <Animated.View style={[loadBarStyles.inner, { transform: [{ translateX }] }]} />
    </View>
  );
}

const loadBarStyles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: LOAD_BAR_HEIGHT,
    backgroundColor: 'rgba(73,192,248,0.25)',
    overflow: 'hidden',
  },
  inner: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '35%',
    backgroundColor: '#49c0f8',
  },
});

const initialTgSafeArea = () =>
  Platform.OS === 'web' && isTelegramWebApp() ? getSafeAreaInsets() : { top: 0, bottom: 0, left: 0, right: 0 };

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [fontsLoadTimedOut, setFontsLoadTimedOut] = useState(false);
  const [tgSafeArea, setTgSafeArea] = useState(initialTgSafeArea);
  const [fontsLoaded] = useFontsLoaded();
  const navigationRef = useRef(null);
  const webStateChangeHandler = useWebAppNavSync(navigationRef);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), SPLASH_DURATION);
    return () => clearTimeout(t);
  }, []);

  // На web: если шрифты не загрузились за 5 с — показываем приложение (не вешать экран)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const t = setTimeout(() => setFontsLoadTimedOut(true), FONTS_LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  // Telegram: при монтировании — ждём WebApp, отключаем закрытие свайпом вниз и подписываемся на viewportChanged
  useEffect(() => {
    if (Platform.OS !== 'web' || !isTelegramWebApp()) return;
    const unsubscribe = setupDisableVerticalSwipesOnReady();
    return unsubscribe;
  }, []);

  // Telegram: при показе сплэша — expand(), цвет шапки (синий), отключение свайпа вниз
  useEffect(() => {
    if (Platform.OS !== 'web' || !isTelegramWebApp() || !showSplash) return;
    const t = setTimeout(() => {
      setHeaderColor();
      expand();
      disableVerticalSwipes();
    }, 150);
    return () => clearTimeout(t);
  }, [showSplash]);

  // Telegram: после сплэша ещё раз запрет закрытия свайпом вниз и fallback скролла
  useEffect(() => {
    if (Platform.OS !== 'web' || !isTelegramWebApp() || showSplash) return;
    ensureDocumentScrollable();
    disableVerticalSwipes();
    const t1 = setTimeout(() => disableVerticalSwipes(), 300);
    const t2 = setTimeout(() => disableVerticalSwipes(), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [showSplash]);

  // Telegram: скрыть индикатор загрузки только когда приложение реально готово (после сплэша); повторно применить цвет шапки
  useEffect(() => {
    if (Platform.OS !== 'web' || !isTelegramWebApp() || showSplash) return;
    ready();
    setHeaderColor();
    const t1 = setTimeout(setHeaderColor, 200);
    const t2 = setTimeout(setHeaderColor, 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [showSplash]);

  // Telegram: обновить кнопку «Назад» в шапке после загрузки и ещё раз через 1 с (на случай запоздалого onStateChange)
  useEffect(() => {
    if (Platform.OS !== 'web' || !isTelegramWebApp() || showSplash || !webStateChangeHandler) return;
    const run = () => { if (navigationRef.current) webStateChangeHandler(); };
    const t1 = setTimeout(run, 400);
    const t2 = setTimeout(run, 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [showSplash, webStateChangeHandler]);

  // Telegram: safe area, дублирование на document/body/root для web, подписка на изменение, повтор с задержкой
  useEffect(() => {
    if (Platform.OS !== 'web' || !isTelegramWebApp()) return;
    const apply = () => {
      const insets = getSafeAreaInsets();
      setTgSafeArea(insets);
      applySafeAreaToDocument(insets);
    };
    apply();
    const t = setTimeout(apply, 150);
    const handleChange = (next) => {
      setTgSafeArea(next);
      applySafeAreaToDocument(next);
    };
    const unsubscribe = onSafeAreaChanged(handleChange);
    return () => {
      clearTimeout(t);
      unsubscribe();
    };
  }, []);

  // Убрать полоску загрузки из index.html (только web): при монтировании и после выхода из сплэша. Хуки — до любых return.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.getElementById('load-bar')?.remove();
  }, []);
  useEffect(() => {
    if (showSplash) return;
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const id = setTimeout(() => document.getElementById('load-bar')?.remove(), 100);
    return () => clearTimeout(id);
  }, [showSplash]);

  const showApp = fontsLoaded || fontsLoadTimedOut;

  if (!showApp) {
    return (
      <View style={{ flex: 1, backgroundColor: SPLASH_BG, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" backgroundColor={SPLASH_BG} />
        <LoadingBar />
      </View>
    );
  }

  if (showSplash) {
    return (
      <View style={{ flex: 1, backgroundColor: SPLASH_BG, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" backgroundColor={SPLASH_BG} />
        <View style={{ borderRadius: 64, overflow: 'hidden', width: 280, height: 280 }}>
          <Image
            source={require('./assets/logo.png')}
            style={{ width: 280, height: 280, backgroundColor: 'transparent' }}
            resizeMode="contain"
          />
        </View>
        <LoadingBar />
      </View>
    );
  }

  // В TWA: невидимый блок сверху (статус-бар + шапка Telegram + заголовок) — контент везде начинается ниже.
  const isTwa = Platform.OS === 'web' && isTelegramWebApp();
  const TWA_HEADER_BLOCK_HEIGHT = 100;
  const twaTop = isTwa ? Math.max(tgSafeArea.top, TWA_HEADER_BLOCK_HEIGHT) : tgSafeArea.top;
  const rootStyle = {
    flex: 1,
    backgroundColor: '#121e24',
    ...(isTwa
      ? {
          paddingTop: twaTop,
          paddingBottom: tgSafeArea.bottom,
          paddingLeft: tgSafeArea.left,
          paddingRight: tgSafeArea.right,
          minHeight: '100vh',
        }
      : {}),
  };

  const safeAreaEdges = isTwa ? [] : ['top'];

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <SafeAreaView style={rootStyle} edges={safeAreaEdges}>
        <StatusBar style="light" backgroundColor="#121e24" />

        <NavigationContainer
          ref={navigationRef}
          onStateChange={Platform.OS === 'web' ? webStateChangeHandler : undefined}
        >
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
            <RootStack.Screen name="MainTabs" component={MainTabs} />
          </RootStack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}