// screens/LearningStack/LearningStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LearningScreen from './LearningScreen';
import MnemotechnicsScreen from './MnemotechnicsScreen';
import TextbookTocScreen from './TextbookTocScreen';
import TextbookArticleScreen from './TextbookArticleScreen';
import MnemonicCodesScreen from './MnemonicCodesScreen';
import CodeLibrary from './CodeLibrary';
import ReferenceCard from './ReferenceCard';
import TrainingCatalogsScreen from './TrainingCatalogsScreen';
import TrainingSubRangesScreen from './TrainingSubRangesScreen';
import TrainingStaticCatalogScreen from './TrainingStaticCatalogScreen';
import KnowledgeCheckScreen from './KnowledgeCheckScreen';
import TrainingSessionScreen from './TrainingSessionScreen';

const Stack = createNativeStackNavigator();

export default function LearningStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#121e24' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '600', fontSize: 18 },
        headerShadowVisible: false,
        headerBackVisible: false,
        headerLeft: () => null,
      }}
    >
      <Stack.Screen name="LearningScreen" component={LearningScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MnemotechnicsScreen" component={MnemotechnicsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TextbookToc" component={TextbookTocScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TextbookArticle" component={TextbookArticleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MnemonicCodesScreen" component={MnemonicCodesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CodeLibrary" component={CodeLibrary} options={{ headerShown: false }} />
      <Stack.Screen name="ReferenceCard" component={ReferenceCard} options={{ headerShown: false }} />
      <Stack.Screen name="TrainingCatalogsScreen" component={TrainingCatalogsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TrainingSubRangesScreen" component={TrainingSubRangesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TrainingStaticCatalogScreen" component={TrainingStaticCatalogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="KnowledgeCheckScreen" component={KnowledgeCheckScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TrainingSessionScreen" component={TrainingSessionScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}