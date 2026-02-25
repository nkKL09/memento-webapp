// screens/PracticeStack/EncodersScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ENCODERS = [
  { id: 'phone', title: 'Номер телефона', description: '+7 (999) 123-45-67', screen: 'PhoneEncoderScreen' },
  { id: 'date', title: 'Дата', description: 'дд.мм.гггг', screen: 'DateEncoderScreen' },
  { id: 'number', title: 'Произвольное число', description: 'для длинных чисел, например банковские карты', screen: 'NumberEncoderScreen' },
];

export default function EncodersScreen() {
  const navigation = useNavigation();
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Кодировщики</Text>

      <View style={styles.tilesContainer}>
        {ENCODERS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.tile}
            activeOpacity={0.8}
            onPress={() => item.screen && navigation.navigate(item.screen)}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  content: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 100 },
  header: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 40,
    textAlign: 'center',
  },
  tilesContainer: { gap: 12 },
  tile: {
    backgroundColor: '#1a2a35',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 22,
  },
  title: { fontSize: 20, fontWeight: '600', color: '#ffffff', marginBottom: 6 },
  description: { fontSize: 15, color: '#94a3b8' },
});
