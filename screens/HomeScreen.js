import React from 'react';
import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#121e24', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>Главная</Text>
      <Text style={{ color: '#49c0f8', fontSize: 18, marginTop: 20 }}>Скоро здесь будет дашборд</Text>
    </View>
  );
}