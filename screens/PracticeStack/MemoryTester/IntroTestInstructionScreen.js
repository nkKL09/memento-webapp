// screens/PracticeStack/MemoryTester/IntroTestInstructionScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../../components/ScreenHeader';
import { generateIntroSequence } from './introTestUtils';

export default function IntroTestInstructionScreen() {
  const navigation = useNavigation();

  const onStart = () => {
    const sequence = generateIntroSequence();
    navigation.navigate('IntroTestShow', { sequence });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Вводное тестирование" showBackButton />
      <Text style={styles.paragraph}>
        Будет показано 20 двузначных чисел. Постарайтесь запомнить их в порядке следования.
      </Text>
      <Text style={styles.paragraph}>
        После показа — 5 простых примеров на сложение. Затем введите запомненные числа по позициям от 1 до 20.
      </Text>
      <View style={styles.btnWrap}>
        <TouchableOpacity style={styles.button} onPress={onStart} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Начать</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  content: { paddingHorizontal: 20, paddingBottom: 60 },
  paragraph: { fontSize: 16, color: '#e2e8f0', lineHeight: 24, marginBottom: 12 },
  btnWrap: { width: '100%', alignItems: 'center', marginTop: 32 },
  button: {
    height: 56,
    minWidth: 200,
    paddingHorizontal: 32,
    borderRadius: 26,
    backgroundColor: '#49c0f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});
