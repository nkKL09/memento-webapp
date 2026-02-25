import React, { useState, useEffect } from 'react';
import { View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';

import HomeScreen from './screens/HomeScreen';
import PracticeStack from './screens/PracticeStack/PracticeStack';
import ProfileScreen from './screens/ProfileScreen';

import LearningStack from './screens/LearningStack/LearningStack';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();   // переименовал для ясности

function MainTabs() {
  return (
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
      }}
    >
      <Tab.Screen 
        name="Главная" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color }) => <Ionicons name="home" size={26} color={color} /> }} 
      />
      <Tab.Screen 
        name="Обучение" 
        component={LearningStack}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="book" size={26} color={color} /> }} 
      />
      <Tab.Screen 
        name="Практика" 
        component={PracticeStack} 
        options={{ tabBarIcon: ({ color }) => <Ionicons name="barbell" size={26} color={color} /> }} 
      />
      <Tab.Screen 
        name="Профиль" 
        component={ProfileScreen} 
        options={{ tabBarIcon: ({ color }) => <Ionicons name="person" size={26} color={color} /> }} 
      />
    </Tab.Navigator>
  );
}

const SPLASH_DURATION = 2000;

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), SPLASH_DURATION);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) {
    const splashBg = '#0f1a26';
    return (
      <View style={{ flex: 1, backgroundColor: splashBg, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" backgroundColor={splashBg} />
        <View style={{ borderRadius: 64, overflow: 'hidden', width: 280, height: 280 }}>
          <Image
            source={require('./assets/logo.png')}
            style={{ width: 280, height: 280, backgroundColor: 'transparent' }}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#121e24' }} edges={['top']}>
        <StatusBar style="light" backgroundColor="#121e24" />

        <NavigationContainer>
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
            <RootStack.Screen name="MainTabs" component={MainTabs} />
          </RootStack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}