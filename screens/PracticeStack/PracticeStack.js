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
        headerShown: false,
        headerBackVisible: false,
        headerLeft: () => null,
      }}
    >
      <Stack.Screen name="PracticeScreen" component={PracticeScreen} />
      <Stack.Screen name="ToolsScreen" component={ToolsScreen} />
      <Stack.Screen name="EncodersScreen" component={EncodersScreen} />
      <Stack.Screen name="PhoneEncoderScreen" component={PhoneEncoderScreen} />
      <Stack.Screen name="DateEncoderScreen" component={DateEncoderScreen} />
      <Stack.Screen name="NumberEncoderScreen" component={NumberEncoderScreen} />
      <Stack.Screen name="CardMemorizationInput" component={CardMemorizationInputScreen} />
      <Stack.Screen name="CardMemorizationRun" component={CardMemorizationRunScreen} />
      <Stack.Screen name="CardMemorizationResults" component={CardMemorizationResultsScreen} />
      <Stack.Screen name="ReferenceCard" component={ReferenceCard} />
      <Stack.Screen name="MemoryTester" component={MemoryTesterScreen} />
      <Stack.Screen name="IntroTestInstruction" component={IntroTestInstructionScreen} />
      <Stack.Screen name="IntroTestShow" component={IntroTestShowScreen} />
      <Stack.Screen name="IntroTestMath" component={IntroTestMathScreen} />
      <Stack.Screen name="IntroTestInput" component={IntroTestInputScreen} />
      <Stack.Screen name="IntroTestResult" component={IntroTestResultScreen} />
      <Stack.Screen name="TrainingConfig" component={TrainingConfigScreen} />
      <Stack.Screen name="TrainingShow" component={TrainingShowScreen} />
      <Stack.Screen name="TrainingMath" component={TrainingMathScreen} />
      <Stack.Screen name="TrainingInput" component={TrainingInputScreen} />
      <Stack.Screen name="TrainingResult" component={TrainingResultScreen} />
      <Stack.Screen name="ExamConfig" component={ExamConfigScreen} />
      <Stack.Screen name="ExamShow" component={ExamShowScreen} />
      <Stack.Screen name="ExamMath" component={ExamMathScreen} />
      <Stack.Screen name="ExamInput" component={ExamInputScreen} />
      <Stack.Screen name="ExamResult" component={ExamResultScreen} />
      <Stack.Screen name="ExamHistory" component={ExamHistoryScreen} />
      <Stack.Screen name="CustomModulesList" component={CustomModulesListScreen} />
      <Stack.Screen name="CustomModuleEdit" component={CustomModuleEditScreen} />
    </Stack.Navigator>
  );
}
