import { View, Text, TextInput } from 'react-native';
import type { Question } from '@/lib/research-forms/types';

interface ReflectionProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const Reflection = ({
  question,
  value,
  onChange,
  error,
}: ReflectionProps) => {
  return (
    <View className="mb-6">
      <Text className="text-base font-medium text-neutral-900 mb-1">
        {question.question}
        {question.required && <Text className="text-red-500"> *</Text>}
      </Text>
      {question.hint && (
        <Text className="text-sm text-neutral-500 mb-3">{question.hint}</Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Take your time to reflect..."
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        className="border border-neutral-200 rounded-lg p-3 text-base text-neutral-900 bg-white min-h-[120px]"
      />
      {error && <Text className="text-red-500 text-sm mt-2">{error}</Text>}
    </View>
  );
};
