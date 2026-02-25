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
        headerShown: false,
        headerBackVisible: false,
        headerLeft: () => null,
      }}
    >
      <Stack.Screen name="LearningScreen" component={LearningScreen} />
      <Stack.Screen name="MnemotechnicsScreen" component={MnemotechnicsScreen} />
      <Stack.Screen name="TextbookToc" component={TextbookTocScreen} />
      <Stack.Screen name="TextbookArticle" component={TextbookArticleScreen} />
      <Stack.Screen name="MnemonicCodesScreen" component={MnemonicCodesScreen} />
      <Stack.Screen name="CodeLibrary" component={CodeLibrary} />
      <Stack.Screen name="ReferenceCard" component={ReferenceCard} />
      <Stack.Screen name="TrainingCatalogsScreen" component={TrainingCatalogsScreen} />
      <Stack.Screen name="TrainingSubRangesScreen" component={TrainingSubRangesScreen} />
      <Stack.Screen name="TrainingStaticCatalogScreen" component={TrainingStaticCatalogScreen} />
      <Stack.Screen name="KnowledgeCheckScreen" component={KnowledgeCheckScreen} />
      <Stack.Screen name="TrainingSessionScreen" component={TrainingSessionScreen} />
    </Stack.Navigator>
  );
}