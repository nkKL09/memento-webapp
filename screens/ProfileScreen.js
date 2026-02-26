import React from 'react';
import { View, StyleSheet } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Профиль" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121e24',
    paddingHorizontal: 20,
  },
});
