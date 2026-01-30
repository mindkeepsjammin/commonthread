import { View, Text } from 'react-native';
import type { FormSection as FormSectionType } from '@/lib/research-forms/types';

interface FormSectionProps {
  section: FormSectionType;
  children: React.ReactNode;
}

export const FormSection = ({ section, children }: FormSectionProps) => {
  return (
    <View className="mb-8 pb-8 border-b border-gray-200">
      <Text className="text-xl font-semibold text-gray-900 mb-2">
        {section.title}
      </Text>
      {section.description && (
        <Text className="text-sm text-gray-600 italic mb-6">
          {section.description}
        </Text>
      )}
      <View className="space-y-6">{children}</View>
    </View>
  );
};
