import React from 'react';
import { View, Text } from 'react-native';
import { APP_VERSION } from '../version';
import ScreenHeader from '../components/ScreenHeader';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#121e24' }}>
      <ScreenHeader title="Главная" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#49c0f8', fontSize: 18 }}>Скоро здесь будет дашборд</Text>
        <Text style={{ color: '#666', fontSize: 14, marginTop: 12 }}>v {APP_VERSION}</Text>
      </View>
    </View>
  );
}