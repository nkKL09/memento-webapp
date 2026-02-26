// Создание и редактирование своего модуля: название + элементы (по одному на строку)
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../../components/ScreenHeader';
import { addCustomModule, updateCustomModule, removeCustomModule } from './customModules';

export default function CustomModuleEditScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const existing = route.params?.module;
  const isEdit = !!existing?.id;

  const [name, setName] = useState(existing?.name ?? '');
  const [elementsText, setElementsText] = useState(
    existing?.elements?.length ? existing.elements.join('\n') : ''
  );

  useEffect(() => {
    if (existing?.name != null) setName(existing.name);
    if (existing?.elements?.length) setElementsText(existing.elements.join('\n'));
  }, [existing?.id]);

  const elements = elementsText
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const canSave = name.trim() !== '' && elements.length >= 2;

  const onSave = async () => {
    if (!canSave) return;
    if (isEdit) {
      await updateCustomModule(existing.id, { name: name.trim(), elements });
    } else {
      await addCustomModule({ name: name.trim(), elements });
    }
    navigation.navigate('TrainingConfig');
  };

  const onDelete = () => {
    Alert.alert(
      'Удалить модуль?',
      `«${name || 'Без названия'}» будет удалён.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            await removeCustomModule(existing.id);
            navigation.navigate('CustomModulesList');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <ScreenHeader title={isEdit ? 'Редактировать модуль' : 'Новый модуль'} showBackButton />

      <Text style={styles.label}>Название модуля</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Например: Столицы, Цвета"
        placeholderTextColor="#64748b"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Элементы (один на строку, минимум 2)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={elementsText}
        onChangeText={setElementsText}
        placeholder={'Москва\nПариж\nЛондон\n...'}
        placeholderTextColor="#64748b"
        multiline
        numberOfLines={8}
      />
      <Text style={styles.hint}>Сейчас элементов: {elements.length}</Text>

      <View style={styles.btnWrap}>
        <TouchableOpacity
          style={[styles.button, !canSave && styles.buttonDisabled]}
          onPress={onSave}
          disabled={!canSave}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Сохранить</Text>
        </TouchableOpacity>
      </View>

      {isEdit && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>Удалить модуль</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  content: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 60 },
  label: { fontSize: 16, color: '#94a3b8', marginBottom: 8, marginTop: 16 },
  input: { fontSize: 18, color: '#ffffff', borderWidth: 2, borderColor: '#334155', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14 },
  textArea: { minHeight: 160, textAlignVertical: 'top' },
  hint: { fontSize: 14, color: '#64748b', marginTop: 6 },
  btnWrap: { width: '100%', alignItems: 'center', marginTop: 32 },
  button: { height: 56, minWidth: 200, paddingHorizontal: 32, borderRadius: 26, backgroundColor: '#49c0f8', justifyContent: 'center', alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#334155', opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  deleteBtn: { marginTop: 24, alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 20 },
  deleteBtnText: { fontSize: 16, color: '#f87171' },
});
