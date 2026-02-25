// screens/PracticeStack/PracticeStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PracticeScreen from './PracticeScreen';
import ToolsScreen from './ToolsScreen';
import EncodersScreen from './EncodersScreen';
import PhoneEncoderScreen from './PhoneEncoderScreen';
import DateEncoderScreen from './DateEncoderScreen';
import NumberEncoderScreen from './NumberEncoderScreen';
import ReferenceCard from '../LearningStack/ReferenceCard';
import CardMemorizationInputScreen from './CardMemorizationInputScreen';
import CardMemorizationRunScreen from './CardMemorizationRunScreen';
import CardMemorizationResultsScreen from './CardMemorizationResultsScreen';
import MemoryTesterScreen from './MemoryTesterScreen';
import IntroTestInstructionScreen from './MemoryTester/IntroTestInstructionScreen';
import IntroTestShowScreen from './MemoryTester/IntroTestShowScreen';
import IntroTestMathScreen from './MemoryTester/IntroTestMathScreen';
import IntroTestInputScreen from './MemoryTester/IntroTestInputScreen';
import IntroTestResultScreen from './MemoryTester/IntroTestResultScreen';
import TrainingConfigScreen from './MemoryTester/TrainingConfigScreen';
import TrainingShowScreen from './MemoryTester/TrainingShowScreen';
import TrainingMathScreen from './MemoryTester/TrainingMathScreen';
import TrainingInputScreen from './MemoryTester/TrainingInputScreen';
import TrainingResultScreen from './MemoryTester/TrainingResultScreen';
import ExamConfigScreen from './MemoryTester/ExamConfigScreen';
import ExamShowScreen from './MemoryTester/ExamShowScreen';
import ExamMathScreen from './MemoryTester/ExamMathScreen';
import ExamInputScreen from './MemoryTester/ExamInputScreen';
import ExamResultScreen from './MemoryTester/ExamResultScreen';
import ExamHistoryScreen from './MemoryTester/ExamHistoryScreen';
import CustomModulesListScreen from './MemoryTester/CustomModulesListScreen';
import CustomModuleEditScreen from './MemoryTester/CustomModuleEditScreen';

const Stack = createNativeStackNavigator();

export default function PracticeStack() {
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
      <Stack.Screen name="PracticeScreen" component={PracticeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ToolsScreen" component={ToolsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EncodersScreen" component={EncodersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PhoneEncoderScreen" component={PhoneEncoderScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DateEncoderScreen" component={DateEncoderScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NumberEncoderScreen" component={NumberEncoderScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CardMemorizationInput" component={CardMemorizationInputScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CardMemorizationRun" component={CardMemorizationRunScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CardMemorizationResults" component={CardMemorizationResultsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ReferenceCard" component={ReferenceCard} options={{ headerShown: false }} />
      <Stack.Screen name="MemoryTester" component={MemoryTesterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="IntroTestInstruction" component={IntroTestInstructionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="IntroTestShow" component={IntroTestShowScreen} options={{ headerShown: false }} />
      <Stack.Screen name="IntroTestMath" component={IntroTestMathScreen} options={{ headerShown: false }} />
      <Stack.Screen name="IntroTestInput" component={IntroTestInputScreen} options={{ headerShown: false }} />
      <Stack.Screen name="IntroTestResult" component={IntroTestResultScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TrainingConfig" component={TrainingConfigScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TrainingShow" component={TrainingShowScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TrainingMath" component={TrainingMathScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TrainingInput" component={TrainingInputScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TrainingResult" component={TrainingResultScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExamConfig" component={ExamConfigScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExamShow" component={ExamShowScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExamMath" component={ExamMathScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExamInput" component={ExamInputScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExamResult" component={ExamResultScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExamHistory" component={ExamHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CustomModulesList" component={CustomModulesListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CustomModuleEdit" component={CustomModuleEditScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
