// screens/LearningStack/KnowledgeCheckScreen.js
// Проверка знаний: показываем num (код/вопрос), пользователь вводит образ (code).
// Один раз перемешиваем каталог, в конце — попап со статистикой, временем и списком ошибок.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { loadCards } from './loadCards.js';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalizeAnswer(s) {
  if (s == null) return '';
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function answersMatch(user, expectedCode) {
  return normalizeAnswer(user) === normalizeAnswer(expectedCode);
}

function formatDuration(ms) {
  if (ms < 0) return '0 сек';
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / 60000);
  if (min > 0) return `${min} мин ${sec} сек`;
  return `${sec} сек`;
}

const SUIT_CONFIG = {
  'Т': { symbol: '♣', color: '#ffffff' },
  'Ч': { symbol: '♥', color: '#ff4d4d' },
  'Б': { symbol: '♦', color: '#ff4d4d' },
  'П': { symbol: '♠', color: '#ffffff' },
};

function capitalizeFirstOnly(s) {
  if (s == null || typeof s !== 'string') return s ? String(s) : '';
  const str = String(s);
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Для карт: { symbol, color, rank }. Ранг без изменения регистра (В, Д, К, Т — с большой). */
function getCardCodeParts(num) {
  if (num == null || typeof num !== 'string') return null;
  const raw = String(num).trim();
  if (raw.length < 2) return null;
  const suit = raw.charAt(0);
  const config = SUIT_CONFIG[suit];
  if (!config) return null;
  const rank = raw.slice(1);
  return { symbol: config.symbol, color: config.color, rank };
}

function formatCodeDisplay(num, catalogId) {
  const raw = num != null ? String(num).trim() : '';
  if (!raw) return '—';
  if (catalogId === 'cards' && raw.length >= 2) {
    const parts = getCardCodeParts(raw);
    if (parts) return parts.symbol + ' ' + parts.rank;
  }
  return capitalizeFirstOnly(raw);
}

export default function KnowledgeCheckScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { catalogId, title } = route.params || {};

  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDontKnowModal, setShowDontKnowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const startTimeRef = useRef(null);

  const startQuiz = useCallback((cardList) => {
    setCards(shuffleArray(cardList));
    setIndex(0);
    setInput('');
    setResults([]);
    setShowModal(false);
    startTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    const data = loadCards(catalogId, null);
    if (data.length === 0) {
      setLoading(false);
      return;
    }
    setCards(shuffleArray(data));
    setIndex(0);
    setInput('');
    setResults([]);
    setShowModal(false);
    startTimeRef.current = Date.now();
    setLoading(false);
  }, [catalogId]);

  const currentCard = cards[index] || {};
  const total = cards.length;
  const expectedCode = currentCard.code ?? '';

  const recordAndNext = useCallback((userAnswer, correct) => {
    setResults(prev => [...prev, { card: currentCard, userAnswer, correct }]);
    setInput('');
    if (index + 1 >= total) {
      setShowModal(true);
    } else {
      setIndex(i => i + 1);
    }
  }, [index, total, currentCard]);

  const handleSubmit = useCallback(() => {
    if (total === 0) return;
    const correct = answersMatch(input, expectedCode);
    recordAndNext(input.trim(), correct);
  }, [total, input, expectedCode, recordAndNext]);

  const handleDontKnow = useCallback(() => {
    if (total === 0) return;
    setShowDontKnowModal(true);
  }, [total]);

  const handleDontKnowClose = useCallback(() => {
    setShowDontKnowModal(false);
    recordAndNext('(не знаю)', false);
  }, [recordAndNext]);

  const handleCloseResults = () => {
    setShowModal(false);
    navigation.goBack();
  };

  const handleRetryErrors = () => {
    const mistakeCards = results.filter(r => !r.correct).map(r => r.card);
    if (mistakeCards.length === 0) return;
    setShowModal(false);
    startQuiz(mistakeCards);
  };

  if (loading || !catalogId) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Загрузка...</Text>
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>В каталоге нет карточек</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const correctCount = results.filter(r => r.correct).length;
  const mistakes = results.filter(r => !r.correct);
  const elapsedMs = startTimeRef.current != null ? Date.now() - startTimeRef.current : 0;
  const cardCodeParts = catalogId === 'cards' ? getCardCodeParts(currentCard.num) : null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <Text style={styles.header}>{title} — Проверка знаний</Text>
      <Text style={styles.progressLabel}>
        Вопрос {index + 1} из {total}
      </Text>

      <View style={styles.cardBlock}>
        <Text style={styles.codeLabel}>Код</Text>
        <Text style={styles.codeText}>
          {cardCodeParts ? (
            <><Text style={{ color: cardCodeParts.color }}>{cardCodeParts.symbol}</Text><Text> {cardCodeParts.rank}</Text></>
          ) : (
            formatCodeDisplay(currentCard.num ?? currentCard.realName, catalogId)
          )}
        </Text>
      </View>

      <Text style={styles.inputLabel}>Ваш ответ (образ):</Text>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Введите образ..."
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
      />

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.submitButton, !input.trim() && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!input.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {index + 1 >= total ? 'Завершить' : 'Далее'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dontKnowButton} onPress={handleDontKnow} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Не знаю</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDontKnowModal}
        transparent
        animationType="fade"
        onRequestClose={handleDontKnowClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Правильный ответ</Text>
            <Text style={styles.dontKnowAnswer}>{currentCard.code ?? '—'}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleDontKnowClose}>
              <Text style={styles.buttonText}>Далее</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseResults}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Результаты</Text>
            <Text style={styles.modalScore}>
              {correctCount} из {total} правильно
            </Text>
            <Text style={styles.modalTime}>
              Проверка заняла {formatDuration(elapsedMs)}
            </Text>
            {mistakes.length > 0 && (
              <>
                <Text style={styles.modalErrorsTitle}>Ошибки:</Text>
                <ScrollView
                  style={styles.modalScroll}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={true}
                >
                  {mistakes.map((r, i) => {
                    const parts = catalogId === 'cards' ? getCardCodeParts(r.card.num) : null;
                    return (
                    <View key={i} style={styles.mistakeRow}>
                      <Text style={styles.mistakeCode}>
                        Код:{' '}
                        {parts ? (
                          <><Text style={{ color: parts.color }}>{parts.symbol}</Text><Text> {parts.rank}</Text></>
                        ) : (
                          formatCodeDisplay(r.card.num ?? r.card.realName, catalogId)
                        )}
                      </Text>
                      <Text style={styles.mistakeText}>
                        Ваш ответ: {r.userAnswer || '(пусто)'}
                      </Text>
                      <Text style={styles.mistakeCorrect}>
                        Правильно: {r.card.code ?? '—'}
                      </Text>
                    </View>
                    );
                  })}
                </ScrollView>
              </>
            )}
            {mistakes.length > 0 && (
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={handleRetryErrors}
              >
                <Text style={styles.buttonText}>Пройти ещё раз только ошибки</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.modalButton} onPress={handleCloseResults}>
              <Text style={styles.buttonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121e24',
    paddingTop: 18,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  cardBlock: {
    backgroundColor: '#1a2a35',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#49c0f8',
  },
  codeLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
  },
  inputLabel: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a2a35',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 18,
    color: '#ffffff',
    borderWidth: 2,
    borderColor: '#334155',
    marginBottom: 24,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#49c0f8',
    height: 56,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  dontKnowButton: {
    backgroundColor: '#64748b',
    minWidth: 120,
    height: 56,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: '#334155',
    height: 56,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#1a2a35',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  dontKnowAnswer: {
    fontSize: 20,
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  modalScore: {
    fontSize: 20,
    color: '#49c0f8',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalTime: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalErrorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f87171',
    marginBottom: 8,
  },
  modalScroll: {
    maxHeight: 280,
    marginBottom: 20,
  },
  modalScrollContent: {
    paddingRight: 8,
  },
  mistakeRow: {
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  mistakeCode: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  mistakeText: {
    fontSize: 14,
    color: '#f87171',
    marginBottom: 2,
  },
  mistakeCorrect: {
    fontSize: 14,
    color: '#22c55e',
  },
  modalButtonSecondary: {
    backgroundColor: '#334155',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButton: {
    backgroundColor: '#49c0f8',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
