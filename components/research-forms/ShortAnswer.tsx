import { View, Text, TextInput } from 'react-native';
import type { Question } from '@/lib/research-forms/types';

interface ShortAnswerProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const ShortAnswer = ({
  question,
  value,
  onChange,
  error,
}: ShortAnswerProps) => {
  return (
    <View className="mb-6">
      <Text className="text-base font-medium text-gray-900 mb-1">
        {question.question}
        {question.required && <Text className="text-red-500"> *</Text>}
      </Text>
      {question.hint && (
        <Text className="text-sm text-gray-500 mb-3">{question.hint}</Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Your answer..."
        placeholderTextColor="#9CA3AF"
        className="border border-gray-200 rounded-lg p-3 text-base text-gray-900 bg-white"
      />
      {error && <Text className="text-red-500 text-sm mt-2">{error}</Text>}
    </View>
  );
};
